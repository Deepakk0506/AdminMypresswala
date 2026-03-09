import { createClient } from '@supabase/supabase-js';

// Service role key to bypass RLS - you need to get this from your Supabase dashboard
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  SERVICE_ROLE_KEY
);

export async function getAllServicesBypassRLS() {
  try {
    console.log('🔍 Querying services with admin privileges...');
    
    const { data, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Admin query error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Found services with admin:', data);
    return { success: true, data };
  } catch (err) {
    console.error('💥 Admin query exception:', err);
    return { success: false, error: `Admin query error: ${err}` };
  }
}
