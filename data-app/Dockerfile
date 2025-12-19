FROM python:3.11-slim
WORKDIR /app/
COPY requirements.txt /app/
RUN pip install -r requirements.txt
COPY . /app/
EXPOSE 5000
VOLUME /data
CMD ["python", "app.py"]


