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
    # Default to False (production-safe). Local dev sets DEBUG=True in .env.
    debug: bool = False

    # Relative to backend/ root
    database_path: str = "data/growthlens.db"

    # Comma-separated string, not a JSON array — much easier to set correctly
    # in Render's env var UI than list-typed pydantic-settings fields, which
    # expect JSON and are a common source of "CORS blocked" deploy bugs.
    cors_origins: str = "http://localhost:4028,http://127.0.0.1:4028"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
