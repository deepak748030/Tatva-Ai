const A4FModel = require('../models/A4FModel');
const ChatConversation = require('../models/ChatConversation');
const { v4: uuidv4 } = require('uuid');
const { Readable, Transform } = require('stream');

class ChatController {
    constructor() {
        this.a4fModel = new A4FModel();
    }

    /**
     * Generates a concise title for a chat conversation using the AI model.
     * @param {string} initialPrompt The first message from the user.
     * @param {string} model The model to use (for A4F)
     * @returns {Promise<string>} The AI-generated title.
     */
    async _generateChatTitle(initialPrompt, model = null) {
        try {
            const titlePrompt = `Generate a concise, descriptive title (under 10 words) for a chat conversation based on the following first user message: "${initialPrompt}"`;
            // console.log(`[ChatTitle] Requesting title for prompt: "${initialPrompt.substring(0, 50)}..."`);

            // console.log(`[ChatTitle] Using A4F for title generation with model: ${model || 'provider-1/chatgpt-4o-latest'}`);
            const messages = [{ role: 'user', content: titlePrompt }];
            const a4fResponse = await this.a4fModel.getA4FResponse(messages, model);
            let aiTitle = a4fResponse.content || 'New Chat';

            // Ensure title is not too long and remove any leading/trailing quotes
            aiTitle = aiTitle.replace(/^["']|["']$/g, '').substring(0, 100); // Max 100 chars for title
            // console.log(`[ChatTitle] Generated title using A4F: "${aiTitle}"`);
            return aiTitle;
        } catch (error) {
            // console.error(`[ChatTitle] Error generating chat title with A4F:`, error);
            return initialPrompt.substring(0, 50); // Fallback to first 50 chars of prompt
        }
    }

    // New endpoint to get all conversations for a user
    async getConversations(req, res) {
        try {
            const userId = req.user.id;
            const conversations = await ChatConversation.find({ userId })
                .select('conversationId title createdAt updatedAt')
                .sort({ updatedAt: -1 }); // Sort by most recent activity
            // console.log(`[GetConversations] Fetched ${conversations.length} conversations for user ${userId}.`);

            res.json({
                success: true,
                conversations
            });
        } catch (error) {
            // console.error('Error fetching conversations:', error);
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
                // console.warn(`[GetConversationById] Conversation ${conversationId} not found for user ${userId}.`);
                return res.status(404).json({
                    success: false,
                    message: 'Conversation not found or not accessible by this user'
                });
            }
            // console.log(`[GetConversationById] Fetched conversation ${conversationId} for user ${userId}.`);

            res.json({
                success: true,
                conversation
            });
        } catch (error) {
            // console.error('Error fetching conversation by ID:', error);
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
                // console.warn(`[DeleteConversation] Conversation ${conversationId} not found or not accessible by user ${userId}.`);
                return res.status(404).json({
                    success: false,
                    message: 'Conversation not found or not accessible by this user'
                });
            }
            // console.log(`[DeleteConversation] Conversation ${conversationId} deleted for user ${userId}.`);

            res.json({
                success: true,
                message: 'Conversation deleted successfully'
            });
        } catch (error) {
            // console.error('Error deleting conversation:', error);
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
            // console.error('Error fetching conversation stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch conversation statistics',
                message: error.message
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

            // console.log(`[A4FChat] ========== A4F CHAT REQUEST ==========`);
            // console.log(`[A4FChat] User ID: ${userId}`);
            // console.log(`[A4FChat] Prompt: "${prompt.substring(0, 100)}..."`);
            // console.log(`[A4FChat] Conversation ID: ${conversationId || 'NEW'}`);
            // console.log(`[A4FChat] Model: ${model || 'provider-1/chatgpt-4o-latest'}`);
            // console.log(`[A4FChat] Web search enabled: ${webSearch}`);

            // Auto-enable web search for certain queries
            const shouldAutoEnableWebSearch = this.a4fModel.webSearchService.shouldPerformWebSearch(prompt);
            const finalWebSearch = webSearch || shouldAutoEnableWebSearch;

            if (shouldAutoEnableWebSearch && !webSearch) {
                // console.log(`[A4FChat] 🔍 Auto-enabling web search based on prompt content`);
            }

            // console.log(`[A4FChat] Final web search setting: ${finalWebSearch}`);

            if (!prompt || typeof prompt !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Prompt is required and must be a string'
                });
            }

