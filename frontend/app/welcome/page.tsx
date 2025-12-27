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
    // Check if user already onboarded
    const hasOnboarded = localStorage.getItem('hasOnboarded');
    if (hasOnboarded === 'true') {
      router.push('/dashboard');
    }

    // Load user name from storage or use default
    const savedName = localStorage.getItem('userName') || 'there';
    setUserName(savedName);
  }, [router]);

  const completeOnboarding = () => {
    localStorage.setItem('hasOnboarded', 'true');
    router.push('/dashboard');
  };

  const nextStep = () => {
    if (step === 'welcome') setStep('value');
    else if (step === 'value') setStep('features');
    else if (step === 'features') setStep('setup');
    else completeOnboarding();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
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
          <WelcomeStep key="welcome" userName={userName} onNext={nextStep} />
        )}
        {step === 'value' && <ValueStep key="value" onNext={nextStep} />}
        {step === 'features' && <FeaturesStep key="features" onNext={nextStep} />}
        {step === 'setup' && (
          <SetupStep key="setup" onComplete={completeOnboarding} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// STEP 1: WELCOME - Personalized Greeting
// ============================================================================

function WelcomeStep({ userName, onNext }: { userName: string; onNext: () => void }) {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Animation */}
      <motion.div
        className="mb-8"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="relative">
          {/* Animated Shield */}
          <motion.div
            className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl"
            animate={{
              boxShadow: [
                '0 20px 60px rgba(59, 130, 246, 0.3)',
                '0 25px 70px rgba(147, 51, 234, 0.4)',
                '0 20px 60px rgba(59, 130, 246, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Shield size={64} className="text-white" strokeWidth={2} />
          </motion.div>

          {/* Sparkles */}
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles size={24} className="text-yellow-500" />
          </motion.div>
        </div>
      </motion.div>

      {/* Greeting */}
      <motion.div
        className="text-center max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Hi {userName},
        </h1>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          Your Guardian Is Ready
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          AI Gatekeeper screens your calls, blocks scams, and protects your time—all
          in your own voice.
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        onClick={onNext}
        className="mt-12 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
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

function ValueStep({ onNext }: { onNext: () => void }) {
  const stats = [
    {
      label: 'Time Saved',
      value: '45 min',
      subtext: 'Weekly average',
      color: 'from-orange-400 to-orange-500',
      icon: Clock,
    },
    {
      label: 'Scams Blocked',
      value: '12',
      subtext: 'This month',
      color: 'from-red-400 to-red-500',
      icon: Shield,
    },
    {
      label: 'Calls Screened',
      value: '89',
      subtext: 'Automatically',
      color: 'from-blue-400 to-blue-500',
      icon: Phone,
    },
    {
      label: 'Peace of Mind',
      value: '100%',
      subtext: 'Priceless',
      color: 'from-green-400 to-green-500',
      icon: TrendingUp,
    },
  ];

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="text-center max-w-2xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Imagine This
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          Real results from users like you
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full mb-12">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}
              >
                <stat.icon size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500">{stat.subtext}</div>
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
        See How It Works
        <ChevronRight size={24} />
      </motion.button>
    </motion.div>
  );
}

// ============================================================================
// STEP 3: FEATURES - Progressive Disclosure
// ============================================================================

function FeaturesStep({ onNext }: { onNext: () => void }) {
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
      className="min-h-screen flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="text-center max-w-2xl mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Your Protection Journey
        </h2>
        <p className="text-xl text-gray-600">
          Start with essentials, unlock more as you go
        </p>
      </motion.div>

      {/* Features List */}
      <div className="w-full max-w-2xl space-y-4 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className={`bg-white rounded-3xl p-6 shadow-lg transition-all ${
              feature.unlocked
                ? 'hover:shadow-xl'
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
                  <h3 className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  {feature.unlocked ? (
                    <CheckCircle2 size={20} className="text-green-500" />
                  ) : (
                    <Lock size={20} className="text-gray-400" />
                  )}
                  {feature.comingSoon && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">
                      SOON
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{feature.description}</p>
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
// STEP 4: SETUP - Quick Configuration
// ============================================================================

function SetupStep({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleComplete = () => {
    if (name) {
      localStorage.setItem('userName', name);
    }
    if (phone) {
      localStorage.setItem('userPhone', phone);
    }
    onComplete();
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <Sparkles size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Almost There!
          </h2>
          <p className="text-gray-600">
            Just a few details to personalize your experience
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              What should we call you?
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sarah"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Your phone number (optional)
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
            />
            <p className="mt-2 text-xs text-gray-500">
              We'll use this to forward legitimate calls
            </p>
          </div>
        </div>

        {/* CTA */}
        <motion.button
          onClick={handleComplete}
          disabled={!name}
          className="mt-8 w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          whileHover={name ? { scale: 1.02 } : {}}
          whileTap={name ? { scale: 0.98 } : {}}
        >
          Start Protecting My Time
          <ChevronRight size={24} />
        </motion.button>

        <p className="mt-6 text-center text-xs text-gray-500">
          You can change these settings anytime
        </p>
      </motion.div>
    </motion.div>
  );
}
