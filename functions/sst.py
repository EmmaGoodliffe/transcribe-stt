#!/usr/bin/env python3

import speech_recognition as sr
from os import path


def resolve(file_path):
  return path.join(path.dirname(path.realpath(__file__)), file_path)


def stt(audio_file_path_):
  audio_file_path = resolve(audio_file_path_)
  r = sr.Recognizer()
  with sr.AudioFile(audio_file_path) as source:
    audio = r.record(source)
    try:
      text = r.recognize_google(audio)
      return text
    except sr.UnknownValueError:
      print("Google Speech Recognition could not understand audio")
    except sr.RequestError as e:
      print(
          "Could not request results from Google Speech Recognition service." +
          "Perhaps you are not connected to the internet?" + " {0}".format(e))
