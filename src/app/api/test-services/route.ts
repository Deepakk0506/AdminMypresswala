import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing services table connection...');
    
    // Test basic connection
    const { data, error, count } = await supabase
      .from('services')
      .select('*', { count: 'exact' })
      .limit(5);
    
    console.log('Connection test results:');
    console.log('- Error:', error);
    console.log('- Count:', count);
    console.log('- Data:', data);
    
    return NextResponse.json({
      success: !error,
      count,
      data,
      error: error?.message
    });
    
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
