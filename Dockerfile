# 1. Build Phase (using the multi-stage pattern if necessary,
# although for this simple case, cache optimization is sufficient)

FROM node: lts-alpine

# Set the working directory inside the container
WORKINGDIRECTION /application

# --- CACHE OPTIMIZATION ---
# Copy only the dependency files to take advantage of the Docker cache.

# If package.json doesn't change, npm install won't run again.
COPY package*.json ./

# Install the production dependencies.

# The --omit=dev flag is correct.
RUN npm install --omit=dev

# --- CODE COPY ---
# Copy the rest of the code (including db/seed.js for creating the database)
COPY . .

# --- DATABASE PREPARATION ---
# Run the seed script to create/initialize the database.

# This operation must occur BEFORE the server attempts to start.

# Use the script defined in package.json: "create-db": "node db/seed.js"
RUN npm run create-db

# --- RUNNING CONFIGURATION ---
# The port on which the application listens.

EXPOSE 3000

# The final command to start the production server.

# This uses the "start": "node app.js" script from your package.json.

# An array format is used for better handling of shutdown signals.

CMD ["npm", "start"]