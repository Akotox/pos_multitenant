# Use an official Node.js runtime as a parent image
FROM node:22-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages
RUN npm install

# Bundle app source
COPY . .

# Build the TypeScript code
RUN npm run build



# Your app binds to port 3000, so expose it
EXPOSE 3000

# Define the command to run your app
CMD [ "npm", "start" ]