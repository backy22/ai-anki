import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const realtime =
  typeof globalThis.WebSocket === 'undefined'
    ? { realtime: { transport: ws as unknown as typeof WebSocket } }
    : {};

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_PUBLIC,
  realtime
);
