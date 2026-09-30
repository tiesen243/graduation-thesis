import json

from lib.config import Config


class Translation:
    __instance: Translation | None = None

    def __init__(self, locale_dir: str = "/data/locales") -> None:
        self._locale_dir = locale_dir
        self._language = ""
        self._translations: dict = {}
        self._fallback: dict = {}
        self._load_language("en")

    def _load_file(self, language: str) -> dict:
        path = f"{self._locale_dir}/{language}.json"
        try:
            with open(path, "r") as f:
                data = json.load(f)
                return data if isinstance(data, dict) else {}
        except Exception as error:
            print(f"[i18n] Failed to load locale '{language}': {error}")
            return {}

    def _load_language(self, language: str) -> None:
        language = str(language or "en").lower().split("-")[0]
        self._fallback = self._load_file("en")
        self._translations = (
            self._fallback if language == "en" else self._load_file(language)
        )
        self._language = language

    def _sync_language(self) -> None:
        config = Config.create()
        language = config.get("language", "en")
        language = str(language or "en").lower().split("-")[0]
        if language != self._language:
            self._load_language(language)

    def translate(self, key: str, **params) -> str:
        self._sync_language()

        value = self._translations.get(key)
        if value is None:
            value = self._fallback.get(key, key)

        value = str(value)
        if params:
            try:
                value = value.format(**params)
            except Exception:
                pass
        return value

    def use(self):
        """Return the translation function: t = Translation.create().use()."""
        return self.translate

    def __call__(self, key: str, **params) -> str:
        return self.translate(key, **params)

    @classmethod
    def create(
        cls, locale_dir: str = "/data/locales", force: bool = False
    ) -> Translation:
        if cls.__instance is None or force:
            cls.__instance = cls(locale_dir)
        return cls.__instance


t = Translation.create().use()
