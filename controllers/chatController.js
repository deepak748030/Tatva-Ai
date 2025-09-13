const TatvaModel = require('../models/TatvaModel');
const ChatConversation = require('../models/ChatConversation');
const { v4: uuidv4 } = require('uuid');
const { Readable, Transform } = require('stream'); // Import Readable and Transform from Node.js stream module

class ChatController {
    constructor() {
        this.tatvaModel = new TatvaModel();
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

            if (conversationId) {
                console.log(`[Chat] Attempting to find conversation with ID: ${conversationId} for user: ${userId}`);
                conversation = await ChatConversation.findOne({ userId, conversationId });
                if (conversation) {
                    history = conversation.messages.map(msg => ({ role: msg.role, content: msg.content }));
                    console.log(`[Chat] Found existing conversation: ${conversationId} for user ${userId} with ${history.length} messages.`);
                } else {
                    // If conversationId is provided but not found for this user, treat as new
                    conversation = new ChatConversation({ userId, conversationId: uuidv4(), title: prompt.substring(0, 50) });
                    console.log(`[Chat] ConversationId ${conversationId} not found for user ${userId}, starting new chat with ID: ${conversation.conversationId}.`);
                }
            } else {
                // New conversation
                conversation = new ChatConversation({ userId, conversationId: uuidv4(), title: prompt.substring(0, 50) });
                console.log(`[Chat] No conversationId provided, starting new conversation with generated ID: ${conversation.conversationId}`);
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

            if (conversationId) {
                console.log(`[StreamChat] Attempting to find conversation with ID: ${conversationId} for user: ${userId}`);
                conversation = await ChatConversation.findOne({ userId, conversationId });
                if (conversation) {
                    history = conversation.messages.map(msg => ({ role: msg.role, content: msg.content }));
                    console.log(`[StreamChat] Found existing conversation: ${conversationId} for user ${userId} with ${history.length} messages.`);
                } else {
                    // If conversationId is provided but not found for this user, treat as new
                    conversation = new ChatConversation({ userId, conversationId: uuidv4(), title: prompt.substring(0, 50) });
                    console.log(`[StreamChat] ConversationId ${conversationId} not found for user ${userId}, starting new chat with ID: ${conversation.conversationId}.`);
                }
            } else {
                // New conversation
                conversation = new ChatConversation({ userId, conversationId: uuidv4(), title: prompt.substring(0, 50) });
                console.log(`[StreamChat] No conversationId provided, starting new conversation with generated ID: ${conversation.conversationId}`);
            }

            // Add user's current prompt to history for AI context
            history.push({ role: 'user', content: prompt });
            console.log('[StreamChat] History being sent to TatvaModel:', history.map(msg => msg.role + ': ' + msg.content.substring(0, 50) + '...'));

            const fullPrompt = this.tatvaModel.buildFullPrompt(prompt, history);
            const requestBody = this.tatvaModel.createRequestBody(fullPrompt, true); // Streaming for this endpoint
            console.log('[StreamChat] Sending request to Tatva AI for streaming...');
            const upstreamResponse = await this.tatvaModel.sendRequest(requestBody);
            console.log('[StreamChat] Received upstream response. Status:', upstreamResponse.status);

            // Save user message immediately
            conversation.messages.push({ role: 'user', content: prompt });
            await conversation.save(); // Save to get the conversationId if new
            console.log(`[StreamChat] User message saved. Conversation ${conversation.conversationId} updated. Current messages count: ${conversation.messages.length}.`);

            // Send initial SSE message with conversationId
            res.write(`data: ${JSON.stringify({
                success: true,
                conversationId: conversation.conversationId,
                initial: true // Indicate initial response with conversationId
            })}\n\n`);
            console.log(`[StreamChat] Sent initial SSE with conversationId: ${conversation.conversationId}`);

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
                    conversationId: conversation ? conversation.conversationId : null
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
                        message: error.message
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
                        message: error.message
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
                    message: error.message
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
}

module.exports = ChatController;
