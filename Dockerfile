FROM node:alpine

WORKDIR /app

# COPY package.json and package-lock.json files
COPY package*.json ./

# COPY
COPY . .

RUN npm install

RUN npx prisma generate

RUN npm install -g nodemon

# Run and expose the server on port 3000
EXPOSE 3000

# A command to start the server
CMD npm run dev