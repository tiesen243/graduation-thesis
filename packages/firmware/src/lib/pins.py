from machine import Pin

from lib.config import load_config

__config = load_config()
pins = __config.get("pins", {})

led = Pin(pins.get("led"), Pin.OUT)
switch = Pin(pins.get("switch"), Pin.IN, Pin.PULL_UP)

servo00 = Pin(pins.get("servo-0-0"), Pin.OUT)
servo01 = Pin(pins.get("servo-0-1"), Pin.OUT)
servo10 = Pin(pins.get("servo-1-0"), Pin.OUT)
servo11 = Pin(pins.get("servo-1-1"), Pin.OUT)
