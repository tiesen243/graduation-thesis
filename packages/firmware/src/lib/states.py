class States:
    _instance = None

    pill_count: int = 0
    last_trigger_time: int = 0

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.pill_count = 0
            cls._instance.last_trigger_time = 0
        return cls._instance
