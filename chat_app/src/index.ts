const { OpenAI } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in the environment variables.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Context = {
  role: "system" | "user" | "assistant";
  content: string;
}[];

// Initial context for the chat
const context: Context = [
  {
    role: "system",
    content: "You are a helpful assistant.",
  },
  {
    role: "user",
    content: "Hello! How are you?",
  },
];

// Function to handle chat completions
async function chatCompletion() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: context,
    });

    const responseMessage = response.choices[0].message;
    context.push({
      role: "assistant",
      content: responseMessage.content,
    });
    console.log(`${responseMessage.role} : ${responseMessage.content}`);
  } catch (error) {
    console.error("Error during chat completion:", error);
    throw error;
  }
}

// Main function to run the chat application
async function run() {
  try {
    const input = require("prompt-sync")({ sigint: true });

    while (true) {
      const userInput = input() as string;
      if (userInput.toLowerCase() === "exit") {
        console.log("Exiting the chat...");
        break;
      }

      context.push({
        role: "user",
        content: userInput,
      });

      await chatCompletion();
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