            // NEW: Check user's daily requests or subscription status
            if (req.user.subscriptionPlan !== 'unlimited') {
                if (req.user.dailyRequestsRemaining <= 0) {
                    // console.warn(`[A4FChat] User ${userId} has exhausted daily requests.`);
                    return res.status(403).json({
                        success: false,
                        message: 'Your daily request limit has been exhausted. Please consider purchasing a subscription plan for continued access.'
                    });
                }
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
                conversation.title = await this._generateChatTitle(prompt, model);
            }

            // Get response from A4F API
            // console.log(`[A4FChat] ========== SENDING TO A4F API ==========`);
            // console.log(`[A4FChat] Messages count: ${messages.length}`);
            // console.log(`[A4FChat] Last message preview: "${messages[messages.length - 1]?.content?.substring(0, 100)}..."`);

            const a4fResponse = await this.a4fModel.getA4FResponse(messages, model, true, finalWebSearch);
            const aiResponse = a4fResponse.content;
            const tokensUsed = a4fResponse.raw?.usage?.total_tokens || 0;

            // console.log(`[A4FChat] A4F response received. Length: ${aiResponse.length} characters`);
            // console.log(`[A4FChat] Tokens used: ${tokensUsed}`);
            // console.log(`[A4FChat] Response preview: "${aiResponse.substring(0, 100)}..."`);

            // NEW: Decrement daily requests remaining if not on unlimited plan
            if (req.user.subscriptionPlan !== 'unlimited') {
                req.user.dailyRequestsRemaining -= 1;
                await req.user.save();
                // console.log(`[A4FChat] User ${userId} daily requests remaining updated to: ${req.user.dailyRequestsRemaining}`);
            }


            // Save conversation
            conversation.messages.push({ role: 'user', content: prompt });
            conversation.messages.push({
                role: 'assistant',
                content: aiResponse,
                metadata: {
                    tokens: tokensUsed,
                    model: model || 'provider-1/chatgpt-4o-latest'
                }
            });
            await conversation.save();

            res.json({
                success: true,
                response: aiResponse,
                conversationId: conversation.conversationId,
                title: conversation.title,
                provider: 'A4F',
                model: model || 'provider-1/chatgpt-4o-latest',
                webSearchEnabled: finalWebSearch,
                tokensUsed: tokensUsed,
                dailyRequestsRemaining: req.user.dailyRequestsRemaining, // Include updated dailyRequestsRemaining
                hasActiveSubscription: req.user.hasActiveSubscription,
                subscriptionPlan: req.user.subscriptionPlan
            });

