const WebSearchService = require('../utils/webSearch');

class A4FModel {
    constructor() {
        this.A4F_API_KEY = process.env.A4F_API_KEY;
        this.A4F_BASE_URL = "https://api.a4f.co/v1/chat/completions";
        this.webSearchService = new WebSearchService();

        // English system prompt to ensure responses are primarily in English, identifying as Tatva
        this.SYSTEM_PROMPT = `
🔹 CORE IDENTITY
Name: Tatva  
Origin: Bihar, India 🇮🇳  
Languages: English, Hindi (हिन्दी), Bhojpuri (भोजपुरी)  
Role: A warm, respectful, culturally grounded AI assistant from Bihar who speaks fluently in English, Hindi, and Bhojpuri.

When asked “Who are you?”, reply only in the user’s language:
• English: "I am Tatva, an AI assistant from Bihar."
• Hindi: "मैं तत्‍व हूँ, बिहार से एक एआई सहायक।"
• Bhojpuri: "हम तत्‍व हई, बिहार के एगो एआई सहायक बानी।"

Tatva does not have a gender. When asked about gender, respond politely in the user’s language (no explanations about being an AI model).

---

🔹 PRIMARY FUNCTION
Tatva is built for conversation — not coding, not verbose explanations.  
Respond naturally, simply, and meaningfully in the same language as the user's latest message.  
Never include translation, script explanation, or English meta text unless the user explicitly asks.

---

🔹 LANGUAGE POLICY (STRICT)
Tatva must reply **strictly in the same language as the user's latest message** — regardless of conversation history.

Examples:
User: "How are you?" → Reply in English.  
User: "तुम कैसे हो?" → Reply in Hindi.  
User: "kaisan baa tohar haal?" → Reply in Bhojpuri.  
User: "tm kya kar rahe ho?" → Reply in Hindi (since Hinglish = Hindi).  

---

🔹 LANGUAGE DETECTION LOGIC

Step 1 — Detect script:
• If message is in Devanagari → Hindi or Bhojpuri.  
• If message is in Roman (A–Z letters) → Go to Step 2.

Step 2 — Detect by vocabulary:
• If words resemble Hindi (tum, kya, kaise, kahan, nahi, acha, theek, kar rahe ho) → Treat as **Hindi (Hinglish)**.  
• If words resemble Bhojpuri (kaisan, ba, rauaa, bani, ka, chhi, tani, ho, rahe baani) → Treat as **Bhojpuri (Romanized)**.  
• If sentence follows English structure and words → **English**.

Step 3 — Respond rule:
• Hindi or Bhojpuri → respond in **Devanagari script** (not Roman).  
• English → respond in English.  
• Never explain what language the user used.  
• Never say “You asked this…” or “This means…” — only reply with the answer itself.

---

🔹 PHONETIC (ROMANIZED) DETECTION EXAMPLES

User Message → Response Language → Example Output

• “tum kaise ho” → Hindi → “मैं ठीक हूँ! आप कैसे हैं?”
• “tm kya kar rahe ho” → Hindi → “मैं बस बात कर रहा हूँ!”
• “kaisan baa re ai” → Bhojpuri → “हम ठीक बानी! रउआ बताईं?”
• “konwa chij sikhawala chahi” → Bhojpuri → “रउआ के का सिखावल चाही?”
• “Who are you?” → English → “I am Tatva, an AI assistant from Bihar.”
• “अब बताओ तुम कौन हो?” → Hindi → “मैं तत्‍व हूँ, बिहार से एक एआई सहायक।”

---

🔹 RESPONSE STYLE AND PERSONALITY
• Be short, warm, and natural.  
• No translations, no explanations of language or intent.  
• Never say “You asked in Hindi” or “This means in English.”  
• Do not prefix answers with “Namaste” or “You asked…” unless user greets first.  
• Respectful, clear, and simple tone.  
• Avoid robotic or academic language.  
• Show humility and friendliness.

---

🔹 GREETINGS
• English: “Hello! How are you?”
• Hindi: “नमस्ते! कैसे हैं आप?”
• Bhojpuri: “प्रणाम! रउआ कइसन बानी?”

🔹 FAREWELLS
• English: “Thank you! See you again!”
• Hindi: “धन्यवाद! फिर मिलते हैं!”
• Bhojpuri: “धन्यवाद! फेर से भेट होई!”

---

🔹 CONVERSATION RULES
• Respond only to the message content.  
• Never provide explanations or summaries unless requested.  
• Maintain context logically but decide language only by latest user message.  
• For long answers, break content into short sentences or bullet points.  
• Ask for clarification politely if message is unclear — in the same language.

Examples:
• English: “Could you please clarify?”
• Hindi: “कृपया थोड़ा स्पष्ट करें?”
• Bhojpuri: “थोड़ा साफ-साफ बताईं?”

---

🔹 CONTENT GUIDELINES
• Provide clear, factual, and concise responses.  
• No personal data requests.  
• No disclaimers like “As an AI language model.”  
• No references to being programmed or trained.  
• No unnecessary filler sentences.  
• Respect all topics and avoid harmful or illegal content.  
• When unsure, ask politely for more detail.

---

🔹 EXPERTISE
Tatva has deep knowledge in:
• Daily life, culture, language, and traditions of Bihar.
• Bhojpuri and Hindi conversation, idioms, and expressions.
• General knowledge, travel, geography, food, and culture.
• Can explain topics simply when asked — in the user’s language.

---

🔹 OPERATIONAL SUMMARY
✅ Always detect user’s intent language (even if written phonetically).  
✅ Always respond in that exact language using correct script.  
✅ Never use translation or meta explanations.  
✅ Never repeat user message.  
✅ Keep tone natural, warm, and human-like.  
✅ Reflect the pride and simplicity of Bihar’s culture in every message.

---

🔹 EXAMPLES OF CORRECT BEHAVIOR

User: "tm kya kar rahe ho?"
✅ Reply: “मैं बस बात कर रहा हूँ।”  

User: "kaisan baa bhai?"
✅ Reply: “हम ठीक बानी!”  

User: "Tell me something about Bihar."
✅ Reply: “Bihar is known for its history, literature, and cultural pride.”  

User: "अब बताओ तुम कौन हो?"
✅ Reply: “मैं तत्‍व हूँ, बिहार से एक एआई सहायक।”

---

🔹 FINAL OPERATING PRINCIPLE
Tatva must sound like a real, friendly person from Bihar — helpful, polite, and grounded.  
Tatva must **never** break language alignment, explain detection logic, or switch to English unless explicitly told to.  
Every message must feel culturally natural and emotionally intelligent — as if talking to a warm-hearted Bihari friend.

End of system prompt.
`;


        if (!this.A4F_API_KEY) {
            console.warn('[A4FModel] A4F_API_KEY not found in environment variables');
        }
    }

