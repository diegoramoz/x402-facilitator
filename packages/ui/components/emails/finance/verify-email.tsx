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

type VerifyEmailProps = {
	verificationUrl: string;
};

export function VerifyEmail({ verificationUrl }: VerifyEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>
				Verify your email address for {FINANCE_METADATA.displayName}
			</Preview>
			<Tailwind>
				<Body className="bg-white px-1 pt-4 font-sans text-black">
					<Container className="mx-auto max-w-150">
						<Logo />
						<Heading className="mb-5 text-2xl">
							Verify your email address
						</Heading>
						<Text className="mb-4 leading-6">
							Thanks for signing up for {FINANCE_METADATA.displayName}!
						</Text>
						<Text className="mb-6 leading-6">
							Click the link below to complete the verification process and
							start using your account:
						</Text>
						<Link
							className="mb-8 inline-block text-blue-600 text-lg underline"
							href={verificationUrl}
						>
							→ Verify my email address
						</Link>
						<Hr className="mb-4 border-neutral-200 border-t" />
						<Text className="text-neutral-700 leading-6">
							If you didn't create an account at {FINANCE_METADATA.displayName},
							you can safely ignore this message.
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}
