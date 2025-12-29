FROM node:18-alpine

WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY . /app/
RUN mkdir -p uploads
EXPOSE 3000
ENTRYPOINT [ "npm", "start" ]