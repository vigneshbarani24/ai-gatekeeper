'use client';

/**
 * AI Gatekeeper Settings Page
 * Professional settings and configuration
 */

import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Bell, Lock, Mic, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={18} />}>
              Back
            </Button>
          </Link>

          <h1 className="text-2xl font-black text-white">Settings</h1>

          <div className="w-20" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-8 py-12">
        <div className="space-y-6">
          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="glass" padding="md">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                  <User size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Profile</h3>
                  <p className="text-sm text-gray-500">Manage your account settings</p>
                </div>
              </div>
              <Button variant="secondary" fullWidth>
                Edit Profile
              </Button>
            </Card>
          </motion.div>

          {/* AI Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass" padding="md">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/10">
                  <Mic size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">AI Voice</h3>
                  <p className="text-sm text-gray-500">Customize your AI assistant's voice and personality</p>
                </div>
              </div>
              <Link href="/dashboard">
                <Button variant="primary" fullWidth>
                  Configure AI
                </Button>
              </Link>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass" padding="md">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                  <Bell size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Notifications</h3>
                  <p className="text-sm text-gray-500">Control how you receive alerts</p>
                </div>
              </div>
              <Button variant="secondary" fullWidth>
                Manage Notifications
              </Button>
            </Card>
          </motion.div>

          {/* Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="glass" padding="md">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/10">
                  <Lock size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Privacy & Security</h3>
                  <p className="text-sm text-gray-500">Manage your data and security preferences</p>
                </div>
              </div>
              <Button variant="secondary" fullWidth>
                Privacy Settings
              </Button>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
