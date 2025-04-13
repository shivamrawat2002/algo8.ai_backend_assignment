# User Management API System

A Node.js based REST API system for user management with MongoDB integration.

## Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd algo8.ai_backend_assignment
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Variables**
Create a `.env` file in the root directory with the following variables:
```env
DB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

4. **Start the server**
```bash
npm start
```

The server will start on port 3000 (default) or the port specified in your environment variables.

## API Endpoints

### Authentication Routes

#### Sign Up
- **POST** `/api/v1/signup`
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "123456",
    "mobile": {
        "countryCode": "+91",
        "phone": "1234567890"
    }
}
```

#### Login
- **POST** `/api/v1/login`
```json
{
    "email": "john@example.com",
    "password": "123456"
}
```

#### Logout
- **GET** `/api/v1/logout`

### User Management Routes

#### Get All Users
- **GET** `/api/v1/users`
- Requires authentication

#### Get User Details
- **GET** `/api/v1/user/:id`
- Requires authentication

#### Update User
- **PUT** `/api/v1/user/:id`
```json
{
    "name": "Updated Name",
    "email": "updated@example.com",
    "mobile": {
        "countryCode": "+91",
        "phone": "9876543210"
    }
}
```
- Requires authentication

#### Delete User
- **DELETE** `/api/v1/user/:id`
- Requires authentication

### Password Management

#### Change Password
- **POST** `/api/v1/password/update`
```json
{
    "id": "user_id",
    "oldPassword": "old_password",
    "newPassword": "new_password"
}
```

#### Forgot Password
- **POST** `/api/v1/forgot-password`
```json
{
    "email": "user@example.com"
}
```

## Authentication

Most endpoints require authentication. Include the JWT token in the request:
- As a cookie (automatically handled after login)
- In Authorization header: `Bearer <token>`

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## Response Format

Success Response:
```json
{
    "success": true,
    "data": {}
}
```

Error Response:
```json
{
    "success": false,
    "message": "Error description"
}
```

## Development

To run in development mode with nodemon:
```bash
npm run dev
```

## Dependencies

- Express.js - Web framework
- Mongoose - MongoDB ODM
- JWT - Authentication
- bcryptjs - Password hashing
- cookie-parser - Cookie handling
- dotenv - Environment variables
