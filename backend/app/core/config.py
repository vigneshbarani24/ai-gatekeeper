"""
Configuration management for AI Gatekeeper.
Handles environment variables, secrets, and service credentials.
"""

from pydantic_settings import BaseSettings
from pydantic import Field, validator
from typing import Optional
import os
from pathlib import Path


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Critical: All API keys must be set via .env file or environment.
    Never hardcode credentials in this file.
    """

    # ============================================================================
    # Application Settings
    # ============================================================================

    APP_NAME: str = "AI Gatekeeper"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development", description="development, staging, production")
    DEBUG: bool = Field(default=False, description="Enable debug logging")

    # Server
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)

    # CORS
    CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000"],
        description="Allowed frontend origins"
    )

    # ============================================================================
    # Twilio Configuration
    # ============================================================================

    TWILIO_ACCOUNT_SID: str = Field(..., description="Twilio Account SID (AC...)")
    TWILIO_AUTH_TOKEN: str = Field(..., description="Twilio Auth Token")
    TWILIO_PHONE_NUMBER: str = Field(..., description="Your Twilio phone number (+1...)")
    TWILIO_TWIML_APP_SID: Optional[str] = Field(None, description="TwiML App SID for WebSocket")

    # WebSocket
    TWILIO_STREAM_URL: str = Field(
        default="wss://your-domain.com/streams/audio",
        description="Public WebSocket URL for Twilio to connect"
    )

    @validator("TWILIO_PHONE_NUMBER")
    def validate_phone_number(cls, v):
        """Ensure phone number is in E.164 format"""
        if not v.startswith("+"):
            raise ValueError("Phone number must be in E.164 format (e.g., +12125551234)")
        return v

    # ============================================================================
    # ElevenLabs Configuration
    # ============================================================================

    ELEVENLABS_API_KEY: str = Field(..., description="ElevenLabs API key (sk_...)")
    ELEVENLABS_AGENT_ID: str = Field(..., description="Conversational AI Agent ID")
    ELEVENLABS_VOICE_ID: str = Field(..., description="Cloned voice ID")

    # Voice Settings
    ELEVENLABS_MODEL: str = Field(default="eleven_turbo_v2_5", description="TTS model")
    ELEVENLABS_STABILITY: float = Field(default=0.5, ge=0.0, le=1.0)
    ELEVENLABS_SIMILARITY_BOOST: float = Field(default=0.75, ge=0.0, le=1.0)

    # Conversational AI WebSocket
    ELEVENLABS_WEBSOCKET_URL: str = "wss://api.elevenlabs.io/v1/convai/conversation"

    # ============================================================================
    # Google Cloud Configuration
    # ============================================================================

    GOOGLE_CLOUD_PROJECT: Optional[str] = Field(None, description="GCP Project ID")
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = Field(
        None,
        description="Path to service account JSON"
    )

    # Calendar API
    GOOGLE_CALENDAR_ID: str = Field(default="primary", description="Calendar ID to check")
    GOOGLE_CALENDAR_TIMEZONE: str = Field(default="America/New_York", description="User timezone")

    # ============================================================================
    # LLM Configuration (Optional - if using Vertex AI directly)
    # ============================================================================

    LLM_PROVIDER: str = Field(default="elevenlabs", description="elevenlabs, openai, vertex")
    LLM_MODEL: str = Field(default="gpt-4o", description="Model name if using OpenAI/Vertex")
    LLM_TEMPERATURE: float = Field(default=0.7, ge=0.0, le=2.0)
    LLM_MAX_TOKENS: int = Field(default=150, description="Max response length")

    OPENAI_API_KEY: Optional[str] = Field(None, description="OpenAI API key (if using)")

    # ============================================================================
    # Vector Database (ChromaDB)
    # ============================================================================

    VECTOR_DB_PATH: str = Field(
        default="./data/vector_store",
        description="Path to ChromaDB persistence"
    )
    VECTOR_DB_COLLECTION: str = Field(default="scam_scripts", description="Collection name")

    # Embedding Model
    EMBEDDING_MODEL: str = Field(
        default="all-MiniLM-L6-v2",
        description="Sentence transformer model"
    )

    # Scam Detection
    SCAM_SIMILARITY_THRESHOLD: float = Field(
        default=0.85,
        ge=0.0,
        le=1.0,
        description="Cosine similarity threshold for scam detection"
    )

    # ============================================================================
    # Security & Authentication
    # ============================================================================

    # Webhook Signature Validation
    WEBHOOK_SECRET: str = Field(..., description="HMAC secret for webhook validation")
    SIGNATURE_TIMEOUT: int = Field(default=300, description="Webhook signature validity (seconds)")

    # Rate Limiting
    RATE_LIMIT_CALLS_PER_MINUTE: int = Field(default=60, description="Max calls per minute")
    RATE_LIMIT_WEBHOOKS_PER_MINUTE: int = Field(default=120, description="Max webhook calls")

    # ============================================================================
    # Data Retention & Privacy
    # ============================================================================

    AUDIO_RETENTION_HOURS: int = Field(default=24, description="Auto-delete audio after N hours")
    TRANSCRIPT_RETENTION_DAYS: int = Field(default=30, description="Transcript retention")

    ENABLE_PII_REDACTION: bool = Field(default=True, description="Redact PII from logs")

    # ============================================================================
    # Frontend Integration
    # ============================================================================

    FRONTEND_WEBSOCKET_URL: str = Field(
        default="ws://localhost:8000/ws/dashboard",
        description="WebSocket for frontend state sync"
    )

    # Audio Energy Broadcast
    AUDIO_ENERGY_BROADCAST_HZ: int = Field(
        default=30,
        description="Frequency of audio energy updates to frontend"
    )

    # ============================================================================
    # Contact Whitelist & Blacklist
    # ============================================================================

    CONTACTS_FILE: str = Field(
        default="./data/contacts.json",
        description="Path to whitelisted contacts"
    )

    BLACKLIST_FILE: str = Field(
        default="./data/blacklist.json",
        description="Path to blocked numbers"
    )

    # ============================================================================
    # Logging & Monitoring
    # ============================================================================

    LOG_LEVEL: str = Field(default="INFO", description="DEBUG, INFO, WARNING, ERROR")
    LOG_FILE: Optional[str] = Field(None, description="Path to log file (None = stdout)")

    # Sentry (Optional)
    SENTRY_DSN: Optional[str] = Field(None, description="Sentry error tracking DSN")

    # ============================================================================
    # System Prompt Configuration
    # ============================================================================

    USER_NAME: str = Field(..., description="User's full name for AI to reference")
    USER_TITLE: Optional[str] = Field(None, description="e.g., 'Dr.', 'Professor'")

    SYSTEM_PROMPT_TEMPLATE: str = Field(
        default="""You are the AI Executive Assistant for {user_name}. You are speaking with a cloned version of {user_name}'s voice, but you must identify yourself as an AI assistant in your first sentence to comply with FCC transparency regulations.

