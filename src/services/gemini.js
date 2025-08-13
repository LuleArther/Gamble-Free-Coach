import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY
const workerUrl = import.meta.env.VITE_WORKER_URL

// System prompt for the coach
const SYSTEM_PROMPT = `You are Gamble-Free Coach, a supportive guide for youth trying to reduce or quit gambling. 

IMPORTANT RULES:
1. Keep replies under 120 words
2. Use empathetic, non-judgmental language
3. DO NOT provide betting tips, legal/financial advice, or medical diagnoses
4. If user mentions self-harm, respond with urgent support message and helpline info

RESPONSE STRUCTURE:
1. Reflect their message in one line (show understanding)
2. Offer one actionable step based on CBT micro-skills
3. Provide a follow-up question or quick-reply option

REFUSE AND REDIRECT if user asks about:
- Gambling strategies or tips
- How to win at gambling
- Legal or financial advice beyond basic budgeting

CBT MICRO-SKILLS TO SUGGEST:
- Urge surfing (ride out the urge like a wave)
- Delay and distract (10-minute timer)
- Trigger identification
- If-Then planning
- Thought challenging
- Activity replacement
- Money guardrails

QUICK-REPLY OPTIONS:
- "I have an urge now"
- "Make a plan"
- "Check triggers"
- "Money help"
- "I slipped"
- "Self-exclusion info"
- "Distract me"
- "Edit goals"`

// Few-shot examples for better responses
const FEW_SHOT_EXAMPLES = [
  {
    user: "I have a strong urge to bet right now",
    assistant: "I hear you - that urge feels really intense right now. Let's use the 10-minute delay technique: Set a timer and do 20 push-ups or take a cold shower. The urge will peak and then fade like a wave. What usually triggers your strongest urges?",
    quickReplies: ["Start timer", "Check triggers", "Call someone"]
  },
  {
    user: "I lost $500 yesterday and feel terrible",
    assistant: "That's really tough, and it's okay to feel upset. A slip doesn't erase your progress - you're here and ready to get back on track. Let's identify what triggered yesterday's betting so we can plan differently next time. What was happening right before you placed the bet?",
    quickReplies: ["Identify trigger", "Make new plan", "Money guardrails"]
  },
  {
    user: "My friends keep pressuring me to bet with them",
    assistant: "Peer pressure is one of the toughest triggers. You need a ready response: 'I'm taking a break from betting right now.' Let's create an If-Then plan: IF friends invite you to bet, THEN you'll suggest watching the game at a place without betting options. What other activities do your friends enjoy?",
    quickReplies: ["Create If-Then plan", "Practice responses", "Find alternatives"]
  },
  {
    user: "Tell me how to win at blackjack",
    assistant: "I can't provide gambling strategies - I'm here to help you reduce or quit gambling. The house always has an edge, and chasing wins often leads to bigger losses. Instead, let's talk about what you're hoping to achieve and find healthier ways to reach those goals. What feeling are you chasing when you think about winning?",
    quickReplies: ["Explore motivations", "Alternative activities", "Financial goals"]
  }
]

// Safety check for harmful content
const checkSafety = (message) => {
  const harmfulPatterns = [
    /suicide|kill myself|end it all|want to die/i,
    /self[\s-]?harm|hurt myself|cutting/i,
    /overdose|OD/i
  ]
  
  return harmfulPatterns.some(pattern => pattern.test(message))
}

// Check for gambling strategy requests
const checkGamblingTips = (message) => {
  const gamblingPatterns = [
    /how to win|winning strategy|beat the odds/i,
    /best bet|sure bet|guaranteed win/i,
    /casino tricks|slot machine hack/i,
    /betting system|martingale|card counting/i
  ]
  
  return gamblingPatterns.some(pattern => pattern.test(message))
}

// Initialize Gemini (for development/fallback)
let genAI = null
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey)
}

