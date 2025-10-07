import { GoogleGenAI, Type } from "@google/genai";
import { Exercise, UserProfile, DataConsentLevel, ExerciseFeedback } from '../types';

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

const buildSystemInstruction = (profile: UserProfile, consentLevel: DataConsentLevel, feedback: ExerciseFeedback, language: string): string => {
    let instruction = `You are an empathetic and supportive AI assistant specializing in anxiety relief. Your goal is to provide users with safe, effective, and personalized coping exercises based on their described symptoms.

Your response MUST be in the following language: ${language}.

You have access to Google Search. First, use it to find relevant, evidence-based coping strategies from reputable sources (e.g., health organizations, academic institutions) for the user's symptoms.

After gathering information, your FINAL and ONLY output must be a single, valid JSON array of exercise objects based on the information you found. Do not include any introductory text, closing remarks, markdown formatting, or any content outside of the JSON array.

The JSON schema for each exercise object is:
{
  "title": "string",
  "description": "string (A brief, encouraging explanation of the exercise and its benefits.)",
  "category": "string (Enum: 'Mindfulness', 'Cognitive', 'Somatic', 'Behavioral', 'Grounding')",
  "steps": ["string", "string", ...],
  "duration_minutes": "number (Estimated time to complete the exercise)"
}

Provide 2-4 diverse exercises. Prioritize simple, actionable techniques that can be performed immediately. Ensure the exercises are appropriate for a general audience and do not constitute medical advice.`;

    if (consentLevel === 'enhanced' || consentLevel === 'complete') {
        instruction += "\n\n--- PERSONALIZATION CONTEXT ---\nUse the following user profile data to deeply personalize the recommendations. Tailor the type of exercise, its framing, and its complexity based on this context. Do not mention the profile data in your response.";
        if (profile.age) instruction += `\n- Age: ${profile.age}. Adjust language and examples to be age-appropriate.`;
        if (profile.location) instruction += `\n- Location/Time Zone: ${profile.location}. Consider the likely time of day for the user when suggesting activities.`;
        if (profile.sleepHours) instruction += `\n- Average Sleep: ${profile.sleepHours} hours/night. If sleep is low, prioritize relaxing or pre-sleep exercises and avoid overly stimulating ones.`;
        if (profile.caffeineIntake) instruction += `\n- Caffeine Intake: ${profile.caffeineIntake}. If high, you can suggest exercises to manage jitteriness or an energy crash.`;
        if (profile.workEnvironment) instruction += `\n- Work/School Environment: ${profile.workEnvironment}. Suggest exercises that are practical for this setting (e.g., discreet exercises for an 'office', focus techniques for a 'student', physical relaxation for 'outdoors_manual').`;
        if (profile.accessToNature) instruction += `\n- Access to Nature: ${profile.accessToNature}. If 'yes', you can suggest outdoor activities like mindful walking. If 'no' or 'limited', focus on indoor exercises.`;
        if (profile.activityLevel) {
            instruction += `\n- Activity Level: ${profile.activityLevel}. This is crucial.
          - If 'sedentary', prioritize extremely low-effort exercises that can be done while sitting or lying down (e.g., sensory grounding, simple breathing, cognitive reframing). Avoid suggesting significant physical movement.
          - If 'lightly_active', you can introduce gentle movements like stretching or slow walking.
          - If 'moderately_active' or 'very_active', the user is receptive to physical activity. Suggest more dynamic, movement-based coping strategies (e.g., a brisk walk, yoga, shaking out limbs) to help release physical tension.`;
        }
        if (profile.copingStyles) instruction += `\n- Previously helpful coping styles: "${profile.copingStyles}". Lean into these styles and techniques.`;
        if (profile.learningModality) instruction += `\n- Preferred Learning Style: ${profile.learningModality}. Frame exercise steps accordingly. For 'visual', use descriptive imagery. For 'kinesthetic', focus on bodily sensations. For 'auditory', emphasize sounds.`;
    }
    if (consentLevel === 'complete' && profile.diagnosedDisorders) {
         instruction += `\n- Diagnosed Conditions: "${profile.diagnosedDisorders}". Be extra sensitive and ensure suggestions are safe and appropriate for this context.`;
    }

    const feedbackEntries = Object.values(feedback);
    if (feedbackEntries.length > 0) {
        instruction += "\n\n--- EXERCISE FEEDBACK ---";
        const helpful = feedbackEntries.filter(f => f.rating >= 4).map(f => f.title);
        const notHelpful = feedbackEntries.filter(f => f.rating <= 2).map(f => f.title);

        if (helpful.length > 0) {
            instruction += `\n- The user found these exercises helpful (rated 4-5 stars): "${helpful.join('", "')}". Prioritize similar styles and topics.`;
        }
        if (notHelpful.length > 0) {
            instruction += `\n- The user found these exercises NOT helpful (rated 1-2 stars): "${notHelpful.join('", "')}". Avoid suggesting exercises with similar styles or topics.`;
        }
    }
    instruction += "\n--- END OF CONTEXT ---";


    return instruction;
};


