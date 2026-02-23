// lib/utils/api-response.ts

import { NextResponse } from 'next/server';

/**
 * Helper funkcije za konzistentne API odgovore
 */

export function successResponse(data: unknown, message?: string, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      ...(message && { message }),
      data,
    },
    { status }
  );
}

export function errorResponse(
  error: string,
  status: number = 400,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details !== undefined ? { details } : {}),
    },
    { status }
  );
}

export function validationErrorResponse(errors: Record<string, string>) {
  return NextResponse.json(
    {
      success: false,
      error: 'Validacija nije uspela',
      errors,
    },
    { status: 400 }
  );
}

export function unauthorizedResponse(message: string = 'Niste autorizovani') {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 401 }
  );
}

export function forbiddenResponse(message: string = 'Nemate dozvolu za ovu akciju') {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 403 }
  );
}

export function notFoundResponse(resource: string = 'Resurs') {
  return NextResponse.json(
    {
      success: false,
      error: `${resource} nije pronađen`,
    },
    { status: 404 }
  );
}

export function serverErrorResponse(
  error: unknown,
  message: string = 'Došlo je do greške na serveru'
) {
  console.error('Server error:', error);

  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.message : String(error),
      }),
    },
    { status: 500 }
  );
}