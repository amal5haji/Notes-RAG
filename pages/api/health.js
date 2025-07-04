import { getMilvusClient } from '../../lib/milvus';
import { getEmbedding } from '../../lib/google-ai';
import dbConnect from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const status = {
    timestamp: new Date().toISOString(),
    services: {}
  };

  // Check MongoDB connection
  try {
    await dbConnect();
    status.services.mongodb = { status: 'connected', error: null };
  } catch (error) {
    status.services.mongodb = { status: 'disconnected', error: error.message };
  }

  // Check Google AI service
  try {
    // Test with a simple embedding request
    await getEmbedding('test');
    status.services.googleAI = { 
      status: 'connected', 
      error: null,
      embeddingModel: process.env.GOOGLE_EMBEDDING_MODEL || 'text-embedding-004',
      generativeModel: process.env.GOOGLE_GENERATIVE_MODEL || 'gemini-1.5-flash'
    };
  } catch (error) {
    const isRateLimit = error.status === 429 || error.message.includes('quota') || error.message.includes('rate limit');
    status.services.googleAI = { 
      status: isRateLimit ? 'rate_limited' : 'disconnected', 
      error: error.message,
      fallbackAvailable: true
    };
  }

  // Check Milvus connection
  try {
    const client = await getMilvusClient();
    const version = await client.getVersion();
    status.services.milvus = { 
      status: 'connected', 
      version: version.version,
      error: null 
    };
  } catch (error) {
    status.services.milvus = { 
      status: 'disconnected', 
      error: error.message,
      fallbackAvailable: true
    };
  }

  // Overall health
  const connectedServices = Object.values(status.services).filter(service => service.status === 'connected').length;
  const totalServices = Object.keys(status.services).length;
  
  if (connectedServices === totalServices) {
    status.overall = 'healthy';
  } else if (connectedServices > 0) {
    status.overall = 'degraded';
  } else {
    status.overall = 'unhealthy';
  }

  const statusCode = status.overall === 'healthy' ? 200 : 
                     status.overall === 'degraded' ? 206 : 503;
                     
  res.status(statusCode).json(status);
}
