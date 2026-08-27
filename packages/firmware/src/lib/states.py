class States:
    _instance = None

    def __init__(self) -> None:
        self.drop_count: int = 0
        self.drop_last_trigger_time: int = 0

        self.check_count: int = 0
        self.check_last_trigger_time: int = 0

    @classmethod
    def create(cls) -> States:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
