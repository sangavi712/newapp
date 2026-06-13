FROM node:18-alpine

WORKDIR /app

# We don't copy package.json right away in dev to allow volume mounts
# but in a real production build we would. 
# This Dockerfile is geared towards development via docker-compose.
CMD ["npm", "run", "dev"]