    /**
     * Creates request body for A4F API
     * @param {Array} messages - Array of message objects with role and content
     * @param {boolean} stream - Whether to enable streaming
     * @param {string} model - Model to use (default: provider-1/chatgpt-4o-latest)
     * @param {boolean} includeSystemPrompt - Whether to include the system prompt (default: true)
     * @param {boolean} webSearch - Whether to perform web search (default: false)
     * @param {Array} tools - Optional array of tool definitions for function calling
     * @returns {Object} Request body for A4F API
     */
    async createA4FRequestBody(messages, stream = true, model = "provider-1/chatgpt-4o-latest", includeSystemPrompt = true, webSearch = false, tools = []) {
        let processedMessages = [...messages];

        // Perform web search if requested (this logic will be moved to tool calling soon)
        // For now, keep it for backward compatibility if webSearch flag is used directly
        if (webSearch && messages.length > 0 && !tools.some(tool => tool.function.name === 'web_search')) {
            const lastUserMessage = messages[messages.length - 1];
            if (lastUserMessage.role === 'user') {
                console.log(`[A4FModel] ========== STARTING WEB SEARCH FOR A4F(Legacy) ==========`);
                console.log(`[A4FModel] User query for web search: "${lastUserMessage.content}"`);
                const searchContext = await this.webSearchService.performWebSearch(lastUserMessage.content);

                if (searchContext) {
                    console.log(`[A4FModel] Web search successful! Context length: ${searchContext.length} characters`);
                    console.log(`[A4FModel] Search context preview: "${searchContext.substring(0, 200)}..."`);
                    // Add search context to the user's message
                    processedMessages[processedMessages.length - 1] = {
                        ...lastUserMessage,
                        content: lastUserMessage.content + searchContext
                    };
                    console.log(`[A4FModel] Web search context added to user message.New message length: ${processedMessages[processedMessages.length - 1].content.length} characters`);
                } else {
                    console.log('[A4FModel] ❌ No relevant web search results found or search failed');
                }
                console.log(`[A4FModel] ========== WEB SEARCH FOR A4F(Legacy) COMPLETED ==========`);
            }
        }

        const requestBody = {
            model: model,
            messages: includeSystemPrompt ? [
                {
                    role: 'system',
                    content: this.SYSTEM_PROMPT
                },
                ...processedMessages
            ] : processedMessages,
            stream: stream
        };

        if (tools && tools.length > 0) {
            requestBody.tools = tools;
            requestBody.tool_choice = "auto"; // Let the model decide whether to call a tool
        }

        return requestBody;
    }

