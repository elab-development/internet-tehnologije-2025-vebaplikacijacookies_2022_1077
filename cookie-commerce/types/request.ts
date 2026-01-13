// types/request.ts

import { NextRequest } from 'next/server';
import { JWTPayload } from '@/lib/auth/jwt';

/**
 * Extended NextRequest sa user objektom
 */
export interface AuthenticatedRequest extends NextRequest {
  user: JWTPayload;
}

/**
 * Type guard za proveru da li je request authenticated
 */
export function isAuthenticatedRequest(
  request: NextRequest | AuthenticatedRequest
): request is AuthenticatedRequest {
  return 'user' in request && request.user !== undefined;
}