export interface ApiError {
  status: number;
  code: string;
  message: string;
  details: unknown;
}

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details: unknown;
  };
}
