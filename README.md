# RAG App

This project is a Retrieval-Augmented Generation (RAG) application that utilizes the Google AI Studio API for language model and embedding functionalities. It integrates with a Milvus managed instance for vector storage and uses MongoDB for user notes management.

## Features

- User authentication with login and signup functionality.
- Chat interface for querying the RAG system.
- Notes management with the ability to create, view, and paginate notes.
- Semantic search capabilities to enhance user queries using embeddings.

## Project Structure

```
rag-app
├── .env.local
├── .gitignore
├── README.md
├── components
│   ├── Auth
│   ├── Chat
│   ├── Layout
│   ├── Notes
│   └── UI
├── lib
├── models
├── next.config.js
├── package.json
├── pages
│   ├── _app.js
│   ├── _document.js
│   ├── account.js
│   ├── api
│   ├── chat.js
│   ├── index.js
│   ├── login.js
│   ├── notes
│   └── signup.js
├── public
│   └── favicon.ico
└── styles
    └── globals.css
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd rag-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your environment variables:
   ```
   GOOGLE_API_KEY=your_google_api_key
   MILVUS_CONNECTION_STRING=your_milvus_connection_string
   MONGODB_URI=your_mongodb_uri
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## Usage

- Navigate to `/signup` to create a new account.
- Use `/login` to access your account.
- The main chat interface is available at `/chat`.
- View and manage your notes at `/notes`.

## Technologies Used

- Next.js
- MongoDB with Mongoose
- Milvus for vector storage
- Google AI Studio API for embeddings and language model

## License

This project is licensed under the MIT License.