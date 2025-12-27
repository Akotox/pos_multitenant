#!/bin/bash

# Script to copy walkthrough files from artifacts to changes directory
# Usage: ./copy-walkthroughs.sh

# Configuration
ARTIFACTS_DIR="/Users/mac/.gemini/antigravity/brain"
CHANGES_DIR="./changes"
DATE_TAG=$(date +"%Y-%m-%d")

# Create changes directory if it doesn't exist
mkdir -p "$CHANGES_DIR"

# Counter for naming files
counter=1

# Find all walkthrough.md files in artifacts directory
echo "Searching for walkthrough files in $ARTIFACTS_DIR..."

find "$ARTIFACTS_DIR" -name "walkthrough.md" -type f | while read -r walkthrough_file; do
    # Get the directory name (conversation ID)
    conversation_id=$(basename "$(dirname "$walkthrough_file")")
    
    # Read the first heading from the walkthrough to use as the name
    # Extract text after "# " and before newline, clean it up for filename
    title=$(head -n 20 "$walkthrough_file" | grep -m 1 "^# " | sed 's/^# //' | sed 's/[^a-zA-Z0-9 -]//g' | sed 's/ /-/g' | tr '[:upper:]' '[:lower:]')
    
    # If no title found, use a generic name
    if [ -z "$title" ]; then
        title="change-$counter"
    fi
    
    # Create filename with date tag
    filename="${DATE_TAG}_${title}.md"
    destination="$CHANGES_DIR/$filename"
    
    # Copy the file
    if [ -f "$walkthrough_file" ]; then
        cp "$walkthrough_file" "$destination"
        echo "✓ Copied: $filename"
        counter=$((counter + 1))
    fi
done

echo ""
echo "Done! Walkthrough files copied to $CHANGES_DIR"
echo "Total files copied: $((counter - 1))"
