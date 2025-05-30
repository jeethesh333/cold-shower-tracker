import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('Gemini API key is not set. Please check your environment variables.');
}

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

export interface ChatContext {
  progress: number;
  completedDays: number;
  totalDays: number;
  streak: number;
  userName?: string;
  recentNotes: Array<{ date: string; note: string }>;
  currentDay: number;
  daysLeft: number;
}

const FALLBACK_RESPONSES = [
  "Keep going with your cold shower journey! Each day builds your resilience.",
  "You're making great progress! Cold showers are helping build your mental toughness.",
  "Remember why you started this challenge. Your future self will thank you!",
  "Stay consistent with your cold showers - the benefits compound over time.",
  "The discomfort you feel is where the growth happens. Keep pushing forward!",
  "Every cold shower is a victory over comfort. Embrace the chill and grow stronger!"
];

export const generateChatResponse = async (
  userMessage: string,
  context: ChatContext
): Promise<string> => {
  try {
    // Check if API key is missing
    if (!GEMINI_API_KEY) {
      return `I'm here to help with your cold shower journey! (Note: For full AI functionality, please add your Gemini API key)`;
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `CORE INSTRUCTIONS:
You are a supportive cold shower challenge assistant. Your responses must be:
- Personal and direct
- Encouraging and motivational
- Focused on the individual's journey
${context.userName ? `- Occasionally addressing them as "${context.userName}"` : '- Using only "you" and "your" for direct address'}

CONTEXT:
IMPORTANT - User is on DAY ${context.currentDay} of the challenge
Days Completed: ${context.completedDays}
Current Streak: ${context.streak} days
Days Left: ${context.daysLeft} days
Progress: ${context.progress.toFixed(1)}% (${context.completedDays} of ${context.totalDays} days completed)
${context.totalDays - context.completedDays > 0 ? `Remaining: ${context.daysLeft} days` : 'Challenge completed!'}
${context.recentNotes.length > 0 
  ? `\nRecent experiences (IMPORTANT: These are calendar dates in MM/DD format, NOT challenge day numbers. For example, "04/19" means April 19th, NOT day 19):\n${context.recentNotes.map(note => `${note.date}: ${note.note}`).join('\n')}` 
  : '\nNo previous sessions recorded yet.'}

RESPONSE GUIDELINES:
1. Keep responses focused on the user's journey
2. Celebrate progress and effort
3. Provide practical cold shower tips when relevant
4. IMPORTANT DATE HANDLING:
   - Notes show calendar dates (MM/DD format) for when sessions were completed
   - NEVER interpret calendar dates as challenge day numbers (e.g., "04/19" is April 19th, not day 19)
   - The user is on day ${context.currentDay} of the challenge
   - They have completed ${context.completedDays} days so far
   - Their current streak is ${context.streak} days
   - They have ${context.daysLeft} days left in the challenge
5. Maintain an encouraging tone

Current message: ${userMessage}`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (modelError: any) {
      console.error('Gemini API Error:', modelError);
      if (modelError.message) {
        console.error('Gemini Error Message:', modelError.message);
      }
      return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    }
  } catch (error: any) {
    console.error('Error in generateChatResponse:', error);
    if (error.message) {
      console.error('General Error Message:', error.message);
    }
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }
}; 