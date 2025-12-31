'use client';

import { ArrowLeft, User, Mic, Bell, Lock, ChevronRight, Heart, Activity, Shield, Settings } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const settings = [
    { icon: User, title: 'Profile', desc: 'Account settings', color: '#f97316' },
    { icon: Mic, title: 'AI Voice', desc: 'Voice preferences', color: '#a855f7', link: '/dashboard' },
    { icon: Bell, title: 'Notifications', desc: 'Alert preferences', color: '#10b981' },
    { icon: Lock, title: 'Privacy', desc: 'Security settings', color: '#3b82f6' },
  ];

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
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Settings</h1>
      </header>

      {/* Profile Card */}
      <section style={{ padding: '0 24px 32px' }}>
        <div style={{
          padding: '24px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(249, 115, 22, 0.05))',
          border: '1px solid rgba(249, 115, 22, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#f97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={32} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>User</h2>
            <p style={{ fontSize: '14px', color: '#9ca3af' }}>Free Plan</p>
          </div>
        </div>
      </section>

      {/* Settings List */}
      <section style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {settings.map((item) => (
            <Link key={item.title} href={item.link || '#'} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
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
                  borderRadius: '16px',
                  backgroundColor: `${item.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <item.icon size={24} color={item.color} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>{item.desc}</div>
                </div>

                <ChevronRight size={20} color="#6b7280" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* App Info */}
      <section style={{ padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: '#4b5563' }}>AI Gatekeeper v1.0.0</p>
        <p style={{ fontSize: '12px', color: '#374151', marginTop: '4px' }}>© 2025</p>
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
            <Activity size={22} color="#6b7280" />
            <span style={{ fontSize: '11px', color: '#6b7280' }}>Calls</span>
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
            <div style={{
              width: '48px',
              height: '32px',
              borderRadius: '16px',
              backgroundColor: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Settings size={18} color="white" />
            </div>
            <span style={{ fontSize: '11px', color: 'white', fontWeight: 600 }}>Settings</span>
          </div>
        </Link>
      </nav>
    </div>
  );
}