            // console.log(`[A4FChat] ========== A4F CHAT COMPLETED ==========`);

        } catch (error) {
            // console.error('Error in A4F chat endpoint:', error);
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
    async a4fStreamChat(req, res) {
        let conversation;
        let fullAiResponse = '';

        try {
            const { prompt, conversationId, model, webSearch = false } = req.body;
            const userId = req.user.id;

            // console.log(`[A4FStreamChat] ========== A4F STREAM CHAT REQUEST ==========`);
            // console.log(`[A4FStreamChat] User ID: ${userId}`);
            // console.log(`[A4FStreamChat] Prompt: "${prompt.substring(0, 100)}..."`);
            // console.log(`[A4FStreamChat] Conversation ID: ${conversationId || 'NEW'}`);
            // console.log(`[A4FStreamChat] Model: ${model || 'provider-1/chatgpt-4o-latest'}`);
            // console.log(`[A4FStreamChat] Web search enabled: ${webSearch}`);

            // Auto-enable web search for certain queries
            const shouldAutoEnableWebSearch = this.a4fModel.webSearchService.shouldPerformWebSearch(prompt);
            const finalWebSearch = webSearch || shouldAutoEnableWebSearch;

            if (shouldAutoEnableWebSearch && !webSearch) {
                // console.log(`[A4FStreamChat] 🔍 Auto-enabling web search based on prompt content`);
            }

            // console.log(`[A4FStreamChat] Final web search setting: ${finalWebSearch}`);

            if (!prompt || typeof prompt !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Prompt is required and must be a string'
                });
            }

            // NEW: Check user's daily requests or subscription status
            if (req.user.subscriptionPlan !== 'unlimited') {
                if (req.user.dailyRequestsRemaining <= 0) {
                    // console.warn(`[A4FStreamChat] User ${userId} has exhausted daily requests.`);
                    res.write(`data: ${JSON.stringify({
                        success: false,
                        error: 'Your daily request limit has been exhausted. Please consider purchasing a subscription plan for continued access.',
                        done: true
                    })}\n\n`);
                    return res.end();
                }
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
                conversation.title = await this._generateChatTitle(prompt, model);
                // console.log(`[A4FStreamChat] Generated and set title for new conversation ${conversation.conversationId}: "${conversation.title}"`);
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
                initial: true,
                dailyRequestsRemaining: req.user.dailyRequestsRemaining, // Include current dailyRequestsRemaining
                hasActiveSubscription: req.user.hasActiveSubscription,
                subscriptionPlan: req.user.subscriptionPlan
            })}\n\n`);

            // Get streaming response from A4F
            // console.log(`[A4FStreamChat] ========== SENDING TO A4F API ==========`);
            // console.log(`[A4FStreamChat] Model: ${model || 'provider-1/chatgpt-4o-latest'}`);
            // console.log(`[A4FStreamChat] Web search: ${finalWebSearch}`);
            // console.log(`[A4FStreamChat] Messages count: ${messages.length}`);
            // console.log(`[A4FStreamChat] Last message preview: "${messages[messages.length - 1]?.content?.substring(0, 100)}..."`);

            const upstreamResponse = await this.a4fModel.getStreamingA4FResponse(messages, model, true, finalWebSearch);
            // console.log(`[A4FStreamChat] Received response from A4F API. Status:`, upstreamResponse.status);

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
                    this.totalTokensUsed = 0;
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

                                if (jsonData.usage && jsonData.usage.total_tokens) {
                                    this.totalTokensUsed = jsonData.usage.total_tokens;
                                    // console.log(`[A4FStreamChat:Transform] Tokens in chunk: ${this.totalTokensUsed}`);
                                }

                                if (content) {
                                    fullAiResponse += content;
                                    this.push(`data: ${JSON.stringify({
                                        success: true,
                                        response: content,
                                        done: false
                                    })}\n\n`);
                                }
                            } catch (parseError) {
                                // console.warn('[A4FStreamChat] Failed to parse JSON chunk:', jsonDataStr, parseError.message);
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

                                    if (jsonData.usage && jsonData.usage.total_tokens) {
                                        this.totalTokensUsed = jsonData.usage.total_tokens;
                                        // console.log(`[A4FStreamChat:Transform] Tokens in final buffer: ${this.totalTokensUsed}`);
                                    }

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
                            // console.warn('[A4FStreamChat] Failed to parse JSON buffer in flush:', this.buffer, parseError.message);
                        }
                    }
                    callback();
                }
            });

            // Pipe streams
            webStream.pipe(a4fTransform).pipe(res);

            // Handle stream completion
            a4fTransform.on('end', async () => {
                // console.log(`[A4FStreamChat] Stream ended. Full response length: ${fullAiResponse.length}`);
                // console.log(`[A4FStreamChat] Total tokens used for this stream: ${a4fTransform.totalTokensUsed}`);

                // NEW: Decrement daily requests remaining if not on unlimited plan
                if (req.user.subscriptionPlan !== 'unlimited') {
                    req.user.dailyRequestsRemaining -= 1;
                    await req.user.save();
                    // console.log(`[A4FStreamChat] User ${userId} daily requests remaining updated to: ${req.user.dailyRequestsRemaining}`);
                }

                // Save AI response
                if (conversation) {
                    conversation.messages.push({
                        role: 'assistant',
                        content: fullAiResponse.trim(),
                        metadata: {
                            tokens: a4fTransform.totalTokensUsed,
                            model: model || 'provider-1/chatgpt-4o-latest'
                        }
                    });
                    await conversation.save();
                }

                // Send final message
                res.write(`data: ${JSON.stringify({
                    success: true,
                    response: '',
                    done: true,
                    fullResponse: fullAiResponse.trim(),
                    conversationId: conversation ? conversation.conversationId : null,
                    title: conversation ? conversation.title : null,
                    tokensUsed: a4fTransform.totalTokensUsed,
                    dailyRequestsRemaining: req.user.dailyRequestsRemaining, // Include updated dailyRequestsRemaining
                    hasActiveSubscription: req.user.hasActiveSubscription,
                    subscriptionPlan: req.user.subscriptionPlan
                })}\n\n`);
                res.end();
            });

            // Error handling
            a4fTransform.on('error', (error) => {
                // console.error('[A4FStreamChat] Transform stream error:', error);
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
                // console.error('[A4FStreamChat] Web stream error:', error);
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
            // console.error('[A4FStreamChat] Error:', error);
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
