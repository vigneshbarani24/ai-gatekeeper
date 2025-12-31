'use client';

import { ArrowLeft, Phone, Ban, CheckCircle, Heart, Activity, Shield, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function CallsPage() {
  const [filter, setFilter] = useState('all');

  const calls = [
    { id: '1', number: '+1 (555) 123-4567', type: 'Scam - IRS', time: '2 min ago', blocked: true },
    { id: '2', number: '+1 (555) 234-5678', type: 'Family - Mom', time: '15 min ago', blocked: false },
    { id: '3', number: '+1 (555) 345-6789', type: 'Car Warranty', time: '1 hour ago', blocked: true },
    { id: '4', number: '+1 (555) 456-7890', type: 'Doctor Office', time: '2 hours ago', blocked: false },
    { id: '5', number: '+1 (555) 567-8901', type: 'Robocall', time: '3 hours ago', blocked: true },
  ];

  const filteredCalls = filter === 'all' ? calls : calls.filter(c => filter === 'blocked' ? c.blocked : !c.blocked);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', color: 'white', paddingBottom: '100px' }}>
      {/* Header */}
      <header style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/home">
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ArrowLeft size={20} color="white" />
          </div>
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Calls</h1>
        </div>
      </header>

      {/* Filters */}
      <section style={{ padding: '0 24px 24px', display: 'flex', gap: '12px' }}>
        {['all', 'blocked', 'passed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'capitalize',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: filter === f ? '#f97316' : 'rgba(255,255,255,0.05)',
              color: filter === f ? 'white' : '#6b7280',
              transition: 'all 0.2s'
            }}
          >
            {f}
          </button>
        ))}
      </section>

      {/* Summary */}
      <section style={{ padding: '0 24px 24px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{
            flex: 1,
            padding: '20px',
            borderRadius: '20px',
            backgroundColor: '#f97316',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>89</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Blocked</div>
          </div>
          <div style={{
            flex: 1,
            padding: '20px',
            borderRadius: '20px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#6ee7b7' }}>1,158</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Passed</div>
          </div>
        </div>
      </section>

      {/* Call List */}
      <section style={{ padding: '0 24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#6b7280' }}>RECENT</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredCalls.map((call) => (
            <div key={call.id} style={{
              padding: '20px',
              borderRadius: '20px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: call.blocked ? 'rgba(249, 115, 22, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {call.blocked ? <Ban size={22} color="#fb923c" /> : <CheckCircle size={22} color="#6ee7b7" />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{call.number}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{call.type}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{call.time}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80px',
        backgroundColor: 'rgba(20, 20, 25, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 20px'
      }}>
        <Link href="/home" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <Heart size={22} color="#6b7280" />
            <span style={{ fontSize: '11px', color: '#6b7280' }}>Home</span>
          </div>
        </Link>

        <Link href="/calls" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '48px',
              height: '32px',
              borderRadius: '16px',
              backgroundColor: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={18} color="white" />
            </div>
            <span style={{ fontSize: '11px', color: 'white', fontWeight: 600 }}>Calls</span>
          </div>
        </Link>

        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <Shield size={22} color="#6b7280" />
            <span style={{ fontSize: '11px', color: '#6b7280' }}>Voice</span>
          </div>
        </Link>

        <Link href="/settings" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <Settings size={22} color="#6b7280" />
            <span style={{ fontSize: '11px', color: '#6b7280' }}>Settings</span>
          </div>
        </Link>
      </nav>
    </div>
  );
}
