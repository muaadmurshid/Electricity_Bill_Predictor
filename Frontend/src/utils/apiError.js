/**
 * Turns an Axios error into something a household user can read.
 * Never show a stack trace or a bare "Error 400".
 *
 * Handles the usual Spring Boot shapes:
 *   { "message": "Email already exists" }
 *   { "error": "Not Found", "message": "..." }
 *   { "errors": { "email": "must be a valid email" } }
 *   { "errors": [ { "field": "email", "defaultMessage": "..." } ] }
 *   plain text bodies
 */
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;

  // No response at all — server down, wrong port, CORS, no network.
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "The server took too long to respond. Please try again.";
    }
    return "Cannot reach the server. Check that the backend is running on port 8080.";
  }

  const { status, data } = error.response;

  const fromBody = extractMessage(data);
  if (fromBody) return fromBody;

  switch (status) {
    case 400:
      return "Some of the details you entered are not valid. Please check and try again.";
    case 401:
      return "Your email or password is incorrect.";
    case 403:
      return "You do not have permission to do that.";
    case 404:
      return "We could not find that record.";
    case 409:
      return "That record already exists.";
    case 422:
      return "Some of the details you entered are not valid.";
    case 500:
      return "The server ran into a problem. Please try again in a moment.";
    default:
      return fallback;
  }
}

/**
 * Returns field-level errors as { fieldName: message }, so a form can
 * show the backend's validation messages next to the right input.
 */
export function getFieldErrors(error) {
  const data = error?.response?.data;
  if (!data) return {};

  const errors = data.errors ?? data.fieldErrors ?? data.validationErrors;
  if (!errors) return {};

  if (Array.isArray(errors)) {
    const out = {};
    errors.forEach((e) => {
      const field = e.field ?? e.fieldName;
      const message = e.defaultMessage ?? e.message ?? e.error;
      if (field && message) out[field] = message;
    });
    return out;
  }

  if (typeof errors === "object") {
    const out = {};
    Object.entries(errors).forEach(([field, message]) => {
      out[field] = Array.isArray(message) ? message[0] : String(message);
    });
    return out;
  }

  return {};
}

function extractMessage(data) {
  if (!data) return null;
  if (typeof data === "string") return data.trim().startsWith("<") ? null : data;

  if (typeof data.message === "string" && data.message.trim()) return data.message;
  if (typeof data.error === "string" && data.error.trim() && !data.message) {
    return data.error;
  }

  // Validation maps / arrays: show the first message.
  const errors = data.errors ?? data.fieldErrors ?? data.validationErrors;
  if (Array.isArray(errors) && errors.length) {
    const first = errors[0];
    return first.defaultMessage ?? first.message ?? null;
  }
  if (errors && typeof errors === "object") {
    const first = Object.values(errors)[0];
    if (first) return Array.isArray(first) ? first[0] : String(first);
  }

  return null;
}
