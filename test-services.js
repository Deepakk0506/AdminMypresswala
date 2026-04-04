import { supabase } from '@/lib/supabaseClient';

async function testServicesConnection() {
  try {
    console.log('Testing services table connection...');
    
    // Test basic connection
    const { data, error, count } = await supabase
      .from('services')
      .select('*', { count: 'exact' });
    
    console.log('Connection test results:');
    console.log('- Error:', error);
    console.log('- Count:', count);
    console.log('- Data:', data);
    
    if (error) {
      console.error('Database error:', error);
      return;
    }
    
    if (count === 0) {
      console.log('✅ Table exists but is empty. You need to add services!');
      
      // Try to add a test service
      const testService = {
        name: 'Test Service',
        description: 'This is a test service to verify the system works'
      };
      
      console.log('Adding test service...', testService);
      
      const { data: insertData, error: insertError } = await supabase
        .from('services')
        .insert([testService])
        .select();
      
      if (insertError) {
        console.error('Failed to add test service:', insertError);
      } else {
        console.log('✅ Test service added successfully:', insertData);
      }
    } else {
      console.log(`✅ Found ${count} services in the database`);
      console.log('Services:', data);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the test
testServicesConnection();
