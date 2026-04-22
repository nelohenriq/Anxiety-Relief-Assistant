import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import crypto from "crypto";
import { Exercise, UserProfile, DataConsentLevel, ExerciseFeedback } from "../types";
import knowledgeBase from "../data/knowledgeBase";

// Initialize Gemini
const geminiAi = process.env.GEMINI_API_KEY ? new GoogleGenAI(process.env.GEMINI_API_KEY) : null;

// Initialize OpenAI (or compatible like NVIDIA NIM)
const getOpenAIClient = (apiKey?: string, baseURL?: string) => {
  const key = apiKey || process.env.OPEN_AI_API_KEY || process.env.NVIDIA_NIM_API_KEY;
  const url = baseURL || process.env.CUSTOM_LLM_BASE_URL;
  
  if (!key) return null;
  
  return new OpenAI({
    apiKey: key,
    baseURL: url, // Allows connecting to NVIDIA NIM or other compatible endpoints
  });
};

interface KnowledgeChunk {
  id: string;
  content: string;
}

const retrieveRelevantChunks = (symptoms: string, db: KnowledgeChunk[], topK: number = 5): string[] => {
  const stopWords = new Set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']);
  
  const queryWords = symptoms
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  if (queryWords.length === 0) return [];

  const scoredChunks = db.map(chunk => {
    let score = 0;
    const chunkTextLower = chunk.content.toLowerCase();
    queryWords.forEach(word => { if (chunkTextLower.includes(word)) score++; });
    return { ...chunk, score };
  });

  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(chunk => chunk.score > 0)
    .map(chunk => chunk.content);
};

const buildSystemInstruction = (
  profile: UserProfile,
  consentLevel: DataConsentLevel,
  feedback: ExerciseFeedback,
  language: string,
  retrievedDocs: string[]
): string => {
  let instruction = `You are an empathetic and supportive AI assistant specializing in anxiety relief. Your goal is to provide users with safe, effective, and personalized coping exercises.

--- RETRIEVED KNOWLEDGE BASE DOCUMENTS ---
You MUST prioritize the information from the following retrieved documents as your primary source of truth. Synthesize your response based on these documents.
${retrievedDocs.map((doc, i) => `Document ${i + 1}:\n${doc}`).join('\n\n')}
--- END OF RETRIEVED DOCUMENTS ---

Your response MUST be in the following language: ${language}.

Your FINAL and ONLY output must be a single, valid JSON object with a key "exercises" containing an array of exercise objects. Do not include any introductory text, markdown formatting, or content outside of the JSON.

The JSON schema for each exercise object is:
{
  "id": "string (unique identifier, e.g., uuid)",
  "title": "string",
  "description": "string",
  "category": "Mindfulness | Cognitive | Somatic | Behavioral | Grounding | Interest-Based",
  "steps": ["string"],
  "duration_minutes": number
}

Provide 2-4 diverse exercises.`;

  // Add personalization logic similar to original gemini.ts...
  if (consentLevel === 'enhanced' || consentLevel === 'complete') {
    instruction += `\n\n--- PERSONALIZATION CONTEXT ---\n- Age: ${profile.age || 'Unknown'}\n- Activity Level: ${profile.activityLevel || 'Unknown'}\n- Interests: ${profile.interests || 'None'}`;
  }
  
  return instruction;
};

