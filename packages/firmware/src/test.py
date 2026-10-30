import asyncio

from machine import PWM, Pin

from modules.st7735 import ST7735

# =========================================================
# BUZZER
# Active LOW:
#   1 = tắt
#   0 = kêu
# =========================================================

buzzer = Pin(20, Pin.OUT)
buzzer.value(1)


async def beep():
    buzzer.value(0)
    await asyncio.sleep_ms(100)
    buzzer.value(1)


# =========================================================
# LCD
# =========================================================

st7735 = ST7735.create()
st7735.init()
st7735.rotation(1)

# Vẽ màn hình ban đầu 1 lần
st7735.fill(ST7735.BLACK)

st7735.text(
    (10, 10),
    "Testing...",
    ST7735.WHITE,
)

# Label cố định
st7735.text(
    (10, 40),
    "Sensor 1:",
    ST7735.WHITE,
)

st7735.text(
    (10, 60),
    "Sensor 2:",
    ST7735.WHITE,
)

# Counter ban đầu
st7735.text(
    (75, 40),
    "0",
    ST7735.WHITE,
)

st7735.text(
    (75, 60),
    "0",
    ST7735.WHITE,
)


# =========================================================
# SENSOR
# =========================================================

sensor1 = Pin(26, Pin.IN, Pin.PULL_UP)
sensor2 = Pin(27, Pin.IN, Pin.PULL_UP)

sensor1_count = 0
sensor2_count = 0

sensor1_detected = False
sensor2_detected = False


def sensor1_irq(pin):
    global sensor1_count
    global sensor1_detected

    # Chỉ đếm 1 lần khi vật vừa đi vào
    if not sensor1_detected:
        sensor1_detected = True
        sensor1_count += 1

        # Buzzer kêu 0.1s
        asyncio.create_task(beep())


def sensor2_irq(pin):
    global sensor2_count
    global sensor2_detected

    # Chỉ đếm 1 lần khi vật vừa đi vào
    if not sensor2_detected:
        sensor2_detected = True
        sensor2_count += 1

        # Buzzer kêu 0.1s
        asyncio.create_task(beep())


sensor1.irq(
    trigger=Pin.IRQ_FALLING,
    handler=sensor1_irq,
)

sensor2.irq(
    trigger=Pin.IRQ_FALLING,
    handler=sensor2_irq,
)


# =========================================================
# SENSOR RELEASE TASK
# =========================================================


async def sensor_state_task():

    global sensor1_detected
    global sensor2_detected

    while True:
        # HIGH = không có vật
        # Bỏ vật ra -> cho phép đếm lần tiếp theo

        if sensor1.value() == 1:
            sensor1_detected = False

        if sensor2.value() == 1:
            sensor2_detected = False

        await asyncio.sleep_ms(50)


# =========================================================
# LCD TASK
# =========================================================


async def lcd_task():

    last_sensor1_count = sensor1_count
    last_sensor2_count = sensor2_count

    while True:
        # -------------------------------------------------
        # SENSOR 1 thay đổi
        # -------------------------------------------------

        if sensor1_count != last_sensor1_count:
            # Chỉ xóa vùng chứa số Sensor 1
            st7735.fill_rect(
                (75, 38),
                (53, 14),
                ST7735.BLACK,
            )

            # Vẽ số mới
            st7735.text(
                (75, 40),
                str(sensor1_count),
                ST7735.WHITE,
            )

            last_sensor1_count = sensor1_count

        # -------------------------------------------------
        # SENSOR 2 thay đổi
        # -------------------------------------------------

        if sensor2_count != last_sensor2_count:
            # Chỉ xóa vùng chứa số Sensor 2
            st7735.fill_rect(
                (75, 58),
                (53, 14),
                ST7735.BLACK,
            )

            # Vẽ số mới
            st7735.text(
                (75, 60),
                str(sensor2_count),
                ST7735.WHITE,
            )

            last_sensor2_count = sensor2_count

        await asyncio.sleep_ms(50)


# =========================================================
# 4 SERVO 360°
# =========================================================

servos = [
    PWM(Pin(0)),
    PWM(Pin(1)),
    PWM(Pin(2)),
    PWM(Pin(3)),
]

for servo in servos:
    servo.freq(50)


def set_servo(servo, pulse_us):

    duty = int((pulse_us / 20000) * 65535)

    servo.duty_u16(duty)


async def servo_task(servo):

    # 1700us = quay
    set_servo(servo, 1700)

    while True:
        await asyncio.sleep(1)


# =========================================================
# STEPPER
# =========================================================

STEP_SEQUENCE = [
    [1, 0, 0, 0],
    [1, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 1],
    [0, 0, 0, 1],
    [1, 0, 0, 1],
]


# ---------------------------------------------------------
# STEPPER 1
# GPIO 19,18,17,16
# ---------------------------------------------------------

stepper1 = [
    Pin(19, Pin.OUT),
    Pin(18, Pin.OUT),
    Pin(17, Pin.OUT),
    Pin(16, Pin.OUT),
]


# ---------------------------------------------------------
# STEPPER 2
# GPIO 7,6,5,4
# ---------------------------------------------------------

stepper2 = [
    Pin(7, Pin.OUT),
    Pin(6, Pin.OUT),
    Pin(5, Pin.OUT),
    Pin(4, Pin.OUT),
]


def set_stepper(pins, step):

    for pin, value in zip(pins, step):
        pin.value(value)


async def stepper_task(pins):

    index = 0

    while True:
        set_stepper(
            pins,
            STEP_SEQUENCE[index],
        )

        index += 1

        if index >= len(STEP_SEQUENCE):
            index = 0

        # Tốc độ stepper
        await asyncio.sleep_ms(10)


# =========================================================
# MAIN
# =========================================================


async def main():

    # -----------------------------------------------------
    # LCD
    # -----------------------------------------------------

    asyncio.create_task(lcd_task())

    # -----------------------------------------------------
    # Sensor release detection
    # -----------------------------------------------------

    asyncio.create_task(sensor_state_task())

    # -----------------------------------------------------
    # 4 Servo
    # -----------------------------------------------------

    for servo in servos:
        asyncio.create_task(servo_task(servo))

    # -----------------------------------------------------
    # 2 Stepper
    # -----------------------------------------------------

    asyncio.create_task(stepper_task(stepper1))

    asyncio.create_task(stepper_task(stepper2))

    # -----------------------------------------------------
    # Keep main alive
    # -----------------------------------------------------

    while True:
        await asyncio.sleep(1)


# =========================================================
# START
# =========================================================

try:
    asyncio.run(main())

finally:
    # -----------------------------------------------------
    # Tắt buzzer
    # -----------------------------------------------------

    buzzer.value(1)

    # -----------------------------------------------------
    # Tắt servo
    # -----------------------------------------------------

    for servo in servos:
        servo.duty_u16(0)
        servo.deinit()

    # -----------------------------------------------------
    # Tắt stepper
    # -----------------------------------------------------

    for pins in (
        stepper1,
        stepper2,
    ):
        for pin in pins:
            pin.value(0)
