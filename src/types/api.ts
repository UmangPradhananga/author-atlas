export interface ErrorModel {
    statusCode: number;
    errorMessage: string;
  }
  
  export interface Response {
    isSuccess: boolean;
    error?: ErrorModel;
  }
  
  export interface GenericResponse<T> extends Response {
    data?: T;
  }