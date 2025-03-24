import { ApiError } from '../errors/ApiError';

export interface ErrorResponse {
  detail: string;
  status?: number;
}

export function handleApiError(error: any): never {
  if (error.response) {
    const { status, data } = error.response;
    const message = (data as ErrorResponse).detail || data.message || 'An error occurred';
    
    switch (status) {
      case 404:
        throw ApiError.NotFound(message);
      case 400:
        throw ApiError.BadRequest(message);
      case 500:
        throw ApiError.ServerError(message);
      default:
        throw new ApiError(status, message, data);
    }
  }
  throw ApiError.ServerError('Network error occurred');
}
