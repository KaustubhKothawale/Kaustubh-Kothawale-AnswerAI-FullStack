# API Documentation
## Data Models
1. User
{
  "username": "string",
  "password": "string",
  "tokenUsage": "number",
  "tokenUsageLimit": "number",
  "lastReset": "date",
  "email": "string",
  "isEmailVerified": "boolean"
}
2. Session:
{
  "user": "objectId",
  "sessionId": "string",
  "chat": [
    {
      "message": "string",
      "response": "string",
      "timestamp": "date"
    }
  ]
}


## WebSocket
URL: ws://localhost:3002

Description: Establishes a WebSocket connection for real-time communication.

Authentication:

Send a message with the token for authentication.
Events:

sendMessage - Sends a message to the server.
Request: { "message": "string", "sessionId": "string" (optional) }
Response: { "sender": "bot", "text": "string" }
receiveMessage - Receives a message from the server.
Response: { "sender": "bot", "text": "string" }
messageError - Receives an error message.
Response: { "message": "string" }
sessionId - Receives the session ID.
Response: { "sessionId": "string" }
endOfResponse - Indicates the end of the response stream.

## Endpoints
1. User Registration
Endpoint: /register
Method: POST
Description: Registers a new user and sends a verification email.

Request Body:
{
  "username": "string",
  "password": "string",
  "email": "string"
}
Response:
{
  "message": "User registered successfully"
}

2. Email Verification
Endpoint: /verify-email
Method: GET
Description: Verifies the user's email using a token.

Query Parameters:

token - JWT token received via email.
Response:
{
  "message": "Email verified successfully"
}

3. User Login
Endpoint: /login
Method: POST
Description: Authenticates a user and returns a JWT token.

Request Body:
{
  "username": "string",
  "password": "string"
}
Response:
{
  "token": "jwt_token"
}

4. Get User Info
Endpoint: /user
Method: GET
Description: Retrieves the authenticated user's information.

Headers:

Authorization: Bearer jwt_token
Response:
{
  "username": "string",
  "email": "string",
  "tokenUsage": "number",
  "tokenUsageLimit": "number",
  "lastReset": "date"
}

5. Session History
Endpoint: /history
Method: GET
Description: Retrieves the session history for the authenticated user.

Headers:

Authorization: Bearer jwt_token
Response:
[
  {
    "user": "object",
    "sessionId": "string",
    "chat": [
      {
        "message": "string",
        "response": "string",
        "timestamp": "date"
      }
    ]
  }
]

6. Chat
Endpoint: /chat
Method: POST
Description: Sends a message to the chat system and receives a response.

Headers:

Authorization: Bearer jwt_token
Request Body:
{
  "message": "string",
  "sessionId": "string" (optional)
}
Response:
{
  "reply": "string",
  "tokensUsed": "number",
  "tokenLimit": "number",
  "sessionId": "string"
}
