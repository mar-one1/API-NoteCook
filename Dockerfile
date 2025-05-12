# syntax=docker/dockerfile:1

# Use an official Node.js runtime as a parent image
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine

# Use production node environment by default
ENV NODE_ENV production

# Set the working directory in the container
WORKDIR /usr/src/app

# Ensure the SQLite database file and directory are writable
# This step should come after the working directory is set and files are copied
# because the directory won't exist until then
COPY . .

RUN chmod -R 777 /usr/src/app/Api

RUN npm install -g nodemon

# Download dependencies as a separate step to take advantage of Docker's caching
# Leverage a cache mount to /root/.npm to speed up subsequent builds
# Leverage bind mounts to package.json and package-lock.json to avoid having to copy them into this layer
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Run the application as a non-root user
USER node

# Expose the port that the application listens on
EXPOSE 3000

# Run the application
CMD ["nodemon", "index.js"]
