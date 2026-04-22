# Production-ready Django Dockerfile for Railway
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project files
COPY backend/ ./backend/

# Collect static files
RUN python backend/manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Start server
CMD ["python", "backend/manage.py", "runserver", "0.0.0.0:8000"]
