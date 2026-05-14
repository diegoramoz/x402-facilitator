import { getSession } from "@ramoz/auth/auth-server";
import { orpc } from "@/utils/orpc.server";

export default async function Page() {
	const session = await getSession();

	if (!session?.user) {
		return <div>Not logged in</div>;
	}

	const { wallet } = await orpc.wallet.get();

	return (
		<div>
			<h1>Welcome, {session.user.name}</h1>
			<dl>
				<dt>Wallet ID</dt>
				<dd>
					<pre>{wallet.walletId}</pre>
				</dd>
				<dt>EVM Address</dt>
				<dd>
					<pre>{wallet.evmAddress}</pre>
				</dd>
			</dl>
		</div>
	);
}
