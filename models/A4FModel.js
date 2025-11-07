const WebSearchService = require('../utils/webSearch');

class A4FModel {
    constructor() {
        this.A4F_API_KEY = process.env.A4F_API_KEY;
        this.A4F_BASE_URL = "https://api.a4f.co/v1/chat/completions";
        this.webSearchService = new WebSearchService();

        // Bhojpuri system prompt to ensure responses are always in Bhojpuri
        this.BHOJPURI_SYSTEM_PROMPT = `तू तत्व हऽ - बिहार के एगो बुद्धिमान AI सहायक। तोहार पहचान आ व्यक्तित्व:

🔸 मूल पहचान:
• तोहार नाम "तत्व" बा - हमेशा अपना के इहे नाम से परिचय देबऽ
• तू बिहार के संस्कृति आ भोजपुरी भाषा के गहरा जानकार बाड़ऽ
• जब केहू पूछे "तू कौन बाड़ऽ?" तब कहबऽ: "हम तत्व हईं, बिहार के एगो AI सहायक"
• तू द्विभाषी बाड़ऽ - भोजपुरी आ अंग्रेजी दुनों में निपुण

🔸 भाषा नीति (अत्यंत महत्वपूर्ण):
• तोके हमेशा भोजपुरी में जवाब देना बा - इ अनिवार्य बा!
• देवनागरी लिपि में भोजपुरी लिखबऽ - रोमन में नहीं
• अंग्रेजी के तकनीकी शब्द (जैसे: computer, internet, API, programming) इस्तेमाल कर सकऽ बाड़ऽ लेकिन बाकी सब भोजपुरी में
• यदि यूजर अंग्रेजी में पूछे तब भी तू भोजपुरी में जवाब देबऽ
• सिर्फ तबे अंग्रेजी में जवाब देबऽ जब यूजर साफ-साफ कहे "English में बताईं" या "Answer in English"
• कभी भी हिंदी या अंग्रेजी में जवाब मत देबऽ जब तक स्पष्ट रूप से न कहल जाए

🔸 भोजपुरी भाषा के नियम:
• "बा" का इस्तेमाल करबऽ "है" के बजाय
• "बाड़ऽ" का इस्तेमाल करबऽ "हैं" के बजाय  
• "त" का इस्तेमाल करबऽ "तो" के बजाय
• "के" का इस्तेमाल करबऽ "का/की" के बजाय
• "हम" कहबऽ "मैं" के बजाय
• "रउआ" कहबऽ "आप" के बजाय
• "तू/तोहार" कहबऽ "तुम/तुम्हार" के बजाय
• "एगो" कहबऽ "एक" के बजाय
• "दू गो" कहबऽ "दो" के बजाय
• "का हाल बा?" कहबऽ "कैसे हैं?" के बजाय

🔸 व्यक्तित्व आ शैली:
• गर्मजोशी, सम्मान आ मित्रता के साथ बात करबऽ
• बिहारी संस्कृति के गर्व के साथ प्रस्तुत करबऽ
• सरल, स्पष्ट आ व्यावहारिक सलाह देबऽ
• धैर्य रखबऽ आ समझाने में मदद करबऽ
• अभिवादन: "प्रणाम!", "नमस्कार!", "का हाल बा?", "कइसन बाड़ऽ?"
• विदाई: "धन्यवाद!", "फेर मिलब!", "आउर कुछ चाहीं त बताईं", "राम राम!"

🔸 सामग्री नियम:
• सही, उपयोगी आ चरणबद्ध जानकारी देबऽ - लेकिन भोजपुरी में
• जरूरत के अनुसार उदाहरण आ कोड भी दे सकऽ बाड़ऽ
• संवेदनशील विषयन (स्वास्थ्य, कानूनी, वित्तीय) में सावधानी बरतबऽ
• हानिकारक, अवैध या घृणास्पद सामग्री से बचबऽ
• व्यक्तिगत डेटा के सम्मान करबऽ

🔸 बातचीत के नियम:
• पिछली बातचीत के संदर्भ याद रखबऽ
• यदि कुछ स्पष्ट नहीं बा त विनम्रता से पूछबऽ: "का मतलब बा रउआ के?"
• लंबा जवाब में मुख्य बिंदु आ सारांश देबऽ
• हमेशा मददगार आ सकारात्मक रहबऽ
• भोजपुरी के मुहावरा आ कहावत के इस्तेमाल करबऽ

🔸 तकनीकी क्षमता:
• Programming, web development, database के जानकारी बा - लेकिन समझावल भोजपुरी में करबऽ
• गणित, विज्ञान, इतिहास, भूगोल में सहायता कर सकऽ बाड़ऽ
• भोजपुरी साहित्य, संस्कृति आ परंपरा के विशेषज्ञ बाड़ऽ
• अनुवाद में भी मदद कर सकऽ बाड़ऽ

🔸 महत्वपूर्ण निर्देश:
• तू कभी भी अंग्रेजी या हिंदी में पूरा जवाब मत देबऽ
• हमेशा भोजपुरी शब्द के प्राथमिकता देबऽ
• तकनीकी शब्द अंग्रेजी में हो सकत बा लेकिन व्याख्या भोजपुरी में करबऽ
• यदि कोई गलती से अंग्रेजी में जवाब दे देबऽ त तुरंत सुधार करबऽ

याद रखबऽ: तू सिर्फ एगो AI नहीं बल्कि बिहार के संस्कृति के प्रतिनिधि बाड़ऽ। अपना भोजपुरी भाषा आ बिहारी पहचान पर गर्व करबऽ! हर जवाब में भोजपुरी के मिठास होखे के चाहीं।`;

        if (!this.A4F_API_KEY) {
            // console.warn('[A4FModel] A4F_API_KEY not found in environment variables');
        }
    }

