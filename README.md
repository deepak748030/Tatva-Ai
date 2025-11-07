# Tatva AI API Server

![Tatva AI Server Banner](https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)

Welcome to the Tatva AI API Server! This is a robust backend application designed to power a bilingual AI assistant specializing in English and Bhojpuri languages. It provides functionalities for user authentication, AI model management, user management, and various chat interactions.

## 🚀 Features

*   **User Authentication**: Secure registration and login with JWT.
*   **AI Model Management**: CRUD operations for managing different AI models.
*   **User Management**: Full CRUD operations for user accounts (protected).
*   **Chat Functionality**:
    *   Standard chat with conversation history.
    *   Streaming chat for real-time responses.
    *   Simple chat for basic, stateless interactions.
*   **System Health & Info**: Endpoints to check server status and API documentation.
*   **Error Handling**: Centralized error handling for a consistent API experience.

## 🛠️ Tech Stack

*   **Node.js**: JavaScript runtime environment.
*   **Express.js**: Web application framework for Node.js.
*   **Mongoose**: MongoDB object data modeling (ODM) for Node.js.
*   **MongoDB**: NoSQL database.
*   **bcryptjs**: For password hashing.
*   **jsonwebtoken**: For secure authentication.
*   **dotenv**: For environment variable management.
*   **cors**: For Cross-Origin Resource Sharing.

## ⚙️ Setup & Installation

### Prerequisites

*   Node.js (v18 or higher recommended)
*   MongoDB instance (local or cloud-hosted)

### Steps

1.  **Clone the repository (if applicable):**
    ```bash
    # Assuming you have the project files already
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    Create a file named `.env` in the root directory and add the following environment variables:

    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/tatva_ai_db # Your MongoDB connection string
    JWT_SECRET=your_jwt_secret_key_here # A strong, random secret key for JWT
    ```
    *Replace `your_jwt_secret_key_here` with a strong, unique secret.*

4.  **Start the server:**
    ```bash
    npm start
    # Or for development with nodemon (if installed):
    # npm run dev
    ```

    The server will start on `http://localhost:3000` (or your specified PORT).

## 📖 API Endpoints Documentation

All API endpoints are prefixed with `/api`.

---

### 1. System Endpoints

#### 1.1. Get Server Health
Checks the operational status of the server.

*   **URL**: `/api/health`
*   **Method**: `GET`
*   **Authentication**: None
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "status": "OK",
            "message": "Tatva AI Server is running!",
            "timestamp": "2025-01-01T12:00:00.000Z",
            "version": "1.0.0"
        }
        ```
*   **Error Response**:
    *   **Code**: `500 Internal Server Error`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "An unexpected error occurred."
        }
        ```

#### 1.2. Get API Information
Provides general information about the API and lists all available endpoints.

*   **URL**: `/api/info`
*   **Method**: `GET`
*   **Authentication**: None
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "name": "Tatva AI API Server",
            "description": "Bilingual AI assistant specializing in English and Bhojpuri languages",
            "endpoints": {
                "POST /api/chat": "Main chat endpoint with conversation history support",
                "POST /api/chat/stream": "Streaming chat endpoint with real-time responses",
                "POST /api/simple-chat": "Simple chat endpoint for basic usage",
                "GET /api/health": "Server health check",
                "GET /api/info": "API information",
                "POST /api/auth/register": "Register a new user - Requires { email: \"string\", password: \"string\", phoneNumber: \"string\" }",
                "POST /api/auth/login": "Authenticate user and get JWT token - Requires { email: \"string\", password: \"string\" }",
                "POST /api/ai-models": "Create a new AI model (Protected) - Requires { name: \"string\", modelIdentifier: \"string\" }",
                "GET /api/ai-models": "Get all AI models (Protected)",
                "GET /api/ai-models/:id": "Get a single AI model by ID (Protected)",
                "PUT /api/ai-models/:id": "Update an AI model by ID (Protected) - Requires { name?: \"string\", modelIdentifier?: \"string\" }",
                "DELETE /api/ai-models/:id": "Delete an AI model by ID (Protected)",
                "GET /api/users": "Get all users (Protected)",
                "GET /api/users/:id": "Get a single user by ID (Protected)",
                "PUT /api/users/:id": "Update a user by ID (Protected) - Requires { email?: \"string\", phoneNumber?: \"string\", password?: \"string\" }",
                "DELETE /api/users/:id": "Delete a user by ID (Protected)"
            },
            "languages": ["English", "Bhojpuri"],
            "origin": "Bihar, India"
        }
        ```
*   **Error Response**:
    *   **Code**: `500 Internal Server Error`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "An unexpected error occurred."
        }
        ```

