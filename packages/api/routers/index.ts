import type { RouterClient } from "@orpc/server";
import { db } from "@ramoz/db";
import {
	insertUserSchema,
	user as userTable,
	wallet as walletTable,
} from "@ramoz/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { protectedProcedure } from "..";

// export const appRouter = {
// 	healthCheck: publicProcedure.handler(() => {
// 		return "OK";
// 	}),
// 	privateData: protectedProcedure.handler(({ context }) => {
// 		return {
// 			message: "This is private",
// 			user: context.session?.user,
// 		};
// 	}),
// };

const userRouter = {
	create: protectedProcedure
		.input(
			insertUserSchema.omit({ updatedAt: true, createdAt: true, nanoId: true })
		)
		.handler(async ({ input }) => {
			const [user] = await db.insert(userTable).values(input).returning();
			if (!user) {
				throw new Error("Failed to create user");
			}
			return { user };
		}),

	list: protectedProcedure.handler(
		async () => await db.select().from(userTable).orderBy(userTable.createdAt)
	),

	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const [user] = await db
				.select()
				.from(userTable)
				.where(eq(userTable.nanoId, input.id));
			if (!user) {
				throw new Error("User not found");
			}
			// Fetch associated wallet if exists
			const [userWallet] = await db
				.select()
				.from(walletTable)
				.where(eq(walletTable.userId, user.id));

			return { user, wallet: userWallet || null };
		}),

	updateEmail: protectedProcedure
		.input(z.object({ email: z.email() }))
		.handler(async ({ input }) => {
			const [firstUser] = await db.select().from(userTable).limit(1);
			if (!firstUser) {
				throw new Error("No user found");
			}
			const [updated] = await db
				.update(userTable)
				.set({ email: input.email })
				.where(eq(userTable.id, firstUser.id))
				.returning();
			if (!updated) {
				throw new Error("Failed to update email");
			}
			return { user: updated };
		}),
};

const walletRouter = {
	// Get current user's wallet
	get: protectedProcedure.handler(async ({ context }) => {
		if (!context.session?.user) {
			throw new Error("No session");
		}
		const [wallet] = await db
			.select()
			.from(walletTable)
			.where(eq(walletTable.userId, BigInt(context.session.user.id)));
		return { wallet: wallet || null };
	}),

	// Get wallet by user ID (admin use case)
	getByUserId: protectedProcedure
		.input(z.object({ userId: z.bigint() }))
		.handler(async ({ input }) => {
			const [wallet] = await db
				.select()
				.from(walletTable)
				.where(eq(walletTable.userId, input.userId));
			return { wallet: wallet || null };
		}),
};

export const appRouter = {
	user: userRouter,
	wallet: walletRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
