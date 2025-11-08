# Tatva AI API Server

![Tatva AI Server Banner](https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)

Welcome to the Tatva AI API Server! This is a robust backend application designed to power a bilingual AI assistant specializing in English and Bhojpuri languages. It provides functionalities for user authentication, AI model management, user management, and various chat interactions.

## 🚀 Features

*   **User Authentication**: Secure registration and login with JWT.
*   **AI Model Management**: CRUD operations for managing different AI models.
*   **User Management**: Full CRUD operations for user accounts (protected).
*   **Chat Functionality**:
    *   Standard chat with conversation history using advanced A4F models.
    *   **Streaming chat for real-time responses using A4F models, now supporting multimodal input (text and images).**
    *   **Daily Free Request Limit**: Users without an active subscription receive 5 free requests per day, which reset daily.
    *   **Subscription Integration**: Placeholder for subscription status to bypass free request limits.
    *   **Web Search Integration**: Automatically performs web searches for current events or factual queries to provide up-to-date information.
*   **System Health & Info**: Endpoints to check server status and API documentation.
*   **Error Handling**: Centralized error handling for a consistent API experience.
*   **English-First AI**: The AI assistant, Tatva, prioritizes English responses and only uses Bhojpuri when explicitly requested by the user.

## 🛠️ Tech Stack

*   **Node.js**: JavaScript runtime environment.
*   **Express.js**: Web application framework for Node.js.
*   **Mongoose**: MongoDB object data modeling (ODM) for Node.js.
*   **MongoDB**: NoSQL database.
*   **bcryptjs**: For password hashing.
*   **jsonwebtoken**: For secure authentication.
*   **dotenv**: For environment variable management.
*   **cors**: For Cross-Origin Resource Sharing.
*   **helmet**: For securing HTTP headers.
*   **express-rate-limit**: For API rate limiting.
*   **uuid**: For generating unique IDs.
*   **multer**: For handling `multipart/form-data` (file uploads).
*   **node-fetch**: For making HTTP requests (used internally by WebContainer's global `fetch`).

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
    MONGO_URI=mongodb://localhost:27017/tatva_ai # Your MongoDB connection string
    JWT_SECRET=your_jwt_secret_key_here # A strong, random secret key for JWT
    A4F_API_KEY=your_a4f_api_key_here # Your API key for A4F models
    ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000 # Comma-separated list of allowed origins for CORS
    ```
    *Replace `your_jwt_secret_key_here` and `your_a4f_api_key_here` with strong, unique secrets.*

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
            "version": "2.0.0",
            "language": "English (default), Bhojpuri"
        }
        ```
*   **Error Response**:
    *   **Code**: `500 Internal Server Error`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "An unexpected error occurred.",
            "stack": "..."
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
            "description": "Bilingual AI assistant - specializing in English and Bhojpuri",
            "version": "2.0.0",
            "a4f": {
                "endpoint": "https://api.a4f.co/v1/chat/completions",
                "model": "provider-1/chatgpt-4o-latest",
                "status": "healthy"
            },
            "endpoints": {
                "POST /api/a4f-chat": "A4F Chat Endpoint - with advanced AI models",
                "POST /api/a4f-chat/stream": "A4F Streaming Chat - real-time A4F responses",
                "GET /api/chat/history": "List all conversations (protected)",
                "GET /api/chat/history/:id": "View a specific conversation (protected)",
                "DELETE /api/chat/history/:id": "Delete a conversation (protected)",
                "GET /api/chat/stats": "Conversation statistics (protected)",
                "GET /api/health": "Server health check",
                "GET /api/info": "API information",
                "POST /api/auth/register": "New user registration",
                "POST /api/auth/login": "User login",
                "POST /api/ai-models": "Create a new AI model (protected)",
                "GET /api/ai-models": "View all AI models (protected)",
                "GET /api/ai-models/:id": "View a specific AI model (protected)",
                "PUT /api/ai-models/:id": "Update an AI model (protected)",
                "DELETE /api/ai-models/:id": "Delete an AI model (protected)",
                "GET /api/users": "View all users (protected)",
                "GET /api/users/:id": "View a specific user (protected)",
                "PUT /api/users/:id": "Update a user (protected)",
                "DELETE /api/users/:id": "Delete a user (protected)",
                "GET /api/users/me/token-balance": "Get authenticated user's usage information (daily free requests, subscription status)",
                "GET /api/users/subscriptions": "Get all available subscription plans",
                "PUT /api/users/:id/subscribe": "Subscribe user to a plan"
            },
            "languages": ["English", "Bhojpuri"],
            "origin": "Bihar, India",
            "features": [
                "Advanced conversation history management",
                "Real-time streaming chat",
                "Bhojpuri language expertise",
                "A4F API integration - advanced AI models",
                "Secure user authentication",
                "Conversation statistics and analysis"
            ]
        }
        ```
*   **Error Response**:
    *   **Code**: `500 Internal Server Error`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "An unexpected error occurred.",
            "stack": "..."
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
            "message": "Hello! Welcome to Tatva AI API Server",
            "description": "Your bilingual AI assistant from Bihar, India",
            "documentation": "Visit /api/info for API documentation",
            "version": "2.0.0",
            "greeting": "Hello! How can Tatva assist you today?"
        }
        ```
