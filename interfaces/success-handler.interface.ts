export interface SuccessHandler<T = any> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
  }