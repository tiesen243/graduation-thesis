import asyncio

from lib.api import Api
from lib.i18n import t
from lib.pins import Pins
from lib.uqr import QRCode
from modules.wifi import WiFi
from services.display import Display


class Link:
    __instance: Link | None = None

    _button = None
    _api: Api
    _wifi: WiFi
    _display: Display

    def __init__(self) -> None:
        pins = Pins.create()

        self._button = pins.link_button
        self._api = Api.create()
        self._wifi = WiFi.create()
        self._display = Display.create()

    async def _generate(self) -> None:
        if self._display.is_link_qr_active():
            return

        print(t("link.generating"))

        response = await self._api.post("/api/devices/link/generate")
        if not isinstance(response, dict) and response.get("error") is not None:
            print(t("link.invalid_response"))
            return

        token = response.get("data")
        if not isinstance(token, str):
            return

        qr = QRCode()
        qr.add_data(token)
        micro_matrix = qr.get_matrix()
        print(micro_matrix)

        self._display.show_link_qr(
            token,
            duration_ms=60_000,
        )

    async def start(self) -> None:
        """
        Trigger link generation after
        press -> release.
        """

        if self._button is None:
            print(t("link.button_missing"))
            return

        last_state = self._button.value()
        pressed = last_state == 0

        print(t("link.started"))

        while True:
            state = self._button.value()

            if state != last_state:
                # Debounce.
                await asyncio.sleep(0.03)

                stable_state = self._button.value()

                if stable_state != state:
                    await asyncio.sleep(0)
                    continue

                last_state = stable_state

                # Button pressed.
                if stable_state == 0:
                    pressed = True

                # Button released after press.
                elif pressed:
                    pressed = False
                    await self._generate()

            await asyncio.sleep(0.05)

    @classmethod
    def create(cls) -> Link:
        if cls.__instance is None:
            cls.__instance = cls()
        return cls.__instance