Core Objective: Screen inbound calls to protect {user_name}'s time from spam, scams, and unwanted solicitations.

Operational Protocol:
1. **Immediate Disclosure**: Start every call with: "Hello, this is {user_name}'s AI assistant. How can I help you?"
2. **Caller Identification**: Ask for the caller's name and reason for calling.
3. **Contact Verification**: If the caller claims to know {user_name}, use the check_contact tool to verify.
4. **Appointment Scheduling**: If the caller wants to meet, use the check_calendar tool to find availability.
5. **Solicitation Defense**: If the caller is selling, surveying, or fundraising, politely decline: "{user_name} is not interested in solicitations. Thank you for understanding." Then end the call.
6. **Scam Awareness**: Flag suspicious patterns immediately:
   - Claims of "IRS", "Social Security", "Warrant", "Legal Action"
   - Requests for immediate payment, gift cards, or wire transfers
   - Threats or urgency tactics
   - Refusal to provide callback information
   If detected, use report_scam tool and terminate the call.

Personality: Professional, warm to verified contacts, guarded but polite to strangers, firm with solicitors, decisive with scams.

Constraints:
- Do NOT promise to pass along messages without checking the contact whitelist first
- Do NOT provide {user_name}'s personal information (address, email, other numbers)
- Do NOT engage in prolonged conversation with obvious robocalls
- Keep responses concise (2-3 sentences maximum per turn)
""",
        description="System prompt template with {user_name} placeholder"
    )

    @property
    def system_prompt(self) -> str:
        """Generate the actual system prompt with user's name"""
        return self.SYSTEM_PROMPT_TEMPLATE.format(user_name=self.USER_NAME)

    # ============================================================================
    # Audio Processing
    # ============================================================================

    AUDIO_SAMPLE_RATE: int = Field(default=8000, description="Twilio uses 8kHz mu-law")
    AUDIO_CHANNELS: int = Field(default=1, description="Mono audio")
    AUDIO_CHUNK_SIZE: int = Field(default=160, description="20ms at 8kHz")

    # VAD (Voice Activity Detection)
    VAD_AGGRESSIVENESS: int = Field(default=3, ge=0, le=3, description="0=least, 3=most")

    # ============================================================================
    # Feature Flags
    # ============================================================================

    ENABLE_SCAM_DETECTION: bool = Field(default=True, description="Enable RAG scam detection")
    ENABLE_CALENDAR_INTEGRATION: bool = Field(default=True, description="Enable Google Calendar")
    ENABLE_CONTACT_WHITELIST: bool = Field(default=True, description="Auto-pass known contacts")
    ENABLE_CALL_RECORDING: bool = Field(default=False, description="Record all calls (check laws!)")
    ENABLE_FRONTEND_BROADCAST: bool = Field(default=True, description="Send state to frontend")

    # Demo/Testing Mode
    DEMO_MODE: bool = Field(default=False, description="Use mock services for testing")

    # ============================================================================
    # Pydantic Configuration
    # ============================================================================

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore"  # Ignore extra env vars
    }

    @validator("ENVIRONMENT")
    def validate_environment(cls, v):
        """Ensure environment is valid"""
        valid = ["development", "staging", "production", "demo"]
        if v not in valid:
            raise ValueError(f"ENVIRONMENT must be one of {valid}")
        return v

    @validator("LOG_LEVEL")
    def validate_log_level(cls, v):
        """Ensure log level is valid"""
        valid = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if v.upper() not in valid:
            raise ValueError(f"LOG_LEVEL must be one of {valid}")
        return v.upper()

    def is_production(self) -> bool:
        """Check if running in production"""
        return self.ENVIRONMENT == "production"

    def is_development(self) -> bool:
        """Check if running in development"""
        return self.ENVIRONMENT in ["development", "demo"]


