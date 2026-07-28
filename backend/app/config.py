from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "GrowthLens API"
    api_prefix: str = "/api"
    port: int = 8001
    debug: bool = True

    # Relative to backend/ root
    database_path: str = "data/growthlens.db"

    cors_origins: list[str] = [
        "http://localhost:4028",
        "http://127.0.0.1:4028",
    ]


settings = Settings()
