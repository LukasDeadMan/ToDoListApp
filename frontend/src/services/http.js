const API_ROOT =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return text ? { message: text } : null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function request(path, options = {}) {
  const body = options.body;
  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      payload?.error ||
      payload?.message ||
      "Nao foi possivel concluir a requisicao.";
    throw new ApiError(message, response.status, payload);
  }

  return payload;
}
