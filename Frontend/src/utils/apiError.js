/**
 * Converts Axios/backend errors into clear user-facing messages.
 * Never expose stack traces or raw HTTP errors to the UI.
 *
 * Supported Spring Boot shapes include:
 *
 * { "message": "Email already exists" }
 * { "error": "Not Found", "message": "..." }
 * { "errors": { "email": "must be a valid email" } }
 * { "errors": [ { "field": "email", "defaultMessage": "..." } ] }
 * plain text responses
 */
export function getErrorMessage(
  error,
  fallback =
    "Something went wrong. Please try again."
) {
  if (!error) {
    return fallback;
  }

  // =========================================================
  // NETWORK / TIMEOUT
  // =========================================================

  if (!error.response) {
    if (
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT"
    ) {
      return "The server took too long to respond. Please try again.";
    }

    return "Cannot reach the server. Please check your connection and try again.";
  }

  const {
    status,
    data,
  } = error.response;

  /*
   * Prefer a useful message returned by
   * Spring Boot when one is available.
   */
  const fromBody =
    extractMessage(data);

  if (fromBody) {
    return fromBody;
  }

  // =========================================================
  // HTTP STATUS FALLBACKS
  // =========================================================

  switch (status) {
    case 400:
      return "Some of the details you entered are not valid. Please check and try again.";

    case 401:
      return "Your session is not valid. Please sign in again.";

    case 403:
      return "You do not have permission to do that.";

    case 404:
      return "We could not find that record.";

    case 409:
      return "That record already exists or conflicts with existing information.";

    case 422:
      return "Some of the details you entered are not valid.";

    case 429:
      return "The service is temporarily busy or unavailable. Please try again later.";

    case 500:
      return "The server ran into a problem. Please try again in a moment.";

    case 502:
    case 503:
    case 504:
      return "The service is temporarily unavailable. Please try again shortly.";

    default:
      return fallback;
  }
}

/**
 * Returns field-level validation errors as:
 *
 * {
 *   fieldName: "message"
 * }
 */
export function getFieldErrors(
  error
) {
  const data =
    error?.response?.data;

  if (!data) {
    return {};
  }

  const errors =
    data.errors ??
    data.fieldErrors ??
    data.validationErrors;

  if (!errors) {
    return {};
  }

  // =========================================================
  // ARRAY FORMAT
  // =========================================================

  if (Array.isArray(errors)) {
    const out = {};

    errors.forEach((item) => {
      const field =
        item.field ??
        item.fieldName;

      const message =
        item.defaultMessage ??
        item.message ??
        item.error;

      if (field && message) {
        out[field] =
          message;
      }
    });

    return out;
  }

  // =========================================================
  // OBJECT / MAP FORMAT
  // =========================================================

  if (
    typeof errors ===
    "object"
  ) {
    const out = {};

    Object.entries(
      errors
    ).forEach(
      ([field, message]) => {
        out[field] =
          Array.isArray(
            message
          )
            ? message[0]
            : String(
                message
              );
      }
    );

    return out;
  }

  return {};
}

/**
 * Extracts a useful backend-provided message.
 */
function extractMessage(
  data
) {
  if (!data) {
    return null;
  }

  // =========================================================
  // PLAIN TEXT BODY
  // =========================================================

  if (
    typeof data === "string"
  ) {
    const text =
      data.trim();

    if (
      !text ||
      text.startsWith("<")
    ) {
      return null;
    }

    return text;
  }

  // =========================================================
  // STANDARD MESSAGE
  // =========================================================

  if (
    typeof data.message ===
      "string" &&
    data.message.trim()
  ) {
    return data.message.trim();
  }

  /*
   * Only use "error" when there is no
   * more useful "message".
   */
  if (
    typeof data.error ===
      "string" &&
    data.error.trim() &&
    !data.message
  ) {
    return data.error.trim();
  }

  // =========================================================
  // VALIDATION ERRORS
  // =========================================================

  const errors =
    data.errors ??
    data.fieldErrors ??
    data.validationErrors;

  if (
    Array.isArray(errors) &&
    errors.length > 0
  ) {
    const first =
      errors[0];

    return (
      first.defaultMessage ??
      first.message ??
      first.error ??
      null
    );
  }

  if (
    errors &&
    typeof errors ===
      "object"
  ) {
    const first =
      Object.values(
        errors
      )[0];

    if (first) {
      return Array.isArray(
        first
      )
        ? first[0]
        : String(first);
    }
  }

  return null;
}