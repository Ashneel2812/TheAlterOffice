# Custom URL Shortener API

This project is a scalable **Custom URL Shortener API** with advanced analytics, JWT-based authentication via Google OAuth, rate limiting, and a fully containerized deployment using Docker. The solution includes clear API documentation (via Swagger) and a suite of tests to validate endpoint functionality. Frequent Git commits have been made to document the solution's evolution.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
- [API Endpoints Documentation](#api-endpoints-documentation)
  - [Authentication](#authentication)
  - [URL Shortening](#url-shortening)
  - [Analytics](#analytics)
  - [Topic Analytics](#topic-analytics)
- [Rate Limiting](#rate-limiting)
- [Deployment](#deployment)
- [Testing](#testing)
- [Git & Version Control](#git--version-control)

## Overview

The **Custom URL Shortener API** allows users to create concise, shareable URLs that redirect to long, complex URLs. In addition, the system tracks detailed analytics (such as clicks by date, OS, and device) for both individual URLs and overall performance. 

Key Features:
- **JWT-based authentication** via Google OAuth
- **Rate limiting** to prevent abuse
- **Advanced Analytics** to track clicks and usage
- **Full Dockerization** for easy deployment

## Features

- **URL Shortening**:  
  - Create short URLs with optional custom aliases and topic grouping
  
- **Analytics**:  
  - View detailed analytics for individual URLs, topics, and overall performance

- **User Authentication**:  
  - Authenticate users using **Google OAuth**, with **JWT-based authentication** for stateless security

- **Rate Limiting**:  
  - Prevent abuse by limiting the number of URL creation and analytics requests per user

- **API Documentation**:  
  - Comprehensive endpoint documentation using **Swagger/OpenAPI**

- **Testing**:  
  - Automated tests using **Jest** and **Supertest** to validate API functionality

## Technology Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: Google OAuth 2.0, Passport.js, JWT
- **Caching/Rate Limiting**: Redis, express-rate-limit
- **Documentation**: Swagger (swagger-ui-express)
- **Testing**: Jest, Supertest
- **Containerization**: Docker, Docker Compose
- **Deployment**: Cloud hosting (e.g., AWS, Heroku, Vercel)

## Installation

### Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v14+)
- **MongoDB** instance (local or cloud-based)
- **Redis** instance (local or cloud-based)
- **Docker & Docker Compose** (for containerized deployment)

### Setup

#### Clone the Repository:
```bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
```

#### Backend Setup:
Navigate to the backend directory:
```bash
cd backend
npm install
```

#### Environment Variables:
Create a `.env` file in the backend directory with the following content:
```env
MONGO_URI=mongodb+srv://dbUser:dbUserPassword@your-cluster.mongodb.net/YourDatabase?retryWrites=true&w=majority
REDIS_HOST=your-redis-host
REDIS_PORT=your-redis-port
REDIS_PWD=your-redis-password
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend-domain.com/auth/google/callback
PORT=5000
NODE_ENV=production
```

#### Frontend Setup:
```bash
cd ../frontend
npm install
npm run build
```

## API Endpoints Documentation

### Authentication

#### GET /auth/google
- **Description**: Initiates Google OAuth login
- **Parameters**: None
- **Responses**: 
  - 302: Redirect to Google OAuth consent screen

#### GET /auth/google/callback
- **Description**: Google OAuth callback
- **Parameters**: None
- **Responses**:
  - 302: Redirect to frontend after successful authentication

### URL Shortening

#### POST /api/shorten
- **Description**: Creates a new short URL
- **Request Body**:
```json
{
  "longUrl": "https://example.com/very-long-url",
  "customAlias": "myalias",
  "topic": "coding"
}
```
- **Responses**:
  - 200: Success
```json
{
  "shortUrl": "https://alteroffice-backend-two.vercel.app/myalias",
  "createdAt": "2025-02-14T17:32:24.962Z"
}
```
  - 400: Error
```json
{
  "message": "Alias already in use."
}
```

#### GET /api/shorten/{alias}
- **Description**: Redirects to the original URL
- **Parameters**: `alias` - The short URL alias
- **Responses**:
  - 302: Redirect to the long URL
  - 404: URL not found

### Analytics

#### GET /api/analytics/{alias}
- **Description**: Retrieves analytics for a specific short URL or overall analytics
- **Parameters**: `alias` - The short URL alias or 'overall'
- **Responses**:
  - 200: Success
```json
{
  "totalClicks": 10,
  "uniqueUsers": 5,
  "clicksByDate": [
    {
      "date": "2025-02-11",
      "clickCount": 3
    }
  ],
  "osType": [
    {
      "osName": "Windows",
      "uniqueClicks": 4,
      "uniqueUsers": 2
    }
  ],
  "deviceType": [
    {
      "deviceName": "desktop",
      "uniqueClicks": 6,
      "uniqueUsers": 3
    }
  ]
}
```

### Topic Analytics

#### GET /api/analytics/topic/{topic}
- **Description**: Retrieves analytics for all URLs under a specific topic
- **Parameters**: `topic` - The topic name
- **Responses**:
  - 200: Success
```json
{
  "totalClicks": 20,
  "uniqueUsers": 10,
  "clicksByDate": [
    {
      "date": "2025-02-11",
      "clickCount": 5
    }
  ],
  "urls": [
    {
      "shortUrl": "https://alteroffice-backend-two.vercel.app/myalias",
      "totalClicks": 10,
      "uniqueUsers": 4
    }
  ]
}
```

## Rate Limiting

Rate limiting is implemented using the express-rate-limit middleware to restrict the number of short URLs a user can create within a specific time window(10 urls for 15 mins). This is configured in `backend/middleware/rateLimiter.js`.

## Deployment

The Dockerized solution can be deployed to any cloud hosting service that supports Docker, such as AWS, Heroku, or DigitalOcean. For Vercel deployment, the backend can be deployed as a serverless function by wrapping the Express app with serverless-http and providing a vercel.json configuration file.

## Testing

Automated tests are written using Jest and Supertest. The tests cover key endpoints such as URL creation and analytics retrieval.

To run the tests:
```bash
cd backend
npm test
```

Make sure you have set a test MongoDB URI (e.g., MONGO_URI_TEST) in your environment for running tests.

## Git & Version Control

The project uses Git for version control. Frequent commits demonstrate the evolution of the solution. Please refer to the commit history in this repository to see how the project has progressed from initial setup to a fully-featured, scalable URL shortener with analytics.