*   **Error Response**:
    *   **Code**: `500 Internal Server Error`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "An unexpected error occurred.",
            "stack": "..."
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
        "phoneNumber": "+919876543210",
        "username": "testuser"
    }
    ```
*   **Success Response**:
    *   **Code**: `201 Created`
    *   **Content**:
        ```json
        {
            "success": true,
            "message": "User registered successfully.",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "user": {
                "id": "65c7b1a2b3c4d5e6f7a8b9c0",
                "email": "user@example.com",
                "username": "testuser",
                "phoneNumber": "+919876543210",
                "dailyRequestsRemaining": 5,
                "lastRequestDate": "2025-01-01T12:00:00.000Z",
                "hasActiveSubscription": false,
                "subscriptionPlan": "none"
            }
        }
        ```
*   **Error Response**:
    *   **Code**: `400 Bad Request` (e.g., missing fields)
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Please enter all required fields: email, password, phone number, and username."
        }
        ```
    *   **Code**: `409 Conflict` (e.g., email, phone number, or username already exists)
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "User with this email already exists."
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
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "user": {
                "id": "65c7b1a2b3c4d5e6f7a8b9c0",
                "email": "user@example.com",
                "username": "testuser",
                "phoneNumber": "+919876543210",
                "dailyRequestsRemaining": 4,
                "lastRequestDate": "2025-01-01T12:00:00.000Z",
                "hasActiveSubscription": false,
                "subscriptionPlan": "none"
            }
        }
        ```
*   **Error Response**:
    *   **Code**: `400 Bad Request` (e.g., missing fields)
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Please enter both email and password."
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
            "message": "AI Model created successfully",
            "model": {
                "_id": "65c7b1a2b3c4d5e6f7a8b9c1",
                "name": "Bhojpuri Translator Model",
                "modelIdentifier": "bhojpuri-translator-v1",
                "createdAt": "2025-01-01T12:05:00.000Z",
                "updatedAt": "2025-01-01T12:05:00.000Z",
                "__v": 0
            }
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized` (e.g., no token, invalid token)
    *   **Content**:
        ```json
        {
            "message": "Not authorized, token failed."
        }
        ```
    *   **Code**: `400 Bad Request` (e.g., missing fields)
    *   **Content**:
        ```json
        {
            "message": "Name and modelIdentifier are required."
        }
        ```
    *   **Code**: `409 Conflict` (e.g., modelIdentifier already exists)
    *   **Content**:
        ```json
        {
            "message": "AI Model with this name or modelIdentifier already exists."
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
        [
            {
                "_id": "65c7b1a2b3c4d5e6f7a8b9c1",
                "name": "Bhojpuri Translator Model",
                "modelIdentifier": "bhojpuri-translator-v1",
                "createdAt": "2025-01-01T12:05:00.000Z",
                "updatedAt": "2025-01-01T12:05:00.000Z",
                "__v": 0
            },
            {
                "_id": "65c7b1a2b3c4d5e6f7a8b9c2",
                "name": "English Chatbot Model",
                "modelIdentifier": "english-chatbot-v2",
                "createdAt": "2025-01-01T12:10:00.000Z",
                "updatedAt": "2025-01-01T12:10:00.000Z",
                "__v": 0
            }
        ]
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
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
            "_id": "65c7b1a2b3c4d5e6f7a8b9c1",
            "name": "Bhojpuri Translator Model",
            "modelIdentifier": "bhojpuri-translator-v1",
            "createdAt": "2025-01-01T12:05:00.000Z",
            "updatedAt": "2025-01-01T12:05:00.000Z",
            "__v": 0
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
            "message": "Not authorized, token failed."
        }
        ```
    *   **Code**: `404 Not Found` (e.g., model not found)
    *   **Content**:
        ```json
        {
            "message": "AI Model not found."
        }
        ```
    *   **Code**: `400 Bad Request` (e.g., invalid ID format)
    *   **Content**:
        ```json
        {
            "message": "Cast to ObjectId failed for value \"invalidid\" at path \"_id\" for model \"AIModel\""
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
            "message": "AI Model updated successfully",
            "model": {
                "_id": "65c7b1a2b3c4d5e6f7a8b9c1",
                "name": "Updated Bhojpuri Translator Model",
                "modelIdentifier": "bhojpuri-translator-v1-updated",
                "createdAt": "2025-01-01T12:05:00.000Z",
                "updatedAt": "2025-01-01T12:15:00.000Z",
                "__v": 0
            }
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
            "message": "Not authorized, token failed."
        }
        ```
    *   **Code**: `404 Not Found`
    *   **Content**:
        ```json
        {
            "message": "AI Model not found."
        }
        ```
    *   **Code**: `409 Conflict` (e.g., modelIdentifier already exists)
    *   **Content**:
        ```json
        {
            "message": "AI Model with this name or modelIdentifier already exists."
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
            "message": "AI Model deleted successfully"
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
            "message": "Not authorized, token failed."
        }
        ```
    *   **Code**: `404 Not Found`
    *   **Content**:
        ```json
        {
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
                    "username": "testuser",
                    "phoneNumber": "+919876543210",
                    "dailyRequestsRemaining": 4,
                    "lastRequestDate": "2025-01-01T12:00:00.000Z",
                    "hasActiveSubscription": false,
                    "subscriptionPlan": "none",
                    "createdAt": "2025-01-01T12:00:00.000Z",
                    "updatedAt": "2025-01-01T12:00:00.000Z"
                },
                {
                    "_id": "65c7b1a2b3c4d5e6f7a8b9d0",
                    "email": "admin@example.com",
                    "username": "adminuser",
                    "phoneNumber": "+919988776655",
                    "dailyRequestsRemaining": 105,
                    "lastRequestDate": "2025-01-01T12:00:00.000Z",
                    "hasActiveSubscription": true,
                    "subscriptionPlan": "premium",
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
                "username": "testuser",
                "phoneNumber": "+919876543210",
                "dailyRequestsRemaining": 4,
                "lastRequestDate": "2025-01-01T12:00:00.000Z",
                "hasActiveSubscription": false,
                "subscriptionPlan": "none",
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
            "message": "Cast to ObjectId failed for value \"invalidid\" at path \"_id\" for model \"User\""
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
        "password": "NewStrongPassword456",
        "hasActiveSubscription": true,
        "subscriptionPlan": "premium",
        "subscriptionEndDate": "2025-02-01T12:00:00.000Z",
        "bonusRequests": 100
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
                "username": "testuser",
                "phoneNumber": "+919999999999",
                "dailyRequestsRemaining": 105,
                "lastRequestDate": "2025-01-01T12:00:00.000Z",
                "hasActiveSubscription": true,
                "subscriptionPlan": "premium",
                "subscriptionEndDate": "2025-02-01T12:00:00.000Z",
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

#### 4.5. Get User Usage Information
Retrieves the authenticated user's daily request count, last request date, and subscription status.

*   **URL**: `/api/users/me/token-balance`
*   **Method**: `GET`
*   **Authentication**: Required (JWT)
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "userId": "65c7b1a2b3c4d5e6f7a8b9c0",
            "username": "testuser",
            "baseDailyRequests": 5,
            "bonusRequests": 0,
            "dailyRequestsRemaining": 4,
            "lastRequestDate": "2025-01-01T12:00:00.000Z",
            "hasActiveSubscription": false,
            "subscriptionPlan": "none",
            "subscriptionEndDate": null
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Not authorized, no token"
        }
        ```

