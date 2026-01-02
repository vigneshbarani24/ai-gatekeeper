'use client';

import { ArrowLeft, Phone, Ban, CheckCircle, Heart, Activity, Shield, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function CallsPage() {
  const [filter, setFilter] = useState('all');
  const [calls, setCalls] = useState([]);
  const [stats, setStats] = useState({ blocked: 0, passed: 0 });
  const [loading, setLoading] = useState(true);

  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [callDetail, setCallDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    // Fetch calls from backend (existing code)
    loadCalls();
  }, []);

  const loadCalls = () => {
     setLoading(true);
     Promise.all([
      fetch(`${BACKEND_URL}/api/calls?limit=50`).then(res => res.json()),
      fetch(`${BACKEND_URL}/api/analytics/dashboard`).then(res => res.json())
    ])
      .then(([callsData, statsData]) => {
        // Process calls
        const formattedCalls = (callsData.calls || []).map((call: any) => ({
          id: call.id,
          number: call.caller_number || 'Unknown',
          type: call.intent === 'scam' ? `Scam - ${call.caller_name || 'Unknown'}` : call.caller_name || call.intent || 'Unknown',
          time: formatTime(call.started_at),
          blocked: call.status === 'blocked' || call.scam_score > 0.7,
          scam_score: call.scam_score || 0
        }));
        
        setCalls(formattedCalls);
        
        const blocked = formattedCalls.filter((c: any) => c.blocked).length;
        const passed = formattedCalls.filter((c: any) => !c.blocked).length;
        setStats({ blocked, passed });
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch calls:', err);
        setLoading(false);
      });
  };

  const handleCallClick = async (callId: string) => {
    setSelectedCallId(callId);
    setDetailLoading(true);
    setCallDetail(null);
    try {
        const res = await fetch(`${BACKEND_URL}/api/calls/${callId}`);
        const data = await res.json();
        setCallDetail(data);
    } catch (err) {
        console.error("Failed to load call detail", err);
    } finally {
        setDetailLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const filteredCalls = filter === 'all' ? calls : calls.filter((c: any) => filter === 'blocked' ? c.blocked : !c.blocked);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', color: 'white', paddingBottom: '100px', display: 'flex' }}>
      
      {/* Main Content */}
      <div style={{ flex: 1, filter: selectedCallId ? 'blur(4px)' : 'none', transition: 'filter 0.3s' }}>
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
                <div style={{ fontSize: '28px', fontWeight: 800 }}>{loading ? '...' : stats.blocked}</div>
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
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#6ee7b7' }}>{loading ? '...' : stats.passed}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Passed</div>
              </div>
            </div>
          </section>

          {/* Call List */}
          <section style={{ padding: '0 24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#6b7280' }}>RECENT</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredCalls.map((call: any) => (
                <div 
                  key={call.id} 
                  onClick={() => handleCallClick(call.id)}
                  style={{
                  padding: '20px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
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
      </div>

      {/* Detail Slide-over */}
      {selectedCallId && (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            maxWidth: '500px',
            backgroundColor: '#0f0f13',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            zIndex: 100,
            padding: '24px',
            overflowY: 'auto',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
        }}>
            <button 
                onClick={() => setSelectedCallId(null)}
                style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <ArrowLeft size={16} /> Back
            </button>

            {detailLoading || !callDetail ? (
                <div style={{ textAlign: 'center', marginTop: '50px', color: '#6b7280' }}>Loading details...</div>
            ) : (
                <div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            backgroundColor: callDetail.call.status === 'blocked' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                              {callDetail.call.status === 'blocked' ? <Ban size={32} color="#fb923c" /> : <CheckCircle size={32} color="#6ee7b7" />}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>{callDetail.call.caller_number}</h2>
                            <div style={{ fontSize: '14px', color: '#6b7280', textTransform: 'capitalize' }}>
                                {callDetail.call.status} • {callDetail.call.intent}
                            </div>
                        </div>
                   </div>

                    {/* Transcript Section */}
                   <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={16} /> TRANSCRIPT
                        </h3>
                        <div style={{ lineHeight: '1.6', fontSize: '15px', color: '#e5e7eb', whiteSpace: 'pre-wrap' }}>
                            {callDetail.transcript?.transcript || "No transcript available for this call."}
                        </div>
                   </div>
                   
                   {/* Scam Score */}
                   <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={16} /> ANALYSIS
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: '#9ca3af' }}>Scam Probability</span>
                            <span style={{ fontWeight: 700, color: callDetail.call.scam_score > 0.5 ? '#f87171' : '#34d399' }}>
                                {Math.round(callDetail.call.scam_score * 100)}%
                            </span>
                        </div>
                        {callDetail.summary && (
                             <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', fontSize: '14px', color: '#d1d5db' }}>
                                {callDetail.summary}
                             </div>
                        )}
                   </div>

                </div>
            )}
        </div>
      )}

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
        padding: '0 20px',
        zIndex: 50
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
