'use client';

/**
 * AI Gatekeeper - Stellar Welcome Screen
 * LIGHT & MODERN - Inspired by best-in-class onboarding UX
 *
 * Goals:
 * 1. Personalized greeting
 * 2. Immediate AHA moment (show value)
 * 3. Progressive disclosure
 * 4. Beautiful animations
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Clock,
  Phone,
  TrendingUp,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Lock
} from 'lucide-react';

type OnboardingStep = 'welcome' | 'value' | 'features' | 'setup';

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [userName, setUserName] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Load user name from storage or use smart default
    const savedName = localStorage.getItem('userName') || 'Friend';
    setUserName(savedName);
  }, [router]);

  const completeOnboarding = () => {
    localStorage.setItem('hasOnboarded', 'true');
    router.push('/dashboard');
  };

  const skipToEnd = () => {
    // Allow skipping entire flow - zero friction!
    completeOnboarding();
  };

  const nextStep = () => {
    if (step === 'welcome') setStep('value');
    else if (step === 'value') setStep('features');
    else if (step === 'features') setStep('setup');
    else completeOnboarding();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-surface">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary-hover"
            initial={{ width: '0%' }}
            animate={{
              width:
                step === 'welcome'
                  ? '25%'
                  : step === 'value'
                    ? '50%'
                    : step === 'features'
                      ? '75%'
                      : '100%',
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <WelcomeStep key="welcome" userName={userName} onNext={nextStep} onSkip={skipToEnd} />
        )}
        {step === 'value' && <ValueStep key="value" onNext={nextStep} onSkip={skipToEnd} />}
        {step === 'features' && <FeaturesStep key="features" onNext={nextStep} onSkip={skipToEnd} />}
        {step === 'setup' && (
          <SetupStep key="setup" onComplete={completeOnboarding} onSkip={skipToEnd} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// STEP 1: WELCOME - The Orb Is The Hero
// ============================================================================

function WelcomeStep({ userName, onNext, onSkip }: { userName: string; onNext: () => void; onSkip: () => void }) {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
    >
      {/* Skip Button - Top Right */}
      <motion.button
        onClick={onSkip}
        className="absolute top-8 right-8 text-gray-400 hover:text-white transition-colors text-sm font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Skip
      </motion.button>

      {/* HERO: The Orb - Massive and Beautiful */}
      <motion.div
        className="mb-12"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, type: 'spring', bounce: 0.4 }}
      >
        <div className="relative">
          {/* Outer Glow Rings */}
          <motion.div
            className="absolute inset-0 w-48 h-48 -translate-x-8 -translate-y-8"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 blur-2xl" />
          </motion.div>

          {/* Main Orb - HUGE */}
          <motion.div
            className="relative w-40 h-40 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl"
            animate={{
              boxShadow: [
                '0 20px 80px rgba(59, 130, 246, 0.5)',
                '0 30px 100px rgba(147, 51, 234, 0.6)',
                '0 20px 80px rgba(59, 130, 246, 0.5)',
              ],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Inner Glow */}
            <motion.div
              className="absolute inset-4 bg-gradient-to-br from-white/40 to-transparent rounded-full"
              animate={{ opacity: [0.6, 0.3, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <Shield size={80} className="text-white relative z-10" strokeWidth={2} />
          </motion.div>

          {/* Floating Sparkles Around Orb */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${50 + 60 * Math.cos((i * Math.PI * 2) / 6)}%`,
                top: `${50 + 60 * Math.sin((i * Math.PI * 2) / 6)}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2 + i * 0.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles size={20} className="text-yellow-400" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Greeting */}
      <motion.div
        className="text-center max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-white mb-3">
          Hi {userName},
        </h1>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent mb-6">
          Your Voice. Your Ears. Your Independence.
        </h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          The first AI that gives deaf and speech-impaired people FULL phone independence—speaking in YOUR cloned voice.
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        onClick={onNext}
        className="mt-12 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        See What's Possible
        <ChevronRight size={24} />
      </motion.button>
    </motion.div>
  );
}

// ============================================================================
// STEP 2: VALUE - The AHA Moment
// ============================================================================

function ValueStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const modes = [
    {
      title: '🦻 Accessibility Mode',
      subtitle: 'Voice & Ears for the Deaf',
      tam: '473M+ people worldwide',
      features: [
        '466M with hearing loss (WHO)',
        '7.6M with speech disabilities',
        'You type - AI speaks in YOUR voice',
        'ZERO good solutions exist today'
      ],
      color: 'from-blue-500 to-purple-600',
      highlight: true,
    },
    {
      title: '🛡️ Gatekeeper Mode',
      subtitle: 'For Busy People',
      tam: '3.5B+ smartphone users',
      features: [
        'AI answers calls you miss',
        '$3.4B lost to scams annually',
        'Handles appointments & confirmations',
        'Never miss job offers or opportunities'
      ],
      color: 'from-purple-500 to-pink-500',
      highlight: false,
    },
  ];

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
    >
      {/* Skip Button */}
      <button
        onClick={onSkip}
        className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
      >
        Skip
      </button>
      <motion.div
        className="text-center max-w-2xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          Two Life-Changing Modes
        </h2>
        <p className="text-xl text-gray-400 mb-12">
          Accessibility for those who need it. Assistance for everyone else.
        </p>
      </motion.div>

      {/* Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mb-12">
        {modes.map((mode, index) => (
          <motion.div
            key={mode.title}
            className={`glass-card rounded-3xl p-6 hover:shadow-card-hover transition-all relative overflow-hidden ${mode.highlight ? 'ring-2 ring-primary' : ''
              }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.2 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            {/* Highlight Badge */}
            {mode.highlight && (
              <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full">
                PRIMARY
              </div>
            )}

            {/* Header */}
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-white mb-1">{mode.title}</h3>
              <p className="text-sm text-gray-400 mb-2">{mode.subtitle}</p>
              <div className={`inline-block px-3 py-1 bg-gradient-to-r ${mode.color} text-white text-xs font-bold rounded-full`}>
                TAM: {mode.tam}
              </div>
            </div>

            {/* Features List */}
            <ul className="space-y-3">
              {mode.features.map((feature, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-300"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.2 + i * 0.1 }}
                >
                  <CheckCircle2 size={16} className="text-success flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.button
        onClick={onNext}
        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        See How It Works
        <ChevronRight size={24} />
      </motion.button>
    </motion.div>
  );
}

// ============================================================================
// STEP 3: FEATURES - Progressive Disclosure
// ============================================================================

function FeaturesStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const features = [
    {
      title: 'Voice Cloning',
      description: 'AI speaks in YOUR voice, creating trust with legitimate callers',
      icon: '🎙️',
      unlocked: true,
    },
    {
      title: 'Scam Detection',
      description: '99% accuracy blocking IRS scams, tech support, and more',
      icon: '🛡️',
      unlocked: true,
    },
    {
      title: 'Smart Screening',
      description: 'Auto-pass family & friends, screen everyone else',
      icon: '📞',
      unlocked: true,
    },
    {
      title: 'Call Analytics',
      description: 'See time saved, scams blocked, and call trends',
      icon: '📊',
      unlocked: false,
      comingSoon: true,
    },
    {
      title: 'Calendar Integration',
      description: 'AI schedules meetings for you automatically',
      icon: '📅',
      unlocked: false,
      comingSoon: true,
    },
  ];

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
    >
      {/* Skip Button */}
      <button
        onClick={onSkip}
        className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
      >
        Skip
      </button>
      <motion.div
        className="text-center max-w-2xl mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          Your Protection Journey
        </h2>
        <p className="text-xl text-gray-400">
          Start with essentials, unlock more as you go
        </p>
      </motion.div>

      {/* Features List */}
      <div className="w-full max-w-2xl space-y-4 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className={`glass-card rounded-3xl p-6 transition-all ${feature.unlocked
              ? 'hover:shadow-card-hover'
              : 'opacity-75'
              }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={feature.unlocked ? { scale: 1.02 } : {}}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="text-4xl flex-shrink-0">{feature.icon}</div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-white">
                    {feature.title}
                  </h3>
                  {feature.unlocked ? (
                    <CheckCircle2 size={20} className="text-success" />
                  ) : (
                    <Lock size={20} className="text-gray-500" />
                  )}
                  {feature.comingSoon && (
                    <span className="px-2 py-1 bg-warning/20 text-warning text-xs font-semibold rounded-full">
                      SOON
                    </span>
                  )}
                </div>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.button
        onClick={onNext}
        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Let's Get Started
        <ChevronRight size={24} />
      </motion.button>
    </motion.div>
  );
}

