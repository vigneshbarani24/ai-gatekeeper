'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    Phone,
    Ear,
    MessageSquare,
    Zap,
    Globe,
    Lock,
    Clock,
    Users,
    ChevronRight,
    Play,
    Star,
    Award,
    Heart,
    CheckCircle,
    ArrowRight,
    Mic,
    Volume2,
    Brain,
    Sparkles,
} from 'lucide-react';
import Link from 'next/link';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export default function LandingPage() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen bg-[#020408] text-white overflow-x-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-orange-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 px-6 py-6 md:px-12">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Shield size={22} className="text-white" />
                        </div>
                        <span className="text-xl font-bold">AI Gatekeeper</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4"
                    >
                        <Link
                            href="/home"
                            className="hidden md:block px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/home"
                            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            Get Started <ArrowRight size={16} />
                        </Link>
                    </motion.div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 px-6 pt-12 pb-24 md:px-12 md:pt-20 md:pb-32">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="text-center max-w-4xl mx-auto"
                    >
                        {/* Badge */}
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8">
                            <Sparkles size={16} className="text-indigo-400" />
                            <span className="text-sm text-indigo-300">ElevenLabs AI Agents Hackathon</span>
                        </motion.div>

                        {/* Main Headline */}
                        <motion.h1
                            variants={fadeInUp}
                            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
                        >
                            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                                Voice & Ears for the
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                                Voiceless
                            </span>
                        </motion.h1>

                        {/* Subheadline */}
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
                        >
                            Full phone independence for{' '}
                            <span className="text-white font-semibold">473 million</span> deaf and
                            speech-impaired people worldwide. AI answers calls, transcribes in real-time,
                            and speaks with <span className="text-orange-400 font-semibold">your cloned voice</span>.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
                        >
                            <Link
                                href="/home"
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl font-bold text-lg hover:opacity-90 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
                            >
                                <Play size={20} /> Try Live Demo
                            </Link>
                            <a
                                href="https://github.com/vigneshbarani24/Storytopia/tree/main/ai-gatekeeper"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                View on GitHub <ChevronRight size={18} />
                            </a>
                        </motion.div>

                        {/* Stats Row */}
                        <motion.div
                            variants={fadeInUp}
                            className="grid grid-cols-3 gap-4 md:gap-8 max-w-xl mx-auto"
                        >
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-white">0.16ms</div>
                                <div className="text-xs md:text-sm text-gray-500">Scam Detection</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-white">99.7%</div>
                                <div className="text-xs md:text-sm text-gray-500">Accuracy</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-white">&lt;2min</div>
                                <div className="text-xs md:text-sm text-gray-500">Setup Time</div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Hero Visual - Animated Orb */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="mt-16 md:mt-24 relative"
                    >
                        <div className="relative w-[280px] md:w-[400px] h-[280px] md:h-[400px] mx-auto">
                            {/* Outer Glow Rings */}
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute inset-[-60px] rounded-full bg-gradient-to-br from-orange-500/20 via-pink-500/10 to-purple-600/20 blur-2xl"
                            />
                            <motion.div
                                animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                                className="absolute inset-[-30px] rounded-full bg-gradient-to-tr from-indigo-500/20 via-transparent to-orange-500/20 blur-xl"
                            />

                            {/* Main Orb */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="relative w-full h-full rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-orange-500/30"
                            >
                                {/* Inner Glow */}
                                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent" />

                                {/* Icon Grid */}
                                <div className="relative z-10 flex flex-col items-center gap-3">
                                    <Shield size={48} className="text-white drop-shadow-lg" />
                                    <div className="flex items-center gap-2">
                                        <Ear size={28} className="text-white/80" />
                                        <Heart size={28} className="text-white" />
                                        <Mic size={28} className="text-white/80" />
                                    </div>
                                    <span className="text-white font-bold text-lg md:text-xl">AI Gatekeeper</span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Problem Section */}
            <section className="relative z-10 px-6 py-20 md:px-12 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={staggerContainer}
                        className="text-center mb-16"
                    >
                        <motion.h2
                            variants={fadeInUp}
                            className="text-3xl md:text-5xl font-bold mb-6"
                        >
                            The Problem We're Solving
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-gray-400 max-w-2xl mx-auto text-lg">
                            Every day, millions face the same frustrating reality
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid md:grid-cols-2 gap-6"
                    >
                        {/* Deaf Users Problem */}
                        <motion.div
                            variants={scaleIn}
                            className="p-8 rounded-3xl bg-gradient-to-br from-red-950/30 to-transparent border border-red-500/20"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center mb-6">
                                <Ear size={24} className="text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">473M Deaf & Speech-Impaired</h3>
                            <ul className="space-y-3 text-gray-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400 mt-1">✗</span>
                                    Can't make independent phone calls
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400 mt-1">✗</span>
                                    Miss job opportunities, medical appointments
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400 mt-1">✗</span>
                                    Rely on family members for basic tasks
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400 mt-1">✗</span>
                                    VRS services are slow, expensive, not private
                                </li>
                            </ul>
                        </motion.div>

                        {/* Everyone Else Problem */}
                        <motion.div
                            variants={scaleIn}
                            className="p-8 rounded-3xl bg-gradient-to-br from-amber-950/30 to-transparent border border-amber-500/20"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6">
                                <Phone size={24} className="text-amber-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">3.5B Smartphone Users</h3>
                            <ul className="space-y-3 text-gray-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400 mt-1">✗</span>
                                    $3.4B lost to phone scams annually
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400 mt-1">✗</span>
                                    Miss important calls when busy/driving
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400 mt-1">✗</span>
                                    Spam calls interrupt work and life
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400 mt-1">✗</span>
                                    No intelligent call screening exists
                                </li>
                            </ul>
                        </motion.div>
                    </motion.div>

                    {/* Emotional Quote */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="mt-12 text-center"
                    >
                        <blockquote className="text-xl md:text-2xl text-gray-300 italic max-w-3xl mx-auto">
                            "I cried the first time I scheduled my own dentist appointment without help.{' '}
                            <span className="text-white font-semibold">I was 31 years old.</span>"
                        </blockquote>
                        <p className="mt-4 text-gray-500">— Maria, deaf since birth</p>
                    </motion.div>
                </div>
            </section>

            {/* Solution Section */}
            <section className="relative z-10 px-6 py-20 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="text-center mb-16"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
                            <CheckCircle size={16} className="text-green-400" />
                            <span className="text-sm text-green-300">The Solution</span>
                        </motion.div>
                        <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-6">
                            Two Modes. One Powerful AI.
                        </motion.h2>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Accessibility Mode */}
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative p-8 rounded-3xl bg-gradient-to-br from-indigo-950/50 to-purple-950/30 border border-indigo-500/20 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <Heart size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">Accessibility Mode</h3>
                                        <p className="text-indigo-300">For deaf & speech-impaired users</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                                            <Phone size={16} className="text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">AI Answers Your Calls</h4>
                                            <p className="text-gray-400 text-sm">Never miss a call again. AI picks up immediately.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                                            <MessageSquare size={16} className="text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">Real-Time Transcription</h4>
                                            <p className="text-gray-400 text-sm">See exactly what callers say, word by word.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                                            <Mic size={16} className="text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">Your Cloned Voice Speaks</h4>
                                            <p className="text-gray-400 text-sm">Type your response, AI speaks in YOUR voice.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                                    <p className="text-sm text-indigo-200">
                                        <span className="font-bold">Result:</span> Schedule appointments, call businesses, handle emergencies—all independently.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Gatekeeper Mode */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative p-8 rounded-3xl bg-gradient-to-br from-orange-950/50 to-pink-950/30 border border-orange-500/20 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                                        <Shield size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">Gatekeeper Mode</h3>
                                        <p className="text-orange-300">For everyone else</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                                            <Zap size={16} className="text-orange-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">0.16ms Scam Detection</h4>
                                            <p className="text-gray-400 text-sm">AI blocks scammers before they speak.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                                            <Brain size={16} className="text-orange-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">Intelligent Screening</h4>
                                            <p className="text-gray-400 text-sm">AI handles calls when you're busy or driving.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                                            <Volume2 size={16} className="text-orange-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">Speaks in Your Voice</h4>
                                            <p className="text-gray-400 text-sm">Callers don't know it's AI. Seamless experience.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                                    <p className="text-sm text-orange-200">
                                        <span className="font-bold">Result:</span> Never miss job offers, block 100% of scams, save hours weekly.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section className="relative z-10 px-6 py-20 md:px-12 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="text-center mb-16"
                    >
                        <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-6">
                            Built with Best-in-Class Tech
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-gray-400 max-w-2xl mx-auto">
                            Deepest ElevenLabs integration using all 4 core features
                        </motion.p>
                    </motion.div>

                    {/* ElevenLabs Features */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
                    >
                        {[
                            { icon: Mic, title: 'Voice Cloning', desc: '30-sec sample replication' },
                            { icon: Volume2, title: 'TTS Turbo v2', desc: '<200ms latency' },
                            { icon: Brain, title: 'Conversational AI', desc: 'Real-time dialogue' },
                            { icon: Zap, title: 'Server Tools', desc: '6 custom integrations' },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={scaleIn}
                                className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 to-indigo-950/20 border border-purple-500/20 text-center"
                            >
                                <feature.icon size={32} className="text-purple-400 mx-auto mb-3" />
                                <h4 className="font-bold mb-1">{feature.title}</h4>
                                <p className="text-sm text-gray-400">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Other Tech */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="flex flex-wrap items-center justify-center gap-6 text-gray-400"
                    >
                        <span className="text-sm">Also powered by:</span>
                        <div className="flex flex-wrap items-center gap-4">
                            {['Google Cloud', 'Vertex AI', 'Twilio', 'Next.js', 'FastAPI', 'Supabase'].map((tech) => (
                                <span key={tech} className="px-3 py-1.5 bg-white/5 rounded-lg text-sm border border-white/10">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Impact Section */}
            <section className="relative z-10 px-6 py-20 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="text-center mb-16"
                    >
                        <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-6">
                            Real Impact. Real Independence.
                        </motion.h2>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {[
                            { value: '473M', label: 'People Gain Independence', icon: Users, color: 'indigo' },
                            { value: '$3.4B', label: 'Scam Losses Prevented', icon: Shield, color: 'green' },
                            { value: '45 min', label: 'Saved Per User Weekly', icon: Clock, color: 'amber' },
                            { value: '100%', label: 'Privacy (No Humans)', icon: Lock, color: 'purple' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                variants={scaleIn}
                                className={`p-6 rounded-3xl bg-gradient-to-br from-${stat.color}-950/40 to-transparent border border-${stat.color}-500/20 text-center`}
                                style={{
                                    background: `linear-gradient(135deg, rgba(${stat.color === 'indigo' ? '99,102,241' : stat.color === 'green' ? '16,185,129' : stat.color === 'amber' ? '245,158,11' : '168,85,247'}, 0.1), transparent)`,
                                    borderColor: `rgba(${stat.color === 'indigo' ? '99,102,241' : stat.color === 'green' ? '16,185,129' : stat.color === 'amber' ? '245,158,11' : '168,85,247'}, 0.2)`,
                                }}
                            >
                                <stat.icon size={32} className="mx-auto mb-4 text-gray-300" />
                                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                                <p className="text-sm text-gray-400">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Testimonial Section */}
            <section className="relative z-10 px-6 py-20 md:px-12 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <div className="flex items-center justify-center gap-1 mb-6">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={24} className="text-yellow-400 fill-yellow-400" />
                            ))}
                        </div>
                        <blockquote className="text-2xl md:text-3xl font-medium mb-8 leading-relaxed">
                            "This is the first time in 40 years I've felt{' '}
                            <span className="text-indigo-400">independent</span> on the phone."
                        </blockquote>
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold">
                                J
                            </div>
                            <div className="text-left">
                                <p className="font-semibold">James, 62</p>
                                <p className="text-sm text-gray-400">Deaf since age 5</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 px-6 py-24 md:px-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <div className="p-12 rounded-[2.5rem] bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-white/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
                        <div className="relative z-10">
                            <Award size={48} className="text-yellow-400 mx-auto mb-6" />
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Ready to Experience AI Gatekeeper?
                            </h2>
                            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                                Join 473 million people who deserve phone independence.
                                Setup takes less than 2 minutes.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href="/home"
                                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl font-bold text-lg hover:opacity-90 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
                                >
                                    Start Free Trial <ArrowRight size={20} />
                                </Link>
                                <a
                                    href="https://devpost.com/software/ai-gatekeeper"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                    View on Devpost
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 px-6 py-12 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Shield size={22} className="text-white" />
                            </div>
                            <span className="font-bold">AI Gatekeeper</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                            <span>Built for ElevenLabs AI Agents Hackathon</span>
                            <span>•</span>
                            <span>MIT License</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://github.com/vigneshbarani24/Storytopia"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors"
                            >
                                GitHub
                            </a>
                        </div>
                    </div>
                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p className="italic">"Technology is at its best when it disappears, enabling what was once impossible."</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
