import machine


class Servo:
    def __init__(self, pin: machine.Pin):
        self.pin = pin
        self.angle = 0

    def set_angle(self, angle: int):
        if 0 <= angle <= 180:
            self.angle = angle
            print(f"Setting servo on pin {self.pin} to angle {self.angle}")
        else:
            raise ValueError("Angle must be between 0 and 180 degrees")