export const getPersonalizedExercises = async (
    symptoms: string,
    profile: UserProfile,
    consentLevel: DataConsentLevel,
    feedback: ExerciseFeedback,
    language: string
): Promise<{ exercises: Exercise[], groundingMetadata: any }> => {
    const systemInstruction = buildSystemInstruction(profile, consentLevel, feedback, language);
    const prompt = `Generate coping exercises for the following symptoms: "${symptoms}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                tools: [{googleSearch: {}}],
            }
        });

        const responseText = response.text.trim();
        // Attempt to find a JSON array within the response, which might be wrapped in markdown
        const startIndex = responseText.indexOf('[');
        const endIndex = responseText.lastIndexOf(']');

        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
            console.error("Could not find a valid JSON array in the API response:", responseText);
            throw new Error("The AI model returned an invalid response format.");
        }
        
        const jsonText = responseText.substring(startIndex, endIndex + 1);
        
        const exercisesFromApi: Omit<Exercise, 'id'>[] = JSON.parse(jsonText);

        const exercises: Exercise[] = exercisesFromApi.map(ex => ({
            ...ex,
            id: crypto.randomUUID(),
        }));
        
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

        return { exercises, groundingMetadata };

    } catch (error) {
        console.error("Error fetching exercises from Gemini API:", error);
        if (error instanceof SyntaxError) {
             throw new Error("The AI model returned an invalid response. Please try rephrasing your symptoms.");
        }
        throw new Error("Failed to generate exercises. The AI model may be temporarily unavailable.");
    }
};

export const getJournalAnalysis = async (entryText: string, language: string): Promise<string> => {
    const systemInstruction = `You are a compassionate, AI-powered journaling assistant. Your role is to provide gentle, supportive, and insightful reflections on a user's journal entry. You are not a therapist and you must not provide medical advice, diagnoses, or treatment plans.

Your response MUST be in the following language: ${language}.

Your analysis should:
1. Start with a sentence of validation and empathy.
2. Gently identify potential cognitive patterns (e.g., all-or-nothing thinking, catastrophizing), recurring themes, or emotional undercurrents in the text. Use bullet points for clarity.
3. Offer one or two open-ended, reflective questions to encourage deeper self-exploration.
4. Conclude with a supportive and encouraging statement.
Keep the entire response concise, under 150 words. Do not wrap your response in markdown code fences.`;

    const prompt = `Please analyze the following journal entry: "${entryText}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error fetching journal analysis from Gemini API:", error);
        throw new Error("Failed to analyze journal entry. The AI model may be temporarily unavailable.");
    }
};

const buildForYouSystemInstruction = (profile: UserProfile, language: string): string => {
    const hours = new Date().getHours();
    const timeOfDay = hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening';

    let instruction = `You are a compassionate AI assistant. Your goal is to provide a single, concise, and personalized piece of content for a "For You" dashboard card.

Your response MUST be in the following language: ${language}.

Based on the user's profile and the current time of day, generate ONE of the following:
1. A short, encouraging quote that feels personal and relevant.
2. A simple, 1-minute mindfulness prompt that can be done right now.
3. A gentle, open-ended question for reflection.

Your response must be short (1-3 sentences) and directly usable as text on a card. Do not include any extra conversational text, titles (like "Quote:"), or markdown formatting. Be creative and empathetic.

--- PERSONALIZATION CONTEXT ---
- Current time of day: ${timeOfDay}. For morning, be uplifting. For afternoon, suggest a reset. For evening, encourage winding down.`;

    if (profile.workEnvironment) instruction += `\n- Work/School Environment: ${profile.workEnvironment}. A 'student' might need focus, someone 'remote' might need a break from their screen.`;
    if (profile.activityLevel) instruction += `\n- Activity Level: ${profile.activityLevel}. An 'active' person might appreciate a prompt about their body, while a 'sedentary' person needs something achievable from a chair.`;
    if (profile.accessToNature === 'yes') instruction += `\n- The user has access to nature, you can incorporate that into your suggestions.`;
    if (profile.copingStyles) instruction += `\n- Previously helpful coping styles: "${profile.copingStyles}". Your suggestion can align with these themes.`;
    
    instruction += "\n--- END OF CONTEXT ---";

    return instruction;
}


export const getForYouSuggestion = async (profile: UserProfile, language: string): Promise<string> => {
    const systemInstruction = buildForYouSystemInstruction(profile, language);
    const prompt = "Generate a personalized suggestion for the user based on my system instruction.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error fetching 'For You' suggestion from Gemini API:", error);
        throw new Error("Failed to generate a suggestion. The AI model may be temporarily unavailable.");
    }
};

export const getThoughtChallengeHelp = async (situation: string, negativeThought: string, language: string): Promise<string> => {
    const systemInstruction = `You are a helpful CBT assistant. Your role is to help a user challenge their automatic negative thought by asking gentle, Socratic questions.

Your response MUST be in the following language: ${language}.

Based on the user's situation and thought, provide 2-3 open-ended questions that encourage them to look for evidence, consider alternative perspectives, and examine the consequences of their thinking.
Do not give advice. Frame your response as a bulleted list of questions. Do not include any conversational text before or after the list.
Example format:
- What is another way to look at this situation?
- If a friend were in this situation, what would you tell them?`;

    const prompt = `
Situation: "${situation}"
Negative Thought: "${negativeThought}"

Generate challenging questions based on the above.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error fetching thought challenge help from Gemini API:", error);
        throw new Error("Failed to get AI assistance. The model may be temporarily unavailable.");
    }
};

export const getMotivationalQuotes = async (language: string): Promise<string[]> => {
    const systemInstruction = `You are a compassionate AI assistant. Your goal is to provide a few short, uplifting, and encouraging motivational quotes related to mental well-being, anxiety, and finding calm.
Your response MUST be in the following language: ${language}.
Your response must be a valid JSON array of 3-5 unique strings. Each string should be a concise quote. Do not add any extra formatting or commentary.`;
    const prompt = "Generate 3-5 motivational quotes.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                        description: "A single motivational quote."
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        if (!jsonText) {
            return [];
        }
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error fetching motivational quotes from Gemini API:", error);
        throw new Error("Failed to generate motivational quotes.");
    }
};