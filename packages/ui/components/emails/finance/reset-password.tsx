import { FINANCE_METADATA } from "@ramoz/shared/metadata/finance";
import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Tailwind,
	Text,
} from "@react-email/components";
import { Logo } from "./logo";

type ResetPasswordProps = {
	resetUrl: string;
};

export function ResetPassword({ resetUrl }: ResetPasswordProps) {
	return (
		<Html>
			<Head />
			<Preview>Reset your {FINANCE_METADATA.displayName} password</Preview>
			<Tailwind>
				<Body className="bg-white px-1 pt-4 font-sans text-2xl text-black">
					<Container className="mx-auto max-w-150">
						<Logo />
						<Heading className="mb-5 text-2xl">Reset your password</Heading>
						<Text className="mb-4 leading-6">
							We received a request to reset the password for your
							{FINANCE_METADATA.displayName} account.
						</Text>
						<Text className="mb-6 leading-6">
							If you requested a password reset, click the link below:
						</Text>
						<Link
							className="mb-8 inline-block text-blue-600 text-lg underline"
							href={resetUrl}
						>
							→ Reset my password
						</Link>
						<Hr className="mb-4 border-neutral-200 border-t" />
						<Text className="text-neutral-700 leading-6">
							This link will expire shortly for security reasons.
						</Text>
						<Text className="text-neutral-700 leading-6">
							If you didn't request a password reset, you can safely ignore this
							message.
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}
