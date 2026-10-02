let csrf;
export async function api(path, method = "GET", data) {
  if (method !== "GET" && !csrf) {
    const response = await fetch("/api/auth/csrf", {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!response.ok)
      throw new Error(
        "The care service is unavailable. Please try again later.",
      );
    csrf = (await response.json()).token;
  }
  let response;
  try {
    response = await fetch("/api" + path, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      headers:
        method === "GET"
          ? {}
          : { "Content-Type": "application/json", "X-CSRF-TOKEN": csrf },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
  } catch {
    throw new Error(
      "The care service could not be reached. Your information has not been saved.",
    );
  }
  if (response.status === 401 && path !== "/auth/login") {
    csrf = undefined;
    throw Object.assign(new Error("Please sign in to continue."), {
      status: 401,
    });
  }
  if (!response.ok) {
    let body;
    try {
      body = await response.json();
    } catch {
      /* Do not show raw server errors. */
    }
    throw new Error(
      body?.message ||
        (response.status === 429
          ? "Too many requests. Please wait a minute and try again."
          : "This request could not be completed. Check your details and try again."),
    );
  }
  if (path === "/auth/login" || path === "/auth/logout") csrf = undefined;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