#### 4.6. Get All Available Subscription Plans
Retrieves a list of all subscription plans offered by the service.

*   **URL**: `/api/users/subscriptions`
*   **Method**: `GET`
*   **Authentication**: Required (JWT)
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "plans": [
                {
                    "planType": "basic",
                    "name": "Basic Plan",
                    "price": 199,
                    "bonusRequests": 50,
                    "durationMonths": 1,
                    "description": "Get 50 extra requests per day for one month."
                },
                {
                    "planType": "premium",
                    "name": "Premium Plan",
                    "price": 399,
                    "bonusRequests": 100,
                    "durationMonths": 1,
                    "description": "Get 100 extra requests per day for one month."
                },
                {
                    "planType": "unlimited",
                    "name": "Unlimited Plan",
                    "price": 599,
                    "bonusRequests": 0,
                    "durationMonths": null,
                    "description": "Enjoy unlimited requests with no daily limits."
                },
                {
                    "planType": "none",
                    "name": "Free Tier",
                    "price": 0,
                    "bonusRequests": 0,
                    "durationMonths": null,
                    "description": "Default free access with 5 daily requests."
                }
            ]
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
            "message": "Not authorized, token failed."
        }
        ```

#### 4.7. Subscribe User to a Plan
Allows an authenticated user to subscribe to a specified plan. This will update their request limits and subscription status.

*   **URL**: `/api/users/:id/subscribe`
*   **Method**: `PUT`
*   **Authentication**: Required (JWT)
*   **Path Parameters**:
    *   `id`: The unique ID of the user to subscribe (e.g., `65c7b1a2b3c4d5e6f7a8b9c0`)
*   **Request Body**:
    ```json
    {
        "planType": "premium"
    }
    ```
    *   `planType` (string, required): The type of plan to subscribe to (`basic`, `premium`, `unlimited`, or `none` to cancel).
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "message": "Premium Plan activated successfully! Get 100 extra requests per day for one month.",
            "data": {
                "id": "65c7b1a2b3c4d5e6f7a8b9c0",
                "email": "user@example.com",
                "username": "testuser",
                "baseDailyRequests": 5,
                "bonusRequests": 100,
                "dailyRequestsRemaining": 105,
                "hasActiveSubscription": true,
                "subscriptionPlan": "premium",
                "subscriptionEndDate": "2025-02-01T12:00:00.000Z"
            }
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
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
    *   **Code**: `400 Bad Request`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Invalid plan type provided."
        }
        ```

