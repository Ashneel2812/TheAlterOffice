Custom URL Shortener API
This project is a scalable Custom URL Shortener API with advanced analytics, JWT-based authentication via Google OAuth, rate limiting, and a fully containerized deployment using Docker. The solution includes clear API documentation (via Swagger) and a suite of tests to validate endpoint functionality. Frequent Git commits have been made to document the solution’s evolution.

Table of Contents
Overview
Features
Technology Stack
Installation
API Endpoints Documentation
Rate Limiting
Dockerization
Deployment
Testing
Git & Version Control
Contributing

Overview
The Custom URL Shortener API allows users to create concise, shareable URLs that redirect to long, complex URLs. In addition, the system tracks detailed analytics (such as clicks by date, OS, and device) for both individual URLs and overall performance. User authentication is handled via Google OAuth and JWT tokens, and endpoints are protected against abuse using rate limiting. The entire application is built using Node.js and MongoDB, is fully Dockerized, and is deployed to a cloud hosting service.

Features
URL Shortening:
Create short URLs with optional custom aliases and topic grouping.
Analytics:
View detailed analytics for individual URLs, topics, and overall performance.
User Authentication:
Authenticate users using Google OAuth, with JWT-based authentication for stateless security.
Rate Limiting:
Prevent abuse by limiting the number of URL creation and analytics requests per user.
API Documentation:
Comprehensive endpoint documentation using Swagger/OpenAPI.
Testing:
Automated tests using Jest and Supertest to validate API functionality.
Dockerized Deployment:
Containerize the application for easy deployment and scaling on cloud platforms.
Technology Stack
Backend: Node.js, Express
Database: MongoDB (Mongoose ODM)
Authentication: Google OAuth 2.0, Passport.js, JWT
Caching/Rate Limiting: Redis, express-rate-limit
Documentation: Swagger (swagger-ui-express)
Testing: Jest, Supertest
Containerization: Docker, Docker Compose
Deployment: Cloud hosting (e.g., AWS, Heroku, or Vercel)
Installation
Prerequisites
Node.js (v14+)
MongoDB instance (local or cloud-based)
Redis instance (local or cloud-based)
Docker & Docker Compose (for containerized deployment)
Setup
Clone the Repository:

bash
Copy
Edit
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
Backend Setup:

Navigate to the backend directory:

bash
Copy
Edit
cd backend
Install dependencies:

bash
Copy
Edit
npm install
Environment Variables:

Create a .env file in the backend directory with the following content (update values as necessary):

env
Copy
Edit
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
Frontend Setup:

Navigate to the frontend directory and install dependencies:

bash
Copy
Edit
cd ../frontend
npm install
Build the production version of the frontend:

bash
Copy
Edit
npm run build
API Endpoints Documentation
The API endpoints are documented using Swagger. Once the backend is running, you can view the documentation at:

arduino
Copy
Edit
https://your-backend-domain.com/api-docs
The Swagger YAML file is located in backend/docs/swagger.yaml and includes details on request/response formats for all endpoints such as:

POST /api/shorten: Create a new short URL.
GET /api/analytics/:alias: Retrieve analytics for a specific URL or overall if alias is "overall".
GET /api/analytics/topic/:topic: Retrieve analytics for URLs grouped by topic.
GET /api/analytics/overall: Retrieve overall analytics for all URLs created by the user.
Rate Limiting
Rate limiting is implemented using the express-rate-limit middleware to restrict the number of short URLs a user can create within a specific time window. This is configured in backend/middleware/rateLimiter.js.

Dockerization
The project includes a Dockerfile and a docker-compose.yml file to containerize the application.

Dockerfile (backend/Dockerfile)
dockerfile
Copy
Edit
FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE 5000

CMD ["npm", "start"]
Docker Compose (docker-compose.yml)
yaml
Copy
Edit
version: '3.8'
services:
  app:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=${MONGO_URI}
      - REDIS_HOST=${REDIS_HOST}
      - REDIS_PORT=${REDIS_PORT}
      - REDIS_PWD=${REDIS_PWD}
      - SESSION_SECRET=${SESSION_SECRET}
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - GOOGLE_CALLBACK_URL=${GOOGLE_CALLBACK_URL}
      - PORT=5000
      - NODE_ENV=production
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:4.4
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

volumes:
  mongo-data:
Deployment
The Dockerized solution can be deployed to any cloud hosting service that supports Docker, such as AWS, Heroku, or DigitalOcean. For example, on Heroku you can deploy a Docker container by following their Docker deployment guide.

If using Vercel, the backend can be deployed as a serverless function by wrapping the Express app with serverless-http and providing a vercel.json configuration file.

Testing
Automated tests are written using Jest and Supertest. The tests cover key endpoints such as URL creation and analytics retrieval. To run the tests, navigate to the backend directory and run:

bash
Copy
Edit
npm test
Make sure you have set a test MongoDB URI (e.g., MONGO_URI_TEST) in your environment for running tests.

Git & Version Control
The project uses Git for version control. Frequent commits demonstrate the evolution of the solution. Please refer to the commit history in this repository to see how the project has progressed from initial setup to a fully-featured, scalable URL shortener with analytics.

Contributing
Contributions are welcome! Please fork this repository and create a pull request with your changes. Ensure that all new features include tests and updated documentation.

