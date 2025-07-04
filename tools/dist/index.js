"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("openai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({});
if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in the environment variables.");
}
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
// Step-1: Define the tool function
function getTimeInJapan() {
    const options = {
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
function callOpenAITool() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const context = [
                {
                    role: "system",
                    content: "You are a helpful assistant.",
                },
                {
                    role: "user",
                    content: "What is the current time in Kyoto, Japan?",
                },
            ];
            const response = yield openai.chat.completions.create({
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
            const willInvokeTheTool = response.choices[0].finish_reason === "tool_calls";
            const toolCall = (_a = response.choices[0].message.tool_calls) === null || _a === void 0 ? void 0 : _a[0];
            if (willInvokeTheTool) {
                const toolName = toolCall === null || toolCall === void 0 ? void 0 : toolCall.function.name;
                if (toolName === "getTimeInJapan") {
                    // Step-5: Call the tool function
                    const time = getTimeInJapan();
                    // Step-6: Push the role,content message to context
                    context.push(response.choices[0].message);
                    context.push({
                        role: "tool",
                        content: time,
                        tool_call_id: (_b = toolCall === null || toolCall === void 0 ? void 0 : toolCall.id) !== null && _b !== void 0 ? _b : "",
                    });
                }
            }
            // Step-7: Send the response back to the user
            const finalResponse = yield openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: context,
            });
            console.log("OpenAI Tool Response:", finalResponse.choices[0].message.content);
        }
        catch (error) {
            console.error("Error calling OpenAI tool:", error);
        }
    });
}
callOpenAITool();
