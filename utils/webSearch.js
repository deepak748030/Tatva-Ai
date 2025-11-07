// const fetch = require('node-fetch'); // REMOVE THIS LINE

class WebSearchService {
    constructor() {
        // Only using DuckDuckGo for search as requested
        this.SEARCH_RESULTS_LIMIT = 5;
        this.MAX_SNIPPET_LENGTH = 300;
        this.TIMEOUT = 10000;
    }

    /**
     * Extract search keywords from user prompt
     * @param {string} prompt - User's message
     * @returns {string} - Optimized search query
     */
    extractSearchKeywords(prompt) {
        console.log(`[WebSearch] Original prompt: "${prompt}"`);

        const lowerPrompt = prompt.toLowerCase();

        // Specific handling for date, day, and weather queries
        if (lowerPrompt.includes('आज') && (lowerPrompt.includes('तारीख') || lowerPrompt.includes('दिनांक'))) {
            console.log(`[WebSearch] Detected date query, setting search query to "current date today"`);
            return "current date today"; // More explicit for search engines
        }
        if (lowerPrompt.includes('आज') && (lowerPrompt.includes('दिन') || lowerPrompt.includes('वार'))) {
            console.log(`[WebSearch] Detected day query, setting search query to "current day of the week today"`);
            return "current day of the week today"; // More explicit
        }
        if (lowerPrompt.includes('आज') && lowerPrompt.includes('मौसम')) {
            console.log(`[WebSearch] Detected weather query, setting search query to "आज का मौसम"`);
            return "आज का मौसम"; // This is likely good enough for weather
        }
        // General English queries for date/time/weather
        if (lowerPrompt.includes('current date') || lowerPrompt.includes('what is the date')) {
            return "current date today";
        }
        if (lowerPrompt.includes('current time') || lowerPrompt.includes('what is the time')) {
            return "current time now";
        }
        if (lowerPrompt.includes('current weather') || lowerPrompt.includes('what is the weather')) {
            return "current weather";
        }


        // Remove common Bhojpuri/Hindi stop words and extract meaningful keywords
        const stopWords = [
            'का', 'के', 'की', 'में', 'से', 'पर', 'को', 'है', 'हैं', 'था', 'थे', 'बा', 'बाड़ऽ',
            'हम', 'तू', 'रउआ', 'इ', 'ओ', 'एगो', 'दू', 'तीन', 'कइसे', 'कहाँ', 'कब', 'क्यों',
            'the', 'is', 'are', 'was', 'were', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at',
            'to', 'for', 'of', 'with', 'by', 'from', 'about', 'what', 'how', 'when', 'where', 'why',
            'tell', 'me', 'please', 'can', 'you', 'would', 'could', 'should', 'will', 'shall'
        ];

        // Clean and tokenize the prompt
        let cleanedPrompt = prompt
            .toLowerCase()
            .replace(/[^\w\s\u0900-\u097F]/g, ' ') // Keep alphanumeric and Devanagari characters
            .replace(/\s+/g, ' ')
            .trim();

        console.log(`[WebSearch] Cleaned prompt for general extraction: "${cleanedPrompt}"`);

        // Split into words and filter out stop words
        const words = cleanedPrompt.split(' ')
            .filter(word => word.length > 2 && !stopWords.includes(word))
            .slice(0, 8); // Take top 8 keywords

        // If no meaningful keywords found, return original prompt (cleaned)
        if (words.length === 0) {
            const fallback = cleanedPrompt.slice(0, 100);
            console.log(`[WebSearch] No general keywords found, using fallback: "${fallback}"`);
            return fallback;
        }

        const searchQuery = words.join(' ');
        console.log(`[WebSearch] Extracted general keywords: "${searchQuery}"`);
        return searchQuery;
    }

