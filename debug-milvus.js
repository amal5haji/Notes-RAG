#!/usr/bin/env node

// Debug script to test Milvus connection
// Run with: node debug-milvus.js

require('dotenv').config({ path: '.env.local' });

async function testMilvusConnection() {
  try {
    console.log('🔍 Testing Milvus connection...');
    console.log(`Address: ${process.env.MILVUS_ADDRESS}`);
    console.log(`Username: ${process.env.MILVUS_USERNAME ? '***set***' : 'NOT SET'}`);
    console.log(`Password: ${process.env.MILVUS_PASSWORD ? '***set***' : 'NOT SET'}`);
    
    // Import the milvus module
    const { getMilvusClient } = await import('./lib/milvus.js');
    
    console.log('\n🚀 Attempting to connect...');
    const client = await getMilvusClient();
    
    if (client) {
      console.log('✅ Successfully connected to Milvus!');
      
      // Test basic operations
      const version = await client.getVersion();
      console.log(`📦 Milvus version: ${version.version}`);
      
      // List collections
      const collections = await client.listCollections();
      console.log(`📋 Available collections: ${collections.collection_names.join(', ')}`);
      
    } else {
      console.log('❌ Failed to get Milvus client');
    }
    
  } catch (error) {
    console.error('❌ Error testing Milvus connection:');
    console.error(`   ${error.message}`);
    
    if (error.message.includes('Name resolution failed')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   1. Check if your MILVUS_ADDRESS is correct');
      console.log('   2. Ensure your Zilliz Cloud cluster is running');
      console.log('   3. Verify your internet connection');
      console.log('   4. Check if the cluster endpoint includes the correct port');
      console.log('   5. Make sure the address includes https:// for Zilliz Cloud');
    }
    
    if (error.message.includes('UNAVAILABLE')) {
      console.log('\n💡 The Milvus service appears to be unavailable:');
      console.log('   1. Check if your Zilliz Cloud cluster is paused/stopped');
      console.log('   2. Verify your credentials are correct');
      console.log('   3. Check the cluster status in your Zilliz Cloud dashboard');
    }
  }
}

testMilvusConnection();
