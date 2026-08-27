class States:
    _instance = None

    def __init__(self) -> None:
        self.pill_count: int = 0
        self.last_trigger_time: int = 0

    @classmethod
    def create(cls) -> States:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
