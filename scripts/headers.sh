#!/bin/bash

# Usage: headers.sh <input audio file>

simplify() {
  while read data; do
    echo $data | sed -E "s/.*wave audio/ /gi" | sed -E "s/,/ /gi"
  done
}

get_encoding() {
  while read data; do
    echo $data | sed -E "s/mono.*/ /gi"
  done
}

convert_encoding() {
  while read data; do
    echo $data | sed -E "s/microsoft pcm 16 bit/linear16/gi"
  done
}

get_sample_rate() {
  while read data; do
    echo $data | sed -E "s/.*\s+(\w+)\s+hz/\1/gi"
  done
}

headers=$(file $1 | simplify)
encoding=$(echo $headers | get_encoding | convert_encoding)
sample_rate=$(echo $headers | get_sample_rate)
output="$encoding,$sample_rate"

echo $output
