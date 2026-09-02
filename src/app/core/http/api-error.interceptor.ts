import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { ApiError, ApiErrorEnvelope } from '../../shared/models/api-error.model';

function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  if (typeof value !== 'object' || value === null || !('error' in value)) {
    return false;
  }

  const candidate = value.error;
  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    'code' in candidate &&
    typeof candidate.code === 'string' &&
    'message' in candidate &&
    typeof candidate.message === 'string'
  );
}

function normalizeApiError(error: unknown): ApiError {
  if (!(error instanceof HttpErrorResponse)) {
    return {
      status: 0,
      code: 'client_error',
      message: 'No se pudo completar la operación.',
      details: error,
    };
  }

  if (isApiErrorEnvelope(error.error)) {
    return {
      status: error.status,
      code: error.error.error.code,
      message: error.error.error.message,
      details: error.error.error.details,
    };
  }

  return {
    status: error.status,
    code: error.status === 0 ? 'api_unreachable' : 'http_error',
    message:
      error.status === 0
        ? 'No se pudo conectar con la API.'
        : 'La API no pudo completar la solicitud.',
    details: error.error,
  };
}

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => throwError(() => normalizeApiError(error))),
  );
