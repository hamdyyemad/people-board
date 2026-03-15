/**
 * Next.js adapter for the shared layer.
 * This is the ONLY file in shared that imports from "next/server".
 * When migrating to NestJS, add adapters/nest.ts and point current.ts to it instead.
 */

import { NextRequest, NextResponse } from 'next/server';

export type FrameworkRequest = NextRequest;
export type FrameworkResponse = NextResponse;

export function getPath(request: NextRequest): string {
  return request.nextUrl.pathname + request.nextUrl.search;
}

export function getHeader(request: NextRequest, name: string): string | null {
  return request.headers.get(name);
}

/**
 * Reads and parses the request body as JSON.
 * Rejects (throws) on invalid JSON so callers can map to 400.
 */
export async function getBody(request: NextRequest): Promise<unknown> {
  return request.json();
}

export interface JsonResponseOptions {
  status?: number;
  headers?: Record<string, string>;
}

export function createJsonResponse(
  body: unknown,
  options?: JsonResponseOptions
): NextResponse {
  return NextResponse.json(body, {
    status: options?.status,
    headers: options?.headers,
  });
}

export function setResponseHeader(
  response: NextResponse,
  name: string,
  value: string
): void {
  response.headers.set(name, value);
}