---

### 5. Chat Endpoints

#### 5.1. Get All Conversations
Retrieves a list of all chat conversations for the authenticated user.

*   **URL**: `/api/chat/history`
*   **Method**: `GET`
*   **Authentication**: Required (JWT)
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "conversations": [
                {
                    "conversationId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                    "title": "Discussion about AI models",
                    "createdAt": "2025-01-01T12:30:00.000Z",
                    "updatedAt": "2025-01-01T12:45:00.000Z"
                },
                {
                    "conversationId": "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
                    "title": "Learning Bhojpuri phrases",
                    "createdAt": "2025-01-01T11:00:00.000Z",
                    "updatedAt": "2025-01-01T11:15:00.000Z"
                }
            ]
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
            "message": "Not authorized, token failed."
        }
        ```

#### 5.2. Get Conversation by ID
Retrieves a specific chat conversation by its ID for the authenticated user.

*   **URL**: `/api/chat/history/:conversationId`
*   **Method**: `GET`
*   **Authentication**: Required (JWT)
*   **Path Parameters**:
    *   `conversationId`: The unique ID of the conversation (e.g., `a1b2c3d4-e5f6-7890-1234-567890abcdef`)
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "conversation": {
                "_id": "65c7b1a2b3c4d5e6f7a8b9c0",
                "userId": "65c7b1a2b3c4d5e6f7a8b9c0",
                "conversationId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                "title": "Discussion about AI models",
                "summary": "Short conversation",
                "tags": [],
                "language": "english",
                "isActive": true,
                "totalMessages": 2,
                "totalTokens": 150,
                "messages": [
                    {
                        "role": "user",
                        "content": "What are the latest advancements in AI?",
                        "timestamp": "2025-01-01T12:30:00.000Z"
                    },
                    {
                        "role": "assistant",
                        "content": "Tatva: The latest advancements in AI include large language models like GPT-4, advancements in generative AI for images and video, and improved AI ethics frameworks. Is there a specific area you'd like to know more about?",
                        "metadata": {
                            "tokens": 100,
                            "processingTime": 500,
                            "model": "provider-1/chatgpt-4o-latest"
                        },
                        "timestamp": "2025-01-01T12:30:05.000Z"
                    }
                ],
                "createdAt": "2025-01-01T12:30:00.000Z",
                "updatedAt": "2025-01-01T12:30:05.000Z",
                "lastActivity": "2025-01-01T12:30:05.000Z",
                "__v": 0
            }
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
            "message": "Not authorized, token failed."
        }
        ```
    *   **Code**: `404 Not Found`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Conversation not found or does not belong to the authenticated user."
        }
        ```

#### 5.3. Delete Conversation by ID
Deletes a specific chat conversation for the authenticated user.

*   **URL**: `/api/chat/history/:conversationId`
*   **Method**: `DELETE`
*   **Authentication**: Required (JWT)
*   **Path Parameters**:
    *   `conversationId`: The unique ID of the conversation (e.g., `a1b2c3d4-e5f6-7890-1234-567890abcdef`)
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "message": "Conversation deleted successfully"
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
            "message": "Not authorized, token failed."
        }
        ```
    *   **Code**: `404 Not Found`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Conversation not found or does not belong to the authenticated user."
        }
        ```

#### 5.4. Get Conversation Statistics
Retrieves statistics about the authenticated user's conversations.

*   **URL**: `/api/chat/stats`
*   **Method**: `GET`
*   **Authentication**: Required (JWT)
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "stats": {
                "totalConversations": 5,
                "totalMessages": 25,
                "totalTokens": 1200
            }
        }
        ```
