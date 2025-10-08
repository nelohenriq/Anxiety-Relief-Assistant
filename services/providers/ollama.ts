import { Exercise, UserProfile, DataConsentLevel, ExerciseFeedback } from '../../types';
import knowledgeBase from '../../data/knowledgeBase';

const OLLAMA_API_ENDPOINT = 'http://localhost:11434/api/generate';

export const getOllamaModels = async (): Promise<string[]> => {
    try {
        const response = await fetch('http://localhost:11434/api/tags', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data && Array.isArray(data.models)) {
            return data.models.map((model: { name: string }) => model.name).sort();
        }

        return [];
    } catch (error) {
        console.error("Could not connect to Ollama to fetch models.", error);
        throw new Error("Could not connect to Ollama. Make sure it's running and accessible at http://localhost:11434.");
    }
};


interface KnowledgeChunk {
    id: string;
    content: string;
}

const retrieveRelevantChunks = (symptoms: string, db: KnowledgeChunk[], topK: number = 5): string[] => {
    const stopWords = new Set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']);
    const queryWords = symptoms.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(/\s+/).filter(word => word.length > 2 && !stopWords.has(word));
    if (queryWords.length === 0) return [];

    const scoredChunks = db.map(chunk => {
        let score = 0;
        const chunkTextLower = chunk.content.toLowerCase();
        queryWords.forEach(word => { if (chunkTextLower.includes(word)) score++; });
        return { ...chunk, score };
    });

    return scoredChunks.sort((a, b) => b.score - a.score).slice(0, topK).filter(chunk => chunk.score > 0).map(chunk => chunk.content);
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
${retrievedDocs.map((doc, i) => `Document ${i+1}:\n${doc}`).join('\n\n')}
--- END OF RETRIEVED DOCUMENTS ---

Your response MUST be in the following language: ${language}.

After consulting the retrieved documents, you may use your built-in web search tool to supplement the information if necessary.

Your FINAL and ONLY output must be a single, valid JSON object. Do not include any introductory text, closing remarks, markdown formatting, or any content outside of the JSON object.

The JSON schema is:
{
  "exercises": [
    {
      "title": "string",
      "description": "string (A brief, encouraging explanation of the exercise and its benefits.)",
      "category": "string (Enum: 'Mindfulness', 'Cognitive', 'Somatic', 'Behavioral', 'Grounding')",
      "steps": ["string"],
      "duration_minutes": "number"
    }
  ],
  "sources": [
    {
      "url": "string",
      "title": "string"
    }
  ]
}

If you use your web search tool, you MUST populate the 'sources' array with the URLs and titles of the websites you used. If you do not use web search, return an empty 'sources' array.

Provide 2-4 diverse exercises. Prioritize simple, actionable techniques. Ensure the exercises are appropriate for a general audience and do not constitute medical advice.`;

    // ... (rest of the personalization logic is the same as Gemini's)
    if (consentLevel === 'enhanced' || consentLevel === 'complete') {
        instruction += "\n\n--- PERSONALIZATION CONTEXT ---\nUse the following user profile data to deeply personalize the recommendations. Tailor the type of exercise, its framing, and its complexity based on this context. Do not mention the profile data in your response.";
        if (profile.age) instruction += `\n- Age: ${profile.age}. Adjust language and examples to be age-appropriate.`;
        if (profile.location) instruction += `\n- Location/Time Zone: ${profile.location}. Consider the likely time of day for the user when suggesting activities.`;
        if (profile.sleepHours) instruction += `\n- Average Sleep: ${profile.sleepHours} hours/night. If sleep is low, prioritize relaxing or pre-sleep exercises and avoid overly stimulating ones.`;
        if (profile.caffeineIntake) instruction += `\n- Caffeine Intake: ${profile.caffeineIntake}. If high, you can suggest exercises to manage jitteriness or an energy crash.`;
        if (profile.workEnvironment) instruction += `\n- Work/School Environment: ${profile.workEnvironment}. Suggest exercises that are practical for this setting (e.g., discreet exercises for an 'office', focus techniques for a 'student', physical relaxation for 'outdoors_manual').`;
        if (profile.accessToNature) instruction += `\n- Access to Nature: ${profile.accessToNature}. If 'yes', you can suggest outdoor activities like mindful walking. If 'no' or 'limited', focus on indoor exercises.`;
        if (profile.activityLevel) { instruction += `\n- Activity Level: ${profile.activityLevel}. This is crucial. If 'sedentary', prioritize low-effort exercises. If 'active', suggest more dynamic strategies.`; }
        if (profile.copingStyles) instruction += `\n- Previously helpful coping styles: "${profile.copingStyles}". Lean into these styles.`;
        if (profile.learningModality) instruction += `\n- Preferred Learning Style: ${profile.learningModality}. Frame steps accordingly (visual, kinesthetic, auditory).`;
    }
    if (consentLevel === 'complete' && profile.diagnosedDisorders) { instruction += `\n- Diagnosed Conditions: "${profile.diagnosedDisorders}". Be extra sensitive and ensure suggestions are safe.`; }
    const feedbackEntries = Object.values(feedback);
    if (feedbackEntries.length > 0) {
        instruction += "\n\n--- EXERCISE FEEDBACK ---";
        const helpful = feedbackEntries.filter(f => f.rating >= 4).map(f => f.title);
        const notHelpful = feedbackEntries.filter(f => f.rating <= 2).map(f => f.title);
        if (helpful.length > 0) { instruction += `\n- The user found these exercises helpful: "${helpful.join('", "')}". Prioritize similar styles.`; }
        if (notHelpful.length > 0) { instruction += `\n- The user found these exercises NOT helpful: "${notHelpful.join('", "')}". Avoid similar styles.`; }
    }
    instruction += "\n--- END OF CONTEXT ---";
    return instruction;
};

export const getPersonalizedExercises = async (
    model: string,
    symptoms: string,
    profile: UserProfile,
    consentLevel: DataConsentLevel,
    feedback: ExerciseFeedback,
    language: string
): Promise<{ exercises: Exercise[]; sources: {url: string, title: string}[] }> => {
    const relevantDocs = retrieveRelevantChunks(symptoms, knowledgeBase, 5);
    const systemInstruction = buildSystemInstruction(profile, consentLevel, feedback, language, relevantDocs);
    const prompt = `Generate coping exercises for the following symptoms: "${symptoms}"`;

    try {
        const response = await fetch(OLLAMA_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                prompt,
                system: systemInstruction,
                format: 'json',
                stream: false,
            }),
        });
        if (!response.ok) { throw new Error(`Ollama API error: ${response.statusText}`); }

        const data = await response.json();
        const responseData = JSON.parse(data.response);

        const exercises: Exercise[] = responseData.exercises.map((ex: Omit<Exercise, 'id'>) => ({
            ...ex,
            id: crypto.randomUUID(),
        }));
        
        const sources = responseData.sources || [];

        return { exercises, sources };
    } catch (error) {
        console.error("Error fetching exercises from Ollama API:", error);
        throw new Error("Failed to generate exercises from local model. Is Ollama running?");
    }
};

export const getJournalAnalysis = async (model: string, entryText: string, language: string): Promise<string> => {
    const systemInstruction = `You are a compassionate, AI-powered journaling assistant. Your role is to provide gentle, supportive, and insightful reflections on a user's journal entry. You are not a therapist and you must not provide medical advice, diagnoses, or treatment plans. Your response MUST be in ${language}. Your analysis should start with validation, gently identify patterns, offer one or two reflective questions, and conclude with encouragement. Keep the entire response concise, under 150 words. Do not wrap your response in markdown code fences.`;
    const prompt = `Please analyze the following journal entry: "${entryText}"`;

    try {
        const response = await fetch(OLLAMA_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, prompt, system: systemInstruction, stream: false }),
        });
        if (!response.ok) { throw new Error(`Ollama API error: ${response.statusText}`); }
        const data = await response.json();
        return data.response.trim();
    } catch (error) {
        console.error("Error fetching journal analysis from Ollama API:", error);
        throw new Error("Failed to analyze journal entry from local model.");
    }
};

