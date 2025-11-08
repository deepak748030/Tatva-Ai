class WebSearchService {
    constructor() {
        // Only using DuckDuckGo for search
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

        // Specific handling for date, day, and weather queries in English
        if (lowerPrompt.includes('current date') || lowerPrompt.includes('what is the date')) {
            console.log(`[WebSearch] Detected date query, setting search query to "current date today"`);
            return "current date today";
        }
        if (lowerPrompt.includes('current day') || lowerPrompt.includes('what day is it')) {
            console.log(`[WebSearch] Detected day query, setting search query to "current day of the week today"`);
            return "current day of the week today";
        }
        if (lowerPrompt.includes('current weather') || lowerPrompt.includes('what is the weather')) {
            console.log(`[WebSearch] Detected weather query, setting search query to "current weather"`);
            return "current weather";
        }
        if (lowerPrompt.includes('current time') || lowerPrompt.includes('what is the time')) {
            console.log(`[WebSearch] Detected time query, setting search query to "current time now"`);
            return "current time now";
        }

        // Remove common English stop words and extract meaningful keywords
        const stopWords = [
            'the', 'is', 'are', 'was', 'were', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at',
            'to', 'for', 'of', 'with', 'by', 'from', 'about', 'what', 'how', 'when', 'where', 'why',
            'tell', 'me', 'please', 'can', 'you', 'would', 'could', 'should', 'will', 'shall'
        ];

        // Clean and tokenize the prompt (only alphanumeric characters and spaces)
        let cleanedPrompt = prompt
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Keep alphanumeric characters
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

            const response = await fetch(searchUrl, { // Using global fetch
                method: 'GET',
                headers: {
                    'User-Agent': 'TatvaAI/2.0 (https://tatva.ai)'
                },
                timeout: this.TIMEOUT
            });

            console.log(`[WebSearch] DuckDuckGo response status: ${response.status}`);

            if (!response.ok) {
                throw new Error(`DuckDuckGo API returned status: ${response.status} - ${response.statusText}`);
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
                    title: data.Heading || 'Main Information',
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
                    title: 'Definition',
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
                    title: 'Direct Answer',
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
                            title: `Related Topic ${index + 1}`,
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

        let context = `\n\n🔍 Latest Web Search Results (searched on ${new Date().toLocaleString('en-US')}):\n`;
        context += `Search Query: "${searchResults.query}"\n`;
        context += `Source: ${searchResults.source}\n\n`;

        // Special handling for date/time/day queries to ensure the AI prioritizes it
        const lowerQuery = searchResults.query.toLowerCase();
        if (lowerQuery.includes('current date') || lowerQuery.includes('current day') || lowerQuery.includes('current time')) {
            context += `!!! This is a date/time/day related query. Please extract the most accurate and current information from the search results below and use it. !!!\n\n`;
        }


        searchResults.results.forEach((result, index) => {
            context += `${index + 1}. ${result.title}\n`;
            context += `   ${result.content}\n`;
            context += `   Source: ${result.source}\n`;
            if (result.publishedDate && result.publishedDate !== 'Recent') {
                context += `   Published Date: ${result.publishedDate}\n`;
            }
            if (result.url) {
                context += `   Link: ${result.url}\n`;
            }
            context += `   Search Engine: ${result.engine}\n\n`;
        });

        context += `📌 Important Instructions:\n`;
        context += `- Use these latest search results to answer in English.\n`;
        context += `- Prioritize information from relevant search results.\n`;
        context += `- Mention dates and facts provided in the search results.\n`;
        context += `- Clearly state if new information was found.\n\n`;

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

            // NEW: Handle specific date/time/day queries internally
            const now = new Date();
            let internalResult = null;

            if (searchQuery === "current date today") {
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                internalResult = {
                    success: true,
                    query: searchQuery,
                    timestamp: now.toISOString(),
                    results: [{
                        type: 'internal',
                        title: 'Current Date',
                        content: now.toLocaleDateString('en-US', options),
                        source: 'Internal System',
                        url: '',
                        publishedDate: now.toISOString(),
                        engine: 'Internal'
                    }],
                    totalResults: 1,
                    source: 'Internal System'
                };
            } else if (searchQuery === "current day of the week today") {
                const options = { weekday: 'long' };
                internalResult = {
                    success: true,
                    query: searchQuery,
                    timestamp: now.toISOString(),
                    results: [{
                        type: 'internal',
                        title: 'Current Day',
                        content: now.toLocaleDateString('en-US', options),
                        source: 'Internal System',
                        url: '',
                        publishedDate: now.toISOString(),
                        engine: 'Internal'
                    }],
                    totalResults: 1,
                    source: 'Internal System'
                };
            } else if (searchQuery === "current time now") {
                const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
                internalResult = {
                    success: true,
                    query: searchQuery,
                    timestamp: now.toISOString(),
                    results: [{
                        type: 'internal',
                        title: 'Current Time',
                        content: now.toLocaleTimeString('en-US', options),
                        source: 'Internal System',
                        url: '',
                        publishedDate: now.toISOString(),
                        engine: 'Internal'
                    }],
                    totalResults: 1,
                    source: 'Internal System'
                };
            }

            let searchResults;
            if (internalResult) {
                searchResults = internalResult;
                console.log('[WebSearch] Using internally generated date/time/day.');
            } else {
                // Directly call DuckDuckGo search
                console.log('[WebSearch] Attempting DuckDuckGo search...');
                searchResults = await this.searchDuckDuckGo(searchQuery);
            }

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
            'current date', 'current day', 'current time' // Added specific keywords
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

