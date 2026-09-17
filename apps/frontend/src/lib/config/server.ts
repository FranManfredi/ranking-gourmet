const DEFAULT_BACKEND_API_URL = "http://localhost:8080";

export function getBackendApiBaseUrl() {
  return process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? DEFAULT_BACKEND_API_URL;
}

export function getBackendAuthBaseUrl() {
  return (
    process.env.BETTER_AUTH_BACKEND_URL?.replace(/\/$/, "") ??
    `${getBackendApiBaseUrl()}/api/auth`
  );
}
