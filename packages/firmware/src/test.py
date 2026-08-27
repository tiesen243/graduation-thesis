import time

import framebuf

from modules.buzzer import Buzzer
from modules.st7735 import ST7735

# 1. Khởi tạo màn hình
tft = ST7735.create()
tft.init()

buzzer = Buzzer.create()

# 2. Thông số
WIDTH = 128
HEIGHT_BOX = 12  # Vùng cao 12px vừa đủ hiển thị dòng chữ
TEXT = "Thien ly oi, em co the o lai day khong"
FONT_SIZE = 1
TEXT_WIDTH = len(TEXT) * 8  # Font chuẩn MicroPython rộng 8px/ký tự
Y_POS = 70

# 3. Tạo Buffer trong RAM (Dùng RGB565 / GS16)
buffer = bytearray(WIDTH * HEIGHT_BOX * 2)
fb = framebuf.FrameBuffer(buffer, WIDTH, HEIGHT_BOX, framebuf.RGB565)

x_pos = WIDTH

buzzer.ring(count=10, freq=3500, delay_ms=100)

while True:
    # Xóa nền RAM buffer màu đen
    fb.fill(0x0000)

    # Vẽ chữ màu vàng (RGB565 Yellow = 0xFFE0) vào RAM buffer
    fb.text(TEXT, x_pos, 2, 0xFFE0)

    # Đẩy RAM buffer ra màn hình qua hàm image() có sẵn
    tft.image(0, Y_POS, WIDTH - 1, Y_POS + HEIGHT_BOX - 1, buffer)

    # Dịch sang trái 1px để cuộn cực mượt
    x_pos -= 1

    # Reset khi toàn bộ chuỗi chữ ra khỏi màn hình
    if x_pos < -TEXT_WIDTH:
        x_pos = WIDTH

    time.sleep_ms(15)  # pyright: ignore[reportAttributeAccessIssue]
