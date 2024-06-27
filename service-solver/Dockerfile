FROM python:3.9-slim

WORKDIR /app

# Install dependencies from requirements.txt
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy your application code
COPY . .

# Run the Kafka consumer script as the entry point
CMD [ "python", "server.py" ]
