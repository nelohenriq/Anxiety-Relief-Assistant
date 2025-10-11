import { Exercise, UserProfile, DataConsentLevel, ExerciseFeedback } from '../../types';
import knowledgeBase from '../../data/knowledgeBase';

const OLLAMA_LOCAL_ENDPOINT = process.env.OLLAMA_BASE_URL ? `${process.env.OLLAMA_BASE_URL}` : 'http://127.0.0.1:11434';
// Ollama Cloud API endpoint - using the documented endpoint
const OLLAMA_CLOUD_ENDPOINT = 'https://ollama.com';

// Actual available Ollama Cloud models from docs
const OLLAMA_CLOUD_MODELS = ['deepseek-v3.1:671b-cloud', 'gpt-oss:20b-cloud', 'gpt-oss:120b-cloud', 'kimi-k2:1t-cloud', 'qwen3-coder:480b-cloud'].sort();

export interface OllamaModelList {
    local: string[];
    cloud: string[];
}

export const getOllamaModels = async (): Promise<{ models: OllamaModelList, error: string | null }> => {
    let localModels: string[] = [];
    let errorMessage: string | null = null;

    // Try to connect to local Ollama instance
    try {
        console.log(`Attempting to connect to local Ollama at ${OLLAMA_LOCAL_ENDPOINT}/api/tags`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const response = await fetch(`${OLLAMA_LOCAL_ENDPOINT}/api/tags`, {
            signal: controller.signal,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 404) {
                errorMessage = "Local Ollama server is running but the /api/tags endpoint is not available. Make sure you have models installed.";
            } else {
                errorMessage = `Local server responded with error (status: ${response.status}).`;
            }
        } else {
            const data = await response.json();
            console.log('Local Ollama response:', data);

            // Handle different possible response formats
            if (data.models && Array.isArray(data.models)) {
                localModels = data.models.map((model: any) => model.name || model).sort();
                console.log('Parsed models from data.models:', localModels);
            } else if (data.tags && Array.isArray(data.tags)) {
                localModels = data.tags.map((tag: any) => tag.name || tag).sort();
                console.log('Parsed models from data.tags:', localModels);
            } else {
                console.warn('Unexpected response format from local Ollama:', data);
                console.log('Available keys in response:', Object.keys(data));
                errorMessage = "Local server returned unexpected response format.";
            }
        }
    } catch (error: any) {
        console.warn(`Could not connect to local Ollama instance at ${OLLAMA_LOCAL_ENDPOINT}:`, error.message);

        if (error.name === 'AbortError') {
            errorMessage = "Local server connection timed out. Make sure Ollama is running and accessible.";
        } else if (error.message.includes('fetch')) {
            errorMessage = "Cannot connect to local Ollama server. Please start Ollama by running 'ollama serve' in your terminal, or ensure it's running on port 11434.";
        } else {
            errorMessage = `Connection error: ${error.message}`;
        }
    }

    console.log(`Local models found: ${localModels.length}, Cloud models: ${OLLAMA_CLOUD_MODELS.length}`);

    return {
        models: {
            local: localModels,
            cloud: OLLAMA_CLOUD_MODELS
        },
        error: errorMessage
    };
};

const getOllamaConfig = (prefixedModel: string, apiKey: string): { endpoint: string, model: string, headers: Record<string, string> } => {
    const [type, ...modelParts] = prefixedModel.split(':');
    let model = modelParts.join(':');

    console.log(`Configuring Ollama request - Type: ${type}, Model: ${model}, API Key present: ${!!apiKey}`);

    if (type === 'cloud') {
        // For cloud models, use the model name as-is (including -cloud suffix if present)
        console.log(`Cloud model detected - Using model: ${model}`);

        return {
            endpoint: `${OLLAMA_CLOUD_ENDPOINT}/api/chat`,
            model: model,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
        };
    }

    // Default to local
    return {
        endpoint: `${OLLAMA_LOCAL_ENDPOINT}/api/chat`,
        model,
        headers: { 'Content-Type': 'application/json' },
    };
};

const handleOllamaFetch = async (endpoint: string, options: RequestInit) => {
    try {
        console.log(`Making Ollama request to: ${endpoint}`);
        console.log(`Request options:`, { ...options, body: options.body ? '[REQUEST_BODY]' : undefined });

        const response = await fetch(endpoint, options);
        console.log(`Response status: ${response.status}, content-type: ${response.headers.get('content-type')}`);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error(`API Error Response: ${errorText}`);
            throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const jsonData = await response.json();
            console.log(`Response data:`, jsonData);
            return jsonData;
        } else {
            const textData = await response.text();
            console.log(`Response text:`, textData);
            return textData;
        }
    } catch (error: any) {
        console.error(`Ollama fetch error for ${endpoint}:`, error);

        if (error instanceof TypeError && error.message.includes('fetch')) {
            if (endpoint.includes('ollama.com')) {
                throw new Error("Cannot connect to Ollama Cloud. Please check your API key and internet connection.");
            }
            throw new Error("Cannot connect to local Ollama server. Please ensure Ollama is running and accessible.");
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
    
    // Determine if this is a cloud request based on the endpoint
    const isCloudRequest = endpoint.includes('ollama.com');

    let body: any;

    if (isCloudRequest) {
        // Ollama Cloud API format - system message in messages array
        body = {
            model: model,
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: prompt }
            ],
            stream: false,
        };
    } else {
        // Local Ollama API format
        body = {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            system: systemInstruction,
            format: 'json',
            stream: false,
        };
    }

    const data = await handleOllamaFetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });

    // Handle Ollama response format (same for both local and cloud)
    let responseData;
    if (data.message && data.message.content) {
        console.log('Ollama response content:', data.message.content);
        let content = data.message.content.trim();

        // Handle markdown code blocks that some models return
        if (content.startsWith('```json') && content.endsWith('```')) {
            content = content.slice(7, -3).trim(); // Remove ```json and ```
        } else if (content.startsWith('```') && content.endsWith('```')) {
            content = content.slice(3, -3).trim(); // Remove generic code blocks
        }

        responseData = JSON.parse(content);
    } else {
        console.error('Unexpected Ollama response format:', data);
        throw new Error(`Unexpected response format from Ollama API. Response: ${JSON.stringify(data)}`);
    }

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

    // Determine if this is a cloud request
    const isCloudRequest = endpoint.includes('ollama.com');

    let body: any;
    if (isCloudRequest) {
        body = {
            model,
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: prompt }
            ],
            stream: false
        };
    } else {
        body = { model, messages: [{ role: 'user', content: prompt }], system: systemInstruction, stream: false };
    }

    const data = await handleOllamaFetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });

    // Handle Ollama response format
    if (data.message && data.message.content) {
        let content = data.message.content.trim();

        // Remove reasoning/thinking content that some models include
        if (content.includes('"thinking":') || content.includes('thinking:')) {
            console.log('Removing reasoning content from response');
            // Extract only the final answer, not the reasoning
            const thinkingMatch = content.match(/"thinking":\s*"[^"]*"/);
            if (thinkingMatch) {
                content = content.replace(thinkingMatch[0], '').trim();
            }
        }

        return content;
    } else {
        console.error('Unexpected Ollama response format:', data);
        throw new Error(`Unexpected response format from Ollama API. Response: ${JSON.stringify(data)}`);
    }
};

