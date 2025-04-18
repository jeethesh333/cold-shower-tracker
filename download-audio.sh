#!/bin/bash

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "ffmpeg is required but not installed. Please install it first."
    echo "You can install it using: brew install ffmpeg"
    exit 1
fi

# Create audio directory if it doesn't exist
mkdir -p public/audio

# Clean up existing files
rm -f public/audio/*.mp3

# Generate a meditation sound using ffmpeg (white noise with low-pass filter)
ffmpeg -f lavfi -i "anoisesrc=color=brown:duration=300" -af "volume=0.5" public/audio/forest-lullaby.mp3

# Generate a zen meditation sound (sine wave with reverb)
ffmpeg -f lavfi -i "sine=frequency=432:duration=300" -af "volume=0.3,aecho=0.8:0.9:1000:0.3" public/audio/zen-meditation.mp3

# Generate a deep meditation sound (low frequency drone)
ffmpeg -f lavfi -i "sine=frequency=128:duration=300" -af "volume=0.4,aecho=0.8:0.9:1000:0.3" public/audio/deep-meditation.mp3

# Generate an achievement bell sound
ffmpeg -f lavfi -i "sine=frequency=880:duration=1" -af "volume=0.5,aecho=0.8:0.9:100:0.3" public/audio/achievement-bell.mp3

echo "Meditation audio files generated successfully!" 