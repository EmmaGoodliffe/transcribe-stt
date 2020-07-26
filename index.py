#!/usr/bin/env python3

from sst import stt

speech = "./test.wav"
text = "./output.txt"

stt(speech, text)
print("STT completed")
