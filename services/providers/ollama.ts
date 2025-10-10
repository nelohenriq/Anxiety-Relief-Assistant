import { Exercise, UserProfile, DataConsentLevel, ExerciseFeedback } from '../../types';
import knowledgeBase from '../../data/knowledgeBase';

const OLLAMA_LOCAL_ENDPOINT = 'http://localhost:11434/api';
const OLLAMA_CLOUD_ENDPOINT = 'https://ollama.com/api';

// A static list of popular cloud models.
const OLLAMA_CLOUD_MODELS = ['llama3', 'mistral', 'llava', 'gemma', 'codellama', 'phi3'].sort();

export interface OllamaModelList {
    local: string[];
    cloud: string[];
}

export const getOllamaModels = async (): Promise<{ models: OllamaModelList, error: string | null }> => {
    let localModels: string[] = [];
    let errorMessage: string | null = null;
    try {
        const response = await fetch(`${OLLAMA_LOCAL_ENDPOINT}/tags`, { signal: AbortSignal.timeout(2000) });
        if (!response.ok) {
             errorMessage = `Local server not reachable (status: ${response.status}).`;
        } else {
            const data = await response.json();
            localModels = data?.models?.map((model: { name: string }) => model.name).sort() || [];
        }
    } catch (error) {
        console.warn(`Could not connect to local Ollama instance at ${OLLAMA_LOCAL_ENDPOINT}.`);
        errorMessage = "Could not connect to local server.";
    }

    return { models: { local: localModels, cloud: OLLAMA_CLOUD_MODELS }, error: errorMessage };
};

const getOllamaConfig = (prefixedModel: string, apiKey: string): { endpoint: string, model: string, headers: Record<string, string> } => {
    const [type, ...modelParts] = prefixedModel.split(':');
    const model = modelParts.join(':');

    if (type === 'cloud') {
        return {
            endpoint: `${OLLAMA_CLOUD_ENDPOINT}/chat`,
            model,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
        };
    }
    
    // Default to local
    return {
        endpoint: `${OLLAMA_LOCAL_ENDPOINT}/chat`,
        model,
        headers: { 'Content-Type': 'application/json' },
    };
};

const handleOllamaFetch = async (endpoint: string, options: RequestInit) => {
    try {
        const response = await fetch(endpoint, options);
        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            if (endpoint.includes('ollama.com')) {
                throw new Error("Request to Ollama Cloud was blocked by the browser's CORS policy. This is a security feature that cannot be bypassed from the app. Please use a local model if available.");
            }
            throw new Error("Failed to connect to the Ollama API. Is the local server running?");
        }
        // Re-throw other errors
        throw error;
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
  ]
}

Provide 2-4 diverse exercises. Prioritize simple, actionable techniques. Ensure the exercises are appropriate for a general audience and do not constitute medical advice.`;

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
    prefixedModel: string,
    apiKey: string,
    symptoms: string,
    profile: UserProfile,
    consentLevel: DataConsentLevel,
    feedback: ExerciseFeedback,
    language: string
): Promise<{ exercises: Exercise[]; sources: {url: string, title: string}[]; calmImageUrl: string | null }> => {
    const { endpoint, model, headers } = getOllamaConfig(prefixedModel, apiKey);
    const relevantDocs = retrieveRelevantChunks(symptoms, knowledgeBase, 5);
    const systemInstruction = buildSystemInstruction(profile, consentLevel, feedback, language, relevantDocs);
    const prompt = `Generate coping exercises for the following symptoms: "${symptoms}"`;
    
    const body = {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        system: systemInstruction,
        format: 'json',
        stream: false,
    };

    const data = await handleOllamaFetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
    const responseData = JSON.parse(data.message.content);

    const exercises: Exercise[] = responseData.exercises.map((ex: Omit<Exercise, 'id'>) => ({
        ...ex,
        id: crypto.randomUUID(),
    }));
    
    const sources = responseData.sources || [];
    return { exercises, sources, calmImageUrl: null };
};

export const getJournalAnalysis = async (prefixedModel: string, apiKey: string, entryText: string, language: string): Promise<string> => {
    const { endpoint, model, headers } = getOllamaConfig(prefixedModel, apiKey);
    const systemInstruction = `You are a compassionate, AI-powered journaling assistant. Your role is to provide gentle, supportive, and insightful reflections on a user's journal entry. You are not a therapist and you must not provide medical advice, diagnoses, or treatment plans. Your response MUST be in ${language}. Your analysis should start with validation, gently identify patterns, offer one or two reflective questions, and conclude with encouragement. Keep the entire response concise, under 150 words. Do not wrap your response in markdown code fences.`;
    const prompt = `Please analyze the following journal entry: "${entryText}"`;

    const body = { model, messages: [{ role: 'user', content: prompt }], system: systemInstruction, stream: false };
    const data = await handleOllamaFetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
    return data.message.content.trim();
};

export const getForYouSuggestion = async (prefixedModel: string, apiKey: string, profile: UserProfile, language: string): Promise<string> => {
    const { endpoint, model, headers } = getOllamaConfig(prefixedModel, apiKey);
    const hours = new Date().getHours();
    const timeOfDay = hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening';
    let systemInstruction = `You are a compassionate AI assistant providing a single, personalized piece of content for a "For You" card in ${language}. Generate ONE of the following: a short quote, a 1-minute mindfulness prompt, or a gentle reflective question. Your response must be 1-3 sentences, direct text, with no extra formatting. Context: Time is ${timeOfDay}.`;
    if (profile.workEnvironment) systemInstruction += `\n- Work: ${profile.workEnvironment}.`;
    if (profile.activityLevel) systemInstruction += `\n- Activity: ${profile.activityLevel}.`;
    const prompt = "Generate a personalized suggestion for the user based on my system instruction.";

    const body = { model, messages: [{ role: 'user', content: prompt }], system: systemInstruction, stream: false };
    const data = await handleOllamaFetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
    return data.message.content.trim();
};

export const getThoughtChallengeHelp = async (prefixedModel: string, apiKey: string, situation: string, negativeThought: string, language: string): Promise<string> => {
    const { endpoint, model, headers } = getOllamaConfig(prefixedModel, apiKey);
    const systemInstruction = `You are a helpful CBT assistant. Your role is to help a user challenge their automatic negative thought by asking gentle, Socratic questions. Your response MUST be in ${language}. Provide 2-3 open-ended questions in a bulleted list. Do not include any conversational text.`;
    const prompt = `Situation: "${situation}"\nNegative Thought: "${negativeThought}"\n\nGenerate challenging questions.`;

    const body = { model, messages: [{ role: 'user', content: prompt }], system: systemInstruction, stream: false };
    const data = await handleOllamaFetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
    return data.message.content.trim();
};

export const getMotivationalQuotes = async (prefixedModel: string, apiKey: string, language: string): Promise<string[]> => {
    const { endpoint, model, headers } = getOllamaConfig(prefixedModel, apiKey);
    const systemInstruction = `You are a compassionate AI assistant. Provide a JSON array of 3-5 unique, short, uplifting motivational quotes related to mental well-being in ${language}. Your response must be ONLY the valid JSON array.`;
    const prompt = "Generate 3-5 motivational quotes as a JSON array of strings.";

    const body = { model, messages: [{ role: 'user', content: prompt }], system: systemInstruction, format: 'json', stream: false };
    const data = await handleOllamaFetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
    return JSON.parse(data.message.content);
};
