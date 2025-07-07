import { ChromaClient, EmbeddingFunction } from "chromadb";
import { OpenAI } from "openai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Run ChromaDB using Docker with the command:
// docker run -p 8000:8000 chromadb/chromadb:latest

// Initialize ChromaDB client
const chromaClient = new ChromaClient({
  host: "localhost",
  port: 8000,
});

// OpenAIEmbedding class implements EmbeddingFunction for ChromaDB.
// The `generate` method sends texts to OpenAI and returns their embeddings.
class OpenAIEmbedding implements EmbeddingFunction {
  async generate(texts: string[]): Promise<number[][]> {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });
    return response.data.map((embedding) => embedding.embedding);
  }
}

// Initialize collection in ChromaDB with OpenAI embeddings
const init = async () => {
  const embedder = new OpenAIEmbedding();

  const collection = await chromaClient.getOrCreateCollection({
    name: "test_collection",
    embeddingFunction: embedder,
  });

  return collection;
};

// Function to add messages to the collection
const addMessages = async (id: string, text: string) => {
  const collection = await init();

  await collection.add({
    ids: [id],
    documents: [text],
  });

  console.log(`Added Text: "${text}" with ID: ${id} to the collection.\n`);
};

// Function to retrieve similar messages based on a query
const getSimilarMessages = async (text: string, limit: number = 5) => {
  const collection = await init();
  const results = await collection.query({
    queryTexts: [text],
    nResults: limit,
  });

  console.log(
    `Similar messages/queries for "${text}": ${results.documents[0].join(", ")}`
  );

  return results.documents[0];
};

// Main function to run the example
const run = async () => {
  // Add messages to the collection
  await addMessages("1", "What is the difference between REST and GraphQL?");
  await addMessages("2", "How do I optimize React performance?");
  await addMessages("3", "Explain the SOLID principles in software design.");
  await addMessages("4", "What is Docker and why is it used?");
  await addMessages(
    "5",
    "How does continuous integration improve development workflow?"
  );

  // Retrieve similar messages
  await getSimilarMessages("Can you explain CI?", 1);
};

run();