// Main AI Generation Hub
export const generatePlan = async (params: {
  provider: string;
  model?: string;
  apiKey?: string;
  baseURL?: string;
  symptoms: string;
  profile: UserProfile;
  consentLevel: DataConsentLevel;
  feedback: ExerciseFeedback;
  language: string;
}) => {
  const { provider, symptoms, profile, consentLevel, feedback, language, model, apiKey, baseURL } = params;
  
  const relevantDocs = retrieveRelevantChunks(symptoms, knowledgeBase as any, 5);
  const systemPrompt = buildSystemInstruction(profile, consentLevel, feedback, language, relevantDocs);
  const userPrompt = `Generate coping exercises for: "${symptoms}"`;

  if (provider === 'gemini') {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Gemini API key missing");
    const ai = new GoogleGenAI(key);
    const m = ai.getGenerativeModel({ model: model || "gemini-1.5-flash", systemInstruction: systemPrompt });
    const result = await m.generateContent(userPrompt);
    const text = result.response.text();
    // Parse result (handling markdown etc)
    const jsonStr = text.match(/\[.*\]|\{.*\}/s)?.[0] || text;
    const parsed = JSON.parse(jsonStr);
    const rawExercises = Array.isArray(parsed) ? parsed : parsed.exercises || [];
    const exercises = rawExercises.map((ex: any) => ({
      ...ex,
      id: ex.id || crypto.randomUUID()
    }));
    return { exercises, sources: [] }; // Grounding handled differently in SDK
  } 
  
  if (provider === 'openai' || provider === 'nvidia') {
    const client = getOpenAIClient(apiKey, baseURL);
    if (!client) throw new Error(`${provider} client not configured`);
    
    const response = await client.chat.completions.create({
      model: model || "gpt-3.5-turbo",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });
    
    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    const rawExercises = parsed.exercises || [];
    const exercises = rawExercises.map((ex: any) => ({
      ...ex,
      id: ex.id || crypto.randomUUID()
    }));
    return { exercises: exercises, sources: [] };
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
};

export const generateForYou = async (params: {
  provider: string;
  profile: UserProfile;
  language: string;
  model?: string;
  apiKey?: string;
  baseURL?: string;
}) => {
  const { provider, profile, language, model, apiKey, baseURL } = params;
  const hours = new Date().getHours();
  const timeOfDay = hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening';

  let instruction = `You are a compassionate AI assistant. Provide ONE concise, personalized suggestion for a "For You" card.
Language: ${language}.
Context: ${timeOfDay}. 
Profile: Age: ${profile.age || 'N/A'}, Activity: ${profile.activityLevel || 'N/A'}.
Suggestions: 1. Encouraging quote 2. 1-min mindfulness 3. Reflection question.
Short (1-3 sentences). No intros.`;

  if (provider === 'gemini') {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Gemini API key missing");
    const ai = new GoogleGenAI(key);
    const m = ai.getGenerativeModel({ model: model || "gemini-1.5-flash", systemInstruction: instruction });
    const result = await m.generateContent("Give me my daily suggestion.");
    return result.response.text().trim();
  }

  if (provider === 'openai' || provider === 'nvidia') {
    const client = getOpenAIClient(apiKey, baseURL);
    if (!client) throw new Error(`${provider} client not configured`);
    const response = await client.chat.completions.create({
      model: model || "gpt-3.5-turbo",
      messages: [{ role: 'system', content: instruction }, { role: 'user', content: "Give me my daily suggestion." }]
    });
    return response.choices[0].message.content?.trim() || "";
  }
  return "Take a deep breath and stay present.";
};

export const analyzeJournal = async (params: {
  provider: string;
  text: string;
  language: string;
  model?: string;
  apiKey?: string;
  baseURL?: string;
}) => {
  const { provider, text, language, model, apiKey, baseURL } = params;
  const instruction = `Analyze this journal entry compassionately. Language: ${language}. 
1. Validate emotions. 2. Identify patterns. 3. Ask a reflective question. 
Concise (under 150 words).`;

  if (provider === 'gemini') {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Gemini API key missing");
    const ai = new GoogleGenAI(key);
    const m = ai.getGenerativeModel({ model: model || "gemini-1.5-flash", systemInstruction: instruction });
    const result = await m.generateContent(text);
    return result.response.text().trim();
  }

  if (provider === 'openai' || provider === 'nvidia') {
    const client = getOpenAIClient(apiKey, baseURL);
    if (!client) throw new Error(`${provider} client not configured`);
    const response = await client.chat.completions.create({
      model: model || "gpt-3.5-turbo",
      messages: [{ role: 'system', content: instruction }, { role: 'user', content: text }]
    });
    return response.choices[0].message.content?.trim() || "";
  }
  return "Your feelings are valid. Keep writing.";
};

export const generateMotivationalQuotes = async (params: {
  provider: string;
  language: string;
  model?: string;
  apiKey?: string;
  baseURL?: string;
}) => {
  const { provider, language, model, apiKey, baseURL } = params;
  const instruction = `Provide 3 short, uplifting motivational quotes about mental well-being and finding calm. Language: ${language}. Return as a valid JSON array of strings: ["quote1", "quote2", "quote3"]. No markdown.`;

  if (provider === 'gemini') {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Gemini API key missing");
    const ai = new GoogleGenAI(key);
    const m = ai.getGenerativeModel({ 
      model: model || "gemini-1.5-flash", 
      systemInstruction: instruction,
      generationConfig: { responseMimeType: "application/json" }
    });
    const result = await m.generateContent("Give me some quotes.");
    return JSON.parse(result.response.text());
  }

  if (provider === 'openai' || provider === 'nvidia') {
    const client = getOpenAIClient(apiKey, baseURL);
    if (!client) throw new Error(`${provider} client not configured`);
    const response = await client.chat.completions.create({
      model: model || "gpt-3.5-turbo",
      messages: [{ role: 'system', content: instruction }, { role: 'user', content: "Give me some quotes." }],
      response_format: { type: "json_object" }
    });
    const parsed = JSON.parse(response.choices[0].message.content || '{"quotes": []}');
    return Array.isArray(parsed) ? parsed : (parsed.quotes || []);
  }
  return ["Take a deep breath.", "One step at a time.", "You are doing great."];
};

export const generateThoughtChallengeHelp = async (params: {
  provider: string;
  situation: string;
  negativeThought: string;
  language: string;
  model?: string;
  apiKey?: string;
  baseURL?: string;
}) => {
  const { provider, situation, negativeThought, language, model, apiKey, baseURL } = params;
  const instruction = `You are a CBT assistant. Help challenge this negative thought with 2-3 Socratic questions. Language: ${language}. Situation: ${situation}. Thought: ${negativeThought}. Bullet points only. Concise.`;

  if (provider === 'gemini') {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Gemini API key missing");
    const ai = new GoogleGenAI(key);
    const m = ai.getGenerativeModel({ model: model || "gemini-1.5-flash", systemInstruction: instruction });
    const result = await m.generateContent("Help me challenge this thought.");
    return result.response.text().trim();
  }

  if (provider === 'openai' || provider === 'nvidia') {
    const client = getOpenAIClient(apiKey, baseURL);
    if (!client) throw new Error(`${provider} client not configured`);
    const response = await client.chat.completions.create({
      model: model || "gpt-3.5-turbo",
      messages: [{ role: 'system', content: instruction }, { role: 'user', content: "Help me challenge this thought." }]
    });
    return response.choices[0].message.content?.trim() || "";
  }
  return "- What evidence supports this?\n- What would you say to a friend?";
};
