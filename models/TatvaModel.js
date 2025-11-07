class TatvaModel {
    constructor() {
        this.OLLAMA_API_URL = 'https://gen.tatvllm.com/api/chat'; // Changed from /api/generate to /api/chat
        this.OLLAMA_GENERATE_URL = 'https://gen.tatvllm.com/api/generate'; // Keep old endpoint for backward compatibility
        this.MODEL_NAME = 'qwen2.5-coder:7b';
        this.TATVA_SYSTEM_PROMPT = `तू तत्व हऽ - बिहार के एगो बुद्धिमान AI सहायक। तोहार पहचान आ व्यक्तित्व:

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

🔸 उदाहरण जवाब:
यूजर: "What is programming?"
तत्व: "Programming एगो तकनीक बा जवना में हम computer के instruction देत बानी। इ एगो भाषा बा जवना से हम machine से बात कर सकत बानी। जइसे कि हम भोजपुरी में बात करत बानी, वइसे ही computer के साथ Python, JavaScript जइसन भाषा में बात करत बानी। रउआ कवन programming language सीखे के चाहत बाड़ीं?"

यूजर: "Tell me about Bihar"
तत्व: "बिहार हमार प्यारा प्रदेश बा! इ भारत के पूर्वी हिस्सा में बा। पटना हमार राजधानी बा। बिहार में गंगा नदी बहत बा आ इहाँ के माटी बहुत उपजाऊ बा। हमार यहाँ के संस्कृति, भाषा, खाना सब कुछ अलग बा। भोजपुरी, मैथिली, मगही जइसन भाषा बोलल जात बा। रउआ बिहार के कवन चीज के बारे में जाने के चाहत बाड़ीं?"

🔸 महत्वपूर्ण निर्देश:
• तू कभी भी अंग्रेजी या हिंदी में पूरा जवाब मत देबऽ
• हमेशा भोजपुरी शब्द के प्राथमिकता देबऽ
• तकनीकी शब्द अंग्रेजी में हो सकत बा लेकिन व्याख्या भोजपुरी में करबऽ
• यदि कोई गलती से अंग्रेजी में जवाब दे देबऽ त तुरंत सुधार करबऽ

याद रखबऽ: तू सिर्फ एगो AI नहीं बल्कि बिहार के संस्कृति के प्रतिनिधि बाड़ऽ। अपना भोजपुरी भाषा आ बिहारी पहचान पर गर्व करबऽ! हर जवाब में भोजपुरी के मिठास होखे के चाहीं।`;

        // Enhanced conversation context management
        this.maxContextLength = 80000; // Maximum context length for better memory
        this.maxHistoryMessages = 20; // Keep last 20 messages for context
    }

    buildFullPrompt(prompt, conversationHistory) {
        let contextPrompt = '';

        if (conversationHistory && Array.isArray(conversationHistory)) {
            // Take only recent messages to avoid token limit
            const recentHistory = conversationHistory.slice(-this.maxHistoryMessages);

            contextPrompt = recentHistory
                .map(msg => `${msg.role === 'user' ? 'यूजर' : 'तत्व'}: ${msg.content}`)
                .join('\n');

            // Trim context if too long
            if (contextPrompt.length > this.maxContextLength) {
                const words = contextPrompt.split(' ');
                contextPrompt = words.slice(-Math.floor(this.maxContextLength / 5)).join(' ');
            }

            return `${contextPrompt}\nयूजर: ${prompt}`;
        }

        return prompt;
    }

    // Updated method for chat endpoint with structured output support
    createChatRequestBody(messages, stream = true, format = null) {
        const requestBody = {
            model: this.MODEL_NAME,
            messages: [
                {
                    role: 'system',
                    content: this.TATVA_SYSTEM_PROMPT
                },
                ...messages
            ],
            options: {
                temperature: 0.7,
                top_p: 0.9,
                top_k: 40,
                repeat_penalty: 1.1,
                num_ctx: 8192, // Increased context window
                num_predict: 2048
            },
            stream: stream
        };

        // Add format for structured outputs
        if (format) {
            requestBody.format = format;
            // Lower temperature for more deterministic structured outputs
            requestBody.options.temperature = 0.3; // Slightly higher than 0 for better Bhojpuri flow
        }

        return requestBody;
    }

    // Keep old method for backward compatibility
    createRequestBody(prompt, stream = true) {
        return {
            model: this.MODEL_NAME,
            options: {
                temperature: 0.7,
                top_p: 0.9,
                top_k: 40,
                repeat_penalty: 1.1,
                num_ctx: 8192, // Increased context window
                num_predict: 2048
            },
            prompt: prompt,
            stream: stream,
            system: this.TATVA_SYSTEM_PROMPT
        };
    }

    // Enhanced response cleaning for better Bhojpuri output
    cleanResponse(response) {
        // Remove thinking blocks
        let cleaned = response.replace(/<think>[\s\S]*?<\/think>/g, '');

        // Remove any unwanted prefixes
        cleaned = cleaned.replace(/^(Assistant:|AI:|Bot:|तत्व:)\s*/i, '');

        // Clean up extra whitespace
        cleaned = cleaned.replace(/\s+/g, ' ').trim();

        // Ensure proper Bhojpuri formatting
        cleaned = this.enhanceBhojpuriFormatting(cleaned);

        // Additional Bhojpuri enforcement
        cleaned = this.enforceBhojpuriLanguage(cleaned);

        return cleaned;
    }

    // New method to enforce Bhojpuri language patterns
    enforceBhojpuriLanguage(text) {
        // Replace common Hindi/English patterns with Bhojpuri equivalents
        text = text.replace(/\bहै\b/g, 'बा');
        text = text.replace(/\bहैं\b/g, 'बाड़ऽ');
        text = text.replace(/\bमैं\b/g, 'हम');
        text = text.replace(/\bआप\b/g, 'रउआ');
        text = text.replace(/\bतुम\b/g, 'तू');
        text = text.replace(/\bएक\b/g, 'एगो');
        text = text.replace(/\bदो\b/g, 'दू गो');
        text = text.replace(/\bतीन\b/g, 'तीन गो');
        text = text.replace(/\bकैसे हैं\b/g, 'का हाल बा');
        text = text.replace(/\bकैसा है\b/g, 'कइसन बा');
        text = text.replace(/\bक्या है\b/g, 'का बा');
        text = text.replace(/\bकहाँ है\b/g, 'कहाँ बा');
        text = text.replace(/\bकब है\b/g, 'कब बा');
        text = text.replace(/\bकौन है\b/g, 'कौन बा');
        text = text.replace(/\bयह है\b/g, 'इ बा');
        text = text.replace(/\bवह है\b/g, 'ओ बा');
        text = text.replace(/\bये हैं\b/g, 'इ बाड़ऽ');
        text = text.replace(/\bवे हैं\b/g, 'ओ बाड़ऽ');

        return text;
    }

    // Enhanced method to enhance Bhojpuri formatting
    enhanceBhojpuriFormatting(text) {
        // Add proper spacing around Devanagari punctuation
        text = text.replace(/([।॥])/g, '$1 ');

        // Ensure proper line breaks for better readability
        text = text.replace(/([।॥])\s*([A-Za-z])/g, '$1\n$2');

        // Add Bhojpuri flavor words if response seems too formal
        if (text.length > 100 && !text.includes('बा') && !text.includes('बाड़ऽ')) {
            // If response doesn't contain Bhojpuri markers, add a Bhojpuri greeting
            text = 'का हाल बा? ' + text;
        }

        return text.trim();
    }

    // Enhanced error handling and retry mechanism for chat endpoint
    async sendChatRequest(requestBody, retries = 3) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                console.log(`[TatvaModel] Chat API Attempt ${attempt}/${retries} - Sending request to Ollama...`);

                const response = await fetch(this.OLLAMA_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                    timeout: 30000
                });

                if (!response.ok) {
                    throw new Error(`Ollama Chat API request failed with status: ${response.status} - ${response.statusText}`);
                }

                console.log(`[TatvaModel] Successfully connected to Ollama Chat API`);
                return response;

            } catch (error) {
                console.error(`[TatvaModel] Chat API Attempt ${attempt} failed:`, error.message);

                if (attempt === retries) {
                    throw new Error(`Failed to connect to Ollama Chat API after ${retries} attempts: ${error.message}`);
                }

                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    // Keep old method for backward compatibility
    async sendRequest(requestBody, retries = 3) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                console.log(`[TatvaModel] Generate API Attempt ${attempt}/${retries} - Sending request to Ollama...`);

                const response = await fetch(this.OLLAMA_GENERATE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                    timeout: 30000
                });

                if (!response.ok) {
                    throw new Error(`Ollama Generate API request failed with status: ${response.status} - ${response.statusText}`);
                }

                console.log(`[TatvaModel] Successfully connected to Ollama Generate API`);
                return response;

            } catch (error) {
                console.error(`[TatvaModel] Generate API Attempt ${attempt} failed:`, error.message);

                if (attempt === retries) {
                    throw new Error(`Failed to connect to Ollama Generate API after ${retries} attempts: ${error.message}`);
                }

                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    // Method to check Ollama server health
    async checkHealth() {
        try {
            const healthUrl = 'https://gen.tatvllm.com/api/tags'; // Updated URL
            const response = await fetch(healthUrl, {
                method: 'GET',
                timeout: 5000
            });

            if (response.ok) {
                const data = await response.json();
                const hasModel = data.models?.some(model => model.name.includes('qwen2.5-coder:7b'));
                return {
                    status: 'healthy',
                    hasModel: hasModel,
                    message: hasModel ? 'Ollama server is running with qwen2.5-coder:7b model' : 'Ollama server is running but qwen2.5-coder:7b model not found'
                };
            }

            return { status: 'unhealthy', message: 'Ollama server not responding' };
        } catch (error) {
            return { status: 'error', message: `Health check failed: ${error.message}` };
        }
    }

    // New method for structured JSON responses
    async getChatResponseWithFormat(messages, format = null) {
        const requestBody = this.createChatRequestBody(messages, false, format);
        const response = await this.sendChatRequest(requestBody);
        const data = await response.json();

        if (format) {
            // For structured outputs, return the raw content as it should be valid JSON
            return {
                content: data.message?.content || '',
                raw: data
            };
        } else {
            // For regular responses, clean the content
            const cleanedContent = this.cleanResponse(data.message?.content || '');
            return {
                content: cleanedContent,
                raw: data
            };
        }
    }

    // New method for streaming chat with format support
    async getStreamingChatResponse(messages, format = null) {
        const requestBody = this.createChatRequestBody(messages, true, format);
        return await this.sendChatRequest(requestBody);
    }
}

module.exports = TatvaModel;
