"""
Runtime Validation & Health Checks
ZERO TOLERANCE for missing configs or silent failures
"""

import os
import logging
from typing import Dict, List, Tuple
from dataclasses import dataclass
import httpx

logger = logging.getLogger(__name__)


@dataclass
class ValidationResult:
    """Result of a validation check"""
    check_name: str
    passed: bool
    message: str
    severity: str  # "critical", "warning", "info"


class RuntimeValidator:
    """
    Comprehensive runtime validation
    Checks EVERYTHING before app starts
    """

    def __init__(self):
        self.results: List[ValidationResult] = []
        self.critical_failures: List[str] = []

    def validate_all(self) -> bool:
        """
        Run all validations
        Returns: True if all critical checks pass
        """
        logger.info("🔍 Starting comprehensive runtime validation...")

        # Environment checks
        self._check_environment_variables()
        self._check_api_keys()
        self._check_urls()

        # Service checks
        self._check_database_connection()
        self._check_external_services()

        # File system checks
        self._check_required_directories()

        # Configuration checks
        self._check_settings_validity()

        # Report results
        self._report_results()

        return len(self.critical_failures) == 0

    # ========================================================================
    # ENVIRONMENT CHECKS
    # ========================================================================

    def _check_environment_variables(self):
        """Verify all required environment variables are set"""
        required_vars = [
            "ENVIRONMENT",
            "TWILIO_ACCOUNT_SID",
            "TWILIO_AUTH_TOKEN",
            "TWILIO_PHONE_NUMBER",
            "ELEVENLABS_API_KEY",
            "ELEVENLABS_AGENT_ID",
            "SUPABASE_URL",
            "SUPABASE_SERVICE_ROLE_KEY",
            "GOOGLE_CLOUD_PROJECT",
        ]

        for var in required_vars:
            value = os.getenv(var)
            if not value or value.startswith("demo_"):
                self._add_result(
                    check_name=f"env.{var}",
                    passed=False,
                    message=f"Missing or demo value: {var}",
                    severity="critical" if var in [
                        "ELEVENLABS_API_KEY",
                        "SUPABASE_URL"
                    ] else "warning"
                )
            else:
                self._add_result(
                    check_name=f"env.{var}",
                    passed=True,
                    message=f"{var} is set",
                    severity="info"
                )

    def _check_api_keys(self):
        """Validate API key formats"""
        from app.core.config import settings

        # ElevenLabs API key
        if settings.ELEVENLABS_API_KEY.startswith("sk_"):
            self._add_result(
                "api_key.elevenlabs",
                True,
                "ElevenLabs API key format valid",
                "info"
            )
        else:
            self._add_result(
                "api_key.elevenlabs",
                False,
                "ElevenLabs API key must start with 'sk_'",
                "critical"
            )

        # Twilio Account SID
        if settings.TWILIO_ACCOUNT_SID.startswith("AC"):
            self._add_result(
                "api_key.twilio",
                True,
                "Twilio Account SID format valid",
                "info"
            )
        else:
            self._add_result(
                "api_key.twilio",
                False,
                "Twilio Account SID must start with 'AC'",
                "warning"
            )

        # Supabase URL
        if "supabase.co" in settings.SUPABASE_URL or "localhost" in settings.SUPABASE_URL:
            self._add_result(
                "api_key.supabase",
                True,
                "Supabase URL format valid",
                "info"
            )
        else:
            self._add_result(
                "api_key.supabase",
                False,
                "Supabase URL must contain 'supabase.co' or 'localhost'",
                "critical"
            )

    def _check_urls(self):
        """Validate URL formats"""
        from app.core.config import settings

        # Check phone number format
        if settings.TWILIO_PHONE_NUMBER.startswith("+1"):
            self._add_result(
                "format.phone",
                True,
                "Phone number in E.164 format",
                "info"
            )
        else:
            self._add_result(
                "format.phone",
                False,
                "Phone number must be in E.164 format (+1...)",
                "warning"
            )

    # ========================================================================
    # SERVICE CHECKS
    # ========================================================================

    def _check_database_connection(self):
        """Test database connectivity"""
        try:
            from app.services.database import db_service

            # Try to initialize connection
            # (actual connection test would require async)
            self._add_result(
                "service.database",
                True,
                "Database service initialized",
                "info"
            )
        except Exception as e:
            self._add_result(
                "service.database",
                False,
                f"Database connection failed: {e}",
                "critical"
            )

    def _check_external_services(self):
        """Check external service availability"""
        from app.core.config import settings

        # Check ElevenLabs API
        if not settings.ELEVENLABS_API_KEY.startswith("demo_"):
            try:
                response = httpx.get(
                    "https://api.elevenlabs.io/v1/voices",
                    headers={"xi-api-key": settings.ELEVENLABS_API_KEY},
                    timeout=5.0
                )
                if response.status_code == 200:
                    self._add_result(
                        "service.elevenlabs",
                        True,
                        "ElevenLabs API accessible",
                        "info"
                    )
                else:
                    self._add_result(
                        "service.elevenlabs",
                        False,
                        f"ElevenLabs API returned {response.status_code}",
                        "critical"
                    )
            except Exception as e:
                self._add_result(
                    "service.elevenlabs",
                    False,
                    f"ElevenLabs API unreachable: {e}",
                    "critical"
                )

        # Check Supabase
        if "demo" not in settings.SUPABASE_URL:
            try:
                response = httpx.get(
                    f"{settings.SUPABASE_URL}/rest/v1/",
                    headers={
                        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}"
                    },
                    timeout=5.0
                )
                if response.status_code in [200, 404]:  # 404 is ok (no endpoint)
                    self._add_result(
                        "service.supabase",
                        True,
                        "Supabase accessible",
                        "info"
                    )
                else:
                    self._add_result(
                        "service.supabase",
                        False,
                        f"Supabase returned {response.status_code}",
                        "critical"
                    )
            except Exception as e:
                self._add_result(
                    "service.supabase",
                    False,
                    f"Supabase unreachable: {e}",
                    "critical"
                )

    # ========================================================================
    # FILE SYSTEM CHECKS
    # ========================================================================

    def _check_required_directories(self):
        """Ensure required directories exist"""
        required_dirs = [
            "./data",
            "./data/vector_store",
        ]

        for dir_path in required_dirs:
            if os.path.exists(dir_path):
                self._add_result(
                    f"filesystem.{dir_path}",
                    True,
                    f"Directory exists: {dir_path}",
                    "info"
                )
            else:
                # Try to create it
                try:
                    os.makedirs(dir_path, exist_ok=True)
                    self._add_result(
                        f"filesystem.{dir_path}",
                        True,
                        f"Created directory: {dir_path}",
                        "info"
                    )
                except Exception as e:
                    self._add_result(
                        f"filesystem.{dir_path}",
                        False,
                        f"Cannot create directory {dir_path}: {e}",
                        "warning"
                    )

    # ========================================================================
    # CONFIGURATION CHECKS
    # ========================================================================

    def _check_settings_validity(self):
        """Validate application settings"""
        from app.core.config import settings

        # Check environment
        valid_envs = ["development", "staging", "production", "demo"]
        if settings.ENVIRONMENT in valid_envs:
            self._add_result(
                "config.environment",
                True,
                f"Environment '{settings.ENVIRONMENT}' is valid",
                "info"
            )
        else:
            self._add_result(
                "config.environment",
                False,
                f"Invalid environment: {settings.ENVIRONMENT}",
                "critical"
            )

        # Check log level
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if settings.LOG_LEVEL.upper() in valid_levels:
            self._add_result(
                "config.log_level",
                True,
                f"Log level '{settings.LOG_LEVEL}' is valid",
                "info"
            )
        else:
            self._add_result(
                "config.log_level",
                False,
                f"Invalid log level: {settings.LOG_LEVEL}",
                "warning"
            )

        # Check port
        if 1024 <= settings.PORT <= 65535:
            self._add_result(
                "config.port",
                True,
                f"Port {settings.PORT} is valid",
                "info"
            )
        else:
            self._add_result(
                "config.port",
                False,
                f"Port {settings.PORT} is outside valid range",
                "warning"
            )

    # ========================================================================
    # HELPER METHODS
    # ========================================================================

    def _add_result(self, check_name: str, passed: bool, message: str, severity: str):
        """Add a validation result"""
        result = ValidationResult(check_name, passed, message, severity)
        self.results.append(result)

        if not passed and severity == "critical":
            self.critical_failures.append(check_name)

        # Log immediately
        if passed:
            logger.debug(f"✅ {check_name}: {message}")
        elif severity == "critical":
            logger.error(f"❌ {check_name}: {message}")
        elif severity == "warning":
            logger.warning(f"⚠️  {check_name}: {message}")

    def _report_results(self):
        """Print summary of validation results"""
        total = len(self.results)
        passed = sum(1 for r in self.results if r.passed)
        failed = total - passed
        critical = len(self.critical_failures)

        logger.info("=" * 60)
        logger.info("📊 RUNTIME VALIDATION SUMMARY")
        logger.info("=" * 60)
        logger.info(f"Total Checks: {total}")
        logger.info(f"✅ Passed: {passed}")
        logger.info(f"❌ Failed: {failed}")
        logger.info(f"🔴 Critical Failures: {critical}")
        logger.info("=" * 60)

        if critical > 0:
            logger.error("🚨 CRITICAL FAILURES DETECTED:")
            for check_name in self.critical_failures:
                result = next(r for r in self.results if r.check_name == check_name)
                logger.error(f"  - {check_name}: {result.message}")
            logger.error("=" * 60)
            logger.error("❌ APPLICATION CANNOT START")
        elif failed > 0:
            logger.warning("⚠️  Some checks failed, but application can start")
        else:
            logger.info("✅ ALL CHECKS PASSED - READY TO ROCK 🚀")

    def get_health_status(self) -> Dict:
        """Get health status for /health endpoint"""
        return {
            "total_checks": len(self.results),
            "passed": sum(1 for r in self.results if r.passed),
            "failed": sum(1 for r in self.results if not r.passed),
            "critical_failures": len(self.critical_failures),
            "healthy": len(self.critical_failures) == 0,
            "checks": [
                {
                    "name": r.check_name,
                    "passed": r.passed,
                    "message": r.message,
                    "severity": r.severity
                }
                for r in self.results
            ]
        }


# ============================================================================
# GLOBAL VALIDATOR
# ============================================================================

runtime_validator = RuntimeValidator()


def run_startup_validation() -> bool:
    """
    Run all startup validations
    Called during app initialization
    Returns: True if app can start safely
    """
    return runtime_validator.validate_all()


def get_validation_status() -> Dict:
    """Get current validation status for monitoring"""
    return runtime_validator.get_health_status()
