import { supabase } from './supabaseClient';

export async function createServicesRLSPolicy() {
  try {
    console.log('🔧 Creating RLS policy to allow public access to services...');
    
    // First, enable RLS on the services table if not already enabled
    const { error: enableError } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE services ENABLE ROW LEVEL SECURITY;'
    });
    
    if (enableError && !enableError.message.includes('already enabled')) {
      console.log('⚠️ RLS already enabled or error:', enableError.message);
    }
    
    // Drop existing policy if it exists
    const { error: dropError } = await supabase.rpc('exec', {
      sql: 'DROP POLICY IF EXISTS "services_public_select" ON services;'
    });
    
    if (dropError) {
      console.log('⚠️ Drop policy error (may be expected):', dropError.message);
    }
    
    // Create a new policy that allows anyone to read services
    const { error: createError } = await supabase.rpc('exec', {
      sql: `
        CREATE POLICY "services_public_select" ON services
        FOR SELECT USING (true);
      `
    });
    
    if (createError) {
      console.error('❌ Failed to create RLS policy:', createError);
      return { success: false, error: createError.message };
    }
    
    console.log('✅ RLS policy created successfully!');
    
    // Test the policy
    const { data, error: testError } = await supabase
      .from('services')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Policy test failed:', testError);
      return { success: false, error: `Policy created but test failed: ${testError.message}` };
    }
    
    console.log('✅ Policy test passed! Services are now accessible.');
    return { success: true, data };
    
  } catch (err) {
    console.error('💥 RLS policy creation error:', err);
    return { success: false, error: `RLS policy error: ${err}` };
  }
}

export async function disableRLSOnServices() {
  try {
    console.log('🔧 Disabling RLS on services table...');
    
    const { error } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE services DISABLE ROW LEVEL SECURITY;'
    });
    
    if (error) {
      console.error('❌ Failed to disable RLS:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ RLS disabled on services table!');
    
    // Test access
    const { data, error: testError } = await supabase
      .from('services')
      .select('*');
    
    if (testError) {
      console.error('❌ Test failed after disabling RLS:', testError);
      return { success: false, error: testError.message };
    }
    
    console.log('✅ Services accessible after disabling RLS!');
    return { success: true, data };
    
  } catch (err) {
    console.error('💥 Disable RLS error:', err);
    return { success: false, error: `Disable RLS error: ${err}` };
  }
}
