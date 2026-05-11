/**
 * Vite aliases `ws` to this file for the **client** bundle only.
 * Supabase only uses it when `globalThis.WebSocket` is missing (never in the browser).
 */
const ctor =
  typeof globalThis.WebSocket !== 'undefined'
    ? globalThis.WebSocket
    : (class WebSocketMissing {
        constructor() {
          throw new Error('WebSocket is not available in this environment');
        }
      } as unknown as typeof WebSocket);

export default ctor;
