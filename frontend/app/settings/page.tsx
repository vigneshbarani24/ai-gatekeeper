'use client';

/**
 * AI Gatekeeper - Settings Page
 * Manage voice, preferences, whitelist
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Shield,
  ChevronLeft,
  Mic,
  Phone,
  Bell,
  Moon,
  Globe,
  Lock,
  Trash2,
  Check,
  X,
  Volume2,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Friend');
  const [userPhone, setUserPhone] = useState('');
  const [hasVoice, setHasVoice] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoPass, setAutoPass] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('userName') || 'Friend';
    const savedPhone = localStorage.getItem('userPhone') || '';
    setUserName(savedName);
    setUserPhone(savedPhone);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    localStorage.setItem('userName', userName);
    if (userPhone) {
      localStorage.setItem('userPhone', userPhone);
    }

    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleResetOnboarding = () => {
    if (confirm('Reset onboarding? You\'ll see the welcome flow again.')) {
      localStorage.removeItem('hasOnboarded');
      router.push('/welcome');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>

          <h1 className="text-xl font-bold text-gray-900">Settings</h1>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Save size={24} className="text-blue-500" />
              </motion.div>
            ) : (
              <Save size={24} className="text-gray-700" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Profile Section */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Shield size={40} className="text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{userName}</h2>
                <p className="text-gray-600">Protected since Dec 2025</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Voice Section */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3 px-2">Voice Clone</h3>
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Mic size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Your Voice</h4>
                {hasVoice ? (
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span className="text-sm text-gray-600">Voice clone active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <X size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">No voice clone yet</span>
                  </div>
                )}
              </div>
            </div>

            <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <Volume2 size={20} />
              {hasVoice ? 'Re-record Voice' : 'Record Your Voice'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              30-second recording needed for voice cloning
            </p>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3 px-2">Preferences</h3>
          <div className="bg-white rounded-3xl shadow-lg divide-y divide-gray-100">
            <ToggleSetting
              icon={Bell}
              title="Notifications"
              description="Get notified when calls are screened"
              enabled={notifications}
              onToggle={setNotifications}
              color="from-blue-400 to-blue-500"
            />
            <ToggleSetting
              icon={Phone}
              title="Auto-pass Whitelist"
              description="Immediately connect whitelisted callers"
              enabled={autoPass}
              onToggle={setAutoPass}
              color="from-green-400 to-green-500"
            />
          </div>
        </motion.div>

        {/* Advanced */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3 px-2">Advanced</h3>
          <div className="bg-white rounded-3xl shadow-lg divide-y divide-gray-100">
            <SettingButton
              icon={Globe}
              title="Language"
              subtitle="English (US)"
              onClick={() => {}}
            />
            <SettingButton
              icon={Lock}
              title="Privacy & Security"
              subtitle="Manage your data"
              onClick={() => {}}
            />
            <SettingButton
              icon={Trash2}
              title="Reset Onboarding"
              subtitle="See welcome screens again"
              onClick={handleResetOnboarding}
              danger
            />
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          className="text-center text-sm text-gray-500 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="mb-1">AI Gatekeeper v1.0</p>
          <p>Made with ❤️ for AI Partner Catalyst 2025</p>
        </motion.div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-around">
          <NavButton icon={Shield} label="Dashboard" onClick={() => router.push('/dashboard')} />
          <NavButton icon={Phone} label="Calls" onClick={() => router.push('/calls')} />
          <NavButton icon={Phone} label="Contacts" onClick={() => router.push('/contacts')} />
          <NavButton icon={Lock} label="Settings" active />
        </div>
      </nav>
    </div>
  );
}

// ============================================================================
// Components
// ============================================================================

function ToggleSetting({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
  color,
}: {
  icon: any;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  color: string;
}) {
  return (
    <div className="p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon size={24} className="text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={`w-12 h-7 rounded-full transition-colors ${
          enabled ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      >
        <motion.div
          className="w-5 h-5 bg-white rounded-full shadow-md"
          animate={{ x: enabled ? 26 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

function SettingButton({
  icon: Icon,
  title,
  subtitle,
  onClick,
  danger = false,
}: {
  icon: any;
  title: string;
  subtitle: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
    >
      <div className={`w-12 h-12 rounded-2xl ${
        danger ? 'bg-red-100' : 'bg-gray-100'
      } flex items-center justify-center flex-shrink-0`}>
        <Icon size={24} className={danger ? 'text-red-500' : 'text-gray-600'} />
      </div>
      <div className="flex-1 text-left">
        <h4 className={`font-semibold ${danger ? 'text-red-600' : 'text-gray-900'}`}>
          {title}
        </h4>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      <ChevronLeft size={20} className="text-gray-400 rotate-180" />
    </button>
  );
}

function NavButton({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
        active
          ? 'text-blue-500 bg-blue-50'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      <Icon size={24} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
