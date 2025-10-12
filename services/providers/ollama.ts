import { Exercise, UserProfile, DataConsentLevel, ExerciseFeedback } from '../../types';
import knowledgeBase from '../../data/knowledgeBase';

// Ollama Cloud API endpoint and models
const OLLAMA_CLOUD_ENDPOINT = 'https://ollama.com';
const OLLAMA_CLOUD_MODELS = [
    'deepseek-v3.1:671b-cloud',
    'gpt-oss:20b-cloud',
    'gpt-oss:120b-cloud',
    'kimi-k2:1t-cloud',
    'qwen3-coder:480b-cloud'
].sort();

export interface OllamaModelList {
    cloud: string[];
}

export const getOllamaModels = async (): Promise<{ models: OllamaModelList, error: string | null }> => {
    return {
        models: {
            cloud: OLLAMA_CLOUD_MODELS
        },
        error: null
    };
};

const getOllamaConfig = (prefixedModel: string, apiKey: string): { endpoint: string, model: string, headers: Record<string, string> } => {
    const [type, ...modelParts] = prefixedModel.split(':');
    let model = modelParts.join(':');


    // Cloud-only configuration
    return {
        endpoint: `${OLLAMA_CLOUD_ENDPOINT}/api/chat`,
        model: model,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
    };
};

const handleOllamaFetch = async (endpoint: string, options: RequestInit) => {
    try {
        const response = await fetch(endpoint, options);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (error: any) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            if (endpoint.includes('ollama.com')) {
                throw new Error("Cannot connect to Ollama Cloud. Please check your API key and internet connection.");
            }
            throw new Error("Cannot connect to local Ollama server. Please ensure:\n1. Ollama is installed and running\n2. The server is accessible on the configured port\n3. No firewall or network issues are blocking the connection\n4. Try running 'ollama serve' in your terminal");
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
        let content = data.message.content.trim();

        // Handle markdown code blocks that some models return
        if (content.startsWith('```json') && content.endsWith('```')) {
            content = content.slice(7, -3).trim(); // Remove ```json and ```
        } else if (content.startsWith('```') && content.endsWith('```')) {
            content = content.slice(3, -3).trim(); // Remove generic code blocks
        }

        responseData = JSON.parse(content);
    } else {
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
            // Extract only the final answer, not the reasoning
            const thinkingMatch = content.match(/"thinking":\s*"[^"]*"/);
            if (thinkingMatch) {
                content = content.replace(thinkingMatch[0], '').trim();
            }
        }

        return content;
    } else {
        throw new Error(`Unexpected response format from Ollama API. Response: ${JSON.stringify(data)}`);
    }
};