// ============================================================================
// STEP 4: SETUP - Quick Configuration (Zero Friction)
// ============================================================================

function SetupStep({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  // Smart defaults - pre-filled!
  const [name, setName] = useState('Friend');
  const [phone, setPhone] = useState('');

  const handleComplete = () => {
    // Save whatever they entered (even defaults)
    localStorage.setItem('userName', name);
    if (phone) {
      localStorage.setItem('userPhone', phone);
    }
    onComplete();
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
    >
      {/* Skip Button */}
      <button
        onClick={onSkip}
        className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
      >
        Skip for now
      </button>

      <motion.div
        className="glass-card rounded-3xl p-8 shadow-2xl max-w-md w-full"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center">
            <Sparkles size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Personalize Your Guardian
          </h2>
          <p className="text-gray-400">
            We've set smart defaults - just tap Continue or customize
          </p>
        </div>

        {/* Form - Pre-filled with defaults */}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-300 mb-2"
            >
              What should we call you?
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Friend"
              className="w-full px-4 py-3 bg-surface border-2 border-surface-light rounded-xl focus:border-primary focus:outline-none transition-colors text-white"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-300 mb-2"
            >
              Your phone number <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 bg-surface border-2 border-surface-light rounded-xl focus:border-primary focus:outline-none transition-colors text-white"
            />
            <p className="mt-2 text-xs text-gray-500">
              For forwarding legitimate calls
            </p>
          </div>
        </div>

        {/* Primary CTA - Always enabled */}
        <motion.button
          onClick={handleComplete}
          className="mt-8 w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Start Protecting My Time
          <ChevronRight size={24} />
        </motion.button>

        {/* Secondary Skip Option */}
        <button
          onClick={onSkip}
          className="mt-4 w-full text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
        >
          I'll set this up later
        </button>

        <p className="mt-6 text-center text-xs text-gray-400">
          Change these anytime in settings
        </p>
      </motion.div>
    </motion.div>
  );
}
