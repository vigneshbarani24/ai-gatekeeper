'use client';

import { useState, useEffect } from 'react';
import { Shield, Phone, Ban, Clock, Activity, Settings, User, Heart } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    const [stats] = useState({
        total_calls: 1247,
        scams_blocked: 89,
        time_saved_hours: 39,
        block_rate: 99,
    });

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0a0a0f',
            color: 'white',
            paddingBottom: '100px'
        }}>
            {/* Header */}
            <header style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ color: '#f97316', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Welcome back,</p>
                    <h1 style={{ fontSize: '28px', fontWeight: 800 }}>AI Gatekeeper</h1>
                </div>
                <Link href="/settings">
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: '#f97316',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <User size={22} color="white" />
                    </div>
                </Link>
            </header>

            {/* Main Orb Section */}
            <section style={{ padding: '40px 24px 60px', textAlign: 'center' }}>
                {/* Glowing Orb */}
                <Link href="/dashboard">
                    <div style={{
                        position: 'relative',
                        width: '280px',
                        height: '280px',
                        margin: '0 auto 40px',
                        cursor: 'pointer'
                    }}>
                        {/* Outer Glow */}
                        <div style={{
                            position: 'absolute',
                            inset: '-40px',
                            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, transparent 70%)',
                            borderRadius: '50%'
                        }} />

                        {/* Main Circle */}
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at 30% 30%, #fb923c, #ea580c, #c2410c)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 100px rgba(249, 115, 22, 0.5)'
                        }}>
                            <Shield size={56} color="white" style={{ marginBottom: '12px' }} />
                            <div style={{ fontSize: '48px', fontWeight: 800 }}>{stats.scams_blocked}</div>
                            <div style={{ fontSize: '14px', opacity: 0.9 }}>Threats Blocked</div>
                        </div>
                    </div>
                </Link>

                {/* Status */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    borderRadius: '20px'
                }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <span style={{ color: '#6ee7b7', fontWeight: 600, fontSize: '14px' }}>Protection Active</span>
                </div>
            </section>

            {/* Stats Grid */}
            <section style={{ padding: '0 24px 40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {/* Duration Card */}
                    <div style={{
                        padding: '24px',
                        borderRadius: '24px',
                        backgroundColor: '#f97316',
                        color: 'white'
                    }}>
                        <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px', textTransform: 'uppercase' }}>Total Calls</div>
                        <div style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1 }}>{stats.total_calls.toLocaleString()}</div>
                    </div>

                    {/* Blocked Card */}
                    <div style={{
                        padding: '24px',
                        borderRadius: '24px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase' }}>Time Saved</div>
                        <div style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1 }}>{stats.time_saved_hours}<span style={{ fontSize: '18px' }}>h</span></div>
                    </div>

                    {/* Rate Card */}
                    <div style={{
                        padding: '24px',
                        borderRadius: '24px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase' }}>Block Rate</div>
                        <div style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1 }}>{stats.block_rate}<span style={{ fontSize: '18px' }}>%</span></div>
                    </div>

                    {/* Activity Card */}
                    <div style={{
                        padding: '24px',
                        borderRadius: '24px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase' }}>Today</div>
                        <div style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1 }}>12</div>
                    </div>
                </div>
            </section>

            {/* Recent Activity */}
            <section style={{ padding: '0 24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>History</h2>

                {[
                    { number: '+1 (555) 123-4567', type: 'Scam Blocked', time: '2 min ago', blocked: true },
                    { number: '+1 (555) 234-5678', type: 'Family Call', time: '15 min ago', blocked: false },
                    { number: '+1 (555) 345-6789', type: 'Spam Blocked', time: '1 hour ago', blocked: true },
                ].map((call, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px 0',
                        borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                    }}>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: call.blocked ? '#f97316' : '#10b981'
                        }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, marginBottom: '2px' }}>{call.number}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>{call.type}</div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{call.time}</div>
                    </div>
                ))}
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
                        <div style={{
                            width: '48px',
                            height: '32px',
                            borderRadius: '16px',
                            backgroundColor: '#f97316',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Heart size={18} color="white" fill="white" />
                        </div>
                        <span style={{ fontSize: '11px', color: 'white', fontWeight: 600 }}>Home</span>
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
                        <Settings size={22} color="#6b7280" />
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>Settings</span>
                    </div>
                </Link>
            </nav>
        </div>
    );
}
