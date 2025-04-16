#!/bin/bash

# Prompt for inputs
read -p "Enter input audio filename (e.g. 002.mp3): " input_file
read -p "Enter Surah name: " surah
read -p "Enter Reciter name: " reciter

# Set default output directory
output_dir="${surah}_Pages"
mkdir -p "$output_dir"

# Set the CSV input file based on Surah name
csv_file="${surah}.csv"

if [[ ! -f "$csv_file" ]]; then
  echo "CSV file '$csv_file' not found!"
  exit 1
fi

echo "Splitting '$input_file' using markers from '$csv_file'..."

# Read CSV, skipping header
tail -n +2 "$csv_file" | while IFS=',' read -r surah_name reciter_name qiraat rawi page_num start_time end_time; do
  # Sanitize 'page' variable to remove invalid characters for filenames
  page=$(echo "$page_num" | sed 's/[^a-zA-Z0-9]/_/g')

  # Construct the output filename
  output_file="${output_dir}/${surah}_${reciter}_Page_${page}.mp3"

  # Output information for debugging
  echo "➡️  Page $surah_name: $reciter_name → Page Number: $page_num, Start: $start_time, End: $end_time"

  # Use ffmpeg to split the audio
  ffmpeg -loglevel error -y -i "$input_file" -ss "$start_time" -to "$end_time" -c copy "$output_file"

  # Output success message
  echo "✅ Saved: $output_file"
done

echo "🎉 All pages split and saved to $output_dir/"