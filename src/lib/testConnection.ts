import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

export async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // Test basic connection
    const { data, error } = await supabase.from('services').select('count');
    
    console.log('📊 Connection test result:', { data, error });
    
    if (error) {
      console.error('❌ Database connection error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { success: false, error: error.message };
    }
    
    console.log('✅ Database connection successful!');
    return { success: true, data };
  } catch (err) {
    console.error('💥 Unexpected error:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

export async function debugServicesQuery() {
  try {
    console.log('🔍 Debugging services query...');
    
    // Test 1: Simple count
    console.log('📊 Test 1: Getting count...');
    const { count, error: countError } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Count error:', countError);
      return { success: false, error: `Count error: ${countError.message}` };
    }
    
    console.log('✅ Services count:', count);
    
    // Test 2: Full query
    console.log('📊 Test 2: Full query...');
    const { data, error } = await supabase
      .from('services')
      .select('*');
    
    if (error) {
      console.error('❌ Query error:', error);
      return { success: false, error: `Query error: ${error.message}` };
    }
    
    console.log('✅ Services data:', data);
    
    // Test 3: Check session/auth
    console.log('📊 Test 3: Checking session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    } else {
      console.log('✅ Session data:', sessionData);
    }
    
    return { 
      success: true, 
      data: {
        count,
        services: data,
        session: sessionData
      }
    };
  } catch (err) {
    console.error('💥 Debug query error:', err);
    return { success: false, error: `Debug error: ${err}` };
  }
}

export async function createSampleService() {
  try {
    const sampleService = {
      service_name: 'Web Development',
      description: 'Professional web development services using modern technologies',
      price: 999,
      duration: '2-4 weeks',
      category: 'Development'
    };

    const { data, error } = await supabase
      .from('services')
      .insert(sampleService)
      .select();

    if (error) {
      console.error('Error creating sample service:', error);
      return { success: false, error: error.message };
    }

    console.log('Sample service created successfully!', data);
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
}