*   **Error Response**:
    *   **Code**: `401 Unauthorized`
    *   **Content**:
        ```json
        {
            "message": "Not authorized, token failed."
        }
        ```

#### 5.5. A4F Chat Endpoint
Engages in a conversation with the AI using A4F models, supporting conversation history and web search.

*   **URL**: `/api/a4f-chat`
*   **Method**: `POST`
*   **Authentication**: Required (JWT)
*   **Request Body**:
    ```json
    {
        "prompt": "What is the capital of France?",
        "conversationId": "optional-existing-conversation-id",
        "model": "optional-model-identifier-like-provider-1/chatgpt-4o-latest",
        "webSearch": true
    }
    ```
    *   `prompt` (string, required): The user's message.
    *   `conversationId` (string, optional): If provided, the message will be added to this existing conversation. Otherwise, a new conversation is created.
    *   `model` (string, optional): The specific A4F model to use. Defaults to `provider-1/chatgpt-4o-latest`.
    *   `webSearch` (boolean, optional): Set to `true` to force a web search. Web search is also auto-enabled for certain types of queries.
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
            "success": true,
            "response": "Tatva: The capital of France is Paris. Is there anything else you'd like to know about France?",
            "conversationId": "new-or-existing-conversation-id",
            "title": "Capital of France",
            "provider": "A4F",
            "model": "provider-1/chatgpt-4o-latest",
            "webSearchEnabled": true,
            "tokensUsed": 75,
            "dailyRequestsRemaining": 3,
            "hasActiveSubscription": false,
            "subscriptionPlan": "none"
        }
        ```
*   **Error Response (Limit Reached)**:
    *   **Code**: `403 Forbidden`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Your daily request limit has been exhausted. Please consider purchasing a subscription plan for continued access."
        }
        ```
