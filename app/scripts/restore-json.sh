#!/bin/bash
set -e

echo "----------------------------------------"
echo "EAS Build Hook: Restore google-services.json"
echo "----------------------------------------"

if [ -z "$GOOGLE_SERVICES_BASE64" ]; then
  echo "❌ Error: GOOGLE_SERVICES_BASE64 environment variable is NOT SET."
  echo "   Please add it via 'eas secret:create' or in the Expo Dashboard."
  exit 1
fi

echo "Decoding secret to google-services.json..."

# Decode and write to file
echo "$GOOGLE_SERVICES_BASE64" | base64 -d > google-services.json

# Verification
if [ -s google-services.json ]; then
    SIZE=$(wc -c < google-services.json)
    echo "✅ Success: google-services.json created ($SIZE bytes)."
else
    echo "❌ Error: google-services.json is empty or missing after decode."
    exit 1
fi

echo "----------------------------------------"
