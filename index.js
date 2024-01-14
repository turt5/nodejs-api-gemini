const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
dotenv.config();
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error('API_KEY environment variable is missing.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/generate', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const localPrompt = "Extract the topic from this topic in short: " + prompt;

    // Get the generative model
    const model = await genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate content based on local prompt
    const result = await model.generateContent(localPrompt);
    const responseTopicText = extractTextFromResponse(result);

    // Generate content based on original prompt
    const result2 = await model.generateContent(prompt);
    const responseMainText = extractTextFromResponse(result2);

    res.status(200).json({ topic: responseTopicText, body: responseMainText });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function extractTextFromResponse(response) {
    try {
      console.log("Response:", response); // Log the entire response object
  
      const candidates = response?.response?.candidates;
      if (candidates && candidates.length > 0) {
        const content = candidates[0]?.content;
        if (content && content.parts && content.parts.length > 0) {
          const text = content.parts[0]?.text;
          if (text) {
            return text;
          }
        }
      }
      throw new Error("Unable to extract text from response");
    } catch (error) {
      console.error("Error extracting text from response:", error);
      return "Error extracting text";
    }
  }
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
