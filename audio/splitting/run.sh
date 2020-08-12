#!/bin/bash

# sox input.wav output/output.wav trim 0 30 : newfile : restart

dist="dist"

trim() {
  rm -rf $dist
  mkdir $dist
  sox "$1" "$dist/$2" trim 0 $3 : newfile : restart
}

trim "input.wav" "output.wav" 300
