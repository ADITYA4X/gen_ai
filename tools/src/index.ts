import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config({});

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in the environment variables.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// This code demonstrates how to use OpenAI's tool calling feature to get the current time in Japan.

// Step-1: Define the tool function
function getTimeInJapan(): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  return new Date().toLocaleString("ja-JP", options);
}

async function callOpenAITool() {
  try {
    const context: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "user",
        content: "What is the current time in Kyoto, Japan?",
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: context,
      //   Step-2: Define the tool to be used
      tools: [
        {
          type: "function",
          function: {
            name: "getTimeInJapan",
            description: "Get the current time in Japan",
          },
        },
      ],

      //Step-3: Set the tool choice to auto
      tool_choice: "auto",
    });

    // Step-4: Check if the response indicates a tool call
    const willInvokeTheTool =
      response.choices[0].finish_reason === "tool_calls";
    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (willInvokeTheTool) {
      const toolName = toolCall?.function.name;
      if (toolName === "getTimeInJapan") {
        // Step-5: Call the tool function
        const time = getTimeInJapan();

        // Step-6: Push the role,content message to context
        context.push(response.choices[0].message);
        context.push({
          role: "tool",
          content: time,
          tool_call_id: toolCall?.id ?? "",
        });
      }
    }

    // Step-7: Send the response back to the user
    const finalResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: context,
    });

    console.log(
      "OpenAI Tool Response:",
      finalResponse.choices[0].message.content
    );
  } catch (error) {
    console.error("Error calling OpenAI tool:", error);
  }
}

callOpenAITool();
