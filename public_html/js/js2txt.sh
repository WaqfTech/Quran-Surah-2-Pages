#!/bin/bash
# Create the txt directory if it doesn't exist
mkdir -p txt

# Loop through all .js files in the current directory
for file in *.js; do
  # Check if there is any .js file to process
  [ -e "$file" ] || continue
  cp "$file" "txt/${file}.txt"
  echo "Copied $file to txt/${file}.txt"
done