#### 1.3. Root Endpoint
A welcoming message from the server.

*   **URL**: `/`
*   **Method**: `GET`
*   **Authentication**: None
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "message": "नमस्कार! Welcome to Tatva AI API Server",
            "description": "Your bilingual AI assistant from Bihar, India",
            "documentation": "Visit /api/info for API documentation"
        }
        ```
*   **Error Response**:
    *   **Code**: `500 Internal Server Error`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "An unexpected error occurred."
        }
        ```

---

### 2. Authentication Endpoints

#### 2.1. Register a New User
Creates a new user account.

*   **URL**: `/api/auth/register`
*   **Method**: `POST`
*   **Authentication**: None
*   **Request Body**:
    ```json
    {
        "email": "user@example.com",
        "password": "StrongPassword123",
        "phoneNumber": "+919876543210"
    }
    ```
*   **Success Response**:
    *   **Code**: `201 Created`
    *   **Content**:
        ```json
        {
            "success": true,
            "message": "User registered successfully.",
            "data": {
                "_id": "65c7b1a2b3c4d5e6f7a8b9c0",
                "email": "user@example.com",
                "phoneNumber": "+919876543210",
                "createdAt": "2025-01-01T12:00:00.000Z",
                "updatedAt": "2025-01-01T12:00:00.000Z",
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }
        ```
*   **Error Response**:
    *   **Code**: `400 Bad Request` (e.g., missing fields, invalid email)
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Please enter all fields."
        }
        ```
    *   **Code**: `409 Conflict` (e.g., email or phone number already exists)
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "User with this email or phone number already exists."
        }
        ```

#### 2.2. Login User
Authenticates a user and returns a JWT token.

*   **URL**: `/api/auth/login`
*   **Method**: `POST`
*   **Authentication**: None
*   **Request Body**:
    ```json
    {
        "email": "user@example.com",
        "password": "StrongPassword123"
    }
    ```
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "message": "Logged in successfully.",
            "data": {
                "_id": "65c7b1a2b3c4d5e6f7a8b9c0",
                "email": "user@example.com",
                "phoneNumber": "+919876543210",
                "createdAt": "2025-01-01T12:00:00.000Z",
                "updatedAt": "2025-01-01T12:00:00.000Z",
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }
        ```
*   **Error Response**:
    *   **Code**: `400 Bad Request` (e.g., missing fields)
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Please enter all fields."
        }
        ```
    *   **Code**: `401 Unauthorized` (e.g., invalid credentials)
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Invalid credentials."
        }
        ```

---

### 3. AI Model Management Endpoints

**Note**: All AI Model Management endpoints require authentication. Include the JWT token in the `Authorization` header as `Bearer <token>`.

#### 3.1. Create a New AI Model
Adds a new AI model to the system.

*   **URL**: `/api/ai-models`
*   **Method**: `POST`
*   **Authentication**: Required (JWT)
*   **Request Body**:
    ```json
    {
        "name": "Bhojpuri Translator Model",
        "modelIdentifier": "bhojpuri-translator-v1"
    }
    ```
*   **Success Response**:
    *   **Code**: `201 Created`
    *   **Content**:
        ```json
        {
            "success": true,
            "message": "AI Model created successfully.",
            "data": {
                "_id": "65c7b1a2b3c4d5e6f7a8b9c1",
                "name": "Bhojpuri Translator Model",
                "modelIdentifier": "bhojpuri-translator-v1",
                "createdAt": "2025-01-01T12:05:00.000Z",
                "updatedAt": "2025-01-01T12:05:00.000Z"
            }
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized` (e.g., no token, invalid token)
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Not authorized, token failed."
        }
        ```
    *   **Code**: `400 Bad Request` (e.g., missing fields)
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Please provide name and modelIdentifier."
        }
        ```
    *   **Code**: `409 Conflict` (e.g., modelIdentifier already exists)
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "AI Model with this identifier already exists."
        }
        ```

