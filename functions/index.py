#!/usr/bin/env python3

from sst import stt
from sys import argv

print("Starting STT...")

print(argv[1])

# try:
#   speech = argv[1]
# except IndexError:
#   raise Exception("You must pass a speech path")

# text = stt(speech)

# print(text)

print("STT completed")
