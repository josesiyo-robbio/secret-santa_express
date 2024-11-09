
# Gift Exchange API

## Overview
A RESTful API for managing a Secret Santa gift exchange. The API allows users to create exchanges, submit gift ideas, approve gift ideas, and handle the return of gifts. It also sends email notifications to participants upon exchange creation.

This API uses MongoDB to store exchange data and integrates with Nodemailer to send emails.

## Project Structure
```
src/
├── controller/         # Route handlers and business logic
├── middleware/         # Validation middleware
├── model/              # Data models and database logic
├── routes/             # API route definitions
└── service/            # Email service and helper functions
```

## API Endpoints

### 1. Create New Exchange
POST /new-exchange

- Creates a new Secret Santa exchange.
- Requires the following fields in the request body:
  ```json
  {
    "name": "string",
    "numberParticipants": "number",
    "minBudget": "number",
    "maxBudget": "number",
    "participants": [{"name": "string", "email": "string"}]
  }
  ```
- Sends a welcome email to each participant.
- Response:
  ```json
  {
    "createNew": {
      "name": "string",
      "numberParticipants": "number",
      "minBudget": "number",
      "maxBudget": "number",
      "participants": [{"name": "string", "email": "string"}],
      "_id": "string"
    }
  }
  ```

### 2. Submit New Gift Idea
POST /new-idea

- Adds a new gift idea to the exchange.
- Requires authentication.
- Requires the following fields in the request body:
  ```json
  {
    "exchangeId": "string",
    "description": "string",
    "price": "number",
    "url": "string",
    "participantEmail": "string"
  }
  ```
- Response:
  ```json
  {
    "newIdeaGift": {
      "description": "string",
      "price": "number",
      "url": "string",
      "participantEmail": "string",
      "_id": "string"
    }
  }
  ```

### 3. Approve Gift Idea
POST /aprove-idea

- Approves a gift idea for an exchange.
- Requires the following fields in the request body:
  ```json
  {
    "exchangeId": "string",
    "email": "string"
  }
  ```
- Response:
  ```json
  {
    "message": "Gift idea approved successfully.",
    "aproveIdea": {
      "_id": "string"
    }
  }
  ```

### 4. Return Gift
POST /return-gift

- Allows a participant to return a gift they received and take another gift.
- Requires the following fields in the request body:
  ```json
  {
    "exchangeId": "string",
    "email": "string",
    "idGiftReturned": "string",
    "idGiftTaken": "string"
  }
  ```
- Response:
  ```json
  {
    "returnsGift": {
      "_id": "string"
    }
  }
  ```

## Technical Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Email Service**: Nodemailer
- **Authentication**: Custom JWT-based authentication

## Middleware
1. **validateRequiredFields**: Validates the required fields in requests.

## Email Service
- **Nodemailer**: Used to send emails to participants upon new exchange creation.

## Error Handling
All endpoints include standardized error responses:
```json
{
  "message": "Error message",
  "error": {
    "message": "Detailed error description"
  }
}
```

Status codes:
- 200: Successful operation
- 400: Bad request or validation error
- 404: Not found
- 500: Internal server error

## Setup Requirements
1. Node.js (v14 or higher)
2. NPM or Yarn
3. MongoDB setup (local or MongoDB Atlas)
4. Environment variables configuration

## Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start the server
npm start
```

## Environment Variables
```
HOST_MAIL=your_mail_host
MAIL_ACCOUNT=your_email_account
MAIL_PASSWORD=your_email_password
MONGO_URI=your_mongodb_uri
```

## Dependencies
```json
{
  "dependencies": {
    "express": "^4.17.1",
    "nodemailer": "^6.6.3",
    "mongodb": "^3.6.0",
    "dotenv": "^8.2.0"
  }
}
```

## Development
1. Follow the Express.js best practices
2. Use async/await for asynchronous operations
3. Implement proper error handling
4. Validate all incoming requests
5. Use middleware for common operations

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## API Collection
The `api_collection.InsomniaV4.json` file is available for import into Insomnia for testing the API. You can also restore the database using `api_collection.InsomniaV4` for testing purposes.
