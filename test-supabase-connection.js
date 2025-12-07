import { supabase } from '@/lib/supabase/client'

async function testConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test 1: Check if table exists
    console.log('📋 Checking if table "excellence_files" exists...')
    const { data, error } = await supabase
      .from('excellence_files')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Table check failed:', error.message)
      
      if (error.message.includes('relation "excellence_files" does not exist')) {
        console.log('\n🔧 SOLUTION: Table does not exist')
        console.log('1. Go to Supabase Dashboard → SQL Editor')
        console.log('2. Copy and paste the contents of: supabase-schema-excellence-files.sql')
        console.log('3. Execute the script to create the table and bucket')
        return
      }
      
      console.log('❌ Database error:', error.message)
      return
    }
    
    console.log('✅ Table exists and is accessible')
    
    // Test 2: Check storage buckets
    console.log('\n🗂️ Checking storage buckets...')
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.error('❌ Bucket check failed:', bucketError.message)
      return
    }
    
    const excellenceBucket = buckets?.find(bucket => bucket.id === 'excellence-files')
    if (excellenceBucket) {
      console.log('✅ Storage bucket "excellence-files" exists')
    } else {
      console.log('❌ Storage bucket "excellence-files" not found')
      console.log('🔧 Run the SQL schema script to create it')
    }
    
    // Test 3: Check auth status
    console.log('\n🔐 Checking authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('⚠️ Auth error:', authError.message)
      console.log('💡 Uploads may require authentication')
    } else if (user) {
      console.log('✅ User authenticated:', user.email || user.id)
    } else {
      console.log('⚠️ No user session detected')
      console.log('💡 Uploads may require authentication')
    }
    
    console.log('\n🎉 All tests completed!')
    
  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

testConnection()