export const getForYouSuggestion = async (prefixedModel: string, apiKey: string, profile: UserProfile, language: string): Promise<string> => {
    console.log(`Generating For You suggestion in language: ${language}`);

    // Normalize language codes for better model compatibility
    const languageMap: Record<string, string> = {
        'en': 'English',
        'es': 'Español',
        'pt-pt': 'Português',
        'fr': 'Français',
        'de': 'Deutsch'
    };

    const fullLanguageName = languageMap[language] || 'English';
    console.log(`Using full language name: ${fullLanguageName} for code: ${language}`);

    const { endpoint, model, headers } = getOllamaConfig(prefixedModel, apiKey);
    const hours = new Date().getHours();
    const timeOfDay = hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening';

    // Create time-based context in the target language
    const timeContext = {
        'English': { morning: 'morning', afternoon: 'afternoon', evening: 'evening' },
        'Español': { morning: 'mañana', afternoon: 'tarde', evening: 'noche' },
        'Português': { morning: 'manhã', afternoon: 'tarde', evening: 'noite' },
        'Français': { morning: 'matin', afternoon: 'après-midi', evening: 'soir' },
        'Deutsch': { morning: 'Morgen', afternoon: 'Nachmittag', evening: 'Abend' }
    };

    const timeLabels = timeContext[fullLanguageName as keyof typeof timeContext] || timeContext['English'];
    const currentTimeLabel = timeLabels[timeOfDay] || timeOfDay;

    // Enhanced system instruction with stronger language enforcement
    let systemInstruction = `You are a compassionate AI assistant providing a single, personalized piece of content for a "For You" card. Your response MUST be in ${fullLanguageName} language only. Do not use English. Generate ONE of the following in ${fullLanguageName}: a short quote, a 1-minute mindfulness prompt, or a gentle reflective question. Your response must be 1-3 sentences, direct text in ${fullLanguageName}, with no extra formatting. Context: Time is ${currentTimeLabel}.`;

    // Add user profile information in target language
    if (profile.workEnvironment) {
        const workLabels = {
            'English': 'Work environment',
            'Español': 'Entorno de trabajo',
            'Português': 'Ambiente de trabalho',
            'Français': 'Environnement de travail',
            'Deutsch': 'Arbeitsumgebung'
        };
        const workLabel = workLabels[fullLanguageName as keyof typeof workLabels] || 'Work environment';
        systemInstruction += `\n- ${workLabel}: ${profile.workEnvironment}.`;
    }

    if (profile.activityLevel) {
        const activityLabels = {
            'English': 'Activity level',
            'Español': 'Nivel de actividad',
            'Português': 'Nível de atividade',
            'Français': 'Niveau d\'activité',
            'Deutsch': 'Aktivitätsniveau'
        };
        const activityLabel = activityLabels[fullLanguageName as keyof typeof activityLabels] || 'Activity level';
        systemInstruction += `\n- ${activityLabel}: ${profile.activityLevel}.`;
    }

    const prompt = `Generate a personalized suggestion for the user in ${fullLanguageName} language based on the system instruction.`;

    // Determine if this is a cloud request
    const isCloudRequest = endpoint.includes('ollama.com');

    let body: any;
    if (isCloudRequest) {
        body = {
            model,
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: prompt }
            ],
            stream: false
        };
    } else {
        body = { model, messages: [{ role: 'user', content: prompt }], system: systemInstruction, stream: false };
    }

    const data = await handleOllamaFetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });

    // Handle Ollama response format
    if (data.message && data.message.content) {
        return data.message.content.trim();
    } else {
        console.error('Unexpected Ollama response format:', data);
        throw new Error(`Unexpected response format from Ollama API. Response: ${JSON.stringify(data)}`);
    }
};

