import { Exercise, UserProfile, DataConsentLevel, ExerciseFeedback } from '../../types';
import knowledgeBase from '../../data/knowledgeBase';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export interface GroqModelList {
    models: string[];
}

export const getGroqModels = async (apiKey?: string): Promise<{ models: GroqModelList, error: string | null }> => {
    // If no API key is provided, return empty models - UI should handle this case
    if (!apiKey || apiKey.trim() === '') {
        return {
            models: {
                models: []
            },
            error: 'API key required to fetch available models'
        };
    }

    try {
        // Fetch models from the API using the provided API key
        const response = await fetch(`${GROQ_BASE_URL}/models`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
        });

        if (response.ok) {
            const data = await response.json();
            // Extract model IDs from the API response
            const apiModels = data.data?.map((model: any) => model.id).filter((id: string) => id) || [];

            if (apiModels.length > 0) {
                console.log(`Successfully fetched ${apiModels.length} models from Groq API`);
                return {
                    models: {
                        models: apiModels
                    },
                    error: null
                };
            } else {
                return {
                    models: {
                        models: []
                    },
                    error: 'No models returned from Groq API'
                };
            }
        } else if (response.status === 401) {
            return {
                models: {
                    models: []
                },
                error: 'Invalid API key provided'
            };
        } else {
            return {
                models: {
                    models: []
                },
                error: `Failed to fetch models: ${response.status} ${response.statusText}`
            };
        }

    } catch (error) {
        console.error('Error fetching Groq models from API:', error);
        return {
            models: {
                models: []
            },
            error: 'Network error while fetching models'
        };
    }
};

const getGroqConfig = (model: string, apiKey: string): { endpoint: string, model: string, headers: Record<string, string> } => {
    console.log(`Configuring Groq request - Model: ${model}, API Key present: ${!!apiKey}`);

    return {
        endpoint: `${GROQ_BASE_URL}/chat/completions`,
        model: model,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
    };
};

const handleGroqFetch = async (endpoint: string, options: RequestInit) => {
    try {
        console.log(`Making Groq request to: ${endpoint}`);
        console.log(`Request options:`, { ...options, body: options.body ? '[REQUEST_BODY]' : undefined });

        const response = await fetch(endpoint, options);
        console.log(`Response status: ${response.status}, content-type: ${response.headers.get('content-type')}`);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error(`API Error Response: ${errorText}`);

            if (response.status === 401) {
                throw new Error("Invalid Groq API key. Please check your API key and try again.");
            } else if (response.status === 429) {
                throw new Error("Groq rate limit exceeded. Please try again in a moment.");
            } else if (response.status === 403) {
                throw new Error("Groq access forbidden. Please check your API key permissions.");
            } else if (response.status === 400) {
                throw new Error("Invalid request to Groq API. Please check your model selection and parameters.");
            }
    
            throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const jsonData = await response.json();
        console.log(`Response data:`, jsonData);
        return jsonData;
    } catch (error: any) {
        console.error(`Groq fetch error for ${endpoint}:`, error);

        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error("Cannot connect to Groq API. Please check your internet connection and API key.");
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
    model: string,
    apiKey: string,
    symptoms: string,
    profile: UserProfile,
    consentLevel: DataConsentLevel,
    feedback: ExerciseFeedback,
    language: string
): Promise<{ exercises: Exercise[]; sources: {url: string, title: string}[]; calmImageUrl: string | null }> => {
    const { endpoint, model: selectedModel, headers } = getGroqConfig(model, apiKey);
    const relevantDocs = retrieveRelevantChunks(symptoms, knowledgeBase, 5);
    const systemInstruction = buildSystemInstruction(profile, consentLevel, feedback, language, relevantDocs);

    const body = {
        model: selectedModel,
        messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: `Generate coping exercises for the following symptoms: "${symptoms}"` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
    };

    const data = await handleGroqFetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });

    if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content.trim();

        // Handle potential markdown code blocks
        let cleanContent = content;
        if (cleanContent.startsWith('```json') && cleanContent.endsWith('```')) {
            cleanContent = cleanContent.slice(7, -3).trim();
        } else if (cleanContent.startsWith('```') && cleanContent.endsWith('```')) {
            cleanContent = cleanContent.slice(3, -3).trim();
        }

        const responseData = JSON.parse(cleanContent);

        const exercises: Exercise[] = responseData.exercises.map((ex: Omit<Exercise, 'id'>) => ({
            ...ex,
            id: crypto.randomUUID(),
        }));

        const sources = responseData.sources || [];
        return { exercises, sources, calmImageUrl: null };
    } else {
        console.error('Unexpected Groq response format:', data);
        throw new Error(`Unexpected response format from Groq API. Response: ${JSON.stringify(data)}`);
    }
};

