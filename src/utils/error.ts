class AppError extends Error {
  public status: number;

  constructor(message: string | unknown, status: number) {
    if (message instanceof Error) {
      super(message.message);
    } else {
      super(message as string);
    }
    this.status = status;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
export default AppError;
export interface IValidationError {
  field: string;
  error: string;
}
export class ValidationError extends Error {
  constructor(message: IValidationError[]) {
    super(JSON.stringify(message));
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class VideoProcessingError extends AppError {
  constructor(
    message: string,
    public readonly videoId: string,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message, 500);
    Object.setPrototypeOf(this, VideoProcessingError.prototype);
  }
}
