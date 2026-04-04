import { supabase } from '@/lib/supabaseClient';

async function testDatabaseStructure() {
  console.log('🔍 Testing database structure...');
  
  // Test services table
  try {
    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .limit(1);
    
    console.log('✅ Services table:', servicesError ? '❌ Error' : '✅ Accessible');
    if (servicesError) console.log('Services error:', servicesError);
    else console.log('Sample service:', servicesData);
  } catch (err) {
    console.log('❌ Services table exception:', err);
  }

  // Test garment_categories table
  try {
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('garment_categories')
      .select('*')
      .limit(1);
    
    console.log('✅ Garment Categories table:', categoriesError ? '❌ Error' : '✅ Accessible');
    if (categoriesError) console.log('Categories error:', categoriesError);
    else console.log('Sample category:', categoriesData);
  } catch (err) {
    console.log('❌ Categories table exception:', err);
  }

  // Test garments table
  try {
    const { data: garmentsData, error: garmentsError } = await supabase
      .from('garments')
      .select('*')
      .limit(1);
    
    console.log('✅ Garments table:', garmentsError ? '❌ Error' : '✅ Accessible');
    if (garmentsError) console.log('Garments error:', garmentsError);
    else console.log('Sample garment:', garmentsData);
  } catch (err) {
    console.log('❌ Garments table exception:', err);
  }

  // Test service_garment_pricing table
  try {
    const { data: pricingData, error: pricingError } = await supabase
      .from('service_garment_pricing')
      .select('*')
      .limit(1);
    
    console.log('✅ Service Garment Pricing table:', pricingError ? '❌ Error' : '✅ Accessible');
    if (pricingError) console.log('Pricing error:', pricingError);
    else console.log('Sample pricing:', pricingData);
  } catch (err) {
    console.log('❌ Pricing table exception:', err);
  }

  console.log('🏁 Database structure test completed');
}

// Run the test
testDatabaseStructure();
