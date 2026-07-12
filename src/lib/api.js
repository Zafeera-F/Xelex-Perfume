// Thin fetch wrapper — the one place that knows the API's base URL, sends
// credentials (the httpOnly auth cookie) on every request, and normalizes
// the backend's { success, message, data } / { success, message, errors }
// response shape into either a resolved value or a thrown ApiClientError.
// Every feature (auth today, products/cart/orders later) calls apiRequest()
// instead of using fetch() directly, so this behavior never has to be
// re-implemented per feature.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export class ApiClientError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors; // field-level validation errors: [{ field, message }]
  }
}

export async function apiRequest(path, { method = "GET", body, ...rest } = {}) {
  // FormData (file uploads) must be sent as-is — the browser sets its own
  // multipart Content-Type with boundary; JSON.stringify-ing it would
  // silently send "[object FormData]" instead of the file.
  const isFormData = body instanceof FormData;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include", // send/receive the httpOnly auth cookie cross-origin
    headers: body && !isFormData ? { "Content-Type": "application/json" } : undefined,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  // 204/logout-style empty responses aside, the API always returns JSON —
  // including on errors — so we can parse first and branch on `success`.
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    const message = payload?.message || "Something went wrong. Please try again.";
    throw new ApiClientError(message, response.status, payload?.errors || []);
  }

  return payload.data;
}
