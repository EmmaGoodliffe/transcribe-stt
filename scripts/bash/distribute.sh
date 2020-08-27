#!/bin/bash

# Usage: distribute.sh <input WAV file> <output directory> <clip length in seconds>

trim() {
  # Get parameters
  input=$1
  dist=$2
  output=$3
  length=$4

  # Empty dist directory
  rm -rf "$dist"
  mkdir "$dist"

  # Distribute audio file
  sox "$input" "$dist/$output" trim 0 $4 : newfile : restart
}

trim "$1" "$2" "output.wav" $3
