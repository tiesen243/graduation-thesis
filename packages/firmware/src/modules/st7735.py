import time
from math import sqrt

from machine import SPI, Pin

from lib.font import sysfont
from lib.pins import Pins
from lib.utils import clamp, rgb

Rotations = [0x00, 0x60, 0xC0, 0xA0]  # 0, 90, 180, 270 degrees

BGR = 0x08
RGB = 0x00


class ST7735:
    __instance: ST7735 | None = None

    spi: SPI
    dc: Pin
    rs: Pin
    cs: Pin

    _size: tuple[int, int]
    _offset: bytearray
    _rotate: int
    _rgb: bool
    _tfa: int
    _bfa: int

    _color_data: bytearray
    _window_loc_data: bytearray

    _buf: bytes

    def __init__(self, size: tuple[int, int] = (128, 160)):
        pins = Pins.create()

        self.spi = pins.tft_spi
        self.dc = pins.tft_dc
        self.rs = pins.tft_rs
        self.cs = pins.tft_cs
        self.cs.value(1)

        self._size = size
        self._offset = bytearray([0, 0])
        self._rotate = 0
        self._rgb = True
        self._tfa = 0
        self._bfa = 0

        self._color_data = bytearray(2)
        self._window_loc_data = bytearray(4)

        self._buf = bytes(self._color_data) * 32

    def size(self) -> tuple[int, int]:
        """
        Get the current logical canvas size based on rotation and orientation.

        :return: Tuple of (width, height) in pixels.
        """
        return self._size

    def on(self, on: bool = True):
        """
        Turn display screen output ON or OFF.

        :param on: Set `True` to enable screen output, `False` to turn off.
        :return: None
        """
        self._cmd(ST7735.DISPON if on else ST7735.DISPOFF)

    def invert(self, invert: bool = True):
        """
        Invert display colors.

        :param invert: Set `True` to enable color inversion, `False` for normal colors.
        :return: None
        """
        self._cmd(ST7735.INVON if invert else ST7735.INVOFF)

    def rgb_mode(self, rgb: bool = True) -> None:
        """
        Configure pixel color order mode between RGB and BGR.

        :param rgb: Set `True` for RGB color order, `False` for BGR.
        :return: None
        """
        self._rgb = rgb
        self._set_MADCTL()

    def rotation(self, rotate: int) -> None:
        """
        Rotate display orientation and automatically swap logical canvas dimensions.

        :param rotate: Rotation index (0: 0°, 1: 90°, 2: 180°, 3: 270°).
        :return: None
        """
        if 0 <= rotate <= 3:
            root_change = self._rotate ^ rotate
            self._rotate = rotate

            if root_change & 1:
                self._size = (self._size[1], self._size[0])
            self._set_MADCTL()

    def pixel(self, pos: tuple[int, int], color: int) -> None:
        """
        Draw a single pixel at the specified coordinate.

        :param pos: Pixel coordinate tuple (x, y).
        :param color: 16-bit RGB565 color value.
        :return: None
        """
        if 0 <= pos[0] < self._size[0] and 0 <= pos[1] < self._size[1]:
            self._set_window_point(pos)
            self._pushcolor(color)

    def text(
        self,
        pos: tuple[int, int],
        text: str,
        color: int,
        font: dict = sysfont,
        size: tuple[int, int] | int = 1,
        wrap: bool = False,
    ) -> None:
        """
        Render string text onto display with custom fonts, scaling, and line wrapping options.

        :param pos: Top-left start coordinate tuple (x, y).
        :param text: String payload to render.
        :param color: 16-bit RGB565 text color value.
        :param font: Font dictionary mapping character glyph data.
        :param size: Uniform scale factor integer or scale tuple (x_scale, y_scale).
        :param wrap: Set `True` to wrap text to next line on reaching display border.
        :return: None
        """

        if isinstance(size, int):
            wh = (size, size)
        else:
            wh = size

        x, y = pos
        width = wh[0] * font.get("width", 0) + 1
        for char in text:
            self.char((x, y), char, color, font, wh)
            x += width

            if x + width > self._size[0]:
                if wrap:
                    y += font["height"] * wh[1] + 1
                    x = pos[0]
                else:
                    break

    def char(
        self,
        pos: tuple[int, int],
        char: str,
        color: int,
        font: dict = sysfont,
        sizes: tuple[int, int] = (1, 1),
    ) -> None:
        """
        Render a single scaled character glyph into memory buffer and output to screen.

        :param pos: Top-left coordinate tuple (x, y).
        :param char: Single character string to render.
        :param color: 16-bit RGB565 color value.
        :param font: Font dictionary mapping character glyph data.
        :param sizes: Horizontal and vertical scaling factor tuple (width_scale, height_scale).
        :return: None
        """
        start_char = font.get("start", 0)
        end_char = font.get("end", 0)
        ci = ord(char)

        if start_char <= ci <= end_char:
            font_width = font.get("width", 0)
            font_height = font.get("height", 0)
            ci = (ci - start_char) * font_width
            char_data = font.get("data", bytearray)[ci : ci + font_width]

            w = font_width * sizes[0]
            h = font_height * sizes[1]

            buf = bytearray(w * h * 2)

            ch = color >> 8
            cl = color & 0xFF

            for x_idx, c in enumerate(char_data):
                for y_idx in range(font_height):
                    if c & 0x01:
                        for sx in range(sizes[0]):
                            for sy in range(sizes[1]):
                                px = x_idx * sizes[0] + sx
                                py = y_idx * sizes[1] + sy
                                idx = (py * w + px) * 2
                                buf[idx] = ch
                                buf[idx + 1] = cl
                    c >>= 1

            x0, y0 = pos
            x1 = x0 + w - 1
            y1 = y0 + h - 1

            self.image(x0, y0, x1, y1, buf)

    def blit(self, x: int, y: int, w: int, h: int, data: bytearray) -> None:
        """
        Blit a raw byte array buffer directly to a rectangular screen region.

        :param x: Left coordinate starting position.
        :param y: Top coordinate starting position.
        :param w: Region width in pixels.
        :param h: Region height in pixels.
        :param data: Bytearray buffer containing 16-bit RGB565 pixel data.
        :return: None
        """
        self.image(x, y, x + w - 1, y + h - 1, data)

    def line(self, start: tuple[int, int], end: tuple[int, int], color: int):
        """
        Draw a straight line between two points using Bresenham's algorithm or optimized axis methods.

        :param start: Starting coordinate tuple (x, y).
        :param end: Ending coordinate tuple (x, y).
        :param color: 16-bit RGB565 line color value.
        :return: None
        """

        if start[0] == end[0]:
            pnt = end if (end[1] < start[1]) else start
            self.vline(pnt, abs(end[1] - start[1]) + 1, color)
        elif start[1] == end[1]:
            pnt = end if end[0] < start[0] else start
            self.hline(pnt, abs(end[0] - start[0]) + 1, color)
        else:
            sx, sy = start
            ex, ey = end

            dx = ex - sx
            dy = ey - sy

            inx = 1 if dx > 0 else -1
            iny = 1 if dy > 0 else -1
            dx = abs(dx)
            dy = abs(dy)

            if dx >= dy:
                dy <<= 1
                e = dy - dx
                dx <<= 1

                while sx != ex:
                    self.pixel((sx, sy), color)
                    if e >= 0:
                        sy += iny
                        e -= dx
                    e += dy
                    sx += inx
            else:
                dx <<= 1
                e = dx - dy
                dy <<= 1

                while sy != ey:
                    self.pixel((sx, sy), color)
                    if e >= 0:
                        sx += inx
                        e -= dy
                    e += dx
                    sy += iny

    def vline(self, pos: tuple[int, int], length: int, color: int) -> None:
        """
        Draw a fast vertical line starting from a given position.

        :param pos: Top-left coordinate tuple (x, y).
        :param length: Line height length in pixels.
        :param color: 16-bit RGB565 color value.
        :return: None
        """
        x, y = pos

        start = clamp(x, 0, self._size[0]), clamp(y, 0, self._size[1])
        stop = start[0], clamp(start[1] + length, 0, self._size[1])

        if stop[1] < start[1]:
            start, stop = stop, start

        self._set_window_loc(start, stop)
        self._set_color(color)
        self._draw(length)

    def hline(self, pos: tuple[int, int], length: int, color: int) -> None:
        """
        Draw a fast horizontal line starting from a given position.

        :param pos: Top-left coordinate tuple (x, y).
        :param length: Line width length in pixels.
        :param color: 16-bit RGB565 color value.
        :return: None
        """
        x, y = pos

        start = clamp(x, 0, self._size[0]), clamp(y, 0, self._size[1])
        stop = clamp(start[0] + length, 0, self._size[0]), start[1]

        if stop[0] < start[0]:
            start, stop = stop, start

        self._set_window_loc(start, stop)
        self._set_color(color)
        self._draw(length)

    def rect(self, pos: tuple[int, int], size: tuple[int, int], color: int) -> None:
        """
        Draw an unfilled rectangle outline.

        :param pos: Top-left coordinate tuple (x, y).
        :param size: Dimension tuple (width, height).
        :param color: 16-bit RGB565 color value.
        :return: None
        """

        self.hline(pos, size[0], color)
        self.hline((pos[0], pos[1] + size[1] - 1), size[0], color)

        self.vline(pos, size[1], color)
        self.vline((pos[0] + size[0] - 1, pos[1]), size[1], color)

    def fill_rect(
        self, pos: tuple[int, int], size: tuple[int, int], color: int
    ) -> None:
        """
        Draw a solid filled rectangle.

        :param pos: Top-left coordinate tuple (x, y).
        :param size: Dimension tuple (width, height).
        :param color: 16-bit RGB565 color value.
        :return: None
        """
        start = clamp(pos[0], 0, self._size[0]), clamp(pos[1], 0, self._size[1])
        end = (
            clamp(start[0] + size[0] - 1, 0, self._size[0]),
            clamp(start[1] + size[1] - 1, 0, self._size[1]),
        )

        if end[0] < start[0]:
            tmp = end[0]
            end = (start[0], end[1])
            start = (tmp, start[1])
        if end[1] < start[1]:
            tmp = end[1]
            end = (end[0], start[1])
            start = (start[0], tmp)

        self._set_window_loc(start, end)
        pixels = (end[0] - start[0] + 1) * (end[1] - start[1] + 1)
        self._set_color(color)
        self._draw(pixels)

    def circle(self, pos: tuple[int, int], radius: int, color: int) -> None:
        """
        Draw an unfilled circle outline using symmetry algorithm.

        :param pos: Center coordinate tuple (x, y).
        :param radius: Radius of the circle in pixels.
        :param color: 16-bit RGB565 color value.
        :return: None
        """
        self._color_data[0] = color >> 8
        self._color_data[1] = color

        xend = int(0.7071 * radius) + 1
        rsq = radius**2

        xp, yp, xn, yn, xyp, yxp, xyn, yxn = 0, 0, 0, 0, 0, 0, 0, 0
        for x in range(xend):
            y = int(sqrt(rsq - x * x))
            xp = pos[0] + x
            yp = pos[1] + y
            xn = pos[0] - x
            yn = pos[1] - y
            xyp = pos[0] + y
            yxp = pos[1] + x
            xyn = pos[0] - y
            yxn = pos[1] - x

        self._set_window_point((xp, yp))
        self._data(self._color_data)
        self._set_window_point((xp, yn))
        self._data(self._color_data)
        self._set_window_point((xn, yp))
        self._data(self._color_data)
        self._set_window_point((xn, yn))
        self._data(self._color_data)
        self._set_window_point((xyp, yxp))
        self._data(self._color_data)
        self._set_window_point((xyp, yxn))
        self._data(self._color_data)
        self._set_window_point((xyn, yxp))
        self._data(self._color_data)
        self._set_window_point((xyn, yxn))
        self._data(self._color_data)

    def fill_circle(self, pos: tuple[int, int], radius: int, color: int) -> None:
        """
        Draw a solid filled circle using vertical scan lines.

        :param pos: Center coordinate tuple (x, y).
        :param radius: Radius of the circle in pixels.
        :param color: 16-bit RGB565 color value.
        :return: None
        """
        self._color_data[0] = color >> 8
        self._color_data[1] = color

        rsq = radius**2
        for x in range(radius):
            y = int(sqrt(rsq - x * x))
            y0 = pos[1] - y
            ey = y0 + y * 2
            y0 = clamp(y0, 0, self._size[1])
            ln = abs(ey - y0) + 1

            self.vline((pos[0] + x, y0), ln, color)
            self.vline((pos[0] - x, y0), ln, color)

    def fill(self, color: int) -> None:
        """
        Clear and fill the entire screen canvas with a uniform color.

        :param color: 16-bit RGB565 color value.
        :return: None
        """
        self.fill_rect((0, 0), self._size, color)

    def image(self, x0: int, y0: int, x1: int, y1: int, data: bytearray) -> None:
        """
        Send raw pixel bytearray data directly to a defined window bounding box.

        :param x0: Left boundary pixel coordinate.
        :param y0: Top boundary pixel coordinate.
        :param x1: Right boundary pixel coordinate.
        :param y1: Bottom boundary pixel coordinate.
        :param data: Bytearray buffer of pixel colors.
        :return: None
        """
        self._set_window_loc((x0, y0), (x1, y1))
        self._data(data)

    def setvscroll(self, tfa: int, bfa: int) -> None:
        """
        Configure hardware vertical scrolling area definition parameters.

        :param tfa: Top Fixed Area height in pixels.
        :param bfa: Bottom Fixed Area height in pixels.
        :return: None
        """
        self._cmd(ST7735.VSCRDEF)

        data2 = bytearray([0, tfa])
        self._data(data2)

        data2[1] = 162 - tfa - bfa
        self._data(data2)

        data2[1] = bfa
        self._data(data2)

        self._tfa = tfa
        self._bfa = bfa

    def vscroll(self, value: int) -> None:
        """
        Scroll screen content vertically by a designated pixel offset.

        :param value: Vertical scroll pixel shift value.
        :return: None
        """
        a = value + self._tfa

        if a + self._bfa > 162:
            a = 162 - self._bfa

        self._vscrolladdr(a)

    def _vscrolladdr(self, addr: int) -> None:
        """
        Send vertical scroll start address register command.

        :param addr: Memory line start address.
        :return: None
        """
        self._cmd(ST7735.VSCSAD)
        data2 = bytearray([addr >> 8, addr & 0xFF])
        self._data(data2)

    def _set_color(self, color: int):
        """
        Prepare internal 16-bit color byte structure and duplicate into block write buffers.

        :param color: 16-bit RGB565 color value.
        :return: None
        """
        self._color_data[0] = color >> 8
        self._color_data[1] = color
        self._buf = bytes(self._color_data) * 32

    def _draw(self, pixels: int):
        """
        Flush pre-calculated color buffers across SPI to render pixel blocks.

        :param pixels: Total count of pixels to transmit.
        :return: None
        """
        self.dc.value(1)
        self.cs.value(0)

        for _ in range(pixels // 32):
            _ = self.spi.write(self._buf)

            rest = int(pixels) % 32
            if rest > 0:
                buf2 = bytes(self._color_data) * rest
                _ = self.spi.write(buf2)

        self.cs(1)

    def _cmd(self, cmd: int) -> None:
        """
        Transmit a single command byte over SPI with DC pin pulled LOW.

        :param cmd: Register command byte.
        :return: None
        """
        self.dc.value(0)
        self.cs.value(0)
        _ = self.spi.write(bytearray([cmd]))
        self.cs.value(1)

    def _data(self, data: bytearray) -> None:
        """
        Transmit data payload buffer over SPI with DC pin pulled HIGH.

        :param data: Bytearray buffer containing data payload.
        :return: None
        """
        self.dc.value(1)
        self.cs.value(0)
        _ = self.spi.write(data)
        self.cs.value(1)

    def _set_MADCTL(self) -> None:
        """
        Update Memory Data Access Control (MADCTL) register for screen orientation and color modes.

        :return: None
        """
        self._cmd(ST7735.MADCTL)
        rgb = RGB if self._rgb else BGR
        self._data(bytearray([Rotations[self._rotate] | rgb]))

    def _reset(self) -> None:
        """
        Perform a hardware pin toggle reset sequence on the display module.

        :return: None
        """
        self.rs.value(1)
        time.sleep(0.05)
        self.rs.value(0)
        time.sleep(0.05)
        self.rs.value(1)
        time.sleep(0.15)

    def _set_window_point(self, pos: tuple[int, int]) -> None:
        """
        Set active window bounding bounds to target a single pixel coordinate.

        :param pos: Pixel coordinate tuple (x, y).
        :return: None
        """
        x = self._offset[0] + int(pos[0])
        y = self._offset[1] + int(pos[1])

        self._cmd(ST7735.CASET)
        self._window_loc_data[0] = x >> 8
        self._window_loc_data[1] = x & 0xFF
        self._window_loc_data[2] = x >> 8
        self._window_loc_data[3] = x & 0xFF
        self._data(self._window_loc_data)

        self._cmd(ST7735.RASET)
        self._window_loc_data[0] = y >> 8
        self._window_loc_data[1] = y & 0xFF
        self._window_loc_data[2] = y >> 8
        self._window_loc_data[3] = y & 0xFF
        self._data(self._window_loc_data)

        self._cmd(ST7735.RAMWR)

    def _set_window_loc(self, pos_0: tuple[int, int], pos_1: tuple[int, int]) -> None:
        """
        Set CASET/RASET address registers to define a rectangular drawing region window.

        :param pos_0: Top-left coordinate tuple (x, y).
        :param pos_1: Bottom-right coordinate tuple (x, y).
        :return: None
        """
        x0 = self._offset[0] + int(pos_0[0])
        x1 = self._offset[0] + int(pos_1[0])
        y0 = self._offset[1] + int(pos_0[1])
        y1 = self._offset[1] + int(pos_1[1])

        self._cmd(ST7735.CASET)
        self._window_loc_data[0] = x0 >> 8
        self._window_loc_data[1] = x0 & 0xFF
        self._window_loc_data[2] = x1 >> 8
        self._window_loc_data[3] = x1 & 0xFF
        self._data(self._window_loc_data)

        self._cmd(ST7735.RASET)
        self._window_loc_data[0] = y0 >> 8
        self._window_loc_data[1] = y0 & 0xFF
        self._window_loc_data[2] = y1 >> 8
        self._window_loc_data[3] = y1 & 0xFF
        self._data(self._window_loc_data)

        self._cmd(ST7735.RAMWR)

    def _pushcolor(self, color: int) -> None:
        """
        Push 16-bit color byte data to display RAM.

        :param color: 16-bit RGB565 color value.
        :return: None
        """
        self._color_data[0] = color >> 8
        self._color_data[1] = color
        self._data(self._color_data)

    def init(self) -> None:
        """
        Execute full hardware initialization sequence and reset display panel configuration registers.

        :return: None
        """
        self._reset()

        self._cmd(ST7735.SWRESET)
        time.sleep(0.15)

        self._cmd(ST7735.SLPOUT)
        time.sleep(0.20)

        self._cmd(ST7735.FRMCTR1)
        self._data(bytearray([0x01, 0x2C, 0x2D]))

        self._cmd(ST7735.FRMCTR2)
        self._data(bytearray([0x01, 0x2C, 0x2D]))

        self._cmd(ST7735.FRMCTR3)
        self._data(bytearray([0x01, 0x2C, 0x2D, 0x01, 0x2C, 0x2D]))

        self._cmd(ST7735.INVCTR)
        self._data(bytearray([0x07]))

        self._cmd(ST7735.PWCTR1)  # Power control
        self._data(bytearray([0xA2, 0x02, 0x84]))

        self._cmd(ST7735.PWCTR2)
        self._data(bytearray([0xC5]))

        self._cmd(ST7735.PWCTR3)
        self._data(bytearray([0x0A, 0x00]))

        self._cmd(ST7735.PWCTR4)
        self._data(bytearray([0x8A, 0x2A]))

        self._cmd(ST7735.PWCTR5)
        self._data(bytearray([0x8A, 0xEE]))

        self._cmd(ST7735.VMCTR1)
        self._data(bytearray([0x0E]))

        self._cmd(ST7735.INVOFF)

        self._set_MADCTL()

        self._cmd(ST7735.COLMOD)
        self._data(bytearray([0x05]))

        self._cmd(ST7735.NORON)
        time.sleep(0.01)

        self._cmd(ST7735.DISPON)
        time.sleep(0.1)

        self.cs.value(1)

    @classmethod
    def create(cls) -> ST7735:
        if cls.__instance is None:
            cls.__instance = ST7735()
        return cls.__instance

    NOP = 0x0

    SWRESET = 0x01
    RDDID = 0x04
    RDDST = 0x09

    SLPIN = 0x10
    SLPOUT = 0x11
    PTLON = 0x12
    NORON = 0x13

    INVOFF = 0x20
    INVON = 0x21
    DISPOFF = 0x28
    DISPON = 0x29
    CASET = 0x2A
    RASET = 0x2B
    RAMWR = 0x2C
    RAMRD = 0x2E

    VSCRDEF = 0x33
    VSCSAD = 0x37

    COLMOD = 0x3A
    MADCTL = 0x36

    FRMCTR1 = 0xB1
    FRMCTR2 = 0xB2
    FRMCTR3 = 0xB3
    INVCTR = 0xB4
    DISSET5 = 0xB6

    PWCTR1 = 0xC0
    PWCTR2 = 0xC1
    PWCTR3 = 0xC2
    PWCTR4 = 0xC3
    PWCTR5 = 0xC4
    VMCTR1 = 0xC5

    RDID1 = 0xDA
    RDID2 = 0xDB
    RDID3 = 0xDC
    RDID4 = 0xDD

    PWCTR6 = 0xFC

    GMCTRP1 = 0xE0
    GMCTRN1 = 0xE1

    BLACK = 0
    RED = rgb(0xFF, 0x00, 0x00)
    MAROON = rgb(0x80, 0x00, 0x00)
    GREEN = rgb(0x00, 0xFF, 0x00)
    FOREST = rgb(0x00, 0x80, 0x80)
    BLUE = rgb(0x00, 0x00, 0xFF)
    NAVY = rgb(0x00, 0x00, 0x80)
    CYAN = rgb(0x00, 0xFF, 0xFF)
    YELLOW = rgb(0xFF, 0xFF, 0x00)
    PURPLE = rgb(0xFF, 0x00, 0xFF)
    WHITE = rgb(0xFF, 0xFF, 0xFF)
    GRAY = rgb(0x80, 0x80, 0x80)