#### 3.2. Get All AI Models
Retrieves a list of all registered AI models.

*   **URL**: `/api/ai-models`
*   **Method**: `GET`
*   **Authentication**: Required (JWT)
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "count": 2,
            "data": [
                {
                    "_id": "65c7b1a2b3c4d5e6f7a8b9c1",
                    "name": "Bhojpuri Translator Model",
                    "modelIdentifier": "bhojpuri-translator-v1",
                    "createdAt": "2025-01-01T12:05:00.000Z",
                    "updatedAt": "2025-01-01T12:05:00.000Z"
                },
                {
                    "_id": "65c7b1a2b3c4d5e6f7a8b9c2",
                    "name": "English Chatbot Model",
                    "modelIdentifier": "english-chatbot-v2",
                    "createdAt": "2025-01-01T12:10:00.000Z",
                    "updatedAt": "2025-01-01T12:10:00.000Z"
                }
            ]
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Not authorized, token failed."
        }
        ```

#### 3.3. Get AI Model by ID
Retrieves a single AI model by its unique ID.

*   **URL**: `/api/ai-models/:id`
*   **Method**: `GET`
*   **Authentication**: Required (JWT)
*   **Path Parameters**:
    *   `id`: The unique ID of the AI model (e.g., `65c7b1a2b3c4d5e6f7a8b9c1`)
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "data": {
                "_id": "65c7b1a2b3c4d5e6f7a8b9c1",
                "name": "Bhojpuri Translator Model",
                "modelIdentifier": "bhojpuri-translator-v1",
                "createdAt": "2025-01-01T12:05:00.000Z",
                "updatedAt": "2025-01-01T12:05:00.000Z"
            }
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Not authorized, token failed."
        }
        ```
    *   **Code**: `404 Not Found` (e.g., model not found)
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "AI Model not found."
        }
        ```
    *   **Code**: `400 Bad Request` (e.g., invalid ID format)
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Invalid AI Model ID."
        }
        ```

#### 3.4. Update AI Model by ID
Updates an existing AI model's details.

*   **URL**: `/api/ai-models/:id`
*   **Method**: `PUT`
*   **Authentication**: Required (JWT)
*   **Path Parameters**:
    *   `id`: The unique ID of the AI model (e.g., `65c7b1a2b3c4d5e6f7a8b9c1`)
*   **Request Body**: (Fields are optional, provide only what needs to be updated)
    ```json
    {
        "name": "Updated Bhojpuri Translator Model",
        "modelIdentifier": "bhojpuri-translator-v1-updated"
    }
    ```
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "message": "AI Model updated successfully.",
            "data": {
                "_id": "65c7b1a2b3c4d5e6f7a8b9c1",
                "name": "Updated Bhojpuri Translator Model",
                "modelIdentifier": "bhojpuri-translator-v1-updated",
                "createdAt": "2025-01-01T12:05:00.000Z",
                "updatedAt": "2025-01-01T12:15:00.000Z"
            }
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Not authorized, token failed."
        }
        ```
    *   **Code**: `404 Not Found`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "AI Model not found."
        }
        ```
    *   **Code**: `409 Conflict` (e.g., modelIdentifier already exists)
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "AI Model with this identifier already exists."
        }
        ```

#### 3.5. Delete AI Model by ID
Removes an AI model from the system.

*   **URL**: `/api/ai-models/:id`
*   **Method**: `DELETE`
*   **Authentication**: Required (JWT)
*   **Path Parameters**:
    *   `id`: The unique ID of the AI model (e.g., `65c7b1a2b3c4d5e6f7a8b9c1`)
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "message": "AI Model deleted successfully."
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Not authorized, token failed."
        }
        ```
    *   **Code**: `404 Not Found`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "AI Model not found."
        }
        ```

---

### 4. User Management Endpoints

**Note**: All User Management endpoints require authentication. Include the JWT token in the `Authorization` header as `Bearer <token>`.

#### 4.1. Get All Users
Retrieves a list of all registered users (excluding their passwords).

*   **URL**: `/api/users`
*   **Method**: `GET`
*   **Authentication**: Required (JWT)
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "count": 2,
            "data": [
                {
                    "_id": "65c7b1a2b3c4d5e6f7a8b9c0",
                    "email": "user@example.com",
                    "phoneNumber": "+919876543210",
                    "createdAt": "2025-01-01T12:00:00.000Z",
                    "updatedAt": "2025-01-01T12:00:00.000Z"
                },
                {
                    "_id": "65c7b1a2b3c4d5e6f7a8b9d0",
                    "email": "admin@example.com",
                    "phoneNumber": "+919988776655",
                    "createdAt": "2025-01-01T12:01:00.000Z",
                    "updatedAt": "2025-01-01T12:01:00.000Z"
                }
            ]
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Not authorized, token failed."
        }
        ```