    /**
     * Search using DuckDuckGo
     * @param {string} query - Search query
     * @returns {Promise<Object>} - Search results
     */
    async searchDuckDuckGo(query) {
        try {
            console.log(`[WebSearch] Searching DuckDuckGo for: "${query}"`);

            const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
            console.log(`[WebSearch] DuckDuckGo URL: ${searchUrl}`);

            const response = await fetch(searchUrl, { // This fetch will now use the global fetch
                method: 'GET',
                headers: {
                    'User-Agent': 'TatvaAI/2.0 (https://tatva.ai)'
                },
                timeout: this.TIMEOUT
            });

            console.log(`[WebSearch] DuckDuckGo response status: ${response.status}`);

            if (!response.ok) {
                throw new Error(`DuckDuckGo API returned status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`[WebSearch] DuckDuckGo raw response:`, JSON.stringify(data, null, 2));

            return this.formatDuckDuckGoResults(data, query);

        } catch (error) {
            console.error('[WebSearch] DuckDuckGo search failed:', error.message);
            return {
                success: false,
                error: error.message,
                results: []
            };
        }
    }

    /**
     * Format search results from DuckDuckGo response
     * @param {Object} data - Raw DuckDuckGo response
     * @param {string} query - Original search query
     * @returns {Object} - Formatted search results
     */
    formatDuckDuckGoResults(data, query) {
        const results = [];

        try {
            // Extract Abstract (main answer)
            if (data.Abstract && data.Abstract.trim()) {
                const abstractResult = {
                    type: 'abstract',
                    title: data.Heading || 'मुख्य जानकारी',
                    content: data.Abstract.slice(0, this.MAX_SNIPPET_LENGTH),
                    source: data.AbstractSource || 'DuckDuckGo',
                    url: data.AbstractURL || '',
                    publishedDate: 'Recent',
                    engine: 'DuckDuckGo'
                };
                results.push(abstractResult);
                console.log(`[WebSearch] DuckDuckGo Abstract:`, abstractResult);
            }

            // Extract Definition
            if (data.Definition && data.Definition.trim()) {
                const definitionResult = {
                    type: 'definition',
                    title: 'परिभाषा',
                    content: data.Definition.slice(0, this.MAX_SNIPPET_LENGTH),
                    source: data.DefinitionSource || 'Dictionary',
                    url: data.DefinitionURL || '',
                    publishedDate: 'Recent',
                    engine: 'DuckDuckGo'
                };
                results.push(definitionResult);
                console.log(`[WebSearch] DuckDuckGo Definition:`, definitionResult);
            }

            // Extract Answer (direct answer)
            if (data.Answer && data.Answer.trim()) {
                const answerResult = {
                    type: 'answer',
                    title: 'सीधा उत्तर',
                    content: data.Answer.slice(0, this.MAX_SNIPPET_LENGTH),
                    source: data.AnswerType || 'Calculation',
                    url: '',
                    publishedDate: 'Current',
                    engine: 'DuckDuckGo'
                };
                results.push(answerResult);
                console.log(`[WebSearch] DuckDuckGo Answer:`, answerResult);
            }

            // Extract Related Topics
            if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
                data.RelatedTopics.slice(0, 3).forEach((topic, index) => {
                    if (topic.Text && topic.Text.trim()) {
                        const relatedResult = {
                            type: 'related',
                            title: `संबंधित विषय ${index + 1}`,
                            content: topic.Text.slice(0, this.MAX_SNIPPET_LENGTH),
                            source: 'DuckDuckGo',
                            url: topic.FirstURL || '',
                            publishedDate: 'Recent',
                            engine: 'DuckDuckGo'
                        };
                        results.push(relatedResult);
                        console.log(`[WebSearch] DuckDuckGo Related ${index + 1}:`, relatedResult);
                    }
                });
            }

            console.log(`[WebSearch] Formatted ${results.length} DuckDuckGo results`);

            return {
                success: results.length > 0,
                query: query,
                timestamp: new Date().toISOString(),
                results: results,
                totalResults: results.length,
                source: 'DuckDuckGo'
            };

        } catch (error) {
            console.error('[WebSearch] Error formatting DuckDuckGo results:', error.message);
            return {
                success: false,
                error: 'Failed to format DuckDuckGo results',
                results: []
            };
        }
    }

    /**
     * Create search context for AI prompt
     * @param {Object} searchResults - Formatted search results
     * @returns {string} - Search context for AI
     */
    createSearchContext(searchResults) {
        if (!searchResults.success || searchResults.results.length === 0) {
            console.log('[WebSearch] No search context created - no results');
            return '';
        }

        console.log(`[WebSearch] Creating search context with ${searchResults.results.length} results`);

        let context = `\n\n🔍 ताज़ा वेब खोज के परिणाम (${new Date().toLocaleString('hi-IN')} पर खोजा गया):\n`;
        context += `खोज प्रश्न: "${searchResults.query}"\n`;
        context += `स्रोत: ${searchResults.source}\n\n`;

        // Special handling for date/time/day queries to ensure the AI prioritizes it
        const lowerQuery = searchResults.query.toLowerCase();
        if (lowerQuery.includes('current date') || lowerQuery.includes('current day') || lowerQuery.includes('current time') || lowerQuery.includes('आज की तारीख') || lowerQuery.includes('आज का दिन')) {
            context += `!!! यह एक तारीख/समय/दिन से संबंधित प्रश्न है। कृपया नीचे दिए गए खोज परिणामों से सबसे सटीक और वर्तमान जानकारी निकालें और उसका उपयोग करें। !!!\n\n`;
        }


        searchResults.results.forEach((result, index) => {
            context += `${index + 1}. ${result.title}\n`;
            context += `   ${result.content}\n`;
            context += `   स्रोत: ${result.source}\n`;
            if (result.publishedDate && result.publishedDate !== 'Recent') {
                context += `   प्रकाशन तिथि: ${result.publishedDate}\n`;
            }
            if (result.url) {
                context += `   लिंक: ${result.url}\n`;
            }
            context += `   खोज इंजन: ${result.engine}\n\n`;
        });

        context += `📌 महत्वपूर्ण निर्देश:\n`;
        context += `- इन ताज़ा खोज परिणामों का उपयोग करके भोजपुरी में उत्तर दें\n`;
        context += `- यदि खोज परिणाम प्रासंगिक हैं तो उनकी जानकारी को प्राथमिकता दें\n`;
        context += `- खोज परिणामों में दी गई तारीखों और तथ्यों का उल्लेख करें\n`;
        context += `- यदि कोई नवीन जानकारी मिली है तो उसे स्पष्ट रूप से बताएं\n\n`;

        console.log(`[WebSearch] Created search context (${context.length} characters):`, context);
        return context;
    }

    /**
     * Perform web search and return formatted context
     * @param {string} prompt - User's message
     * @returns {Promise<string>} - Search context for AI
     */
    async performWebSearch(prompt) {
        try {
            console.log(`[WebSearch] ========== STARTING WEB SEARCH ==========`);
            console.log(`[WebSearch] User prompt: "${prompt}"`);

            // Extract keywords from prompt
            const searchQuery = this.extractSearchKeywords(prompt);

            if (!searchQuery || searchQuery.trim().length < 2) {
                console.log('[WebSearch] No meaningful search query extracted, skipping web search');
                return '';
            }

            console.log(`[WebSearch] Final search query: "${searchQuery}"`);

            // Directly call DuckDuckGo search
            console.log('[WebSearch] Attempting DuckDuckGo search...');
            let searchResults = await this.searchDuckDuckGo(searchQuery);

            console.log(`[WebSearch] Final search results:`, JSON.stringify(searchResults, null, 2));

            // Create context from search results
            const context = this.createSearchContext(searchResults);

            console.log(`[WebSearch] ========== WEB SEARCH COMPLETED ==========`);
            console.log(`[WebSearch] Context created: ${context ? 'YES' : 'NO'}`);
            console.log(`[WebSearch] Context length: ${context.length} characters`);

            return context;

        } catch (error) {
            console.error('[WebSearch] ========== WEB SEARCH ERROR ==========');
            console.error('[WebSearch] Error details:', error);
            console.error('[WebSearch] Stack trace:', error.stack);
            return '';
        }
    }

    /**
     * Check if web search is needed based on prompt content
     * @param {string} prompt - User's message
     * @returns {boolean} - Whether web search might be helpful
     */
    shouldPerformWebSearch(prompt) {
        const searchIndicators = [
            // English indicators
            'latest', 'recent', 'current', 'today', 'news', 'update', 'now', 'price', 'weather',
            'what is', 'who is', 'when is', 'where is', 'how much', 'current price', 'new',
            'breaking', 'live', 'real time', 'happening', 'trending', '2024', '2025',

            // Bhojpuri/Hindi indicators
            'ताज़ा', 'नया', 'आज', 'अभी', 'समाचार', 'खबर', 'कीमत', 'मौसम', 'हाल',
            'का बा', 'कौन बा', 'कब बा', 'कहाँ बा', 'कतना बा', 'कइसन बा', 'नवीन',
            'ब्रेकिंग', 'लाइव', 'चालू', 'हो रहा', 'ट्रेंडिंग', 'तारीख', 'दिनांक', 'दिन', 'वार' // Added specific keywords
        ];

        const lowerPrompt = prompt.toLowerCase();
        const shouldSearch = searchIndicators.some(indicator => lowerPrompt.includes(indicator.toLowerCase()));

        console.log(`[WebSearch] Should perform web search for "${prompt.substring(0, 50)}...": ${shouldSearch}`);

        return shouldSearch;
    }

    /**
     * Enhanced search with multiple strategies (now only uses DuckDuckGo)
     * @param {string} query - Search query
     * @returns {Promise<Object>} - Search results
     */
    async enhancedSearch(query) {
        console.log(`[WebSearch] Starting enhanced search for: "${query}"`);
        // With only DuckDuckGo, enhanced search directly calls it.
        return await this.searchDuckDuckGo(query);
    }
}

module.exports = WebSearchService;
