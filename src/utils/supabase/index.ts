
export { createBrowserClient } from './browserClient';
export { createServerClient } from './serverClient';

/**
 * Use this convenience function to get the appropriate client
 * based on the environment
 */
export function getSupabaseClient() {
  if (typeof window !== 'undefined') {
    // We're in the browser
    const { createBrowserClient } = require('./browserClient');
    return createBrowserClient();
  } else {
    // We're on the server
    const { createServerClient } = require('./serverClient');
    return createServerClient();
  }
}