export const getForYouSuggestion = async (model: string, apiKey: string, profile: UserProfile, language: string): Promise<string> => {
    console.log(`Generating For You suggestion with Groq in language: ${language}`);

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

    const { endpoint, model: selectedModel, headers } = getGroqConfig(model, apiKey);
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

    // Optimized system instruction for fast Groq inference
    let systemInstruction = `You are a compassionate AI assistant. Provide a single, concise, personalized suggestion for a "For You" dashboard card.

Response in: ${fullLanguageName}

Choose ONE:
1. Short encouraging quote (personal & relevant)
2. Simple 1-minute mindfulness prompt (do it now)
3. Gentle reflection question

Keep response: 1-3 sentences, direct, no extra text or formatting.

Personalization:
- Time: ${currentTimeLabel} (morning=uplifting, afternoon=reset, evening=wind down)`;

    if (profile.workEnvironment) {
        const workLabels = {
            'English': 'Work environment',
            'Español': 'Entorno de trabajo',
            'Português': 'Ambiente de trabalho',
            'Français': 'Environnement de travail',
            'Deutsch': 'Arbeitsumgebung'
        };
        const workLabel = workLabels[fullLanguageName as keyof typeof workLabels] || 'Work environment';
        systemInstruction += `\n- ${workLabel}: ${profile.workEnvironment}`;
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
        systemInstruction += `\n- ${activityLabel}: ${profile.activityLevel}`;
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
        systemInstruction += `\n- ${natureLabel}: yes`;
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
        systemInstruction += `\n- ${copingLabel}: "${profile.copingStyles}"`;
    }

    const body = {
        model: selectedModel,
        messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: "Generate a personalized suggestion for the user." }
        ],
        temperature: 0.8,
        max_tokens: 150,
        stream: false,
    };

    const data = await handleGroqFetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });

    if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content.trim();
    } else {
        console.error('Unexpected Groq response format:', data);
        throw new Error(`Unexpected response format from Groq API. Response: ${JSON.stringify(data)}`);
    }
};

export const getGroqSetupInstructions = (language: string = 'en'): string => {
    const setupInstructions = {
        'en': "To use Groq's fast AI models, follow these simple steps:\n\n1. Create a free account at https://console.groq.com\n2. Go to API Keys section\n3. Click 'Create API Key'\n4. Copy your API key\n5. Paste it in the application settings\n\nThe application will automatically fetch and display available models from the Groq API once your API key is configured.\n\n🚀 Up to 500 RPM free tier available!",
        'es': "Para usar los modelos rápidos de Groq, sigue estos pasos simples:\n\n1. Crea una cuenta gratuita en https://console.groq.com\n2. Ve a la sección de Claves API\n3. Haz clic en 'Crear Clave API'\n4. Copia tu clave API\n5. Pégala en la configuración de la aplicación\n\nLa aplicación obtendrá y mostrará automáticamente los modelos disponibles de la API de Groq una vez que se configure tu clave API.\n\n🚀 ¡Hasta 500 RPM en el nivel gratuito!",
        'pt': "Para usar os modelos rápidos do Groq, siga estes passos simples:\n\n1. Crie uma conta gratuita em https://console.groq.com\n2. Vá para a seção de Chaves API\n3. Clique em 'Criar Chave API'\n4. Copie sua chave API\n5. Cole-a nas configurações do aplicativo\n\nO aplicativo buscará e exibirá automaticamente os modelos disponíveis da API do Groq assim que sua chave API for configurada.\n\n🚀 Até 500 RPM no nível gratuito!",
        'fr': "Pour utiliser les modèles rapides de Groq, suivez ces étapes simples :\n\n1. Créez un compte gratuit sur https://console.groq.com\n2. Allez dans la section Clés API\n3. Cliquez sur 'Créer une Clé API'\n4. Copiez votre clé API\n5. Collez-la dans les paramètres de l'application\n\nL'application récupérera et affichera automatiquement les modèles disponibles depuis l'API Groq une fois votre clé API configurée.\n\n🚀 Jusqu'à 500 RPM dans le niveau gratuit !",
        'de': "Um die schnellen KI-Modelle von Groq zu verwenden, folgen Sie diesen einfachen Schritten:\n\n1. Erstellen Sie ein kostenloses Konto auf https://console.groq.com\n2. Gehen Sie zum API-Schlüssel-Bereich\n3. Klicken Sie auf 'API-Schlüssel erstellen'\n4. Kopieren Sie Ihren API-Schlüssel\n5. Fügen Sie ihn in den Anwendungseinstellungen ein\n\nDie Anwendung ruft automatisch verfügbare Modelle von der Groq-API ab und zeigt sie an, sobald Ihr API-Schlüssel konfiguriert ist.\n\n🚀 Bis zu 500 RPM im kostenlosen Tarif!"
    };

    return setupInstructions[language as keyof typeof setupInstructions] || setupInstructions['en'];
};

