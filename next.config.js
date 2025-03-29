module.exports = {
  reactStrictMode: true,
  env: {
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
    GOOGLE_EMBEDDING_MODEL: process.env.GOOGLE_EMBEDDING_MODEL,
    GOOGLE_GENERATIVE_MODEL: process.env.GOOGLE_GENERATIVE_MODEL,
    MILVUS_ADDRESS: process.env.MILVUS_ADDRESS,
    MILVUS_USERNAME: process.env.MILVUS_USERNAME,
    MILVUS_PASSWORD: process.env.MILVUS_PASSWORD,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  },
};