import { OpenAI } from "openai";
import dotenv from "dotenv";
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Fruit = {
  id: string;
  name: string;
  description: string;
  embedding?: number[];
};

// Step 4: Function to calculate the dot product and cosine similarity
const dotProduct = (vecA: number[], vecB: number[]) => {
  return vecA.reduce((sum, value, index) => sum + value * vecB[index], 0);
};

const cosineSimilarity = (vecA: number[], vecB: number[]) => {
  const dot = dotProduct(vecA, vecB);
  const magnitudeA = Math.sqrt(dotProduct(vecA, vecA));
  const magnitudeB = Math.sqrt(dotProduct(vecB, vecB));
  return dot / (magnitudeA * magnitudeB);
};

// Step 5: Function to perform similarity search
const similaritySearch = (fruits: Fruit[], target: Fruit) => {
  const similarities = fruits
    .filter((fruit) => fruit.id !== target.id)
    .map((fruit) => ({
      name: fruit.name,
      dot: dotProduct(fruit.embedding!, target.embedding!),
      cosine: cosineSimilarity(fruit.embedding!, target.embedding!),
    }))
    .sort((a, b) => b.cosine - a.cosine);
  return similarities;
};

// Step 2: Load fruit data from JSON file
export function loadFruitJsonFile<T>(fileName: string): T {
  const filePath = join(__dirname, fileName);
  const rawData = readFileSync(filePath, "utf-8");
  return JSON.parse(rawData.toString());
}

// Step 1: Generate embeddings for fruit descriptions
async function generateEmbeddings(
  fruitDescription: string | string[]
): Promise<any> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: fruitDescription,
    });

    return response;
  } catch (error) {
    console.error("Error generating embeddings:", error);
  }
}

// Step 3: Save the data with embeddings to a new JSON file
const saveDataToJsonFile = (fileName: string, data: any) => {
  const filePath = join(__dirname, fileName);
  const jsonData = JSON.stringify(data, null, 2);
  writeFileSync(filePath, jsonData, "utf-8");
};

// Main function to run the embedding generation and similarity search
async function run() {
  const fruits: Fruit[] = loadFruitJsonFile("fruits.json");
  const fruitDescriptions = fruits.map((fruit) => fruit.description);

  const embeddings = await generateEmbeddings(fruitDescriptions);
  //   console.log(embeddings);

  const fruitWithEmbeddings = fruits.map((fruit, index) => ({
    ...fruit,
    embedding: embeddings.data[index].embedding,
  }));

  saveDataToJsonFile("fruits_with_embeddings.json", fruitWithEmbeddings);

  const targetFruit = fruitWithEmbeddings.find(
    (fruit) => fruit.name === "Orange"
  );
  if (!targetFruit || !targetFruit.embedding) {
    console.error("Target fruit not found or embedding is missing.");
    return;
  }

  const similarities = similaritySearch(fruitWithEmbeddings, targetFruit);
  console.log(`Similar fruits to ${targetFruit.name}:`);
  similarities.forEach((similarity) => {
    console.log(
      `Name: ${similarity.name}, Dot Product: ${similarity.dot.toFixed(
        2
      )}, Cosine Similarity: ${similarity.cosine.toFixed(2)}`
    );
  });
  console.log("Similarity search completed.");
}

run();
