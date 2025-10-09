import { Exercise, UserProfile, DataConsentLevel, ExerciseFeedback } from '../../types';
import knowledgeBase from '../../data/knowledgeBase';

const OLLAMA_BASE_URL = process.env.OLLAMA_API_URL || 'http://127.0.0.1:11434';
// Use proxy path for development (always use proxy in this context)
const OLLAMA_API_ENDPOINT = '/api/ollama/generate';

export const getOllamaModels = async (): Promise<string[]> => {
     try {
         const response = await fetch('/api/ollama/tags', {
             method: 'GET',
             headers: {
                 'Content-Type': 'application/json',
                 'Accept': 'application/json'
             },
         });

         if (!response.ok) {
              if (response.status === 403) {
                  console.error('Ollama 403 Forbidden - CORS issue likely. Check Ollama server configuration.');
                  throw new Error(`Ollama server rejected request (403 Forbidden). This usually means CORS is not enabled on the Ollama server. Please ensure Ollama is running with CORS enabled or configure it to allow requests from your domain.`);
              }
              const errorText = await response.text().catch(() => 'Unknown error');
              throw new Error(`Ollama API error (${response.status}): ${response.statusText}. ${errorText}`);
          }

         const data = await response.json();

         if (data && Array.isArray(data.models)) {
             return data.models.map((model: { name: string }) => model.name).sort();
         }

         return [];
     } catch (error) {
         console.error("Could not connect to Ollama to fetch models.", error);
         // Only use fallback if we're clearly in a cloud environment
         if (error instanceof TypeError && error.message.includes('fetch')) {
             console.log("Network error - Ollama not accessible, using fallback");
             return [];
         }
         throw error; // Re-throw other errors
     }
};


interface KnowledgeChunk {
    id: string;
    content: string;
}

const getFallbackExercises = (symptoms: string, language: string): { exercises: Exercise[]; sources: {url: string, title: string}[] } => {
    // Provide basic fallback exercises when Ollama is not available
    const exercises: Exercise[] = [
        {
            id: crypto.randomUUID(),
            title: language === 'pt' ? 'Respiração profunda' : 'Deep Breathing',
            description: language === 'pt'
                ? 'Uma técnica simples para acalmar o sistema nervoso através da respiração lenta e profunda.'
                : 'A simple technique to calm the nervous system through slow, deep breathing.',
            category: 'Mindfulness',
            steps: [
                language === 'pt' ? 'Sente-se ou deite-se confortavelmente' : 'Sit or lie down comfortably',
                language === 'pt' ? 'Coloque uma mão no peito e outra na barriga' : 'Place one hand on your chest and one on your belly',
                language === 'pt' ? 'Inspire lentamente pelo nariz contando até 4' : 'Inhale slowly through your nose counting to 4',
                language === 'pt' ? 'Segure a respiração contando até 4' : 'Hold your breath counting to 4',
                language === 'pt' ? 'Expire lentamente pela boca contando até 6' : 'Exhale slowly through your mouth counting to 6',
                language === 'pt' ? 'Repita por 5 minutos' : 'Repeat for 5 minutes'
            ],
            duration_minutes: 5
        },
        {
            id: crypto.randomUUID(),
            title: language === 'pt' ? 'Aterramento sensorial' : 'Sensory Grounding',
            description: language === 'pt'
                ? 'Uma técnica de aterramento que usa os sentidos para trazer a atenção de volta ao presente.'
                : 'A grounding technique that uses your senses to bring attention back to the present.',
            category: 'Grounding',
            steps: [
                language === 'pt' ? 'Nomeie 5 coisas que você pode ver' : 'Name 5 things you can see',
                language === 'pt' ? 'Nomeie 4 coisas que você pode tocar' : 'Name 4 things you can touch',
                language === 'pt' ? 'Nomeie 3 coisas que você pode ouvir' : 'Name 3 things you can hear',
                language === 'pt' ? 'Nomeie 2 coisas que você pode cheirar' : 'Name 2 things you can smell',
                language === 'pt' ? 'Nomeie 1 coisa que você pode saborear' : 'Name 1 thing you can taste'
            ],
            duration_minutes: 3
        }
    ];

    return { exercises, sources: [] };
};

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

Your FINAL and ONLY output must be a single, valid JSON object. Do not include any introductory text, closing remarks, markdown formatting, thinking tags, reasoning process, or any content outside of the JSON object.

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
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
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
        // Only use fallback for network errors, not for other errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
            console.log('Network error, using fallback exercises');
            return getFallbackExercises(symptoms, language);
        }
        throw error; // Re-throw other errors (like API errors)
    }
};

