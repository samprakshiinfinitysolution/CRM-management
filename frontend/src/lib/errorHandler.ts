import { toast } from 'sonner';

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface StructuredApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: ApiErrorDetail[] | unknown;
}

// User-friendly fallback messages mapped to backend domain error codes
const KNOWN_ERROR_CODE_MESSAGES: Record<string, string> = {
  INVALID_SALES_EXECUTIVES: 'One or more selected sales executives are inactive, invalid, or do not exist.',
  NO_EXECUTIVES_PROVIDED: 'Please select at least one active sales executive for assignment.',
  LEADS_NOT_FOUND: 'One or more requested leads do not exist or were deleted.',
  UNASSIGNED_POOL_EMPTY: 'No unassigned leads are currently available in the intake pool.',
  EXCEEDS_AVAILABLE_LEADS: 'The requested assignment count exceeds the number of available leads.',
  DUPLICATE_LEAD: 'A lead with this contact information already exists.',
  UNAUTHORIZED: 'Your session has expired or you are unauthorized. Please sign in again.',
  FORBIDDEN: 'Access denied. You do not have permission to perform this action.',
  VALIDATION_ERROR: 'Invalid input. Please verify the submitted information.',
  INTERNAL_ERROR: 'An unexpected internal server error occurred.',
};

interface BackendErrorPayload {
  message?: string;
  code?: string;
  details?: Array<string | { field?: string; message?: string }>;
}

interface RawApiError {
  status?: string | number;
  code?: string;
  message?: string;
  error?: string;
  data?: {
    message?: string;
    code?: string;
    error?: string | BackendErrorPayload;
  };
  response?: {
    status?: number;
    data?: {
      message?: string;
      code?: string;
      error?: string | BackendErrorPayload;
    };
  };
}

/**
 * Universal error message extractor for RTK Query, Axios, and standard JavaScript errors.
 */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred'
): string {
  if (!error) return fallbackMessage;

  const err = error as RawApiError;

  // 1. Network / Connection errors (RTK Query 'FETCH_ERROR', Axios 'ERR_NETWORK', or TypeError)
  if (err.status === 'FETCH_ERROR' || err.code === 'ERR_NETWORK') {
    return 'Cannot reach the CRM server. Please ensure the backend is running and check your connection.';
  }
  if (err.code === 'ECONNABORTED' || (typeof err.message === 'string' && err.message.toLowerCase().includes('timeout'))) {
    return 'The request timed out. Please try again.';
  }

  // 2. RTK Query FetchBaseQueryError or Axios error with backend ApiResponse envelope:
  // e.g. err.data = { success: false, message: "...", error: { code: "...", details: ... } }
  const data = err.data || err.response?.data;
  if (data && typeof data === 'object') {
    // A. Backend custom message
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }

    // B. Nested error message
    if (typeof data.error === 'object' && data.error && typeof data.error.message === 'string' && data.error.message.trim()) {
      return data.error.message;
    }

    // C. Validation details array (e.g. Zod or Prisma)
    if (typeof data.error === 'object' && data.error && Array.isArray(data.error.details) && data.error.details.length > 0) {
      const details = data.error.details
        .map((d: unknown) => {
          if (typeof d === 'string') return d;
          if (d && typeof d === 'object') {
            const detailObj = d as { field?: string; message?: string };
            if (detailObj.field && detailObj.message) return `${detailObj.field}: ${detailObj.message}`;
            return detailObj.message || null;
          }
          return null;
        })
        .filter(Boolean);
      if (details.length > 0) {
        return details.join('; ');
      }
    }

    // D. Error code mapping
    const errCode = typeof data.error === 'object' && data.error ? data.error.code : undefined;
    const code = errCode || data.code;
    if (code && typeof code === 'string' && KNOWN_ERROR_CODE_MESSAGES[code]) {
      return KNOWN_ERROR_CODE_MESSAGES[code];
    }

    // E. Primitive error string in data.error
    const rawError = (data as Record<string, unknown>).error;
    if (typeof rawError === 'string' && rawError.trim()) {
      return rawError;
    }
  }

  // 3. HTTP status fallback if data didn't contain a specific message
  const status = err.status || err.response?.status;
  if (typeof status === 'number') {
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input parameters.';
      case 401:
        return 'Session expired or unauthenticated. Please sign in again.';
      case 403:
        return 'Access denied. You lack permissions for this operation.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'Conflict detected. The resource may have been modified by another user.';
      case 422:
        return 'Unprocessable request. Validation failed.';
      case 429:
        return 'Too many requests. Please slow down and try again shortly.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Server temporarily unavailable or gateway timed out. Please try again.';
      default:
        break;
    }
  }

  // 4. Standard JS Error object
  if (typeof err.message === 'string' && err.message.trim()) {
    return err.message;
  }

  // 5. RTK Query serialized string error
  if (typeof err.error === 'string' && err.error.trim()) {
    return err.error;
  }

  // 6. Primitive string error
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallbackMessage;
}

/**
 * Extracts error code from backend error response (e.g. 'INVALID_SALES_EXECUTIVES', 'UNASSIGNED_POOL_EMPTY')
 */
export function getApiErrorCode(error: unknown): string | undefined {
  const err = error as RawApiError;
  const data = err.data || err.response?.data;
  if (data && typeof data === 'object') {
    if (typeof data.error === 'object' && data.error && typeof data.error.code === 'string') {
      return data.error.code;
    }
    if (typeof data.code === 'string') {
      return data.code;
    }
  }
  return undefined;
}

/**
 * Extracts HTTP status code if present
 */
export function getApiErrorStatus(error: unknown): number | undefined {
  const err = error as RawApiError;
  const status = err.status || err.response?.status;
  return typeof status === 'number' ? status : undefined;
}

/**
 * Displays a toast error with the extracted API error message and returns the message.
 */
export function handleApiError(error: unknown, fallbackMessage = 'Operation failed'): string {
  const message = getApiErrorMessage(error, fallbackMessage);
  toast.error(message);
  return message;
}
