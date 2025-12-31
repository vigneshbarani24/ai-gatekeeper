'use client';

/**
 * AI Gatekeeper Contacts Page
 * Professional trusted contacts management
 */

import { motion } from 'framer-motion';
import { Shield, ArrowLeft, UserPlus, Phone, Mail, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { useState } from 'react';

export default function ContactsPage() {
  const [contacts] = useState([
    { id: '1', name: 'Mom', phone: '+1 (555) 234-5678', email: 'mom@example.com' },
    { id: '2', name: 'Dad', phone: '+1 (555) 234-5679', email: 'dad@example.com' },
    { id: '3', name: 'Best Friend', phone: '+1 (555) 345-6789', email: 'friend@example.com' },
  ]);

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

          <h1 className="text-2xl font-black text-white">Trusted Contacts</h1>

          <Button variant="primary" size="sm" icon={<UserPlus size={18} />}>
            Add
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <p className="text-gray-400 font-semibold mb-8 text-center max-w-2xl mx-auto">
          Contacts on this list will always be connected directly to you, bypassing the AI screening.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="glass" padding="md">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                    <span className="text-xl font-bold">{contact.name[0]}</span>
                  </div>
                  <button className="text-gray-600 hover:text-rose-400 transition-colors p-2">
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-white mb-4">{contact.name}</h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Phone size={14} />
                    <span>{contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail size={14} />
                    <span>{contact.email}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
