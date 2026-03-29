/**
 * API Error Handling
 *
 * Handles HTTP API errors following RFC 7807 (Problem Details for HTTP APIs).
 * Parses fetch responses and throws structured ApiError instances.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7807
 */

// ─────────────────────────────────────────────────────────────────────────
// Error Types & Classes
// ─────────────────────────────────────────────────────────────────────────

/**
 * RFC 7807 Problem Details response structure
 * @see https://datatracker.ietf.org/doc/html/rfc7807
 */
export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  [key: string]: any; // Allow extension members
}

/**
 * Error class that wraps problem details from the backend API
 * Thrown by handleResponse() when an HTTP API call fails
 */
export class ApiError extends Error {
  public readonly details: ProblemDetails;
  public readonly statusCode: number;

  constructor(details: ProblemDetails) {
    super(details.detail || details.title);
    this.name = "ApiError";
    this.details = details;
    this.statusCode = details.status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Response Handler
// ─────────────────────────────────────────────────────────────────────────

/**
 * Handles fetch response and throws ApiError if needed
 * Follows the backend RFC 7807 pattern
 *
 * @param response - The fetch response object
 * @returns Parsed response data on success
 * @throws ApiError on failure with RFC 7807 details
 *
 * @example
 * const res = await fetch('/api/v1/users');
 * const data = await handleResponse<{ data: User[] }>(res);
 * return data.data;
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  
  if (!response.ok) {
    let errorData: ProblemDetails;
    let jsonData: any = null;
    
    // Try to parse JSON from response body
    if (isJson) {
      try {
        jsonData = await response.json();
        console.log("API Error Response:", jsonData);
      } catch (e) {
        console.error("Failed to parse error response JSON:", e);
      }
    } else {
      // Try to parse as JSON anyway even if content-type doesn't indicate it
      try {
        const text = await response.text();
        if (text) {
          jsonData = JSON.parse(text);
          console.log("API Error Response (parsed from text):", jsonData);
        }
      } catch (e) {
        console.error("Failed to parse error response as JSON:", e);
      }
    }
    
    // Build error data from response, checking multiple possible field names
    if (jsonData) {
      errorData = {
        type: jsonData.type,
        title: jsonData.title || jsonData.error || "Error",
        status: jsonData.status || response.status,
        detail: 
          jsonData.detail || 
          jsonData.message || 
          jsonData.msg || 
          jsonData.error ||
          response.statusText,
        instance: jsonData.instance,
      };
    } else {
      // Fallback when no JSON found
      errorData = {
        title: `HTTP ${response.status}`,
        status: response.status,
        detail: response.statusText || "An error occurred",
      };
    }
    
    console.log("Throwing ApiError with detail:", errorData.detail);
    throw new ApiError(errorData);
  }

  if (!isJson) {
    throw new ApiError({
      title: "Invalid Response",
      status: 500,
      detail: "Server returned non-JSON response",
    });
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────
// Global Error Notification System
// ─────────────────────────────────────────────────────────────────────────

/**
 * Global error callback - set at module load time by ApiProvider
 * IMPORTANT: Must be set before any mutations fire
 * @internal
 */
let errorCallback: ((error: ApiError) => void) | null = null;

/**
 * Sets the global error handler callback for API errors
 * Called once at app startup from api-provider.tsx
 *
 * IMPORTANT: Must be called at module load time (not in useEffect)
 * to ensure it's available before any mutations fire
 *
 * @param callback - Function to call when an ApiError occurs
 *
 * @example
 * setGlobalErrorHandler((error: ApiError) => {
 *   toast.error(error.details.detail || error.details.title);
 * });
 */
export function setGlobalErrorHandler(callback: (error: ApiError) => void) {
  console.log("Setting global API error handler");
  errorCallback = callback;
}

/**
 * Notifies the global error handler of an API error
 * Called from mutation onError callbacks
 *
 * @param error - The error to notify about
 *
 * @example
 * onError: (error: unknown) => {
 *   if (error instanceof ApiError) {
 *     triggerError(error);
 *   }
 * }
 */
export function triggerError(error: unknown) {
  if (error instanceof ApiError) {
    console.log("Error is ApiError, has callback?", !!errorCallback);
    if (errorCallback) {
      console.log("Triggering errorCallback");
      errorCallback(error);
    } else {
      console.warn("errorCallback not set!");
    }
  } else {
    console.warn("triggerError received non-ApiError:", error);
  }
}
