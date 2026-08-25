from .settings import *  # noqa: F403


# Tests should be self-contained and must not require PostgreSQL CREATE DATABASE
# privileges on a developer's local database account.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "test.sqlite3",  # noqa: F405
    }
}
