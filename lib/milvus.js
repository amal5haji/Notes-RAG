import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const COLLECTION_NAME = 'user_notes';
const VECTOR_DIMENSION = 768;
const CONNECTION_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

let milvusClient = null;

async function getMilvusClient() {
  if (milvusClient) {
    return milvusClient;
  }

  const address = process.env.MILVUS_ADDRESS;
  const username = process.env.MILVUS_USERNAME;
  const password = process.env.MILVUS_PASSWORD;

  if (!address) {
    throw new Error('Missing Milvus address in environment variables');
  }
  if (!username) {
    throw new Error('Missing Milvus username in environment variables');
  }
  if (!password) {
    throw new Error('Missing Milvus password in environment variables');  
  }

  // Create client with increased timeout
  milvusClient = new MilvusClient({
    address,
    username,
    password,
    ssl: true,
    timeout: CONNECTION_TIMEOUT
  });

  // Ensure collection exists
  try {
    await checkCollectionExists();
  } catch (error) {
    console.error('Error initializing Milvus:', error);
    milvusClient = null; // Reset client on error
    throw error;
  }

  return milvusClient;
}

// Function to check if collection exists with retries
async function checkCollectionExists() {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Checking if collection exists (attempt ${attempt}/${MAX_RETRIES})...`);
      const hasCollection = await milvusClient.hasCollection({
        collection_name: COLLECTION_NAME,
      });

      if (!hasCollection.value) {
        await createCollection();
      }
      console.log('Collection check successful');
      return;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        throw new Error(`Failed to connect to Milvus after ${MAX_RETRIES} attempts: ${error.message}`);
      }
    }
  }
}

async function createCollection() {
  try {
    console.log(`Creating collection: ${COLLECTION_NAME}`);
    await milvusClient.createCollection({
      collection_name: COLLECTION_NAME,
      fields: [
        {
          name: 'id',
          description: 'ID field',
          data_type: 5, // VARCHAR
          is_primary_key: true,
          max_length: 100,
        },
        {
          name: 'user_id',
          description: 'User ID',
          data_type: 5, // VARCHAR
          max_length: 100,
        },
        {
          name: 'note_id',
          description: 'Note ID',
          data_type: 5, // VARCHAR
          max_length: 100,
        },
        {
          name: 'embedding',
          description: 'Vector embedding',
          data_type: 101, // FLOAT_VECTOR
          dim: VECTOR_DIMENSION,
        },
      ],
    });

    // Create index
    await milvusClient.createIndex({
      collection_name: COLLECTION_NAME,
      field_name: 'embedding',
      index_type: 'AUTOINDEX', // Automatic index selection
      metric_type: 'L2',
    });

    // Load collection
    await milvusClient.loadCollection({
      collection_name: COLLECTION_NAME,
    });
    console.log(`Collection ${COLLECTION_NAME} created successfully`);
  } catch (error) {
    console.error('Error creating collection:', error);
    throw error;
  }
}

// Health check function to verify connection
export async function checkMilvusHealth() {
  try {
    const client = await getMilvusClient();
    await client.listCollections();
    return { status: 'connected' };
  } catch (error) {
    return { 
      status: 'error', 
      message: error.message,
      code: error.code || 'UNKNOWN'
    };
  }
}

export async function storeEmbedding(userId, noteId, embedding) {
  try {
    const client = await getMilvusClient();
    
    const id = `${userId}_${noteId}`;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await client.insert({
          collection_name: COLLECTION_NAME,
          fields_data: [{
            id,
            user_id: userId,
            note_id: noteId,
            embedding,
          }],
        });
        return id;
      } catch (error) {
        console.error(`Insert attempt ${attempt} failed:`, error.message);
        
        if (attempt < MAX_RETRIES) {
          console.log(`Retrying insert in ${RETRY_DELAY/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Error storing embedding:', error);
    throw error;
  }
}

export async function searchSimilarNotes(userId, queryEmbedding, limit = 5) {
  try {
    const client = await getMilvusClient();
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const searchResult = await client.search({
          collection_name: COLLECTION_NAME,
          vector: queryEmbedding,
          filter: `user_id == "${userId}"`,
          output_fields: ['note_id'],
          limit,
          metric_type: 'L2',
        });
        
        return searchResult.results.map(item => ({
          noteId: item.entity.note_id,
          score: item.score,
        }));
      } catch (error) {
        console.error(`Search attempt ${attempt} failed:`, error.message);
        
        if (attempt < MAX_RETRIES) {
          console.log(`Retrying search in ${RETRY_DELAY/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Error searching similar notes:', error);
    throw error;
  }
}

// Close client connection
export async function closeMilvusConnection() {
  if (milvusClient) {
    try {
      await milvusClient.close();
      console.log('Milvus connection closed');
      milvusClient = null;
    } catch (error) {
      console.error('Error closing Milvus connection:', error);
    }
  }
}