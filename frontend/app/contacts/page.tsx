'use client';

import { ArrowLeft, UserPlus, Phone, Mail, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ContactsPage() {
  const contacts = [
    { id: '1', name: 'Mom', phone: '+1 (555) 234-5678', email: 'mom@email.com' },
    { id: '2', name: 'Dad', phone: '+1 (555) 234-5679', email: 'dad@email.com' },
    { id: '3', name: 'Sarah', phone: '+1 (555) 345-6789', email: 'sarah@email.com' },
    { id: '4', name: 'Doctor Office', phone: '+1 (555) 456-7890', email: 'office@clinic.com' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', color: 'white' }}>
      {/* Navigation */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#9ca3af' }}>
              <ArrowLeft size={20} />
              <span style={{ fontWeight: 600 }}>Back</span>
            </Link>

            <span style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>Trusted Contacts</span>

            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              <UserPlus size={18} />
              Add
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
        <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
          Contacts on this list will always be connected directly to you, bypassing AI screening.
        </p>

        {/* Contact Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {contacts.map((contact) => (
            <div
              key={contact.id}
              style={{
                padding: '24px',
                borderRadius: '20px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 700
                }}>
                  {contact.name[0]}
                </div>
                <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '8px' }}>
                  <Trash2 size={18} />
                </button>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>{contact.name}</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#9ca3af', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={14} />
                  <span>{contact.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={14} />
                  <span>{contact.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
