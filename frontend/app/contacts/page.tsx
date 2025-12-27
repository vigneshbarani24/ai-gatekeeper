'use client';

/**
 * AI Gatekeeper - Contacts/Whitelist Page
 * Manage trusted contacts who get auto-passed
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Shield,
  ChevronLeft,
  Phone,
  UserPlus,
  CheckCircle,
  Trash2,
  Search,
  Lock,
  Heart,
  Star,
} from 'lucide-react';

type Contact = {
  id: string;
  name: string;
  phone: string;
  relationship: 'family' | 'friend' | 'work' | 'other';
  added: string;
};

export default function ContactsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Demo contacts
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Mom',
      phone: '+1 (555) 123-4567',
      relationship: 'family',
      added: '2025-12-20',
    },
    {
      id: '2',
      name: 'Dad',
      phone: '+1 (555) 234-5678',
      relationship: 'family',
      added: '2025-12-20',
    },
    {
      id: '3',
      name: 'Best Friend Sarah',
      phone: '+1 (555) 345-6789',
      relationship: 'friend',
      added: '2025-12-21',
    },
    {
      id: '4',
      name: 'Dr. Smith (Dentist)',
      phone: '+1 (555) 456-7890',
      relationship: 'other',
      added: '2025-12-22',
    },
    {
      id: '5',
      name: 'Boss - John',
      phone: '+1 (555) 567-8901',
      relationship: 'work',
      added: '2025-12-23',
    },
  ]);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
  );

  const handleDelete = (id: string) => {
    if (confirm('Remove from whitelist? They\'ll be screened on next call.')) {
      setContacts(contacts.filter((c) => c.id !== id));
    }
  };

  const getRelationshipIcon = (relationship: Contact['relationship']) => {
    switch (relationship) {
      case 'family':
        return <Heart size={16} className="text-red-500" />;
      case 'friend':
        return <Star size={16} className="text-yellow-500" />;
      case 'work':
        return <Phone size={16} className="text-blue-500" />;
      default:
        return <CheckCircle size={16} className="text-gray-500" />;
    }
  };

  const getRelationshipColor = (relationship: Contact['relationship']) => {
    switch (relationship) {
      case 'family':
        return 'from-red-400 to-red-500';
      case 'friend':
        return 'from-yellow-400 to-yellow-500';
      case 'work':
        return 'from-blue-400 to-blue-500';
      default:
        return 'from-gray-400 to-gray-500';
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

          <h1 className="text-xl font-bold text-gray-900">Whitelist</h1>

          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <UserPlus size={24} className="text-blue-500" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Info Banner */}
        <motion.div
          className="mb-6 bg-blue-100 border border-blue-200 rounded-2xl p-4 flex items-start gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CheckCircle size={24} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Privacy First</h3>
            <p className="text-sm text-blue-700">
              These contacts ring through to you directly. Everyone else goes to your AI if you don't pick up.
            </p>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
            />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mb-6 grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            label="Family"
            value={contacts.filter((c) => c.relationship === 'family').length}
            color="bg-red-100 text-red-700"
          />
          <StatCard
            label="Friends"
            value={contacts.filter((c) => c.relationship === 'friend').length}
            color="bg-yellow-100 text-yellow-700"
          />
          <StatCard
            label="Work"
            value={contacts.filter((c) => c.relationship === 'work').length}
            color="bg-blue-100 text-blue-700"
          />
        </motion.div>

        {/* Contacts List */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-gray-600 px-2 mb-2">
            {filteredContacts.length} Contact{filteredContacts.length !== 1 ? 's' : ''}
          </h3>

          <AnimatePresence mode="popLayout">
            {filteredContacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getRelationshipColor(
                      contact.relationship
                    )} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white text-xl font-bold">
                      {contact.name[0].toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {contact.name}
                      </h4>
                      {getRelationshipIcon(contact.relationship)}
                    </div>
                    <p className="text-sm text-gray-600">{contact.phone}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Added {new Date(contact.added).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} className="text-red-500" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No matches</h3>
              <p className="text-gray-600">Try a different search term</p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddContactModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-around">
          <NavButton icon={Shield} label="Dashboard" onClick={() => router.push('/dashboard')} />
          <NavButton icon={Phone} label="Calls" onClick={() => router.push('/calls')} />
          <NavButton icon={UserPlus} label="Contacts" active />
          <NavButton icon={Lock} label="Settings" onClick={() => router.push('/settings')} />
        </div>
      </nav>
    </div>
  );
}

// ============================================================================
// Components
// ============================================================================

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`${color} rounded-2xl p-3 text-center`}>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs font-semibold">{label}</div>
    </div>
  );
}

function AddContactModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState<Contact['relationship']>('other');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add to contacts list
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl p-6 w-full max-w-md"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Contact</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mom, Sarah, Dr. Smith..."
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Relationship
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'family', label: 'Family', icon: '❤️' },
                { value: 'friend', label: 'Friend', icon: '⭐' },
                { value: 'work', label: 'Work', icon: '💼' },
                { value: 'other', label: 'Other', icon: '👤' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRelationship(option.value as Contact['relationship'])}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    relationship === option.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Add to Whitelist
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
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
