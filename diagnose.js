#!/usr/bin/env node

// Quick diagnostic script to check current configuration
// Run with: node diagnose.js

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Diagnostic Report - Notes RAG Application\n');

console.log('📅 Generated:', new Date().toLocaleString());
console.log('📁 Working Directory:', process.cwd());

console.log('\n🔐 Environment Variables:');

// Google AI
console.log('\n📡 Google AI:');
console.log(`  API Key: ${process.env.GOOGLE_AI_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`  Embedding Model: ${process.env.GOOGLE_EMBEDDING_MODEL || '❌ Not set (will use default)'}`);
console.log(`  Generative Model: ${process.env.GOOGLE_GENERATIVE_MODEL || '❌ Not set (will use default)'}`);

if (process.env.GOOGLE_GENERATIVE_MODEL === 'gemini-2.5-pro-exp-03-25') {
  console.log('  ⚠️  WARNING: You\'re using an experimental model with strict rate limits!');
  console.log('     Recommended: Change to gemini-1.5-flash for better performance');
}

// Milvus
console.log('\n🗄️  Milvus/Vector Database:');
console.log(`  Address: ${process.env.MILVUS_ADDRESS || '❌ Not configured'}`);
console.log(`  Username: ${process.env.MILVUS_USERNAME ? '✅ Set' : '❌ Missing'}`);
console.log(`  Password: ${process.env.MILVUS_PASSWORD ? '✅ Set' : '❌ Missing'}`);

if (process.env.MILVUS_ADDRESS) {
  const addr = process.env.MILVUS_ADDRESS;
  if (!addr.includes('://') && !addr.includes(':')) {
    console.log('  ❌ INVALID: Address appears to be incomplete');
    console.log('     Expected: https://cluster-id.region.vectordb.zillizcloud.com:19530');
    console.log(`     Got: ${addr}`);
  } else if (addr.includes('://')) {
    console.log('  ✅ Address format looks correct');
  } else {
    console.log('  ⚠️  Address might need https:// prefix');
  }
}

// MongoDB
console.log('\n🍃 MongoDB:');
console.log(`  URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Missing'}`);

// JWT
console.log('\n🔑 Authentication:');
console.log(`  JWT Secret: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);

// File checks
console.log('\n📄 Configuration Files:');
const fs = require('fs');
console.log(`  .env.local: ${fs.existsSync('.env.local') ? '✅ Exists' : '❌ Missing'}`);
console.log(`  .env.template: ${fs.existsSync('.env.template') ? '✅ Exists' : '❌ Missing'}`);

// Recommendations
console.log('\n💡 Recommendations:');

if (!process.env.GOOGLE_AI_API_KEY) {
  console.log('  1. Set up Google AI API key from https://aistudio.google.com/app/apikey');
}

if (process.env.GOOGLE_GENERATIVE_MODEL === 'gemini-2.5-pro-exp-03-25') {
  console.log('  2. Change GOOGLE_GENERATIVE_MODEL to gemini-1.5-flash for better rate limits');
}

if (!process.env.MILVUS_ADDRESS || !process.env.MILVUS_ADDRESS.includes('://')) {
  console.log('  3. Configure Milvus with full endpoint URL from Zilliz Cloud dashboard');
}

if (!process.env.MONGODB_URI) {
  console.log('  4. Set up MongoDB connection (MongoDB Atlas or local instance)');
}

console.log('\n🚀 Quick Setup:');
console.log('  Run: npm run setup (for interactive configuration)');
console.log('  Or: node setup.js');

console.log('\n🏥 Health Check:');
console.log('  After fixing config, run: npm run health');
console.log('  Or visit: http://localhost:3000/api/health');

console.log('\n' + '='.repeat(60));
