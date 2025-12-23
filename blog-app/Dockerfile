FROM node:18-alpine
WORKDIR /app
COPY package.json /app/
RUN npm install
COPY . /app/
VOLUME ["blog-app-data:/app/data"," blog-app-data:/app/uploads"]
EXPOSE 3000
CMD [ "npm", "start" ]