export const getJournalAnalysis = async (model: string, entryText: string, language: string): Promise<string> => {
    const systemInstruction = `You are a compassionate, AI-powered journaling assistant. Your role is to provide gentle, supportive, and insightful reflections on a user's journal entry. You are not a therapist and you must not provide medical advice, diagnoses, or treatment plans. Your response MUST be in ${language}. Your analysis should start with validation, gently identify patterns, offer one or two reflective questions, and conclude with encouragement. Keep the entire response concise, under 150 words. Do not wrap your response in markdown code fences. Do not include thinking tags, reasoning process, or meta-commentary.`;
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
        // Only use fallback for network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return language === 'pt'
                ? "Obrigado por compartilhar seus pensamentos. Esta entrada mostra que você está se dedicando ao autocuidado através do journaling. Considere: o que nesta experiência você pode aprender sobre si mesmo? Lembre-se de que cada passo no caminho da autoconsciência é valioso."
                : "Thank you for sharing your thoughts. This entry shows you're engaging in self-care through journaling. Consider: what might you learn about yourself from this experience? Remember that every step on the path of self-awareness is valuable.";
        }
        throw error; // Re-throw API errors
    }
};

export const getForYouSuggestion = async (model: string, profile: UserProfile, language: string): Promise<string> => {
    const hours = new Date().getHours();
    const timeOfDay = hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening';
    let systemInstruction = `You are a compassionate AI assistant providing a single, personalized piece of content for a "For You" card in ${language}. Generate ONE of the following: a short quote, a 1-minute mindfulness prompt, or a gentle reflective question. Your response must be 1-3 sentences, direct text, with no extra formatting, no thinking tags, no reasoning process, and no meta-commentary. Just the final suggestion. Context: Time is ${timeOfDay}.`;
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
        // Only use fallback for network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
            if (language === 'pt') {
                if (timeOfDay === 'morning') return 'Bom dia! Lembre-se: cada novo dia é uma oportunidade para ser gentil consigo mesmo.';
                if (timeOfDay === 'afternoon') return 'Boa tarde! Neste momento, que tal fazer uma pausa para respirar profundamente?';
                return 'Boa noite! Antes de dormir, pense em algo pelo qual você é grato hoje.';
            } else {
                if (timeOfDay === 'morning') return 'Good morning! Remember: each new day is an opportunity to be kind to yourself.';
                if (timeOfDay === 'afternoon') return 'Good afternoon! In this moment, how about taking a pause to breathe deeply?';
                return 'Good evening! Before sleep, think of something you\'re grateful for today.';
            }
        }
        throw error; // Re-throw API errors
    }
};

export const getThoughtChallengeHelp = async (model: string, situation: string, negativeThought: string, language: string): Promise<string> => {
    const systemInstruction = `You are a helpful CBT assistant. Your role is to help a user challenge their automatic negative thought by asking gentle, Socratic questions. Your response MUST be in ${language}. Provide 2-3 open-ended questions in a bulleted list. Do not include any conversational text, thinking tags, reasoning process, or meta-commentary.`;
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
         // Only use fallback for network errors
         if (error instanceof TypeError && error.message.includes('fetch')) {
             return language === 'pt'
                 ? `- Esta situação é realmente tão grave quanto parece?\n- Que evidências tenho de que este pensamento é 100% verdadeiro?\n- Como eu me sentiria se pensasse de forma diferente sobre esta situação?`
                 : `- Is this situation really as serious as it seems?\n- What evidence do I have that this thought is 100% true?\n- How would I feel if I thought differently about this situation?`;
         }
         throw error; // Re-throw API errors
     }
};

export const getMotivationalQuotes = async (model: string, language: string): Promise<string[]> => {
    const systemInstruction = `You are a compassionate AI assistant. Provide a JSON array of 3-5 unique, short, uplifting motivational quotes related to mental well-being in ${language}. Your response must be ONLY the valid JSON array. Do not include thinking tags, reasoning process, or any explanatory text.`;
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
        // Only use fallback for network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return language === 'pt'
                ? [
                    "A calma não é a ausência de tempestade, mas a paz no meio dela.",
                    "Você é mais forte do que pensa. Cada desafio é uma oportunidade de crescimento.",
                    "Respire. Você está exatamente onde deveria estar neste momento.",
                    "A gentileza consigo mesmo é o primeiro passo para a cura."
                  ]
                : [
                    "Calm is not the absence of storm, but peace within it.",
                    "You are stronger than you think. Every challenge is a growth opportunity.",
                    "Breathe. You are exactly where you need to be in this moment.",
                    "Self-kindness is the first step toward healing."
                  ];
        }
        throw error; // Re-throw API errors
    }
};