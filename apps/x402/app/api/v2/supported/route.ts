import { API_POLICY } from "@/app/api/policy";
import { SUPPORTED_RESPONSE } from "@/app/api/v2/supported-response";

function applyDiscoveryCacheHeaders(response: Response): Response {
	const policy = API_POLICY.v2.supported;
	const headers = new Headers(response.headers);

	if (policy.cacheControl) {
		headers.set("Cache-Control", policy.cacheControl);
	}

	if (policy.vary) {
		headers.set("Vary", policy.vary);
	}

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

export function GET() {
	return applyDiscoveryCacheHeaders(
		Response.json(SUPPORTED_RESPONSE, {
			headers: { "Content-Type": "application/json" },
		})
	);
}

export function OPTIONS() {
	return new Response(null, {
		status: 204,
		headers: {
			Allow: API_POLICY.v2.supported.methods.join(", "),
		},
	});
}
