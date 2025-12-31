'use client';

import { Shield, ArrowLeft, Mic, Square, Heart, Activity, Settings } from 'lucide-react';
import Link from 'next/link';
import { useConversation } from '@elevenlabs/react';
import { useCallback, useState } from 'react';

const AGENT_ID = 'agent_6801kdt0jrjjf13bk24sywwy0kze';

export default function DashboardPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () => setErrorMsg(null),
    onError: (error: any) => setErrorMsg(typeof error === 'string' ? error : error?.message || 'Connection error'),
  });

  const startConversation = useCallback(async () => {
    try {
      setErrorMsg(null);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // @ts-expect-error - SDK types mismatch
      await conversation.startSession({ agentId: AGENT_ID });
    } catch (error) {
      setErrorMsg('Failed to start voice session');
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isActive = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';

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
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700 }}>Voice Interface</h1>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Talk to AI</p>
        </div>
        <div style={{ width: '44px' }} />
      </header>

      {/* Main Orb Section */}
      <section style={{ padding: '60px 24px', textAlign: 'center' }}>
        {/* Glowing Orb */}
        <button
          onClick={isActive ? stopConversation : startConversation}
          disabled={isConnecting}
          style={{
            position: 'relative',
            width: '260px',
            height: '260px',
            margin: '0 auto 40px',
            background: 'none',
            border: 'none',
            cursor: isConnecting ? 'wait' : 'pointer'
          }}
        >
          {/* Outer Glow */}
          <div style={{
            position: 'absolute',
            inset: '-50px',
            background: isActive
              ? 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            transition: 'all 0.5s ease'
          }} />

          {/* Main Circle */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: isActive
              ? 'radial-gradient(circle at 30% 30%, #34d399, #10b981, #059669)'
              : isConnecting
                ? 'radial-gradient(circle at 30% 30%, #fbbf24, #f59e0b, #d97706)'
                : 'radial-gradient(circle at 30% 30%, #fb923c, #ea580c, #c2410c)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isActive
              ? '0 0 120px rgba(16, 185, 129, 0.6)'
              : '0 0 100px rgba(249, 115, 22, 0.5)',
            transition: 'all 0.5s ease'
          }}>
            {isConnecting ? (
              <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid white',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : isActive ? (
              <Square size={60} color="white" />
            ) : (
              <Mic size={60} color="white" />
            )}
          </div>
        </button>

        {/* Status Text */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
            {isActive ? 'Listening...' : isConnecting ? 'Connecting...' : 'Tap to Start'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>
            {isActive ? 'Tap the orb to stop' : 'Speak to your AI Gatekeeper'}
          </p>
        </div>

        {/* Speaking Indicator */}
        {isActive && conversation.isSpeaking && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderRadius: '20px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              animation: 'pulse 1s infinite'
            }} />
            <span style={{ color: '#6ee7b7', fontWeight: 600, fontSize: '14px' }}>AI is speaking...</span>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <p style={{ color: '#f87171', fontSize: '14px', marginTop: '16px' }}>{errorMsg}</p>
        )}
      </section>

      {/* Quick Tips */}
      <section style={{ padding: '0 24px' }}>
        <div style={{
          padding: '24px',
          borderRadius: '24px',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          border: '1px solid rgba(249, 115, 22, 0.2)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fb923c', marginBottom: '12px' }}>Tips</h3>
          <ul style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.8, paddingLeft: '16px', margin: 0 }}>
            <li>Speak naturally to configure settings</li>
            <li>Ask about blocked calls</li>
            <li>Request call summaries</li>
          </ul>
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
            <Activity size={22} color="#6b7280" />
            <span style={{ fontSize: '11px', color: '#6b7280' }}>Calls</span>
          </div>
        </Link>

        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
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
              <Shield size={18} color="white" />
            </div>
            <span style={{ fontSize: '11px', color: 'white', fontWeight: 600 }}>Voice</span>
          </div>
        </Link>

        <Link href="/settings" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <Settings size={22} color="#6b7280" />
            <span style={{ fontSize: '11px', color: '#6b7280' }}>Settings</span>
          </div>
        </Link>
      </nav>

      {/* Animations */}
      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