export const getThoughtChallengeHelp = async (prefixedModel: string, apiKey: string, situation: string, negativeThought: string, language: string): Promise<string> => {
    const { endpoint, model, headers } = getOllamaConfig(prefixedModel, apiKey);
    const systemInstruction = `You are a helpful CBT assistant. Your role is to help a user challenge their automatic negative thought by asking gentle, Socratic questions. Your response MUST be in ${language}. Provide 2-3 open-ended questions in a bulleted list. Do not include any conversational text.`;
    const prompt = `Situation: "${situation}"\nNegative Thought: "${negativeThought}"\n\nGenerate challenging questions.`;

    // Determine if this is a cloud request
    const isCloudRequest = endpoint.includes('ollama.com');

    let body: any;
    if (isCloudRequest) {
        body = { model, messages: [{ role: 'user', content: prompt }], system: systemInstruction, stream: false };
    } else {
        body = { model, messages: [{ role: 'user', content: prompt }], system: systemInstruction, stream: false };
    }

    const data = await handleOllamaFetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });

    // Handle Ollama response format
    if (data.message && data.message.content) {
        return data.message.content.trim();
    } else {
        console.error('Unexpected Ollama response format:', data);
        throw new Error(`Unexpected response format from Ollama API. Response: ${JSON.stringify(data)}`);
    }
};

/**
 * Fetches a list of motivational quotes in the specified language using the Ollama API.
 *
 * @param prefixedModel - The model identifier to use for generating quotes, prefixed for compatibility.
 * @param apiKey - The API key for authenticating with the Ollama service.
 * @param language - The language code for the desired language of the motivational quotes.
 *                   Supported codes include 'en', 'es', 'pt-pt', 'fr', and 'de'.
 *                   Defaults to 'English' if the language code is not recognized.
 * @returns A promise that resolves to an array of 3-5 motivational quotes in the specified language.
 *
 * @throws Will throw an error if the response from the Ollama API is not in the expected format
 *         or if parsing the response fails.
 *
 * @remarks
 * - The function supports both cloud-based and local Ollama models.
 * - For local models, additional parsing logic is implemented to handle potential variations
 *   in the response format.
 * - The response is expected to be a JSON array of strings, and the function ensures that
 *   only valid JSON is returned.
 * - Logs are included for debugging purposes to trace the response handling process.
 */