export const diagnoseGroqSetup = async (language: string = 'en'): Promise<{ status: 'healthy' | 'warning' | 'error', message: string, suggestions: string[] }> => {
    const diagnostics = {
        'en': {
            healthy: 'Groq API is ready for fast inference',
            warning: 'Groq API key may be missing or invalid',
            error: 'Groq API setup needs attention',
            suggestions: {
                apikey: 'Get your free API key from https://console.groq.com/keys',
                models: 'Models will be fetched dynamically from the API',
                ratelimit: 'Free tier: 500 requests per minute',
                account: 'Create free account at https://console.groq.com'
            }
        },
        'es': {
            healthy: 'La API de Groq está lista para inferencia rápida',
            warning: 'Es posible que falte o sea inválida la clave API de Groq',
            error: 'La configuración de la API de Groq necesita atención',
            suggestions: {
                apikey: 'Obtén tu clave API gratuita desde https://console.groq.com/keys',
                models: 'Los modelos se obtendrán dinámicamente de la API',
                ratelimit: 'Nivel gratuito: 500 solicitudes por minuto',
                account: 'Crea una cuenta gratuita en https://console.groq.com'
            }
        },
        'pt': {
            healthy: 'A API do Groq está pronta para inferência rápida',
            warning: 'A chave API do Groq pode estar faltando ou ser inválida',
            error: 'A configuração da API do Groq precisa de atenção',
            suggestions: {
                apikey: 'Obtenha sua chave API gratuita em https://console.groq.com/keys',
                models: 'Os modelos serão obtidos dinamicamente da API',
                ratelimit: 'Nível gratuito: 500 solicitações por minuto',
                account: 'Crie uma conta gratuita em https://console.groq.com'
            }
        },
        'fr': {
            healthy: 'L\'API Groq est prête pour l\'inférence rapide',
            warning: 'La clé API Groq peut être manquante ou invalide',
            error: 'La configuration de l\'API Groq nécessite une attention',
            suggestions: {
                apikey: 'Obtenez votre clé API gratuite depuis https://console.groq.com/keys',
                models: 'Les modèles seront récupérés dynamiquement depuis l\'API',
                ratelimit: 'Niveau gratuit : 500 requêtes par minute',
                account: 'Créez un compte gratuit sur https://console.groq.com'
            }
        },
        'de': {
            healthy: 'Die Groq-API ist bereit für schnelle Inferenz',
            warning: 'Der Groq-API-Schlüssel könnte fehlen oder ungültig sein',
            error: 'Das Groq-API-Setup braucht Aufmerksamkeit',
            suggestions: {
                apikey: 'Holen Sie sich Ihren kostenlosen API-Schlüssel von https://console.groq.com/keys',
                models: 'Modelle werden dynamisch von der API abgerufen',
                ratelimit: 'Kostenloser Tarif: 500 Anfragen pro Minute',
                account: 'Erstellen Sie ein kostenloses Konto auf https://console.groq.com'
            }
        }
    };

    const texts = diagnostics[language as keyof typeof diagnostics] || diagnostics['en'];

    // Try to fetch available models dynamically
    try {
        const { models, error } = await getGroqModels();
        const availableModels = models.models.length > 0 ? models.models.slice(0, 3).join(', ') + '...' : 'Models available via API';

        return {
            status: 'healthy',
            message: texts.healthy,
            suggestions: [
                `Available models: ${availableModels}`,
                texts.suggestions.apikey,
                texts.suggestions.ratelimit
            ]
        };
    } catch (error) {
        // If we can't fetch models, return generic message
        return {
            status: 'warning',
            message: texts.warning,
            suggestions: [
                texts.suggestions.models,
                texts.suggestions.apikey,
                texts.suggestions.ratelimit
            ]
        };
    }
};