export const getForYouSuggestion = async (prefixedModel: string, apiKey: string, profile: UserProfile, language: string): Promise<string> => {
    // Normalize language codes for better model compatibility
    const languageMap: Record<string, string> = {
        'en': 'English',
        'es': 'Español',
        'pt-pt': 'Português',
        'fr': 'Français',
        'de': 'Deutsch'
    };

    const fullLanguageName = languageMap[language] || 'English';

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

    // Enhanced system instruction with stronger language enforcement - focused and specific like Gemini
    let systemInstruction = `You are a compassionate AI assistant. Your goal is to provide a single, concise, and personalized piece of content for a "For You" dashboard card.

Your response MUST be in the following language: ${fullLanguageName}.

Based on the user's profile and the current time of day, generate ONE of the following:
1. A short, encouraging quote that feels personal and relevant.
2. A simple, 1-minute mindfulness prompt that can be done right now.
3. A gentle, open-ended question for reflection.

Your response must be short (1-3 sentences) and directly usable as text on a card. Do not include any extra conversational text, titles, or markdown formatting. Be creative and empathetic.

--- PERSONALIZATION CONTEXT ---
- Current time of day: ${currentTimeLabel}. For morning, be uplifting. For afternoon, suggest a reset. For evening, encourage winding down.`;

    if (profile.workEnvironment) {
        const workLabels = {
            'English': 'Work environment',
            'Español': 'Entorno de trabajo',
            'Português': 'Ambiente de trabalho',
            'Français': 'Environnement de travail',
            'Deutsch': 'Arbeitsumgebung'
        };
        const workLabel = workLabels[fullLanguageName as keyof typeof workLabels] || 'Work environment';
        systemInstruction += `\n- ${workLabel}: ${profile.workEnvironment}. A 'student' might need focus, someone 'remote' might need a break from their screen.`;
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
        systemInstruction += `\n- ${activityLabel}: ${profile.activityLevel}. An 'active' person might appreciate a prompt about their body, while a 'sedentary' person needs something achievable from a chair.`;
    }

    if (profile.accessToNature === 'yes') {
        const natureLabels = {
            'English': 'Access to nature',
            'Español': 'Acceso a la naturaleza',
            'Português': 'Acesso à natureza',
            'Français': 'Accès à la nature',
            'Deutsch': 'Zugang zur Natur'
        };
        const natureLabel = natureLabels[fullLanguageName as keyof typeof natureLabels] || 'Access to nature';
        systemInstruction += `\n- ${natureLabel}: yes. You can incorporate nature into your suggestions.`;
    }

    if (profile.copingStyles) {
        const copingLabels = {
            'English': 'Previously helpful coping styles',
            'Español': 'Estilos de afrontamiento previamente útiles',
            'Português': 'Estilos de coping previamente úteis',
            'Français': 'Styles d\'adaptation précédemment utiles',
            'Deutsch': 'Früher hilfreiche Bewältigungsstile'
        };
        const copingLabel = copingLabels[fullLanguageName as keyof typeof copingLabels] || 'Previously helpful coping styles';
        systemInstruction += `\n- ${copingLabel}: "${profile.copingStyles}". Your suggestion can align with these themes.`;
    }

    systemInstruction += "\n--- END OF CONTEXT ---";

    const prompt = "Generate a personalized suggestion for the user based on my system instruction.";

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
// Fallback suggestion system for when context is insufficient
export const getFallbackSuggestion = (language: string = 'en'): string => {
    const fallbackMessages = {
        'en': "I'm happy to help, but I don't see any information about your system or what kind of suggestions you'd like me to generate. Could you please provide more context or details about what you're looking for? If you'd like, we can start from scratch and go through a process together to figure out what type of suggestion might be most helpful to you. Here are some questions to get started: * What is the purpose of your system? * Who is it for (e.g., personal use, business, educational)? * Are there any specific requirements or constraints I should keep in mind? Let me know, and I'll do my best to provide a personalized suggestion!",
        'es': "Estoy encantado de ayudar, pero no veo información sobre tu sistema o qué tipo de sugerencias te gustaría que generara. ¿Podrías proporcionar más contexto o detalles sobre lo que buscas? Si lo deseas, podemos empezar desde cero y pasar juntos por un proceso para determinar qué tipo de sugerencia podría ser más útil para ti. Aquí tienes algunas preguntas para empezar: * ¿Cuál es el propósito de tu sistema? * ¿Para quién es (por ejemplo, uso personal, empresarial, educativo)? * ¿Hay requisitos o restricciones específicos que deba tener en cuenta? ¡Házmelo saber y haré todo lo posible por proporcionar una sugerencia personalizada!",
        'pt': "Fico feliz em ajudar, mas não vejo informações sobre o seu sistema ou que tipo de sugestões gostaria que eu gerasse. Você poderia fornecer mais contexto ou detalhes sobre o que está procurando? Se quiser, podemos começar do zero e passar juntos por um processo para descobrir que tipo de sugestão pode ser mais útil para você. Aqui estão algumas perguntas para começar: * Qual é o propósito do seu sistema? * Para quem é (por exemplo, uso pessoal, empresarial, educacional)? * Há requisitos ou restrições específicos que devo ter em mente? Me avise e farei o meu melhor para fornecer uma sugestão personalizada!",
        'fr': "Je suis ravi de vous aider, mais je ne vois pas d'informations sur votre système ou le type de suggestions que vous aimeriez que je génère. Pourriez-vous fournir plus de contexte ou de détails sur ce que vous recherchez ? Si vous le souhaitez, nous pouvons repartir de zéro et passer ensemble par un processus pour déterminer quel type de suggestion pourrait vous être le plus utile. Voici quelques questions pour commencer : * Quel est l'objectif de votre système ? * À qui est-il destiné (par exemple, usage personnel, professionnel, éducatif) ? * Y a-t-il des exigences ou des contraintes spécifiques que je devrais garder à l'esprit ? Dites-le-moi et je ferai de mon mieux pour fournir une suggestion personnalisée !",
        'de': "Ich helfe gerne weiter, sehe aber keine Informationen über Ihr System oder welche Art von Vorschlägen Sie gerne generiert haben möchten. Könnten Sie bitte mehr Kontext oder Details zu dem angeben, wonach Sie suchen? Wenn Sie möchten, können wir bei Null anfangen und gemeinsam einen Prozess durchgehen, um herauszufinden, welche Art von Vorschlag für Sie am hilfreichsten sein könnte. Hier sind einige Fragen, um zu beginnen: * Was ist der Zweck Ihres Systems? * Für wen ist es bestimmt (z.B. persönliche Nutzung, Geschäft, Bildung)? * Gibt es spezielle Anforderungen oder Einschränkungen, die ich beachten sollte? Lassen Sie es mich wissen, und ich werde mein Bestes tun, um einen personalisierten Vorschlag zu machen!"
    };

    return fallbackMessages[language as keyof typeof fallbackMessages] || fallbackMessages['en'];
};

export const getOllamaSetupInstructions = (language: string = 'en'): string => {
    const setupInstructions = {
        'en': "To use Ollama Cloud models, follow these simple steps:\n\n1. Create an account at https://ollama.com\n2. Go to Settings > API Keys\n3. Click 'Create new secret key'\n4. Copy your API key\n5. Paste it in the application settings\n\nAvailable cloud models:\n• deepseek-v3.1:671b-cloud (Recommended for complex tasks)\n• gpt-oss:20b-cloud (Good balance of speed and quality)\n• gpt-oss:120b-cloud (Best quality, slower)\n• kimi-k2:1t-cloud (Specialized for coding)\n• qwen3-coder:480b-cloud (Optimized for development)\n\nNo local installation required!",
        'es': "Para usar modelos de Ollama Cloud, sigue estos pasos simples:\n\n1. Crea una cuenta en https://ollama.com\n2. Ve a Configuración > Claves API\n3. Haz clic en 'Crear nueva clave secreta'\n4. Copia tu clave API\n5. Pégala en la configuración de la aplicación\n\nModelos de nube disponibles:\n• deepseek-v3.1:671b-cloud (Recomendado para tareas complejas)\n• gpt-oss:20b-cloud (Buen equilibrio entre velocidad y calidad)\n• gpt-oss:120b-cloud (Mejor calidad, más lento)\n• kimi-k2:1t-cloud (Especializado para programación)\n• qwen3-coder:480b-cloud (Optimizado para desarrollo)\n\n¡No se requiere instalación local!",
        'pt': "Para usar modelos do Ollama Cloud, siga estes passos simples:\n\n1. Crie uma conta em https://ollama.com\n2. Vá para Configurações > Chaves API\n3. Clique em 'Criar nova chave secreta'\n4. Copie sua chave API\n5. Cole-a nas configurações do aplicativo\n\nModelos de nuvem disponíveis:\n• deepseek-v3.1:671b-cloud (Recomendado para tarefas complexas)\n• gpt-oss:20b-cloud (Bom equilíbrio entre velocidade e qualidade)\n• gpt-oss:120b-cloud (Melhor qualidade, mais lento)\n• kimi-k2:1t-cloud (Especializado para programação)\n• qwen3-coder:480b-cloud (Otimizado para desenvolvimento)\n\nNão é necessária instalação local!",
        'fr': "Pour utiliser les modèles Ollama Cloud, suivez ces étapes simples :\n\n1. Créez un compte sur https://ollama.com\n2. Allez dans Paramètres > Clés API\n3. Cliquez sur 'Créer une nouvelle clé secrète'\n4. Copiez votre clé API\n5. Collez-la dans les paramètres de l'application\n\nModèles cloud disponibles :\n• deepseek-v3.1:671b-cloud (Recommandé pour les tâches complexes)\n• gpt-oss:20b-cloud (Bon équilibre vitesse/qualité)\n• gpt-oss:120b-cloud (Meilleure qualité, plus lent)\n• kimi-k2:1t-cloud (Spécialisé pour le codage)\n• qwen3-coder:480b-cloud (Optimisé pour le développement)\n\nAucune installation locale requise !",
        'de': "Um Ollama Cloud-Modelle zu verwenden, folgen Sie diesen einfachen Schritten:\n\n1. Erstellen Sie ein Konto auf https://ollama.com\n2. Gehen Sie zu Einstellungen > API-Schlüssel\n3. Klicken Sie auf 'Neuen geheimen Schlüssel erstellen'\n4. Kopieren Sie Ihren API-Schlüssel\n5. Fügen Sie ihn in den Anwendungseinstellungen ein\n\nVerfügbare Cloud-Modelle:\n• deepseek-v3.1:671b-cloud (Empfohlen für komplexe Aufgaben)\n• gpt-oss:20b-cloud (Gute Balance zwischen Geschwindigkeit und Qualität)\n• gpt-oss:120b-cloud (Beste Qualität, langsamer)\n• kimi-k2:1t-cloud (Spezialisiert für Programmierung)\n• qwen3-coder:480b-cloud (Optimiert für Entwicklung)\n\nKeine lokale Installation erforderlich!"
    };

    return setupInstructions[language as keyof typeof setupInstructions] || setupInstructions['en'];
};

export const getRecommendedModels = (): { local: string[], cloud: string[] } => {
    return {
        local: [
            'llama3.2:3b',
            'llama3.2:1b',
            'mistral:7b',
            'codellama:7b',
            'vicuna:7b'
        ],
        cloud: [
            'deepseek-v3.1:671b-cloud',
            'gpt-oss:20b-cloud',
            'qwen3-coder:480b-cloud'
        ]
    };
};

export const validateModelAvailability = async (modelName: string): Promise<{ available: boolean, error?: string }> => {
    try {
        const { models } = await getOllamaModels();

        // Cloud-only validation
        const isKnownCloudModel = OLLAMA_CLOUD_MODELS.some(cloudModel =>
            cloudModel.toLowerCase().includes(modelName.toLowerCase())
        );

        return {
            available: isKnownCloudModel,
            error: isKnownCloudModel ? undefined : `Unknown cloud model '${modelName}'. Available cloud models: ${OLLAMA_CLOUD_MODELS.join(', ')}`
        };
    } catch (error) {
        return {
            available: false,
            error: `Failed to validate model: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};

export const diagnoseOllamaSetup = async (language: string = 'en'): Promise<{ status: 'healthy' | 'warning' | 'error', message: string, suggestions: string[] }> => {
    const diagnostics = {
        'en': {
            healthy: 'Ollama Cloud is ready to use',
            warning: 'Ollama Cloud API key may be missing',
            error: 'Ollama Cloud setup needs attention',
            suggestions: {
                apikey: 'Get your API key from https://ollama.com/settings/keys',
                models: 'Choose from available cloud models',
                internet: 'Check your internet connection',
                account: 'Ensure you have an Ollama.com account'
            }
        },
        'es': {
            healthy: 'Ollama Cloud está listo para usar',
            warning: 'Es posible que falte la clave API de Ollama Cloud',
            error: 'La configuración de Ollama Cloud necesita atención',
            suggestions: {
                apikey: 'Obtén tu clave API desde https://ollama.com/settings/keys',
                models: 'Elige entre los modelos de nube disponibles',
                internet: 'Verifica tu conexión a internet',
                account: 'Asegúrate de tener una cuenta en Ollama.com'
            }
        },
        'pt': {
            healthy: 'Ollama Cloud está pronto para usar',
            warning: 'A chave API do Ollama Cloud pode estar faltando',
            error: 'A configuração do Ollama Cloud precisa de atenção',
            suggestions: {
                apikey: 'Obtenha sua chave API em https://ollama.com/settings/keys',
                models: 'Escolha entre os modelos de nuvem disponíveis',
                internet: 'Verifique sua conexão com a internet',
                account: 'Certifique-se de ter uma conta no Ollama.com'
            }
        },
        'fr': {
            healthy: 'Ollama Cloud est prêt à être utilisé',
            warning: 'La clé API Ollama Cloud peut être manquante',
            error: 'La configuration Ollama Cloud nécessite une attention',
            suggestions: {
                apikey: 'Obtenez votre clé API depuis https://ollama.com/settings/keys',
                models: 'Choisissez parmi les modèles cloud disponibles',
                internet: 'Vérifiez votre connexion internet',
                account: 'Assurez-vous d\'avoir un compte Ollama.com'
            }
        },
        'de': {
            healthy: 'Ollama Cloud ist bereit zur Nutzung',
            warning: 'Ollama Cloud API-Schlüssel könnte fehlen',
            error: 'Ollama Cloud-Setup braucht Aufmerksamkeit',
            suggestions: {
                apikey: 'Holen Sie sich Ihren API-Schlüssel von https://ollama.com/settings/keys',
                models: 'Wählen Sie aus verfügbaren Cloud-Modellen',
                internet: 'Überprüfen Sie Ihre Internetverbindung',
                account: 'Stellen Sie sicher, dass Sie ein Ollama.com-Konto haben'
            }
        }
    };

    const texts = diagnostics[language as keyof typeof diagnostics] || diagnostics['en'];

    try {
        const { models, error } = await getOllamaModels();

        if (error) {
            return {
                status: 'error',
                message: texts.error,
                suggestions: [
                    texts.suggestions.account,
                    texts.suggestions.internet,
                    texts.suggestions.apikey
                ]
            };
        }

        return {
            status: 'healthy',
            message: texts.healthy,
            suggestions: [
                `Found ${models.cloud.length} cloud models available`,
                texts.suggestions.apikey,
                texts.suggestions.models
            ]
        };
    } catch (error) {
        return {
            status: 'error',
            message: texts.error,
            suggestions: [
                texts.suggestions.internet,
                texts.suggestions.account
            ]
        };
    }
};

export const getMotivationalQuotes = async (prefixedModel: string, apiKey: string, language: string): Promise<string[]> => {
    // Normalize language codes for better model compatibility
    const languageMap: Record<string, string> = {
        'en': 'English',
        'es': 'Spanish',
        'pt-pt': 'Portuguese',
        'fr': 'French',
        'de': 'German'
    };

    const fullLanguageName = languageMap[language] || 'English';

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
        // For local models, try different parsing approaches
        if (!isCloudRequest) {
            // First try: direct JSON parse (if format parameter worked)
            try {
                return JSON.parse(data.message.content.trim());
            } catch (directError) {
                // Second try: extract JSON from markdown or text
                let content = data.message.content.trim();

                // Handle markdown code blocks
                if (content.startsWith('```json') && content.endsWith('```')) {
                    content = content.slice(7, -3).trim();
                } else if (content.startsWith('```') && content.endsWith('```')) {
                    content = content.slice(3, -3).trim();
                }

                // Try to find JSON array in the content
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    try {
                        return JSON.parse(jsonMatch[0]);
                    } catch (arrayError) {
                        // Last resort: return empty array to prevent crashes
                        return [];
                    }
                }

                // Last resort: return empty array to prevent crashes
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

                return JSON.parse(content);
            } catch (parseError) {
                throw new Error(`Invalid JSON response from Ollama API: ${data.message.content}`);
            }
        }
    } else {
        throw new Error(`Unexpected response format from Ollama API. Response: ${JSON.stringify(data)}`);
    }
};
