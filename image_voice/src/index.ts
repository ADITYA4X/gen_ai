import { OpenAI } from "openai";
import dotenv from "dotenv";
import { writeFileSync, createReadStream } from "node:fs";

dotenv.config({});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateImageFromText() {
  try {
    const response = await openai.images.generate({
      prompt: "cute cats group ",
      n: 1,
      size: "1024x1024",
      model: "dall-e-3",
      quality: "standard",
      style: "vivid",
    });

    const imageUrl = response.data?.[0].b64_json;
    if (imageUrl) {
      writeFileSync("image.png", Buffer.from(imageUrl, "base64"));
    }
    console.log(response);
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

generateImageFromText();

// Function to convert text to speech using OpenAI's TTS API
async function textToSpeech() {
  try {
    const sampleText =
      "yadā yadā hi dharmasya glānir bhavati bhārata abhyutthānam adharmasya tadātmānaṁ sṛjāmy aham";

    const response = await openai.audio.speech.create({
      model: "tts-1",
      input: sampleText,
      response_format: "mp3",
      voice: "alloy",
    });

    console.log(response);
    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync("output.mp3", buffer);
  } catch (error) {
    console.error("Error generating speech:", error);
  }
}

textToSpeech();

// Function to convert speech to text using OpenAI's Whisper model
async function SpeechToText() {
  try {
    const response = await openai.audio.transcriptions.create({
      file: createReadStream("output.mp3"),
      model: "whisper-1",
      language: "hi",
    });

    console.log(response);
  } catch (error) {
    console.error("Error generating speech:", error);
  }
}

SpeechToText();
