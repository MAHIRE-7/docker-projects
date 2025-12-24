FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt /app/
RUN pip install -r requirements.txt
COPY . /app/
ENV MARIADB_HOST=mariadb \
    MARIADB_USER=root \
    MARIADB_PASSWORD=root \
    MARIADB_DB=inventory_db
EXPOSE 5001
CMD [ "python", "app.py" ]