export const getForYouSuggestion = async (model: string, profile: UserProfile, language: string): Promise<string> => {
    const hours = new Date().getHours();
    const timeOfDay = hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening';
    let systemInstruction = `You are a compassionate AI assistant providing a single, personalized piece of content for a "For You" card in ${language}. Generate ONE of the following: a short quote, a 1-minute mindfulness prompt, or a gentle reflective question. Your response must be 1-3 sentences, direct text, with no extra formatting. Context: Time is ${timeOfDay}.`;
    if (profile.workEnvironment) systemInstruction += `\n- Work: ${profile.workEnvironment}.`;
    if (profile.activityLevel) systemInstruction += `\n- Activity: ${profile.activityLevel}.`;
    const prompt = "Generate a personalized suggestion for the user based on my system instruction.";

    try {
        const response = await fetch(OLLAMA_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, prompt, system: systemInstruction, stream: false }),
        });
        if (!response.ok) { throw new Error(`Ollama API error: ${response.statusText}`); }
        const data = await response.json();
        return data.response.trim();
    } catch (error) {
        console.error("Error fetching 'For You' suggestion from Ollama API:", error);
        throw new Error("Failed to generate a suggestion from local model.");
    }
};

export const getThoughtChallengeHelp = async (model: string, situation: string, negativeThought: string, language: string): Promise<string> => {
    const systemInstruction = `You are a helpful CBT assistant. Your role is to help a user challenge their automatic negative thought by asking gentle, Socratic questions. Your response MUST be in ${language}. Provide 2-3 open-ended questions in a bulleted list. Do not include any conversational text.`;
    const prompt = `Situation: "${situation}"\nNegative Thought: "${negativeThought}"\n\nGenerate challenging questions.`;

    try {
         const response = await fetch(OLLAMA_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, prompt, system: systemInstruction, stream: false }),
        });
        if (!response.ok) { throw new Error(`Ollama API error: ${response.statusText}`); }
        const data = await response.json();
        return data.response.trim();
    } catch (error) {
        console.error("Error fetching thought challenge help from Ollama API:", error);
        throw new Error("Failed to get AI assistance from local model.");
    }
};

export const getMotivationalQuotes = async (model: string, language: string): Promise<string[]> => {
    const systemInstruction = `You are a compassionate AI assistant. Provide a JSON array of 3-5 unique, short, uplifting motivational quotes related to mental well-being in ${language}. Your response must be ONLY the valid JSON array.`;
    const prompt = "Generate 3-5 motivational quotes as a JSON array of strings.";

    try {
        const response = await fetch(OLLAMA_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, prompt, system: systemInstruction, format: 'json', stream: false }),
        });
        if (!response.ok) { throw new Error(`Ollama API error: ${response.statusText}`); }
        const data = await response.json();
        return JSON.parse(data.response);
    } catch (error) {
        console.error("Error fetching motivational quotes from Ollama API:", error);
        throw new Error("Failed to generate motivational quotes from local model.");
    }
};