// Main coach function
export const sendToCoach = async (message, conversationHistory = []) => {
  try {
    // Safety checks
    if (checkSafety(message)) {
      return {
        response: "I'm really concerned about what you're sharing. You don't have to go through this alone. Please reach out for immediate support:\n\n**Crisis Line: 988** (call or text)\n**Crisis Text Line: Text HOME to 741741**\n\nWould you like me to help you find local mental health resources?",
        quickReplies: ["Find local help", "Coping strategies", "Talk to someone"],
        isUrgent: true
      }
    }
    
    if (checkGamblingTips(message)) {
      return {
        response: "I can't provide gambling strategies or tips. I'm here to help you reduce or quit gambling, not to help you gamble more effectively. The reality is that gambling is designed for the house to win in the long run. Let's focus on what you really want to achieve - is it excitement, money, or something else? There are healthier ways to reach those goals.",
        quickReplies: ["Explore motivations", "Alternative activities", "Money goals"],
        isBlocked: true
      }
    }
    
    // Try to use Cloudflare Worker first (production)
    if (workerUrl) {
      try {
        const response = await fetch(`${workerUrl}/coach`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            history: conversationHistory.slice(-6), // Last 3 exchanges
            systemPrompt: SYSTEM_PROMPT
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          return data
        }
      } catch (error) {
        console.log('Worker unavailable, falling back to direct API')
      }
    }
    
    // Fallback to direct Gemini API (development)
    if (genAI) {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
      
      // Build conversation context
      const conversationContext = conversationHistory
        .slice(-6)
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')
      
      const fullPrompt = `${SYSTEM_PROMPT}\n\nConversation history:\n${conversationContext}\n\nUser: ${message}\n\nProvide a helpful, empathetic response following the guidelines. Also suggest 3 relevant quick-reply options.`
      
      const result = await model.generateContent(fullPrompt)
      const response = result.response.text()
      
      // Extract quick replies (simple parsing)
      const quickReplies = extractQuickReplies(response)
      const cleanResponse = response.replace(/Quick replies:.*$/i, '').trim()
      
      return {
        response: cleanResponse,
        quickReplies,
        isUrgent: false
      }
    }
    
    // Fallback response if no API available
    return {
      response: "I'm here to help, but I'm having trouble connecting right now. In the meantime, try the Quick Help feature for immediate urge management, or explore the Learn section for helpful strategies.",
      quickReplies: ["Quick Help", "Learn", "Try again"],
      isOffline: true
    }
    
  } catch (error) {
    console.error('Coach error:', error)
    return {
      response: "I'm having trouble right now, but you can still use Quick Help for immediate support or explore the Learn section for coping strategies.",
      quickReplies: ["Quick Help", "Learn", "Try again"],
      isError: true
    }
  }
}

// Helper function to extract quick replies from response
const extractQuickReplies = (response) => {
  // Look for quick replies in the response
  const quickReplyMatch = response.match(/quick.?replies?:(.*)$/i)
  if (quickReplyMatch) {
    const replies = quickReplyMatch[1]
      .split(/[,•\n]/)
      .map(r => r.trim())
      .filter(r => r.length > 0 && r.length < 20)
      .slice(0, 3)
    
    if (replies.length > 0) return replies
  }
  
  // Default quick replies based on context
  if (response.includes('urge')) {
    return ["Start timer", "Check triggers", "Distract me"]
  }
  if (response.includes('slip') || response.includes('lost')) {
    return ["Make new plan", "Identify trigger", "Self-compassion"]
  }
  if (response.includes('trigger')) {
    return ["Create If-Then plan", "Avoid triggers", "Coping skills"]
  }
  
  // Generic defaults
  return ["Tell me more", "Coping strategies", "Make a plan"]
}

// Export quick reply options for UI
export const QUICK_REPLY_OPTIONS = [
  "I have an urge now",
  "Make a plan", 
  "Check triggers",
  "Money guardrails",
  "I slipped",
  "Self-exclusion info",
  "Distract me",
  "Edit goals",
  "Help lines"
]