*   **Error Response (Other)**:
    *   **Code**: `400 Bad Request`
    *   **Content**:
        ```json
        {
            "success": false,
            "error": "Prompt is required and must be a string"
        }
        ```
    *   **Code**: `404 Not Found`
    *   **Content**:
        ```json
        {
            "success": false,
            "message": "Conversation not found or does not belong to the authenticated user."
        }
        ```
    *   **Code**: `500 Internal Server Error`
    *   **Content**:
        ```json
        {
            "success": false,
            "error": "Failed to get response from A4F API",
            "message": "..."
        }
        ```

#### 5.6. A4F Streaming Chat Endpoint
Provides real-time, streaming responses using A4F models, supporting conversation history and web search. **Now supports multimodal input (text and images).**

*   **URL**: `/api/a4f-chat/stream`
*   **Method**: `POST`
*   **Authentication**: Required (JWT)
*   **Request Body**: `multipart/form-data`
    *   `prompt` (string, optional): The user's text message.
    *   `conversationId` (string, optional): If provided, the message will be added to this existing conversation. Otherwise, a new conversation is created.
    *   `model` (string, optional): The specific A4F model to use. Defaults to `provider-1/chatgpt-4o-latest`.
    *   `webSearch` (boolean, optional): Set to `true` to force a web search. Web search is also auto-enabled for certain types of queries.
    *   `images` (file, optional, multiple): One or more image files (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`). These will be saved to the server's `uploads` directory and their URLs passed to the AI model.

    **Example `FormData` structure for client-side request:**
    ```javascript
    const formData = new FormData();
    formData.append('prompt', 'Can you see this image inside?');
    formData.append('conversationId', 'optional-existing-conversation-id');
    formData.append('model', 'provider-3/llama-3-70b'); // Example model
    formData.append('webSearch', 'false'); // Must be a string for FormData boolean
    formData.append('images', imageFile1, 'image1.png'); // Append image file
    formData.append('images', imageFile2, 'image2.jpeg'); // Append multiple image files
    ```

*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**: (Server-Sent Events - SSE stream)
        ```
        data: {"success": true, "conversationId": "new-or-existing-conversation-id", "title": "Friendly Robot Story", "provider": "A4F", "model": "provider-1/chatgpt-4o-latest", "webSearchEnabled": false, "initial": true, "dailyRequestsRemaining": 3, "hasActiveSubscription": false, "subscriptionPlan": "none"}

        data: {"success": true, "response": "Tatva: Once upon a time,", "done": false}

        data: {"success": true, "response": " in a bustling city,", "done": false}

        data: {"success": true, "response": " lived a friendly robot named Bolt.", "done": false}

        data: {"success": true, "response": "", "done": true, "fullResponse": "Tatva: Once upon a time, in a bustling city, lived a friendly robot named Bolt.", "conversationId": "new-or-existing-conversation-id", "title": "Friendly Robot Story", "tokensUsed": 120, "dailyRequestsRemaining": 3, "hasActiveSubscription": false, "subscriptionPlan": "none"}
        ```
*   **Error Response (Limit Reached)**:
    *   **Code**: `200 OK` (but with error data in stream)
    *   **Content**: (Server-Sent Events - SSE stream)
        ```
        data: {"success": false, "error": "Your daily request limit has been exhausted. Please consider purchasing a subscription plan for continued access.", "done": true}
        ```
*   **Error Response (Other)**:
    *   **Code**: `200 OK` (but with error data in stream)
    *   **Content**: (Server-Sent Events - SSE stream)
        ```
        data: {"success": false, "error": "Prompt or image is required", "done": true}
        ```
    *   **Code**: `500 Internal Server Error` (if headers not sent yet)
    *   **Content**:
        ```json
        {
            "success": false,
            "error": "Failed to get response from A4F API",
            "message": "..."
        }
        ```

---

## 🤝 Contributing

Feel free to fork the repository, open issues, and submit pull requests.

## 📄 License

This project is licensed under the MIT License.
