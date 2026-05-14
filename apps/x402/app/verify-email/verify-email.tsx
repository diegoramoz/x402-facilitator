import { FINANCE_METADATA } from "@ramoz/shared/metadata/finance";

export function VerifyEmail() {
	return (
		<div className="mx-auto mb-8 max-w-prose">
			<div>Check your email</div>
			<div className="mb-4 text-muted-foreground italic">
				We have sent a verification link to your email.
			</div>
			<div className="space-y-4">
				<h3 className="font-semibold text-lg">Next steps:</h3>
				<ol className="ml-4 list-decimal space-y-3 text-muted-foreground">
					<li>
						Look for the verification email from {FINANCE_METADATA.displayName}{" "}
						and follow the instructions.
					</li>
				</ol>

				<div className="mb-4 rounded-md bg-primary/5 p-4">
					<p className="mb-1 font-medium text-sm">Can't find the email?</p>
					<p className="text-muted-foreground text-sm">
						Check your spam or junk folder. The email may take a few minutes to
						arrive.
					</p>
				</div>

				<div className="text-center">
					<p className="text-muted-foreground text-sm">
						You can close this tab.
					</p>
				</div>
			</div>
		</div>
	);
}
