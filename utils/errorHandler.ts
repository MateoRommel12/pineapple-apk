import { Alert } from 'react-native';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export class NetworkError extends Error {
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, code: string = 'NETWORK_ERROR', details?: any) {
    super(message);
    this.name = 'NetworkError';
    this.code = code;
    this.details = details;
  }
}

export class BackendError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: any;

  constructor(message: string, code: string = 'BACKEND_ERROR', statusCode?: number, details?: any) {
    super(message);
    this.name = 'BackendError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Handle network and API errors with user-friendly messages
 */
export const handleApiError = (error: any): ApiError => {
  console.error('API Error:', error);

  // Network timeout
  if (error.message?.includes('timeout')) {
    return {
      code: 'TIMEOUT',
      message: 'Request timed out. Please check your internet connection and try again.',
      details: error,
    };
  }

  // Network connection error
  if (error.message?.includes('Network request failed') || 
      error.message?.includes('fetch')) {
    return {
      code: 'NETWORK_FAILED',
      message: 'Unable to connect to the server. Please check that the backend is running.',
      details: error,
    };
  }

  // Backend server errors
  if (error instanceof BackendError) {
    switch (error.statusCode) {
      case 400:
        return {
          code: 'BAD_REQUEST',
          message: 'Invalid request. Please check your image and try again.',
          details: error,
        };
      case 413:
        return {
          code: 'FILE_TOO_LARGE',
          message: 'Image file is too large. Please use an image smaller than 10MB.',
          details: error,
        };
      case 415:
        return {
          code: 'UNSUPPORTED_FORMAT',
          message: 'Unsupported image format. Please use JPG, PNG, or WebP.',
          details: error,
        };
      case 500:
        return {
          code: 'SERVER_ERROR',
          message: 'Server error occurred during analysis. Please try again.',
          details: error,
        };
      default:
        return {
          code: 'BACKEND_ERROR',
          message: `Server error (${error.statusCode}): ${error.message}`,
          details: error,
        };
    }
  }

  // JSON parsing errors
  if (error.message?.includes('JSON')) {
    return {
      code: 'INVALID_RESPONSE',
      message: 'Received invalid response from server. Please try again.',
      details: error,
    };
  }

  // Model/Analysis specific errors
  if (error.message?.includes('model') || error.message?.includes('analysis')) {
    return {
      code: 'ANALYSIS_ERROR',
      message: 'Failed to analyze image. The AI model may be unavailable.',
      details: error,
    };
  }

  // Generic error
  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'An unexpected error occurred. Please try again.',
    details: error,
  };
};

/**
 * Show user-friendly error alert
 */
export const showErrorAlert = (error: ApiError, title: string = 'Error') => {
  Alert.alert(
    title,
    error.message,
    [
      { text: 'OK', style: 'default' }
    ]
  );
};

/**
 * Show error alert with retry option
 */
export const showRetryAlert = (
  error: ApiError, 
  onRetry: () => void, 
  title: string = 'Error'
) => {
  Alert.alert(
    title,
    error.message,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Retry', onPress: onRetry, style: 'default' }
    ]
  );
};

/**
 * Get user-friendly error message for specific error codes
 */
export const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'TIMEOUT':
      return 'The request is taking too long. Please check your connection.';
    case 'NETWORK_FAILED':
      return 'Unable to connect. Is the backend server running?';
    case 'BAD_REQUEST':
      return 'Invalid image or request. Please try a different image.';
    case 'FILE_TOO_LARGE':
      return 'Image is too large. Please use a smaller image.';
    case 'UNSUPPORTED_FORMAT':
      return 'Image format not supported. Use JPG, PNG, or WebP.';
    case 'SERVER_ERROR':
      return 'Server error. Please try again in a moment.';
    case 'ANALYSIS_ERROR':
      return 'Analysis failed. The AI model may be unavailable.';
    case 'INVALID_RESPONSE':
      return 'Received invalid data from server. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Check if error is recoverable (user can retry)
 */
export const isRecoverableError = (errorCode: string): boolean => {
  const recoverableErrors = [
    'TIMEOUT',
    'NETWORK_FAILED',
    'SERVER_ERROR',
    'ANALYSIS_ERROR',
    'INVALID_RESPONSE'
  ];
  
  return recoverableErrors.includes(errorCode);
};

/**
 * Log error for debugging (in development)
 */
export const logError = (error: any, context: string = 'Unknown') => {
  if (__DEV__) {
    console.group(`🚨 Error in ${context}`);
    console.error('Error object:', error);
    console.error('Stack trace:', error.stack);
    console.groupEnd();
  }
};
