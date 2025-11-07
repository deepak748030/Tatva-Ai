const TatvaModel = require('../models/TatvaModel');
const A4FModel = require('../models/A4FModel');
const ChatConversation = require('../models/ChatConversation');
const { v4: uuidv4 } = require('uuid');
const { Readable, Transform } = require('stream'); // Import Readable and Transform from Node.js stream module

class ChatController {
    constructor() {
        this.tatvaModel = new TatvaModel();
        this.a4fModel = new A4FModel();
    }

    /**
     * Generates a concise title for a chat conversation using the AI model.
     * @param {string} initialPrompt The first message from the user.
     * @param {string} provider The AI provider to use ('tatva' or 'a4f')
     * @param {string} model The model to use (for A4F)
     * @returns {Promise<string>} The AI-generated title.
     */
    async _generateChatTitle(initialPrompt, provider = 'tatva', model = null) {
        try {
            const titlePrompt = `Generate a concise, descriptive title (under 10 words) for a chat conversation based on the following first user message: "${initialPrompt}"`;
            console.log(`[ChatTitle] Requesting title for prompt: "${initialPrompt.substring(0, 50)}..."`);

            let aiTitle;

            if (provider === 'a4f') {
                console.log(`[ChatTitle] Using A4F for title generation with model: ${model || 'provider-1/chatgpt-4o-latest'}`);
                const messages = [{ role: 'user', content: titlePrompt }];
                const a4fResponse = await this.a4fModel.getA4FResponse(messages, model);
                aiTitle = a4fResponse.content || 'New Chat';
            } else {
                console.log(`[ChatTitle] Using Tatva model for title generation`);
                const requestBody = this.tatvaModel.createRequestBody(titlePrompt, false);
                const response = await this.tatvaModel.sendRequest(requestBody);
                const data = await response.json();
                aiTitle = data.response || 'New Chat';
                aiTitle = this.tatvaModel.cleanResponse(aiTitle).trim();
            }

            // Ensure title is not too long and remove any leading/trailing quotes
            aiTitle = aiTitle.replace(/^["']|["']$/g, '').substring(0, 100); // Max 100 chars for title
            console.log(`[ChatTitle] Generated title using ${provider}: "${aiTitle}"`);
            return aiTitle;
        } catch (error) {
            console.error(`[ChatTitle] Error generating chat title with ${provider}:`, error);
            return initialPrompt.substring(0, 50); // Fallback to first 50 chars of prompt
        }
    }

    async chat(req, res) {
        try {
            const { prompt, conversationId } = req.body;
            const userId = req.user.id; // Extracted from JWT by auth middleware

            console.log(`[Chat] Received request: prompt="${prompt.substring(0, 50)}...", conversationId="${conversationId}"`);

            if (!prompt || typeof prompt !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Prompt is required and must be a string'
                });
            }

            let conversation;
            let history = [];
            let isNewConversation = false;

            if (conversationId) {
                console.log(`[Chat] Attempting to find conversation with ID: ${conversationId} for user: ${userId}`);
                conversation = await ChatConversation.findOne({ userId, conversationId });
                if (!conversation) {
                    // If conversationId is provided but not found for this user, return 404
                    console.warn(`[Chat] Conversation ${conversationId} not found for user ${userId}.`);
                    return res.status(404).json({
                        success: false,
                        message: 'Conversation not found or does not belong to the authenticated user.'
                    });
                }
                history = conversation.messages.map(msg => ({ role: msg.role, content: msg.content }));
                console.log(`[Chat] Found existing conversation: ${conversationId} for user ${userId} with ${history.length} messages.`);
            } else {
                // New conversation
                isNewConversation = true;
                conversation = new ChatConversation({ userId, conversationId: uuidv4() }); // Title will be generated
                console.log(`[Chat] No conversationId provided, starting new conversation with generated ID: ${conversation.conversationId}`);
            }

            // Generate title for new conversations
            if (isNewConversation) {
                conversation.title = await this._generateChatTitle(prompt, 'tatva');
                console.log(`[Chat] Generated and set title for new conversation ${conversation.conversationId}: "${conversation.title}"`);
            }

            // Add user's current prompt to history for AI context
            history.push({ role: 'user', content: prompt });
            console.log('[Chat] History being sent to TatvaModel:', history.map(msg => msg.role + ': ' + msg.content.substring(0, 50) + '...'));


            const fullPrompt = this.tatvaModel.buildFullPrompt(prompt, history);
            const requestBody = this.tatvaModel.createRequestBody(fullPrompt, false); // Non-streaming for this endpoint
            const response = await this.tatvaModel.sendRequest(requestBody);
            const data = await response.json();

            let aiResponse = data.response || 'Sorry, I could not generate a response.';
            aiResponse = this.tatvaModel.cleanResponse(aiResponse);

            // Save user message
            conversation.messages.push({ role: 'user', content: prompt });
            console.log(`[Chat] User message added to conversation ${conversation.conversationId}. Total messages before AI response: ${conversation.messages.length}`);
            // Save AI response
            conversation.messages.push({ role: 'assistant', content: aiResponse });
            await conversation.save();
            console.log(`[Chat] AI response added and conversation ${conversation.conversationId} saved. Total messages: ${conversation.messages.length}.`);

            res.json({
                success: true,
                response: aiResponse,
                conversationId: conversation.conversationId,
                title: conversation.title, // Include the title in the response
                created_at: data.created_at,
                metadata: {
                    total_duration: data.total_duration,
                    prompt_eval_count: data.prompt_eval_count,
                    eval_count: data.eval_count
                }
            });

        } catch (error) {
            console.error('Error in chat endpoint:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get response from Tatva AI',
                message: error.message
            });
        }
    }

    async streamChat(req, res) {
        let conversation;
        let fullAiResponse = '';
        // isInsideThinkBlock and buffer are now instance properties of sseTransform

        try {
            const { prompt, conversationId } = req.body;
            const userId = req.user.id; // Extracted from JWT by auth middleware

            console.log(`[StreamChat] Received request: prompt="${prompt.substring(0, 50)}...", conversationId="${conversationId}"`);

            if (!prompt || typeof prompt !== 'string') {
                console.error('[StreamChat] Prompt is required or not a string.');
                return res.status(400).json({
                    success: false,
                    error: 'Prompt is required and must be a string'
                });
            }

            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control'
            });
            console.log('[StreamChat] SSE headers sent.');

            let history = [];
            let isNewConversation = false;

            if (conversationId) {
                console.log(`[StreamChat] Attempting to find conversation with ID: ${conversationId} for user: ${userId}`);
                conversation = await ChatConversation.findOne({ userId, conversationId });
                if (!conversation) {
                    // If conversationId is provided but not found for this user, send error and end stream
                    console.warn(`[StreamChat] Conversation ${conversationId} not found for user ${userId}.`);
                    res.write(`data: ${JSON.stringify({
                        success: false,
                        error: 'Conversation not found or does not belong to the authenticated user.',
                        done: true
                    })}\n\n`);
                    return res.end();
                }
                history = conversation.messages.map(msg => ({ role: msg.role, content: msg.content }));
                console.log(`[StreamChat] Found existing conversation: ${conversationId} for user ${userId} with ${history.length} messages.`);
            } else {
                // New conversation
                isNewConversation = true;
                conversation = new ChatConversation({ userId, conversationId: uuidv4() }); // Title will be generated
                console.log(`[StreamChat] No conversationId provided, starting new conversation with generated ID: ${conversation.conversationId}`);
            }

            // Generate title for new conversations
            if (isNewConversation) {
                conversation.title = await this._generateChatTitle(prompt, 'tatva');
                console.log(`[StreamChat] Generated and set title for new conversation ${conversation.conversationId}: "${conversation.title}"`);
            }

            // Add user's current prompt to history for AI context
            history.push({ role: 'user', content: prompt });
            console.log('[StreamChat] History being sent to TatvaModel:', history.map(msg => msg.role + ': ' + msg.content.substring(0, 50) + '...'));

            const fullPrompt = this.tatvaModel.buildFullPrompt(prompt, history);
            const requestBody = this.tatvaModel.createRequestBody(fullPrompt, true); // Streaming for this endpoint
            console.log('[StreamChat] Sending request to Tatva AI for streaming...');
            const upstreamResponse = await this.tatvaModel.sendRequest(requestBody);
            console.log('[StreamChat] Received upstream response. Status:', upstreamResponse.status);

            // Save user message immediately and the conversation (including new title)
            conversation.messages.push({ role: 'user', content: prompt });
            await conversation.save(); // Save to get the conversationId if new, and persist title
            console.log(`[StreamChat] User message and conversation title saved. Conversation ${conversation.conversationId} updated. Current messages count: ${conversation.messages.length}.`);

            // Send initial SSE message with conversationId and title
            res.write(`data: ${JSON.stringify({
                success: true,
                conversationId: conversation.conversationId,
                title: conversation.title, // Include the title in the initial response
                initial: true // Indicate initial response with conversationId
            })}\n\n`);
            console.log(`[StreamChat] Sent initial SSE with conversationId: ${conversation.conversationId} and title: "${conversation.title}"`);

            // Create a Node.js Readable stream from the Web ReadableStream
            const webStream = Readable.fromWeb(upstreamResponse.body);
            console.log('[StreamChat] Web stream converted to Node.js Readable stream.');

            // Create a custom Transform stream to process the data
            const sseTransform = new Transform({
                readableObjectMode: false, // Output is strings/buffers
                writableObjectMode: false, // Input is buffers
                // Initialize TextDecoder and state once per stream instance
                construct(callback) {
                    this.decoder = new TextDecoder();
                    this.isInsideThinkBlock = false; // Instance property for state
                    this.buffer = ''; // Instance property for buffer
                    console.log('[StreamChat:Transform] TextDecoder and state initialized.');
                    callback();
                },
                transform(chunk, encoding, callback) {
                    // Decode chunk and append to buffer
                    this.buffer += this.decoder.decode(chunk, { stream: true });
                    // console.log('[StreamChat:Transform] Received chunk. Current buffer length:', this.buffer.length);

                    const lines = this.buffer.split('\n');
                    this.buffer = lines.pop(); // Keep the last (potentially incomplete) line in buffer

                    for (const line of lines) {
                        if (line.trim()) {
                            try {
                                const data = JSON.parse(line);
                                // console.log('[StreamChat:Transform] Parsed line data:', data);

                                if (data.response) {
                                    let responseText = data.response;
                                    // console.log('[StreamChat:Transform] Raw responseText chunk:', responseText.substring(0, 50) + '...');

                                    // Update think block state
                                    if (responseText.includes('<think>')) {
                                        this.isInsideThinkBlock = true;
                                        // console.log('[StreamChat:Transform] Entered <think> block.');
                                    }

                                    // If currently inside a think block, skip this content
                                    if (this.isInsideThinkBlock) {
                                        // Check if the think block ends in this chunk
                                        if (responseText.includes('</think>')) {
                                            this.isInsideThinkBlock = false;
                                            // console.log('[StreamChat:Transform] Exited <think> block.');
                                        }
                                        // console.log('[StreamChat:Transform] Skipping content due to <think> block.');
                                        continue; // Skip content inside <think>
                                    }

                                    // If not inside a think block, clean any self-contained think blocks
                                    responseText = responseText.replace(/<think>[\s\S]*?<\/think>/g, '');

                                    if (responseText.trim()) {
                                        fullAiResponse += responseText; // Accumulate full response
                                        this.push(`data: ${JSON.stringify({
                                            success: true,
                                            response: responseText,
                                            done: data.done || false
                                        })}\n\n`);
                                        console.log('[StreamChat:Transform] Pushed SSE data. Response part length:', responseText.length, 'Content (first 50 chars):', responseText.substring(0, 50) + '...');
                                    } else {
                                        // console.log('[StreamChat:Transform] Cleaned responseText was empty, not pushing.');
                                    }
                                }
                            } catch (parseError) {
                                console.warn('[StreamChat:Transform] Failed to parse JSON line:', line, parseError.message);
                                // Continue processing other lines
                            }
                        }
                    }
                    callback();
                },
                flush(callback) {
                    // Process any remaining data in the buffer at the end of the stream
                    if (this.buffer.trim()) {
                        console.log('[StreamChat:Transform] Flushing remaining buffer:', this.buffer.substring(0, 100) + '...');
                        try {
                            const data = JSON.parse(this.buffer);
                            if (data.response) {
                                let responseText = data.response;
                                // At flush, we just clean any remaining self-contained think blocks
                                responseText = responseText.replace(/<think>[\s\S]*?<\/think>/g, '');
                                if (responseText.trim()) {
                                    fullAiResponse += responseText;
                                    this.push(`data: ${JSON.stringify({
                                        success: true,
                                        response: responseText,
                                        done: data.done || false
                                    })}\n\n`);
                                    console.log('[StreamChat:Transform] Pushed final SSE data from flush. Response part length:', responseText.length, 'Content (first 50 chars):', responseText.substring(0, 50) + '...');
                                } else {
                                    // console.log('[StreamChat:Transform] Cleaned responseText in flush was empty, not pushing.');
                                }
                            }
                        } catch (parseError) {
                            console.warn('[StreamChat:Transform] Failed to parse JSON buffer in flush:', this.buffer.substring(0, 100) + '...', parseError.message);
                        }
                    }
                    callback();
                }
            });

            // Pipe the upstream response through the transform stream to the client response
            webStream.pipe(sseTransform).pipe(res);
            console.log('[StreamChat] Streams piped: webStream -> sseTransform -> res.');

            // Handle stream completion and errors
            sseTransform.on('end', async () => {
                console.log(`[StreamChat] SSE Transform stream ended. Full AI response length: ${fullAiResponse.length}. Content (first 100 chars): ${fullAiResponse.substring(0, 100)}...`);
                // Save AI's full response after streaming is complete
                if (conversation) { // Ensure conversation object exists
                    conversation.messages.push({ role: 'assistant', content: fullAiResponse.trim() });
                    await conversation.save();
                    console.log(`[StreamChat] AI's full response saved to conversation ${conversation.conversationId}. Total messages: ${conversation.messages.length}.`);
                }

                // Send final SSE message indicating completion
                res.write(`data: ${JSON.stringify({
                    success: true,
                    response: '',
                    done: true,
                    fullResponse: fullAiResponse.trim(),
                    conversationId: conversation ? conversation.conversationId : null,
                    title: conversation ? conversation.title : null // Include the final title
                })}\n\n`);
                res.end();
                console.log('[StreamChat] Final SSE message sent and response ended.');
            });

            // Error handling for the transform stream
            sseTransform.on('error', (error) => {
                console.error('[StreamChat] Error in SSE Transform stream:', error);
                if (res.headersSent) {
                    res.write(`data: ${JSON.stringify({
                        success: false,
                        error: 'Streaming error during transformation',
                        message: error.message,
                        done: true
                    })}\n\n`);
                    res.end();
                } else {
                    res.status(500).json({
                        success: false,
                        error: 'Streaming error during transformation',
                        message: error.message
                    });
                }
            });

            // Error handling for the upstream web stream
            webStream.on('error', (error) => {
                console.error('[StreamChat] Error in upstream Web Readable stream:', error);
                if (res.headersSent) {
                    res.write(`data: ${JSON.stringify({
                        success: false,
                        error: 'Upstream streaming error',
                        message: error.message,
                        done: true
                    })}\n\n`);
                    res.end();
                } else {
                    res.status(500).json({
                        success: false,
                        error: 'Upstream streaming error',
                        message: error.message
                    });
                }
            });

        } catch (error) {
            console.error('[StreamChat] Error in streaming chat endpoint:', error);
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Failed to get response from Tatva AI',
                    message: error.message
                }));
            } else {
                res.write(`data: ${JSON.stringify({
                    success: false,
                    error: 'Failed to get response from Tatva AI',
                    message: error.message,
                    done: true
                })}\n\n`);
                res.end();
            }
        }
    }

    // New endpoint to get all conversations for a user
    async getConversations(req, res) {
        try {
            const userId = req.user.id;
            const conversations = await ChatConversation.find({ userId })
                .select('conversationId title createdAt updatedAt')
                .sort({ updatedAt: -1 }); // Sort by most recent activity
            console.log(`[GetConversations] Fetched ${conversations.length} conversations for user ${userId}.`);

            res.json({
                success: true,
                conversations
            });
        } catch (error) {
            console.error('Error fetching conversations:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch conversations',
                message: error.message
            });
        }
    }

    // New endpoint to get a specific conversation by ID
    async getConversationById(req, res) {
        try {
            const userId = req.user.id;
            const { conversationId } = req.params;

            const conversation = await ChatConversation.findOne({ userId, conversationId });

            if (!conversation) {
                console.warn(`[GetConversationById] Conversation ${conversationId} not found for user ${userId}.`);
                return res.status(404).json({
                    success: false,
                    message: 'Conversation not found or not accessible by this user'
                });
            }
            console.log(`[GetConversationById] Fetched conversation ${conversationId} for user ${userId}.`);

            res.json({
                success: true,
                conversation
            });
        } catch (error) {
            console.error('Error fetching conversation by ID:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch conversation',
                message: error.message
            });
        }
    }

    // New endpoint to delete a conversation by ID
    async deleteConversation(req, res) {
        try {
            const userId = req.user.id;
            const { conversationId } = req.params;

            const result = await ChatConversation.deleteOne({ userId, conversationId });

            if (result.deletedCount === 0) {
                console.warn(`[DeleteConversation] Conversation ${conversationId} not found or not accessible by user ${userId}.`);
                return res.status(404).json({
                    success: false,
                    message: 'Conversation not found or not accessible by this user'
                });
            }
            console.log(`[DeleteConversation] Conversation ${conversationId} deleted for user ${userId}.`);

            res.json({
                success: true,
                message: 'Conversation deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting conversation:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete conversation',
                message: error.message
            });
        }
    }

    // New endpoint to get conversation statistics for the authenticated user
    async getConversationStats(req, res) {
        try {
            const userId = req.user.id;

            const totalConversations = await ChatConversation.countDocuments({ userId });
            const totalMessagesResult = await ChatConversation.aggregate([
                { $match: { userId: userId } },
                { $unwind: '$messages' },
                { $count: 'totalMessages' }
            ]);
            const totalTokensResult = await ChatConversation.aggregate([
                { $match: { userId: userId } },
                { $group: { _id: null, totalTokens: { $sum: '$totalTokens' } } }
            ]);

            res.json({
                success: true,
                stats: {
                    totalConversations: totalConversations,
                    totalMessages: totalMessagesResult.length > 0 ? totalMessagesResult[0].totalMessages : 0,
                    totalTokens: totalTokensResult.length > 0 ? totalTokensResult[0].totalTokens : 0
                }
            });
        } catch (error) {
            console.error('Error fetching conversation stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch conversation statistics',
                message: error.message
            });
        }
    }

    // Simple chat endpoint (kept for backward compatibility, but won't save history)
    async simpleChat(req, res) {
        try {
            const { message } = req.body;

            if (!message) {
                console.error('[SimpleChat] Message is required.');
                return res.status(400).json({
                    error: 'Message is required'
                });
            }

            const requestBody = this.tatvaModel.createRequestBody(message, false);
            const response = await this.tatvaModel.sendRequest(requestBody);
            const data = await response.json();

            let aiResponse = data.response || 'Sorry, I could not generate a response.';
            aiResponse = this.tatvaModel.cleanResponse(aiResponse);
            console.log('[SimpleChat] Received response from Tatva AI.');

            res.json({
                response: aiResponse
            });

        } catch (error) {
            console.error('Error in simple chat:', error);
            res.status(500).json({
                error: 'Failed to get response from Tatva AI'
            });
        }
    }

    /**
     * A4F Chat endpoint with conversation history support
     */
    async a4fChat(req, res) {
        try {
            const { prompt, conversationId, model, webSearch = false } = req.body;
            const userId = req.user.id;

            console.log(`[A4FChat] ========== A4F CHAT REQUEST ==========`);
            console.log(`[A4FChat] User ID: ${userId}`);
            console.log(`[A4FChat] Prompt: "${prompt.substring(0, 100)}..."`);
            console.log(`[A4FChat] Conversation ID: ${conversationId || 'NEW'}`);
            console.log(`[A4FChat] Model: ${model || 'provider-1/chatgpt-4o-latest'}`);
            console.log(`[A4FChat] Web search enabled: ${webSearch}`);

            // Auto-enable web search for certain queries
            const shouldAutoEnableWebSearch = this.a4fModel.webSearchService.shouldPerformWebSearch(prompt);
            const finalWebSearch = webSearch || shouldAutoEnableWebSearch;

            if (shouldAutoEnableWebSearch && !webSearch) {
                console.log(`[A4FChat] 🔍 Auto-enabling web search based on prompt content`);
            }

            console.log(`[A4FChat] Final web search setting: ${finalWebSearch}`);

            if (!prompt || typeof prompt !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Prompt is required and must be a string'
                });
            }

            let conversation;
            let messages = [];
            let isNewConversation = false;

            if (conversationId) {
                conversation = await ChatConversation.findOne({ userId, conversationId });
                if (!conversation) {
                    return res.status(404).json({
                        success: false,
                        message: 'Conversation not found or does not belong to the authenticated user.'
                    });
                }
                // Convert conversation history to A4F format
                messages = conversation.messages.map(msg => ({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: msg.content
                }));
            } else {
                isNewConversation = true;
                conversation = new ChatConversation({ userId, conversationId: uuidv4() });
            }

            // Add current user message
            messages.push({ role: 'user', content: prompt });

            // Generate title for new conversations
            if (isNewConversation) {
                conversation.title = await this._generateChatTitle(prompt);
            }

            // Get response from A4F API
            console.log(`[A4FChat] ========== SENDING TO A4F API ==========`);
            console.log(`[A4FChat] Messages count: ${messages.length}`);
            console.log(`[A4FChat] Last message preview: "${messages[messages.length - 1]?.content?.substring(0, 100)}..."`);

            const a4fResponse = await this.a4fModel.getA4FResponse(messages, model, true, finalWebSearch);
            const aiResponse = a4fResponse.content;

            console.log(`[A4FChat] A4F response received. Length: ${aiResponse.length} characters`);
            console.log(`[A4FChat] Response preview: "${aiResponse.substring(0, 100)}..."`);

            // Save conversation
            conversation.messages.push({ role: 'user', content: prompt });
            conversation.messages.push({ role: 'assistant', content: aiResponse });
            await conversation.save();

            res.json({
                success: true,
                response: aiResponse,
                conversationId: conversation.conversationId,
                title: conversation.title,
                provider: 'A4F',
                model: model || 'provider-1/chatgpt-4o-latest',
                webSearchEnabled: finalWebSearch
            });

            console.log(`[A4FChat] ========== A4F CHAT COMPLETED ==========`);

        } catch (error) {
            console.error('Error in A4F chat endpoint:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get response from A4F API',
                message: error.message
            });
        }
    }

    /**
     * A4F Streaming Chat endpoint
     */
    /**
      * A4F Streaming Chat endpoint
      */
    async a4fStreamChat(req, res) {
        let conversation;
        let fullAiResponse = '';

        try {
            const { prompt, conversationId, model, webSearch = true } = req.body;
            const userId = req.user.id;

            console.log(`[A4FStreamChat] ========== A4F STREAM CHAT REQUEST ==========`);
            console.log(`[A4FStreamChat] User ID: ${userId}`);
            console.log(`[A4FStreamChat] Prompt: "${prompt.substring(0, 100)}..."`);
            console.log(`[A4FStreamChat] Conversation ID: ${conversationId || 'NEW'}`);
            console.log(`[A4FStreamChat] Model: ${model || 'provider-1/chatgpt-4o-latest'}`);
            console.log(`[A4FStreamChat] Web search enabled: ${webSearch}`);

            // Auto-enable web search for certain queries
            const shouldAutoEnableWebSearch = this.a4fModel.webSearchService.shouldPerformWebSearch(prompt);
            const finalWebSearch = webSearch || shouldAutoEnableWebSearch;

            if (shouldAutoEnableWebSearch && !webSearch) {
                console.log(`[A4FStreamChat] 🔍 Auto-enabling web search based on prompt content`);
            }

            console.log(`[A4FStreamChat] Final web search setting: ${finalWebSearch}`);

            if (!prompt || typeof prompt !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Prompt is required and must be a string'
                });
            }

            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control'
            });

            let messages = [];
            let isNewConversation = false;

            if (conversationId) {
                conversation = await ChatConversation.findOne({ userId, conversationId });
                if (!conversation) {
                    res.write(`data: ${JSON.stringify({
                        success: false,
                        error: 'Conversation not found or does not belong to the authenticated user.',
                        done: true
                    })}\n\n`);
                    return res.end();
                }
                messages = conversation.messages.map(msg => ({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: msg.content
                }));
            } else {
                isNewConversation = true;
                conversation = new ChatConversation({ userId, conversationId: uuidv4() });
            }

            // Add current user message
            messages.push({ role: 'user', content: prompt });

            // Generate title for new conversations
            if (isNewConversation) {
                conversation.title = await this._generateChatTitle(prompt, 'a4f', model);
                console.log(`[A4FStreamChat] Generated and set title for new conversation ${conversation.conversationId}: "${conversation.title}"`);
            }

            // Save user message and conversation
            conversation.messages.push({ role: 'user', content: prompt });
            await conversation.save();

            // Send initial SSE message
            res.write(`data: ${JSON.stringify({
                success: true,
                conversationId: conversation.conversationId,
                title: conversation.title,
                provider: finalWebSearch ? 'A4F + Web Search' : 'A4F',
                model: model || 'provider-1/chatgpt-4o-latest',
                webSearchEnabled: finalWebSearch,
                initial: true
            })}\n\n`);

            // Get streaming response from A4F
            console.log(`[A4FStreamChat] ========== SENDING TO A4F API ==========`);
            console.log(`[A4FStreamChat] Model: ${model || 'provider-1/chatgpt-4o-latest'}`);
            console.log(`[A4FStreamChat] Web search: ${finalWebSearch}`);
            console.log(`[A4FStreamChat] Messages count: ${messages.length}`);
            console.log(`[A4FStreamChat] Last message preview: "${messages[messages.length - 1]?.content?.substring(0, 100)}..."`);

            const upstreamResponse = await this.a4fModel.getStreamingA4FResponse(messages, model, true, finalWebSearch);
            console.log(`[A4FStreamChat] Received response from A4F API. Status:`, upstreamResponse.status);

            if (!upstreamResponse.body) {
                throw new Error("A4F response body is null");
            }

            // Create readable stream from A4F response
            const webStream = Readable.fromWeb(upstreamResponse.body);

            // Create transform stream to process A4F SSE data
            const a4fTransform = new Transform({
                readableObjectMode: false,
                writableObjectMode: false,
                construct(callback) {
                    this.decoder = new TextDecoder();
                    this.buffer = '';
                    callback();
                },
                transform(chunk, encoding, callback) {
                    this.buffer += this.decoder.decode(chunk, { stream: true });

                    let boundary;
                    while ((boundary = this.buffer.indexOf("\n\n")) !== -1) {
                        const chunkLine = this.buffer.substring(0, boundary);
                        this.buffer = this.buffer.substring(boundary + 2);

                        if (chunkLine.startsWith("data: ")) {
                            const jsonDataStr = chunkLine.substring(6);
                            if (jsonDataStr.trim() === "[DONE]") {
                                continue;
                            }
                            try {
                                const jsonData = JSON.parse(jsonDataStr);
                                const content = jsonData.choices?.[0]?.delta?.content;
                                if (content) {
                                    fullAiResponse += content;
                                    this.push(`data: ${JSON.stringify({
                                        success: true,
                                        response: content,
                                        done: false
                                    })}\n\n`);
                                }
                            } catch (parseError) {
                                console.warn('[A4FStreamChat] Failed to parse JSON chunk:', jsonDataStr, parseError.message);
                            }
                        }
                    }
                    callback();
                },
                flush(callback) {
                    if (this.buffer.trim()) {
                        try {
                            if (this.buffer.startsWith("data: ")) {
                                const jsonDataStr = this.buffer.substring(6);
                                if (jsonDataStr.trim() !== "[DONE]") {
                                    const jsonData = JSON.parse(jsonDataStr);
                                    const content = jsonData.choices?.[0]?.delta?.content;
                                    if (content) {
                                        fullAiResponse += content;
                                        this.push(`data: ${JSON.stringify({
                                            success: true,
                                            response: content,
                                            done: false
                                        })}\n\n`);
                                    }
                                }
                            }
                        } catch (parseError) {
                            console.warn('[A4FStreamChat] Failed to parse JSON buffer in flush:', this.buffer, parseError.message);
                        }
                    }
                    callback();
                }
            });

            // Pipe streams
            webStream.pipe(a4fTransform).pipe(res);

            // Handle stream completion
            a4fTransform.on('end', async () => {
                console.log(`[A4FStreamChat] Stream ended. Full response length: ${fullAiResponse.length}`);

                // Save AI response
                if (conversation) {
                    conversation.messages.push({ role: 'assistant', content: fullAiResponse.trim() });
                    await conversation.save();
                }

                // Send final message
                res.write(`data: ${JSON.stringify({
                    success: true,
                    response: '',
                    done: true,
                    fullResponse: fullAiResponse.trim(),
                    conversationId: conversation ? conversation.conversationId : null,
                    title: conversation ? conversation.title : null
                })}\n\n`);
                res.end();
            });

            // Error handling
            a4fTransform.on('error', (error) => {
                console.error('[A4FStreamChat] Transform stream error:', error);
                if (res.headersSent) {
                    res.write(`data: ${JSON.stringify({
                        success: false,
                        error: 'A4F streaming error',
                        message: error.message,
                        done: true
                    })}\n\n`);
                    res.end();
                }
            });

            webStream.on('error', (error) => {
                console.error('[A4FStreamChat] Web stream error:', error);
                if (res.headersSent) {
                    res.write(`data: ${JSON.stringify({
                        success: false,
                        error: 'A4F upstream error',
                        message: error.message,
                        done: true
                    })}\n\n`);
                    res.end();
                }
            });

        } catch (error) {
            console.error('[A4FStreamChat] Error:', error);
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Failed to get response from A4F API',
                    message: error.message
                }));
            } else {
                res.write(`data: ${JSON.stringify({
                    success: false,
                    error: 'Failed to get response from A4F API',
                    message: error.message,
                    done: true
                })}\n\n`);
                res.end();
            }
        }
    }
}

module.exports = ChatController;