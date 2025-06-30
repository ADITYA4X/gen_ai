import { OpenAI } from "openai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Check if the OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in the environment variables.");
}

// Initialize OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to run the OpenAI chat completion
async function run() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Hello, how are you?",
        },
      ],
    });

    // Log the response from the OpenAI API
    console.log("Response from OpenAI:", response.choices[0].message.content);
  } catch (error) {
    console.error("Error while calling OpenAI API:", error);
  }
}

// Call the run function
run();
