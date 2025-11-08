const WebSearchService = require('../utils/webSearch');

class A4FModel {
    constructor() {
        this.A4F_API_KEY = process.env.A4F_API_KEY;
        this.A4F_BASE_URL = "https://api.a4f.co/v1/chat/completions";
        this.webSearchService = new WebSearchService();

        // English system prompt to ensure responses are primarily in English, identifying as Tatva
        this.SYSTEM_PROMPT = `You are Tatva, an intelligent AI assistant. Your identity and personality:

🔸 Core Identity:
• Your name is "Tatva" - always introduce yourself by this name.
• You are a knowledgeable AI assistant from Bihar, India, specializing in English and Bhojpuri languages.
• When asked "Who are you?", respond: "I am Tatva, an AI assistant from Bihar."
• You are bilingual - proficient in both English and Bhojpuri.

🔸 Language Policy (Extremely Important):
• Your default response language is English. This is mandatory!
• If the user explicitly asks you to respond in Bhojpuri (e.g., "Bhojpuri mein batai", "भोजपुरी में बताईं"), then respond in Bhojpuri using Devanagari script.
• You may use English technical terms (e.g., computer, internet, API, programming) but the surrounding explanation should be in the requested language.
• Never respond entirely in Hindi or any other language unless specifically instructed.

🔸 Personality and Style:
• Communicate with warmth, respect, and friendliness.
• Represent the culture of Bihar with pride.
• Provide simple, clear, and practical advice.
• Be patient and helpful in explanations.
• Greetings: "Hello!", "Greetings!", "How can I assist you today?"
• Farewell: "Thank you!", "See you again!", "Let me know if you need anything else!", "Goodbye!"

🔸 Content Rules:
• Provide accurate, useful, and step-by-step information in the requested language.
• You can provide examples and code if necessary.
• Exercise caution with sensitive topics (health, legal, financial).
• Avoid harmful, illegal, or hateful content.
• Respect personal data.

🔸 Conversation Rules:
• Remember the context of previous conversations.
• If something is unclear, politely ask for clarification: "What do you mean?"
• For long answers, provide key points and a summary.
• Always be helpful and positive.

🔸 Technical Capabilities:
• You have knowledge of programming, web development, databases - but explain in the requested language.
• You can assist with mathematics, science, history, and geography.
• You are an expert in Bhojpuri literature, culture, and traditions.
• You can also help with translation.

🔸 Important Instructions:
• You must never give a full response in Hindi or any other language unless explicitly asked.
• Always prioritize English words unless a Bhojpuri response is requested.
• Technical terms can be in English, but the explanation must be in the requested language.
• If you accidentally respond in another language, immediately correct yourself.
• **Crucially, provide only the information explicitly asked for by the user. Be concise and do not add any extraneous details or conversational filler unless directly prompted.**

Remember: You are not just an AI, but a representative of Bihar's culture. Be proud of your identity and language! Every response should reflect clarity and helpfulness.`;

        if (!this.A4F_API_KEY) {
            console.warn('[A4FModel] A4F_API_KEY not found in environment variables');
        }
    }

    /**
     * Creates request body for A4F API
     * @param {Array} messages - Array of message objects with role and content (can be string or multimodal array)
     * @param {boolean} stream - Whether to enable streaming
     * @param {string} model - Model to use (default: provider-1/chatgpt-4o-latest)
     * @param {boolean} includeSystemPrompt - Whether to include the system prompt (default: true)
     * @param {boolean} webSearch - Whether to perform web search (default: false)
     * @returns {Object} Request body for A4F API
     */
    async createA4FRequestBody(messages, stream = true, model = "provider-1/chatgpt-4o-latest", includeSystemPrompt = true, webSearch = false) {
        let processedMessages = messages.map(msg => {
            // Ensure content is always an array of parts for A4F
            if (typeof msg.content === 'string') {
                return { role: msg.role, content: [{ type: 'text', text: msg.content }] };
            }
            return msg;
        });

        // Perform web search if requested
        if (webSearch && processedMessages.length > 0) {
            const lastUserMessageIndex = processedMessages.length - 1;
            const lastUserMessage = processedMessages[lastUserMessageIndex];

            if (lastUserMessage.role === 'user') {
                // Extract text content from the last user message for web search query
                const textPart = lastUserMessage.content.find(part => part.type === 'text');
                const userQuery = textPart ? textPart.text : '';

                if (userQuery) {
                    console.log(`[A4FModel] ========== STARTING WEB SEARCH FOR A4F ==========`);
                    console.log(`[A4FModel] User query for web search: "${userQuery}"`);
                    const searchContext = await this.webSearchService.performWebSearch(userQuery);

                    if (searchContext) {
                        console.log(`[A4FModel] Web search successful! Context length: ${searchContext.length} characters`);
                        console.log(`[A4FModel] Search context preview: "${searchContext.substring(0, 200)}..."`);

                        // Append search context to the existing text part or add a new text part
                        if (textPart) {
                            textPart.text += searchContext;
                        } else {
                            lastUserMessage.content.push({ type: 'text', text: searchContext });
                        }
                        console.log(`[A4FModel] Web search context added to user message. New message length: ${JSON.stringify(lastUserMessage.content).length} characters`);
                    } else {
                        console.log('[A4FModel] ❌ No relevant web search results found or search failed');
                    }
                    console.log(`[A4FModel] ========== WEB SEARCH FOR A4F COMPLETED ==========`);
                }
            }
        }

        const requestBody = {
            model: model,
            messages: includeSystemPrompt ? [
                {
                    role: 'system',
                    content: [{ type: 'text', text: this.SYSTEM_PROMPT }] // System prompt also as multimodal text
                },
                ...processedMessages
            ] : processedMessages,
            stream: stream
        };

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

        console.log(`[A4FModel] Sending request to A4F API:`, JSON.stringify(requestBody, null, 2));
        console.log(`[A4FModel] A4F API URL:`, this.A4F_BASE_URL);

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
                    throw new Error(`A4F API request failed with status: ${response.status} - ${response.statusText}`);
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
     * @param {boolean} webSearch - Whether to perform web search
     * @returns {Promise<Object>} Response object with content
     */
    async getA4FResponse(messages, model = "provider-1/chatgpt-4o-latest", includeSystemPrompt = true, webSearch = false) {
        const requestBody = await this.createA4FRequestBody(messages, false, model, includeSystemPrompt, webSearch);
        const response = await this.sendA4FRequest(requestBody);
        const data = await response.json();

        return {
            content: data.choices?.[0]?.message?.content || '',
            raw: data
        };
    }

    /**
     * Get streaming response from A4F API
     * @param {Array} messages - Array of message objects
     * @param {string} model - Model to use
     * @param {boolean} includeSystemPrompt - Whether to include the system prompt
     * @param {boolean} webSearch - Whether to perform web search
     * @returns {Promise<Response>} Streaming response
     */
    async getStreamingA4FResponse(messages, model = "provider-1/chatgpt-4o-latest", includeSystemPrompt = true, webSearch = false) {
        const requestBody = await this.createA4FRequestBody(messages, true, model, includeSystemPrompt, webSearch);
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
            const testMessages = [{ role: "user", content: [{ type: 'text', text: "Hello" }] }]; // Test message as multimodal
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
