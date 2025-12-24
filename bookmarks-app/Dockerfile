FROM node:18-alpine
WORKDIR /app
COPY package.json /app/
RUN npm install
COPY . /app/
ENV MYSQL_HOST=mysql
ENV MYSQL_USER=root
ENV MYSQL_PASSWORD=root
ENV MYSQL_DB=bookmarks_db
EXPOSE 3000
CMD ["npm", "start"]