#### 4.2. Get User by ID
Retrieves a single user by their unique ID (excluding their password).

*   **URL**: `/api/users/:id`
*   **Method**: `GET`
*   **Authentication**: Required (JWT)
*   **Path Parameters**:
    *   `id`: The unique ID of the user (e.g., `65c7b1a2b3c4d5e6f7a8b9c0`)
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "data": {
                "_id": "65c7b1a2b3c4d5e6f7a8b9c0",
                "email": "user@example.com",
                "phoneNumber": "+919876543210",
                "createdAt": "2025-01-01T12:00:00.000Z",
                "updatedAt": "2025-01-01T12:00:00.000Z"
            }
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Not authorized, token failed."
        }
        ```
    *   **Code**: `404 Not Found`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "User not found."
        }
        ```
    *   **Code**: `400 Bad Request` (e.g., invalid ID format)
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Invalid User ID."
        }
        ```

#### 4.3. Update User by ID
Updates an existing user's details.

*   **URL**: `/api/users/:id`
*   **Method**: `PUT`
*   **Authentication**: Required (JWT)
*   **Path Parameters**:
    *   `id`: The unique ID of the user (e.g., `65c7b1a2b3c4d5e6f7a8b9c0`)
*   **Request Body**: (Fields are optional, provide only what needs to be updated)
    ```json
    {
        "email": "updated_user@example.com",
        "phoneNumber": "+919999999999",
        "password": "NewStrongPassword456"
    }
    ```
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "message": "User updated successfully.",
            "data": {
                "_id": "65c7b1a2b3c4d5e6f7a8b9c0",
                "email": "updated_user@example.com",
                "phoneNumber": "+919999999999",
                "createdAt": "2025-01-01T12:00:00.000Z",
                "updatedAt": "2025-01-01T12:20:00.000Z"
            }
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Not authorized, token failed."
        }
        ```
    *   **Code**: `404 Not Found`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "User not found."
        }
        ```
    *   **Code**: `409 Conflict` (e.g., email or phone number already in use)
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Email or phone number already in use."
        }
        ```

#### 4.4. Delete User by ID
Removes a user account from the system.

*   **URL**: `/api/users/:id`
*   **Method**: `DELETE`
*   **Authentication**: Required (JWT)
*   **Path Parameters**:
    *   `id`: The unique ID of the user (e.g., `65c7b1a2b3c4d5e6f7a8b9c0`)
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "message": "User deleted successfully."
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Not authorized, token failed."
        }
        ```
    *   **Code**: `404 Not Found`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "User not found."
        }
        ```

---

### 5. Chat Endpoints

#### 5.1. Main Chat Endpoint
Engages in a conversation with the AI, supporting conversation history.

