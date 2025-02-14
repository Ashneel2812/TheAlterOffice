# Use a lightweight Node.js image
FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install --production

# Copy the rest of the application source code
COPY . .

# Expose the port that the app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
