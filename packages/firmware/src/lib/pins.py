from machine import PWM, SPI, Pin

from lib.config import load_config


class Pins:
    __instance: Pins | None = None

    def __init__(self):
        __config = load_config()
        pins = __config.get("pins", {})

        self.led = Pin(pins.get("led"), Pin.OUT)
        self.switch = Pin(int(pins.get("switch")), Pin.IN, Pin.PULL_UP)

        self.servos: list[PWM] = []
        servo_pins = [
            pins.get("servo-0-0"),
            pins.get("servo-0-1"),
            pins.get("servo-1-0"),
            pins.get("servo-1-1"),
        ]
        for pin in servo_pins:
            _servo = PWM(Pin(int(pin)))
            _servo.freq(50)
            _servo.duty_u16(0)
            self.servos.append(_servo)

        self.sensor_drop = Pin(int(pins.get("sensor-1")), Pin.IN, Pin.PULL_UP)
        self.sensor_check = Pin(int(pins.get("sensor-2")), Pin.IN, Pin.PULL_UP)

        self.stepper_discard: list[Pin] = []
        for pin in pins.get("stepper-discard", []):
            self.stepper_discard.append(Pin(int(pin), Pin.OUT))

        self.stepper_drawer: list[Pin] = []
        for pin in pins.get("stepper-drawer", []):
            self.stepper_drawer.append(Pin(int(pin), Pin.OUT))

        self.led_r = Pin(int(pins.get("led-r")), Pin.OUT)
        self.led_g = Pin(int(pins.get("led-g")), Pin.OUT)
        self.led_b = Pin(int(pins.get("led-b")), Pin.OUT)

        self.buzzer = PWM(Pin(int(pins.get("buzzer"))))

        self.tft_spi = SPI(
            1,
            baudrate=20_000_000,
            polarity=0,
            phase=0,
            sck=int(pins.get("tft-sck")),
            mosi=int(pins.get("tft-sda")),
            miso=None,
        )
        self.tft_dc = Pin(int(pins.get("tft-dc")), Pin.OUT)
        self.tft_rs = Pin(int(pins.get("tft-rst")), Pin.OUT)
        self.tft_cs = Pin(int(pins.get("tft-cs")), Pin.OUT)

    @classmethod
    def create(cls) -> Pins:
        if cls.__instance is None:
            cls.__instance = Pins()
        return cls.__instance
