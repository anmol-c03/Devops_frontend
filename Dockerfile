# Use an official Node.js image for building the React app
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire React app source code
COPY . .

# Build the React app
RUN npm run build

# Use an Nginx base image to serve the built React app
FROM nginx:latest

# Copy the built files from the build stage to Nginx's web root
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 to serve the app
EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]
