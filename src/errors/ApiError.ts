export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static NotFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static BadRequest(message = 'Invalid request') {
    return new ApiError(400, message);
  }

  static ServerError(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}
