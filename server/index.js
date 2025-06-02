import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { promises as fs } from "fs";
import { exec } from "child_process";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://architecturebot-ccvg.onrender.com/",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

const port = 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "-" });
const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "iZqfTs6ZpfGIMJMyFf2Z"; // Architecture-themed voice

// Utility to run shell commands
const execCommand = (command) =>
  new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });

// Generate speech with ElevenLabs
const generateSpeech = async (text, fileName) => {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceID}/stream`;
  const headers = {
    "Content-Type": "application/json",
    "xi-api-key": elevenLabsApiKey,
    Accept: "audio/mpeg",
  };
  const data = {
    text,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5,
    },
  };

  const response = await axios.post(url, data, {
    headers,
    responseType: "stream",
  });

  const writer = await fs.open(fileName, "w");
  await new Promise((resolve, reject) => {
    const stream = response.data.pipe(writer.createWriteStream());
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  await writer.close();
  console.log(`🎤 Audio saved: ${fileName}`);
};

// Convert mp3 to wav and generate Rhubarb lipsync
const lipSyncMessage = async (index) => {
  const mp3 = `audios/message_${index}.mp3`;
  const wav = `audios/message_${index}.wav`;
  const json = `audios/message_${index}.json`;

  console.log(`🎞️ Converting ${mp3} to ${wav}`);
  await execCommand(`ffmpeg -y -i ${mp3} ${wav}`);

  console.log(`🗣️ Generating lipsync for ${wav}`);
  await execCommand(`./bin/rhubarb -f json -o ${json} ${wav} -r phonetic`);
  console.log(`✅ Lipsync file created: ${json}`);
};

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!elevenLabsApiKey || openai.apiKey === "-") {
      return res.send({
        messages: [
          {
            text: "My drawing tools are locked... Please add your API keys to proceed.",
            audio: null,
            lipsync: [],
            facialExpression: "angry",
            animation: "Angry",
          },
        ],
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1000,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are an architecture professor with a warm, passionate tone.
You always respond with a JSON object containing a "messages" array (max 3 entries).
Each message has:
- "text": response about architecture/design/history/creativity
- "facialExpression": one of [smile, sad, angry, surprised, funnyFace, default]
- "animation": one of [Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, Angry]

Respond only with JSON. Example:
{
  "messages": [
    {
      "text": "Architecture is the thoughtful making of space.",
      "facialExpression": "smile",
      "animation": "Talking_1"
    }
  ]
}
        `,
        },
        { role: "user", content: userMessage },
      ],
    });

    let parsed = JSON.parse(completion.choices[0].message.content);
    let messages = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.messages)
        ? parsed.messages
        : parsed.messages?.responses;

    if (!Array.isArray(messages)) {
      throw new Error("OpenAI returned an invalid format.");
    }

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const mp3File = `audios/message_${i}.mp3`;
      const jsonFile = `audios/message_${i}.json`;

      try {
        await generateSpeech(message.text, mp3File);
        await lipSyncMessage(i);
        message.audio = await audioFileToBase64(mp3File);
        message.lipsync = await readJsonTranscript(jsonFile);
      } catch (err) {
        console.error("Audio or lipsync generation failed:", err.message);
        message.audio = null;
        message.lipsync = [];
      }
    }

    res.send({ messages });
  } catch (err) {
    console.error("❌ Server error in /chat:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
  }
});

app.listen(port, () => {
  console.log(`🏛️ Architecture Bot running on http://localhost:${port}`);
});
