module.exports = {
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
  reactStrictMode: false,

  experimental: {
    serverComponentsExternalPackages: [
      "sharp",
      "onnxruntime-node",
      "@zilliz/milvus2-sdk-node",
    ],
    outputFileTracingIncludes: {
      // When deploying to Vercel, the following configuration is required
      "/api/**/*": ["node_modules/@zilliz/milvus2-sdk-node/dist/proto/**/*"],
    },
  },
};