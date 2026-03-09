import { supabase } from './supabaseClient';

export async function testDatabaseOperations() {
  console.log('🔍 Testing database operations...');

  try {
    // First, check what columns exist in the services table
    console.log('📊 Checking table schema...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'services')
      .order('ordinal_position');

    if (schemaError) {
      console.error('❌ Schema check error:', schemaError);
      return { success: false, error: schemaError.message };
    }

    console.log('✅ Services table columns:', schemaData);

    // Test reading services
    console.log('📖 Testing read operations...');
    const { data: readData, error: readError } = await supabase
      .from('services')
      .select('*')
      .limit(1);

    if (readError) {
      console.error('❌ Read error:', readError);
      return { success: false, error: `Read error: ${readError.message}` };
    }

    console.log('✅ Read successful, sample data:', readData);

    // Test inserting a service
    console.log('➕ Testing insert operations...');
    const testService = {
      service_name: 'Test Service',
      description: 'This is a test service to check database operations',
      price: 99.99,
      status: true
    };

    const { data: insertData, error: insertError } = await supabase
      .from('services')
      .insert([testService])
      .select();

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return { success: false, error: `Insert error: ${insertError.message}` };
    }

    console.log('✅ Insert successful:', insertData);

    // Test updating the service
    console.log('✏️ Testing update operations...');
    const serviceId = insertData[0].id;
    const { data: updateData, error: updateError } = await supabase
      .from('services')
      .update({ description: 'Updated test service description' })
      .eq('id', serviceId)
      .select();

    if (updateError) {
      console.error('❌ Update error:', updateError);
      return { success: false, error: `Update error: ${updateError.message}` };
    }

    console.log('✅ Update successful:', updateData);

    // Test deleting the service
    console.log('🗑️ Testing delete operations...');
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (deleteError) {
      console.error('❌ Delete error:', deleteError);
      return { success: false, error: `Delete error: ${deleteError.message}` };
    }

    console.log('✅ Delete successful');

    return {
      success: true,
      data: {
        schema: schemaData,
        operations: 'All operations successful'
      }
    };

  } catch (err) {
    console.error('💥 Unexpected error:', err);
    return { success: false, error: `Unexpected error: ${err}` };
  }
}
