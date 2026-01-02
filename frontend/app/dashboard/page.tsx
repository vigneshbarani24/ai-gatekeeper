'use client';

import { Shield, ArrowLeft, Mic, Square, Heart, Activity, Settings, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useConversation } from '@elevenlabs/react';
import { useCallback, useState, useEffect, useRef } from 'react';

const AGENT_ID = 'agent_6801kdt0jrjjf13bk24sywwy0kze';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function DashboardPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scamAlert, setScamAlert] = useState<{ detected: boolean; confidence: number; message: string } | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [logs, setLogs] = useState<{ type: string; message: string; timestamp: number }[]>([]);
  const [threatLevel, setThreatLevel] = useState<'safe' | 'warning' | 'danger'>('safe');
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((type: string, message: string) => {
    setLogs(prev => [...prev, { type, message, timestamp: Date.now() }]);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const conversation = useConversation({
    onConnect: () => setErrorMsg(null),
    onError: (error: any) => setErrorMsg(typeof error === 'string' ? error : error?.message || 'Connection error'),
    onMessage: (message: any) => {
      // Capture transcript for scam analysis
      if (message.message) {
        setTranscript(prev => prev + ' ' + message.message);
        addLog('transcript', message.message);
      }
    },
  });

  const isActive = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';

  // Analyze transcript for scams using Google ADK
  useEffect(() => {
    if (transcript.length > 30) {
      const analyzeScam = async () => {
        const startTime = Date.now();
        try {
          addLog('analysis', 'Analyzing conversation pattern...');
          addLog('adk', 'Querying model: gemini-2.0-flash-exp...');
          
          const response = await fetch(`${BACKEND_URL}/api/analytics/analyze-scam?text=${encodeURIComponent(transcript)}`);
          const data = await response.json();
          const latency = Date.now() - startTime;
          
          addLog('adk', `Response received in ${latency}ms`);
          
          if (data.reasoning) {
             const reasons = data.reasoning.split(' | ');
             reasons.forEach((r: string) => addLog('reasoning', r));
          }

          if (data.is_scam) {
            setThreatLevel('danger');
            // Show reasoning in the alert itself
            const mainReason = data.reasoning ? data.reasoning.split('|')[0].replace('❌', '').trim() : 'Suspicious patterns detected';
            setScamAlert({
              detected: true,
              confidence: data.score,
              message: `SCAM DETECTED: ${mainReason}`
            });
            addLog('alert', `SCAM DETECTED (Confidence: ${(data.score * 100).toFixed(0)}%)`);
          } else if (data.score > 0.4) {
             setThreatLevel('warning');
             addLog('analysis', `Use Caution (Score: ${data.score})`);
          } else {
             setThreatLevel('safe');
             addLog('analysis', `Analysis complete: Safe (Score: ${data.score})`);
          }

        } catch (error) {
          console.error('Scam analysis error:', error);
          addLog('analysis', 'Analysis failed for this segment');
        }
      };
      
      // Debounce analysis
      const timeoutId = setTimeout(analyzeScam, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [transcript, addLog]);

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
    
    // Always log the call to Supabase (even if short or no transcript)
    try {
      const scam_score = scamAlert?.detected ? 0.95 : 0.1;
      const intent = scamAlert?.detected ? 'scam' : 'unknown';
      const callTranscript = transcript.length > 0 ? transcript : 'Voice test call';
      
      await fetch(`${BACKEND_URL}/api/calls/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: callTranscript,
          scam_score,
          intent,
          caller_number: 'Test',  // Default caller for voice agent tests
        })
      });
      
      console.log('✅ Call logged to Supabase');
      
      // Reset transcript and scam alert for next call
      setTranscript('');
      setScamAlert(null);
      setThreatLevel('safe');
    } catch (error) {
      console.error('❌ Failed to log call:', error);
    }
  }, [conversation, transcript, scamAlert]);

  // Dynamic Orb Colors
  const getOrbColor = () => {
      if (!isActive) return ['#fb923c', '#ea580c', '#c2410c']; // Orange (Inactive)
      if (isConnecting) return ['#fbbf24', '#f59e0b', '#d97706']; // Amber (Connecting)
      
      switch (threatLevel) {
          case 'danger': return ['#ef4444', '#dc2626', '#b91c1c']; // Red (Scam)
          case 'warning': return ['#facc15', '#eab308', '#ca8a04']; // Yellow (Suspicious)
          case 'safe': default: return ['#34d399', '#10b981', '#059669']; // Green (Safe)
      }
  };

  const getOrbShadow = () => {
      if (!isActive) return '0 0 100px rgba(249, 115, 22, 0.5)';
      
      switch (threatLevel) {
          case 'danger': return '0 0 150px rgba(239, 68, 68, 0.8)'; // Intense Red
          case 'warning': return '0 0 120px rgba(234, 179, 8, 0.6)'; // Yellow Glow
          default: return '0 0 120px rgba(16, 185, 129, 0.6)'; // Green Glow
      }
  };

  const orbColors = getOrbColor();
  const orbShadow = getOrbShadow();

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
              ? `radial-gradient(circle, ${orbColors[1]}40 0%, transparent 70%)`
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
            background: `radial-gradient(circle at 30% 30%, ${orbColors[0]}, ${orbColors[1]}, ${orbColors[2]})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: orbShadow,
            transition: 'all 0.5s ease',
            animation: threatLevel === 'danger' ? 'dangerPulse 0.5s infinite alternate' : 'none'
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

        {/* Scam Alert */}
        {scamAlert && scamAlert.detected && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid #ef4444',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertTriangle size={24} color="#ef4444" />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
                ⚠️ SCAM ALERT
              </div>
              <div style={{ color: '#fca5a5', fontSize: '14px' }}>
                {scamAlert.message}
              </div>
              <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                Confidence: {(scamAlert.confidence * 100).toFixed(0)}% • Powered by Google ADK
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Live Neural Analysis Terminal */}
      <section style={{ padding: '0 24px', marginBottom: '84px' }}>
        <div style={{
          padding: '20px',
          borderRadius: '16px',
          backgroundColor: '#0f0f13',
          border: '1px solid rgba(255,255,255,0.1)',
          height: '300px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
        }}>
          <h3 style={{ 
            fontSize: '12px', 
            fontWeight: 700, 
            color: '#6b7280', 
            marginBottom: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            <Activity size={12} color="#10b981" /> Google ADK Neural Stream
          </h3>
          
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            fontFamily: 'monospace', 
            fontSize: '12px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px' 
          }}>
            {logs.length === 0 && (
              <div style={{ color: '#4b5563', fontStyle: 'italic' }}>Waiting for voice input...</div>
            )}
            
            {logs.map((log, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                gap: '8px', 
                opacity: 0, 
                animation: 'fadeIn 0.3s forwards',
                animationDelay: `${i * 0.05}s` 
              }}>
                <span style={{ 
                  color: log.type === 'transcript' ? '#60a5fa' : 
                         log.type === 'analysis' ? '#f59e0b' : 
                         log.type === 'reasoning' ? '#a78bfa' : 
                         log.type === 'adk' ? '#d8b4fe' : 
                         log.type === 'alert' ? '#ef4444' : '#6b7280',
                  fontWeight: 700,
                  minWidth: '80px'
                }}>[{log.type.toUpperCase()}]</span>
                <span style={{ color: '#d1d5db', lineHeight: 1.4 }}>{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
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
        @keyframes dangerPulse { 0% { transform: scale(1); box-shadow: 0 0 100px rgba(239, 68, 68, 0.8); } 100% { transform: scale(1.05); box-shadow: 0 0 180px rgba(239, 68, 68, 1); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