*   **URL**: `/api/chat`
*   **Method**: `POST`
*   **Authentication**: None (can be protected if needed)
*   **Request Body**:
    ```json
    {
        "message": "Hello, how are you?",
        "conversationId": "optional-existing-conversation-id",
        "modelIdentifier": "optional-model-identifier-like-bhojpuri-translator-v1"
    }
    ```
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "conversationId": "new-or-existing-conversation-id",
            "response": "I am doing well, thank you for asking! How can I assist you today?",
            "timestamp": "2025-01-01T12:30:00.000Z"
        }
        ```
*   **Error Response**:
    *   **Code**: `400 Bad Request`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Message is required."
        }
        ```
    *   **Code**: `500 Internal Server Error`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Failed to process chat request."
        }
        ```

#### 5.2. Streaming Chat Endpoint
Provides real-time, streaming responses from the AI.

*   **URL**: `/api/chat/stream`
*   **Method**: `POST`
*   **Authentication**: None (can be protected if needed)
*   **Request Body**:
    ```json
    {
        "message": "Tell me a story about a brave warrior.",
        "conversationId": "optional-existing-conversation-id",
        "modelIdentifier": "optional-model-identifier-like-english-chatbot-v2"
    }
    ```
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**: (Server-Sent Events - SSE stream)
        ```
        data: {"chunk": "Once upon a time,"}

        data: {"chunk": " in a land far away,"}

        data: {"chunk": " lived a brave warrior..."}

        data: {"end": true, "conversationId": "new-or-existing-conversation-id"}
        ```
*   **Error Response**:
    *   **Code**: `400 Bad Request`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Message is required."
        }
        ```
    *   **Code**: `500 Internal Server Error`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Failed to establish streaming chat."
        }
        ```

#### 5.3. Simple Chat Endpoint
A basic, stateless chat endpoint for quick interactions without conversation history.

*   **URL**: `/api/simple-chat`
*   **Method**: `POST`
*   **Authentication**: None (can be protected if needed)
*   **Request Body**:
    ```json
    {
        "message": "What is the capital of India?",
        "modelIdentifier": "optional-model-identifier-like-english-chatbot-v2"
    }
    ```
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "response": "The capital of India is New Delhi."
        }
        ```
*   **Error Response**:
    *   **Code**: `400 Bad Request`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Message is required."
        }
        ```
    *   **Code**: `500 Internal Server Error`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Failed to process simple chat request."
        }
        ```

#### 5.4. A4F Chat Endpoint
Engages in a conversation using A4F API with advanced AI models, supporting conversation history.

*   **URL**: `/api/a4f-chat`
*   **Method**: `POST`
*   **Authentication**: Required (JWT)
*   **Request Body**:
    ```json
    {
        "prompt": "Hello, how are you?",
        "conversationId": "optional-existing-conversation-id",
        "model": "provider-1/chatgpt-4o-latest"
    }
    ```
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "response": "I am doing well, thank you for asking! How can I assist you today?",
            "conversationId": "conversation-id",
            "title": "Generated conversation title",
            "provider": "A4F",
            "model": "provider-1/chatgpt-4o-latest"
        }
        ```
*   **Error Response**:
    *   **Code**: `400 Bad Request`
    *   **Content**:
        ```json
        {
            "success": false,
            "error": "Prompt is required and must be a string"
        }
        ```

#### 5.5. A4F Streaming Chat Endpoint
Provides real-time, streaming responses using A4F API.

*   **URL**: `/api/a4f-chat/stream`
*   **Method**: `POST`
*   **Authentication**: Required (JWT)
*   **Request Body**:
    ```json
    {
        "prompt": "Tell me a story about a friendly robot.",
        "conversationId": "optional-existing-conversation-id",
        "model": "provider-1/chatgpt-4o-latest"
    }
    ```
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**: (Server-Sent Events - SSE stream)
        ```
        data: {"success": true, "conversationId": "...", "title": "...", "provider": "A4F", "initial": true}

        data: {"success": true, "response": "Once upon a time,", "done": false}

        data: {"success": true, "response": " there was a friendly robot...", "done": false}

        data: {"success": true, "response": "", "done": true, "fullResponse": "...", "conversationId": "..."}
        ```

---

## 🤝 Contributing

Feel free to fork the repository, open issues, and submit pull requests.

## 📄 License

This project is licensed under the MIT License.

---
#