import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let model = null;

export const initGemini = (apiKey) => {
  if (!apiKey) return false;
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    localStorage.setItem('geminiApiKey', apiKey);
    return true;
  } catch (error) {
    console.error("Failed to init Gemini:", error);
    return false;
  }
};

const DEFAULT_API_KEY = "AIzaSyClrGBXNQ4EwHMbKLCY7fklRhyvuclUsAw";
const savedKey = localStorage.getItem('geminiApiKey') || DEFAULT_API_KEY;

if (savedKey) {
  initGemini(savedKey);
}

// Pass language ('ar' or 'en')
export const buildSentence = async (wordsArray, language = 'en') => {
  if (!model || wordsArray.length === 0) return null;

  try {
    const langInstruction = language === 'ar' 
      ? 'Output ONLY in natural Arabic. Create a grammatically correct Arabic sentence.' 
      : 'Output ONLY in natural English. Create a grammatically correct English sentence.';

    const prompt = `You are a professional sign language translator. 
    I will give you an array of disconnected words translated from sign language. 
    Your job is to convert them into a single, natural, grammatically correct sentence.
    Do not add extra context, just form the most logical sentence out of these words.
    ${langInstruction}
    
    Words: ${JSON.stringify(wordsArray)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.trim();
  } catch (error) {
    console.error("Error generating sentence:", error);
    return null;
  }
};