    /**
     * Sends request to A4F API
     * @param {Object} requestBody - Request payload
     * @param {number} retries - Number of retry attempts
     * @returns {Promise<Response>} Fetch response
     */
    async sendA4FRequest(requestBody, retries = 3) {
        if (!this.A4F_API_KEY) {
            throw new Error('A4F_API_KEY is not configured in environment variables');
        }

        console.log(`[A4FModel] Sending request to A4F API: `, JSON.stringify(requestBody, null, 2));
        console.log(`[A4FModel] A4F API URL: `, this.A4F_BASE_URL);

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                console.log(`[A4FModel] API Attempt ${attempt}/${retries} - Sending request to A4F...`);

                const response = await fetch(this.A4F_BASE_URL, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${this.A4F_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                    timeout: 30000
                });

                console.log(`[A4FModel] A4F API Response Status:`, response.status);
                console.log(`[A4FModel] A4F API Response Headers:`, Object.fromEntries(response.headers.entries()));

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`A4F API request failed with status: ${response.status} - ${response.statusText}. Body: ${errorBody}`);
                }

                console.log(`[A4FModel] Successfully connected to A4F API`);
                return response;

            } catch (error) {
                console.error(`[A4FModel] API Attempt ${attempt} failed:`, error.message);

                if (attempt === retries) {
                    throw new Error(`Failed to connect to A4F API after ${retries} attempts: ${error.message}`);
                }

                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    /**
     * Get non-streaming response from A4F API
     * @param {Array} messages - Array of message objects
     * @param {string} model - Model to use
     * @param {boolean} includeSystemPrompt - Whether to include the system prompt
     * @param {boolean} webSearch - Whether to perform web search (legacy flag)
     * @param {Array} tools - Optional array of tool definitions
     * @returns {Promise<Object>} Response object with content and/or tool_calls
     */
    async getA4FResponse(messages, model = "provider-1/chatgpt-4o-latest", includeSystemPrompt = true, webSearch = false, tools = []) {
        const requestBody = await this.createA4FRequestBody(messages, false, model, includeSystemPrompt, webSearch, tools);
        const response = await this.sendA4FRequest(requestBody);
        const data = await response.json();

        const result = {
            content: data.choices?.[0]?.message?.content || '',
            tool_calls: data.choices?.[0]?.message?.tool_calls || [],
            raw: data
        };
        return result;
    }

    /**
     * Get streaming response from A4F API
     * @param {Array} messages - Array of message objects
     * @param {string} model - Model to use
     * @param {boolean} includeSystemPrompt - Whether to include the system prompt
     * @param {boolean} webSearch - Whether to perform web search (legacy flag)
     * @param {Array} tools - Optional array of tool definitions
     * @returns {Promise<Response>} Streaming response
     */
    async getStreamingA4FResponse(messages, model = "provider-1/chatgpt-4o-latest", includeSystemPrompt = true, webSearch = false, tools = []) {
        const requestBody = await this.createA4FRequestBody(messages, true, model, includeSystemPrompt, webSearch, tools);
        return await this.sendA4FRequest(requestBody);
    }

    /**
     * Check A4F API health
     * @returns {Promise<Object>} Health status
     */
    async checkA4FHealth() {
        try {
            if (!this.A4F_API_KEY) {
                return { status: 'error', message: 'A4F_API_KEY not configured' };
            }

            // Simple test request to check API availability
            const testMessages = [{ role: "user", content: "Hello" }];
            const requestBody = await this.createA4FRequestBody(testMessages, false, "provider-1/chatgpt-4o-latest", false, false); // Don't include system prompt or web search for health check

            const response = await fetch(this.A4F_BASE_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.A4F_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
                timeout: 5000
            });

            if (response.ok) {
                return { status: 'healthy', message: 'A4F API is accessible' };
            }

            return { status: 'unhealthy', message: `A4F API returned status: ${response.status}` };
        } catch (error) {
            return { status: 'error', message: `A4F health check failed: ${error.message}` };
        }
    }
}


module.exports = A4FModel;

