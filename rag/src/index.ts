import { Document } from "@langchain/core/documents";
import dotenv from "dotenv";
import fs from "fs";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

dotenv.config();

async function main() {
  try {
    //Step 1: Read the raw text file
    const rawtext = fs.readFileSync("./src/data/docs.txt", "utf8");

    // Step 2:
    // Create a text splitter instance
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 100,
    });

    // Split the raw text into smaller chunks
    const docs = await splitter.splitDocuments([
      new Document({
        pageContent: rawtext,
      }),
    ]);

    // Step 3: Create an embeddings from chunk and store the data in memory database
    const vectorStore = await MemoryVectorStore.fromDocuments(
      docs,
      new OpenAIEmbeddings()
    );

    // Step 4: Retrieve or fetch chunk data
    const retriever = vectorStore.asRetriever();

    const question = "Who is the CEO of Tesla?";

    const results = await retriever._getRelevantDocuments(question);

    // Step-5: Create a prompt
    const context = results.map((doc, index) => {
      return `${index + 1}. ${doc.pageContent}`;
    });

    const prompt = `You are helpful assistant. use the context below to answer the question.
    Context: ${context}
    Question: ${question} `;

    // Step-6: GPT-Model
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      maxTokens: 500,
    });

    const response = await model.invoke(prompt);

    console.log(`Answer: ${response.content}`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
