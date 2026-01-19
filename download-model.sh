#!/bin/bash
# Script to download the Phi-3.5 Mini Instruct Q4 K_M model

set -e

MODEL_DIR="./models"
MODEL_FILE="phi-3.5-mini-instruct-q4_k_m.gguf"
MODEL_URL="https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q4_K_M.gguf"

echo "========================================="
echo "PocketLLM Portal - Model Download Script"
echo "========================================="
echo ""

# Create models directory if it doesn't exist
mkdir -p "$MODEL_DIR"

# Check if model already exists
if [ -f "$MODEL_DIR/$MODEL_FILE" ]; then
    echo "✓ Model file already exists at $MODEL_DIR/$MODEL_FILE"
    echo ""
    read -p "Do you want to re-download it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping download."
        exit 0
    fi
    rm "$MODEL_DIR/$MODEL_FILE"
fi

echo "Downloading Phi-3.5 Mini Instruct Q4 K_M model..."
echo "Size: ~2.2GB (this may take a while depending on your internet speed)"
echo ""

# Download with progress bar
if command -v wget &> /dev/null; then
    wget -O "$MODEL_DIR/$MODEL_FILE" "$MODEL_URL" --progress=bar:force
elif command -v curl &> /dev/null; then
    curl -L -o "$MODEL_DIR/$MODEL_FILE" "$MODEL_URL" --progress-bar
else
    echo "Error: Neither wget nor curl is installed."
    echo "Please install one of them and try again."
    exit 1
fi

echo ""
echo "✓ Model downloaded successfully to $MODEL_DIR/$MODEL_FILE"
echo ""
echo "You can now run: docker compose up --build"
echo "========================================="
