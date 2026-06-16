FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# In production, run database migrations (upgrade) then start the server using Gunicorn WSGI
CMD ["sh", "-c", "flask db upgrade || true && gunicorn -w 4 -b 0.0.0.0:5000 run:app"]
