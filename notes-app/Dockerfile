FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV MYSQL_HOST=mysql
ENV MYSQL_USER=root
ENV MYSQL_PASSWORD=root
ENV MYSQL_DB=notes_db

EXPOSE 3000

CMD ["npm", "start"]
