/**
 * Current framework adapter for the shared layer.
 * Re-exports from the active framework adapter.
 *
 * When migrating to NestJS: change this file to re-export from './nest' instead of './next'.
 */

export {
  type FrameworkRequest,
  type FrameworkResponse,
  getPath,
  getHeader,
  getBody,
  createJsonResponse,
  setResponseHeader,
  type JsonResponseOptions,
} from './next';
