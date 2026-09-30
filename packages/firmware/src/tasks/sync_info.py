from lib.api import Api
from lib.config import Config
from lib.i18n import t


class SyncInfo:
    __instance: SyncInfo | None = None

    _api: Api

    def __init__(self):
        self._api = Api.create()

    async def execute(self):
        """
        Fetch the latest information from the server and update the local configuration.

        :return: None
        """
        config = Config.create()

        resp = await self._api.get("/api/devices/info")
        if resp.get("error") is not None:
            print(t("sync_info.error", error=resp.get("error")))
            return

        data = resp.get("data", {}).copy()
        data.pop("compartments", None)

        if config.set("device", data):
            print(t("sync_info.updated"))
        else:
            print(t("sync_info.failed"))

    @classmethod
    def create(cls) -> SyncInfo:
        if cls.__instance is None:
            cls.__instance = SyncInfo()
        return cls.__instance
