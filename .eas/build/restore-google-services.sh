#!/bin/bash
echo "Decoder: Starting google-services.json restoration..."
if [ -z "$GOOGLE_SERVICES_BASE64" ]; then
  echo "Decoder Error: GOOGLE_SERVICES_BASE64 environment variable is not set!"
  exit 1
fi

# Decode the base64 string to the file
echo $GOOGLE_SERVICES_BASE64 | base64 --decode > ./app/google-services.json

if [ -f "./app/google-services.json" ]; then
  echo "Decoder Success: ./app/google-services.json created."
  # Optional: Print first few chars to verify not empty (without leaking full content)
  head -c 20 ./app/google-services.json
  echo "..."
else
  echo "Decoder Error: Failed to create ./app/google-services.json"
  exit 1
fi
