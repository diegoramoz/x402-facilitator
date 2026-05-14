import { getCurrentAdapter } from "@better-auth/core/context";
import { passkey } from "@better-auth/passkey";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { db } from "@ramoz/db";
import schema from "@ramoz/db/schema";
import { env as financeEnv } from "@ramoz/env/finance";
import { env } from "@ramoz/env/server";
import { ResetPassword } from "@ramoz/ui/components/emails/finance/reset-password";
import { VerifyEmail } from "@ramoz/ui/components/emails/finance/verify-email";
import { render } from "@react-email/render";
import { type BetterAuthPlugin, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

const missingTransactionAdapterFallback = {
	create: () => {
		throw new Error("Missing Better Auth transaction adapter");
	},
} as unknown as Parameters<typeof getCurrentAdapter>[0];

const walletSchemaPlugin = () =>
	({
		id: "wallet-schema",
		schema: {
			wallet: {
				fields: {
					userId: {
						type: "number",
						required: true,
						references: {
							model: "user",
							field: "id",
							onDelete: "cascade",
						},
					},
					walletId: {
						type: "string",
						required: true,
					},
					evmAddress: {
						type: "string",
						required: true,
					},
				},
			},
		},
	}) satisfies BetterAuthPlugin;

function getCircleClient() {
	return initiateDeveloperControlledWalletsClient({
		apiKey: financeEnv.CIRCLE_API_KEY,
		entitySecret: financeEnv.CIRCLE_ENTITY_SECRET,
	});
}

async function createUserWallet(userId: bigint) {
	const adapter = await getCurrentAdapter(missingTransactionAdapterFallback);
	const response = await getCircleClient().createWallets({
		blockchains: ["ARC-TESTNET"],
		count: 1,
		walletSetId: financeEnv.CIRCLE_WALLET_SET_ID,
		accountType: "SCA",
	});

	const wallet = response.data?.wallets?.[0];

	if (!wallet) {
		throw new Error("No wallets returned from Circle API");
	}

	await adapter.create({
		model: "wallet",
		data: {
			userId,
			walletId: wallet.id,
			evmAddress: wallet.address,
		},
	});
}

export function createAuth() {
	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",
			schema,
			transaction: true,
		}),
		advanced: {
			database: {
				generateId: "serial",
			},
		},
		session: {
			cookieCache: {
				enabled: true,
				maxAge: 5 * 60, // 5 minutes
			},
		},
		trustedOrigins: [
			// env.CORS_ORIGIN,
			"oss://",
			...(env.NODE_ENV === "development"
				? [
						"exp://",
						"exp://**",
						"exp://192.168.*.*:*/**",
						"http://localhost:8081",
					]
				: []),
		],
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: true,
			sendResetPassword: async ({ user, url }) => {
				try {
					const emailHtml = await render(ResetPassword({ resetUrl: url }));

					await resend.emails.send({
						// from: `${APP.displayName} <no-reply@${APP.domain}>`,
						from: "Acme <onboarding@resend.dev>",
						to: [user.email],
						subject: "Reset your password",
						html: emailHtml,
					});
				} catch (error) {
					console.error("Error sending password reset email:", error);
				}
			},
		},
		emailVerification: {
			sendVerificationEmail: async ({ user, url }) => {
				try {
					const emailHtml = await render(VerifyEmail({ verificationUrl: url }));

					await resend.emails.send({
						// from: `${APP.displayName} <no-reply@${APP.domain}>`,
						from: "Acme <onboarding@resend.dev>",
						to: [user.email],
						subject: "Verify your email address",
						html: emailHtml,
					});
				} catch (error) {
					console.error("Error sending verification email:", error);
				}
			},
		},
		user: {
			additionalFields: {
				role: {
					type: "string",
					required: true,
					defaultValue: "user",
					input: false,
				},
			},
		},
		databaseHooks: {
			account: {
				create: {
					before: async (account) => {
						if (account.providerId !== "credential") {
							return;
						}

						try {
							await createUserWallet(BigInt(account.userId));
						} catch (error) {
							const message =
								error instanceof Error ? error.message : String(error);
							throw new Error(
								`Failed to create wallet via Circle API: ${message}`
							);
						}
					},
				},
			},
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		plugins: [walletSchemaPlugin(), passkey(), nextCookies()],
	});
}

export const auth = createAuth();