# ============================================================================
# Global Settings Instance
# ============================================================================

# Singleton pattern: instantiate once, import everywhere
try:
    settings = Settings()
except Exception as e:
    print(f"❌ Configuration Error: {e}")
    print("\n📋 Required environment variables:")
    print("   - TWILIO_ACCOUNT_SID")
    print("   - TWILIO_AUTH_TOKEN")
    print("   - TWILIO_PHONE_NUMBER")
    print("   - ELEVENLABS_API_KEY")
    print("   - ELEVENLABS_AGENT_ID")
    print("   - ELEVENLABS_VOICE_ID")
    print("   - WEBHOOK_SECRET")
    print("   - USER_NAME")
    print("\nCreate a .env file based on .env.example")
    raise


# ============================================================================
# Helper Functions
# ============================================================================

def get_vector_db_path() -> Path:
    """Get absolute path to vector database"""
    path = Path(settings.VECTOR_DB_PATH)
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_contacts_file() -> Path:
    """Get absolute path to contacts file"""
    path = Path(settings.CONTACTS_FILE)
    if not path.exists():
        # Create empty contacts file
        path.write_text("[]")
    return path


def get_blacklist_file() -> Path:
    """Get absolute path to blacklist file"""
    path = Path(settings.BLACKLIST_FILE)
    if not path.exists():
        # Create empty blacklist
        path.write_text("[]")
    return path
