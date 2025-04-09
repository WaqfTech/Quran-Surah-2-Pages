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
tail -n +2 "$csv_file" | while IFS=, read -r page start_time end_time; do
  output_file="${output_dir}/${surah}_${reciter}_Page_${page}.mp3"
  echo "➡️  Page $page: $start_time → $end_time"
  ffmpeg -loglevel error -y -i "$input_file" -ss "$start_time" -to "$end_time" -c copy "$output_file"
  echo "✅ Saved: $output_file"
done

echo "🎉 All pages split and saved to $output_dir/"
