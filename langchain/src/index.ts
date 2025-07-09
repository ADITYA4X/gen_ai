import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { ChatPromptTemplate } from "@langchain/core/prompts";

dotenv.config();

// Initialize the ChatOpenAI model
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  maxTokens: 500,
  streaming: true,
});

// Define a function to invoke the model with different methods
const prompts = [
  `What is the capital of Bhutan?`,
  `What is the capital of India?`,
];

const main = async () => {
  try {
    // Method 1 single request
    const response1 = await model.invoke(prompts[0]);
    console.log(`Response from the model: ${response1.content}`);
    console.log("\n" + "------------------" + "\n");

    // Method 2 multiple requests
    const response2 = await model.batch(prompts);
    response2.forEach((res, index) => {
      console.log(`Response ${index + 1} from the model: ${res.content}`);
      console.log("\n" + "------------------" + "\n");
    });

    // Method 3 with a stream
    const stream = await model.stream(prompts[0]);
    console.log("Streaming response:");
    for await (const chunk of stream) {
      console.log(chunk.content);
    }
  } catch (error) {
    console.error("Error invoking the model:", error);
  }
};

main();

// Create a prompt template for translation tasks
const run = async () => {
  try {
    const systemTemplate =
      "Translate the following from English into {language}";

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", systemTemplate],
      ["user", "{text}"],
    ]);

    const promptValue = await promptTemplate.invoke({
      language: "hindi",
      text: "Hello everyone, how are you doing today?",
    });

    console.log(`Prompt value: ${promptValue.toString()}`);

    promptValue.toChatMessages();

    const response = await model.invoke(promptValue);
    console.log(`Translation: ${response.content}`);
    console.log("\n" + "------------------" + "\n");
  } catch (error) {
    console.error("Error in run function:", error);
  }
};

run();
