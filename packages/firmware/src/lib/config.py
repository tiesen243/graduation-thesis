import json


class Config:
    __instance: Config | None = None

    def __init__(self, file_path: str) -> None:
        self._file_path = file_path
        self._config = self._load()

    def get(self, key: str, default: str | int | dict | None = None):
        return self._config.get(key, default)

    def set(self, key: str, value: str | int | dict) -> bool:
        self._config[key] = value
        try:
            with open(self._file_path, "w") as f:
                json.dump(self._config, f)
            return True
        except Exception as e:
            print(f"Error saving configuration to {self._file_path}: {e}")
            return False

    def _load(self) -> dict:
        with open(self._file_path, "r") as f:
            self._config = json.load(f)
        return self._config

    @classmethod
    def create(
        cls, file_path: str = "/data/config.json", force: bool = False
    ) -> Config:
        if cls.__instance is None or force:
            cls.__instance = cls(file_path)
        return cls.__instance
