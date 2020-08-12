#!/bin/bash

# sox input.wav output/output.wav trim 0 30 : newfile : restart

dist="audio_dist"

trim() {
  rm -rf $dist
  mkdir $dist
  sox "$1" "$dist/$2" trim 0 $3 : newfile : restart
}

trim "$1" "output.wav" 10
