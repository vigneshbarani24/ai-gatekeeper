"""
AI Gatekeeper: FastAPI Application Entry Point
Production-ready call screening system with Google Cloud + ElevenLabs
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.routers import telephony_optimized as telephony, webhooks, contacts, calls, analytics, elevenlabs_tools, realtime
from app.services.database import init_database
from app.services.vector_store import init_vector_store

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("🚀 Starting AI Gatekeeper...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Twilio Number: {settings.TWILIO_PHONE_NUMBER}")

    # CRITICAL: Run comprehensive runtime validation
    logger.info("🔍 Running runtime validation checks...")
    from app.core.runtime_checks import run_startup_validation

    validation_passed = run_startup_validation()

    if not validation_passed:
        logger.error("❌ RUNTIME VALIDATION FAILED")
        if settings.is_production():
            raise RuntimeError("Critical validation failures - cannot start in production")
        else:
            logger.warning("⚠️  Continuing in development mode despite validation failures")

    # Initialize database connection
    logger.info("📊 Initializing database...")
    await init_database()

    # Initialize vector store for scam detection
    if settings.ENABLE_SCAM_DETECTION:
        logger.info("🔍 Initializing scam detection vector store...")
        await init_vector_store()

    logger.info("✅ AI Gatekeeper started successfully!")

    yield

    # Shutdown
    logger.info("🛑 Shutting down AI Gatekeeper...")


# Create FastAPI application
app = FastAPI(
    title="AI Gatekeeper",
    description="Voice-cloned call screening with scam detection",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.is_development() else None,  # Hide in production
    redoc_url="/redoc" if settings.is_development() else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Comprehensive health check with runtime validation status
    Used by load balancers and monitoring systems
    """
    from app.core.runtime_checks import get_validation_status

    validation_status = get_validation_status()

    return {
        "status": "healthy" if validation_status["healthy"] else "degraded",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0",
        "validation": {
            "total_checks": validation_status["total_checks"],
            "passed": validation_status["passed"],
            "failed": validation_status["failed"],
            "critical_failures": validation_status["critical_failures"],
        },
        "details": validation_status["checks"] if settings.DEBUG else []
    }


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "AI Gatekeeper API",
        "version": "1.0.0",
        "description": "Voice-cloned call screening with scam detection",
        "docs": "/docs" if settings.is_development() else "Contact support for API documentation",
        "health": "/health"
    }


# Include routers
app.include_router(
    telephony.router,
    tags=["Telephony"],
)

app.include_router(
    webhooks.router,
    prefix="/webhooks",
    tags=["Webhooks"],
)

app.include_router(
    contacts.router,
    prefix="/api/contacts",
    tags=["Contacts"],
)

app.include_router(
    calls.router,
    prefix="/api/calls",
    tags=["Calls"],
)

app.include_router(
    analytics.router,
    prefix="/api/analytics",
    tags=["Analytics"],
)

app.include_router(
    elevenlabs_tools.router,
    prefix="/api",
    tags=["ElevenLabs Tools"],
)

app.include_router(
    realtime.router,
    tags=["Realtime"],
)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.is_development(),
        log_level=settings.LOG_LEVEL.lower(),
    )