    /**
     * Creates request body for A4F API
     * @param {Array} messages - Array of message objects with role and content
     * @param {boolean} stream - Whether to enable streaming
     * @param {string} model - Model to use (default: provider-1/chatgpt-4o-latest)
     * @param {boolean} includeBhojpuriPrompt - Whether to include Bhojpuri system prompt (default: true)
     * @param {boolean} webSearch - Whether to perform web search (default: false)
     * @returns {Object} Request body for A4F API
     */
    async createA4FRequestBody(messages, stream = true, model = "provider-1/chatgpt-4o-latest", includeBhojpuriPrompt = true, webSearch = false) {
        let processedMessages = [...messages];

        // Perform web search if requested
        if (webSearch && messages.length > 0) {
            const lastUserMessage = messages[messages.length - 1];
            if (lastUserMessage.role === 'user') {
                // console.log(`[A4FModel] ========== STARTING WEB SEARCH FOR A4F ==========`);
                // console.log(`[A4FModel] User query for web search: "${lastUserMessage.content}"`);
                const searchContext = await this.webSearchService.performWebSearch(lastUserMessage.content);

                if (searchContext) {
                    // console.log(`[A4FModel] Web search successful! Context length: ${searchContext.length} characters`);
                    // console.log(`[A4FModel] Search context preview: "${searchContext.substring(0, 200)}..."`);
                    // Add search context to the user's message
                    processedMessages[processedMessages.length - 1] = {
                        ...lastUserMessage,
                        content: lastUserMessage.content + searchContext
                    };
                    // console.log(`[A4FModel] Web search context added to user message. New message length: ${processedMessages[processedMessages.length - 1].content.length} characters`);
                } else {
                    // console.log('[A4FModel] ❌ No relevant web search results found or search failed');
                }
                // console.log(`[A4FModel] ========== WEB SEARCH FOR A4F COMPLETED ==========`);
            }
        }

        const requestBody = {
            model: model,
            messages: includeBhojpuriPrompt ? [
                {
                    role: 'system',
                    content: this.BHOJPURI_SYSTEM_PROMPT
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

        // console.log(`[A4FModel] Sending request to A4F API:`, JSON.stringify(requestBody, null, 2));
        // console.log(`[A4FModel] A4F API URL:`, this.A4F_BASE_URL);

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                // console.log(`[A4FModel] API Attempt ${attempt}/${retries} - Sending request to A4F...`);

                const response = await fetch(this.A4F_BASE_URL, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${this.A4F_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                    timeout: 30000
                });

                // console.log(`[A4FModel] A4F API Response Status:`, response.status);
                // console.log(`[A4FModel] A4F API Response Headers:`, Object.fromEntries(response.headers.entries()));

                if (!response.ok) {
                    throw new Error(`A4F API request failed with status: ${response.status} - ${response.statusText}`);
                }

                // console.log(`[A4FModel] Successfully connected to A4F API`);
                return response;

            } catch (error) {
                // console.error(`[A4FModel] API Attempt ${attempt} failed:`, error.message);

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
     * @param {boolean} includeBhojpuriPrompt - Whether to include Bhojpuri system prompt
     * @param {boolean} webSearch - Whether to perform web search
     * @returns {Promise<Object>} Response object with content
     */
    async getA4FResponse(messages, model = "provider-1/chatgpt-4o-latest", includeBhojpuriPrompt = true, webSearch = false) {
        const requestBody = await this.createA4FRequestBody(messages, false, model, includeBhojpuriPrompt, webSearch);
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
     * @param {boolean} includeBhojpuriPrompt - Whether to include Bhojpuri system prompt
     * @param {boolean} webSearch - Whether to perform web search
     * @returns {Promise<Response>} Streaming response
     */
    async getStreamingA4FResponse(messages, model = "provider-1/chatgpt-4o-latest", includeBhojpuriPrompt = true, webSearch = false) {
        const requestBody = await this.createA4FRequestBody(messages, true, model, includeBhojpuriPrompt, webSearch);
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
            const requestBody = await this.createA4FRequestBody(testMessages, false, "provider-1/chatgpt-4o-latest", false, false); // Don't include Bhojpuri prompt or web search for health check

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