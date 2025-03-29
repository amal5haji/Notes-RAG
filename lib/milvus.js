import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const COLLECTION_NAME = 'user_notes';
const VECTOR_DIMENSION = 768;

let milvusClient = null;

async function getMilvusClient() {
  if (milvusClient) {
    return milvusClient;
  }

  const address = process.env.MILVUS_ADDRESS;
  const username = process.env.MILVUS_USERNAME;
  const password = process.env.MILVUS_PASSWORD;

  if (!address || !username || !password) {
    throw new Error('Missing Milvus connection parameters');
  }

  milvusClient = new MilvusClient({
    address,
    username,
    password,
    ssl: true
  });

  // Ensure collection exists
  try {
    const hasCollection = await milvusClient.hasCollection({
      collection_name: COLLECTION_NAME,
    });

    if (!hasCollection.value) {
      await createCollection();
    }
  } catch (error) {
    console.error('Error checking Milvus collection:', error);
    throw error;
  }

  return milvusClient;
}

async function createCollection() {
  const client = await getMilvusClient();
  
  await client.createCollection({
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
  await client.createIndex({
    collection_name: COLLECTION_NAME,
    field_name: 'embedding',
    index_type: 'AUTOINDEX', // Automatic index selection
    metric_type: 'L2',
  });

  // Load collection
  await client.loadCollection({
    collection_name: COLLECTION_NAME,
  });
}

export async function storeEmbedding(userId, noteId, embedding) {
  try {
    const client = await getMilvusClient();
    
    const id = `${userId}_${noteId}`;
    
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
    console.error('Error storing embedding:', error);
    throw error;
  }
}

export async function searchSimilarNotes(userId, queryEmbedding, limit = 5) {
  try {
    const client = await getMilvusClient();
    
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
    console.error('Error searching similar notes:', error);
    throw error;
  }
}