export const getMotivationalQuotes = async (prefixedModel: string, apiKey: string, language: string): Promise<string[]> => {
    console.log(`Generating motivational quotes in language: ${language}`);

    // Normalize language codes for better model compatibility
    const languageMap: Record<string, string> = {
        'en': 'English',
        'es': 'Spanish',
        'pt-pt': 'Portuguese',
        'fr': 'French',
        'de': 'German'
    };

    const fullLanguageName = languageMap[language] || 'English';
    console.log(`Using full language name: ${fullLanguageName} for code: ${language}`);

    const { endpoint, model, headers } = getOllamaConfig(prefixedModel, apiKey);
    const systemInstruction = `You are a compassionate AI assistant. Provide a JSON array of 3-5 unique, short, uplifting motivational quotes related to mental well-being. Your response MUST be in ${fullLanguageName} language. Generate the quotes in ${fullLanguageName} only. Your response must be ONLY the valid JSON array.`;
    const prompt = `Generate 3-5 motivational quotes as a JSON array of strings in ${fullLanguageName} language.`;

    // Determine if this is a cloud request
    const isCloudRequest = endpoint.includes('ollama.com');

    let body: any;
    if (isCloudRequest) {
        body = {
            model,
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: prompt }
            ],
            stream: false
        };
    } else {
        // Local Ollama - try without format parameter first to see if it helps
        console.log('Using local model without format parameter to test response format');
        body = { model, messages: [{ role: 'user', content: prompt }], system: systemInstruction, stream: false };
        // body = { model, messages: [{ role: 'user', content: prompt }], system: systemInstruction, format: 'json', stream: false };
    }

    const data = await handleOllamaFetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });

    // Handle Ollama response format
    if (data.message && data.message.content) {
        console.log('Motivational quotes raw response:', data.message.content);
        console.log('Response type - isCloud:', isCloudRequest ? 'CLOUD' : 'LOCAL');

        // For local models, try different parsing approaches
        if (!isCloudRequest) {
            console.log('Trying local model parsing approaches...');

            // First try: direct JSON parse (if format parameter worked)
            try {
                const directParse = JSON.parse(data.message.content.trim());
                console.log('Local model direct JSON parse successful:', directParse);
                return directParse;
            } catch (directError) {
                console.log('Direct JSON parse failed, trying alternative approaches...');

                // Second try: extract JSON from markdown or text
                let content = data.message.content.trim();
                console.log('Content to process:', content);

                // Handle markdown code blocks
                if (content.startsWith('```json') && content.endsWith('```')) {
                    content = content.slice(7, -3).trim();
                    console.log('Removed markdown code blocks:', content);
                } else if (content.startsWith('```') && content.endsWith('```')) {
                    content = content.slice(3, -3).trim();
                    console.log('Removed generic code blocks:', content);
                }

                // Try to find JSON array in the content
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    console.log('Found JSON array match:', jsonMatch[0]);
                    try {
                        const parsed = JSON.parse(jsonMatch[0]);
                        console.log('JSON array parse successful:', parsed);
                        return parsed;
                    } catch (arrayError) {
                        console.error('JSON array parse failed:', arrayError);
                    }
                }

                // Last resort: return empty array to prevent crashes
                console.error('All parsing attempts failed, returning empty array');
                return [];
            }
        } else {
            // Cloud model parsing (existing logic)
            try {
                let content = data.message.content.trim();

                // Handle markdown code blocks that some models return
                if (content.startsWith('```json') && content.endsWith('```')) {
                    content = content.slice(7, -3).trim(); // Remove ```json and ```
                } else if (content.startsWith('```') && content.endsWith('```')) {
                    content = content.slice(3, -3).trim(); // Remove generic code blocks
                }

                const parsed = JSON.parse(content);
                console.log('Motivational quotes parsed:', parsed);
                return parsed;
            } catch (parseError) {
                console.error('Failed to parse motivational quotes JSON:', parseError);
                console.error('Raw content that failed to parse:', data.message.content);
                throw new Error(`Invalid JSON response from Ollama API: ${data.message.content}`);
            }
        }
    } else {
        console.error('Unexpected Ollama response format:', data);
        throw new Error(`Unexpected response format from Ollama API. Response: ${JSON.stringify(data)}`);
    }
};
