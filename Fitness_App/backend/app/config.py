import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory (app/)
BASE_DIR = Path(__file__).resolve().parent

# .env path is backend/.env (one directory up from app/)
env_path = BASE_DIR.parent / '.env'

if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=True)
    # print(f"✅ Loaded .env from {env_path}")
else:
    print(f"⚠️ [backend] Optional .env load skipped: file not found at {env_path}")
