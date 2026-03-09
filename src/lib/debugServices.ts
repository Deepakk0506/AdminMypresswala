import { supabase } from './supabaseClient';

export async function debugServicesIssue() {
  console.log('🔍 Debugging services CRUD operations...');

  try {
    // Step 1: Test basic connection and read
    console.log('📖 Testing read operations...');
    const { data: readData, error: readError } = await supabase
      .from('services')
      .select('*')
      .limit(1);

    if (readError) {
      console.error('❌ Read failed:', readError);
      return { success: false, error: `Read error: ${readError.message}` };
    }

    console.log('✅ Read successful, found', readData.length, 'services');

    // Step 2: Check RLS status
    console.log('🔐 Checking RLS status...');
    const { data: rlsData, error: rlsError } = await supabase.rpc('exec', {
      sql: "SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'services'"
    });

    if (rlsError) {
      console.log('⚠️ Could not check RLS (may be expected):', rlsError.message);
    } else {
      console.log('✅ RLS status:', rlsData);
    }

    // Step 3: Test insert operation
    console.log('➕ Testing insert operation...');
    const testService = {
      service_name: `Test Service ${Date.now()}`,
      description: 'This is a test service to debug CRUD operations',
      price: 99.99,
      status: true,
      category: 'Test'
    };

    console.log('Inserting:', testService);
    const { data: insertData, error: insertError } = await supabase
      .from('services')
      .insert([testService])
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      console.error('Error details:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
      return { success: false, error: `Insert error: ${insertError.message}` };
    }

    console.log('✅ Insert successful:', insertData);

    // Step 4: Test update operation
    if (insertData && insertData.length > 0) {
      console.log('✏️ Testing update operation...');
      const serviceId = insertData[0].id;
      const { data: updateData, error: updateError } = await supabase
        .from('services')
        .update({ description: 'Updated test service description' })
        .eq('id', serviceId)
        .select();

      if (updateError) {
        console.error('❌ Update failed:', updateError);
        console.error('Error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
      } else {
        console.log('✅ Update successful:', updateData);
      }

      // Step 5: Test delete operation
      console.log('🗑️ Testing delete operation...');
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (deleteError) {
        console.error('❌ Delete failed:', deleteError);
        console.error('Error details:', {
          message: deleteError.message,
          details: deleteError.details,
          hint: deleteError.hint,
          code: deleteError.code
        });
      } else {
        console.log('✅ Delete successful');
      }
    }

    // Step 6: Check environment variables (without exposing secrets)
    console.log('🔧 Environment check:');
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log('Supabase URL configured:', hasSupabaseUrl);
    console.log('Supabase Key configured:', hasSupabaseKey);

    return {
      success: true,
      data: {
        readCount: readData.length,
        envCheck: { hasSupabaseUrl, hasSupabaseKey }
      }
    };

  } catch (err) {
    console.error('💥 Unexpected error:', err);
    return { success: false, error: `Unexpected error: ${err}` };
  }
}
