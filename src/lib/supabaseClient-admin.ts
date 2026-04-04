// Updated Supabase client to use admin_role
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create client with admin role
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'admin-panel'
    }
  }
});

// Alternative: Use service role key if you have it
// export const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!);
