'use client';

import Link from 'next/link';

export default function DocumentationPage() {
    return (
        <div className="text-white min-h-screen">
            {/* Glass Morphism Navigation */}
            <nav className="glass-nav fixed top-0 w-full z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl accent-gradient flex items-center justify-center text-2xl">
                                🛡️
                            </div>
                            <span className="font-black text-xl tracking-tight">AI Gatekeeper</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link href="/#features" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">Features</Link>
                            <Link href="/#how-it-works" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">How it works</Link>
                            <Link href="/#pricing" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">Pricing</Link>
                            <Link href="/documentation" className="text-sm font-semibold text-[#FF8C68] hover:text-white transition-colors">Documentation</Link>
                            <Link href="/#faq" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">FAQ</Link>
                            <a
                                href="https://github.com/vigneshbarani24/ai-gatekeeper"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                            >
                                GitHub
                            </a>
                            <Link href="/home" className="btn-primary inline-flex">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                {/* Background gradient orbs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full accent-gradient opacity-10 blur-3xl"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16 fade-in-up">
                        <div className="inline-block px-4 py-2 bg-[#FF8C68]/10 rounded-full text-[#FF8C68] text-sm font-bold uppercase tracking-wider mb-6">
                            Technical Documentation
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6">
                            System <span className="text-transparent bg-clip-text accent-gradient">Architecture</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto font-medium leading-relaxed">
                            Built on enterprise-grade infrastructure with ElevenLabs, Google Cloud, and modern AI technologies
                        </p>
                    </div>

                    {/* Architecture Diagrams */}
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        {/* System Overview */}
                        <div className="bento-card group hover:border-[#FF8C68]/30 transition-all duration-300">
                            <h3 className="text-xl font-bold text-white mb-4">System Overview</h3>
                            <div className="relative overflow-hidden rounded-2xl bg-[#0A0A0A] p-4">
                                <img
                                    src="/images/architecture/system-overview.png"
                                    alt="System Architecture Overview"
                                    className="w-full h-auto rounded-lg"
                                />
                            </div>
                            <p className="text-gray-400 text-sm mt-4 font-medium">Complete system architecture showing integration between Twilio, ElevenLabs, and Google Cloud services</p>
                        </div>

                        {/* Call Flow */}
                        <div className="bento-card group hover:border-[#FF8C68]/30 transition-all duration-300">
                            <h3 className="text-xl font-bold text-white mb-4">Call Flow Diagram</h3>
                            <div className="relative overflow-hidden rounded-2xl bg-[#0A0A0A] p-4">
                                <img
                                    src="/images/architecture/call-flow.png"
                                    alt="Call Flow Diagram"
                                    className="w-full h-auto rounded-lg"
                                />
                            </div>
                            <p className="text-gray-400 text-sm mt-4 font-medium">Detailed call routing logic for Accessibility and Gatekeeper modes with parallel agent execution</p>
                        </div>

                        {/* Agent Architecture */}
                        <div className="bento-card group hover:border-[#FF8C68]/30 transition-all duration-300">
                            <h3 className="text-xl font-bold text-white mb-4">Agent Architecture</h3>
                            <div className="relative overflow-hidden rounded-2xl bg-[#0A0A0A] p-4">
                                <img
                                    src="/images/architecture/agent-architecture.png"
                                    alt="Agent Architecture"
                                    className="w-full h-auto rounded-lg"
                                />
                            </div>
                            <p className="text-gray-400 text-sm mt-4 font-medium">Multi-agent system with specialized agents for screening, detection, and decision-making</p>
                        </div>

                        {/* Sequence Diagram */}
                        <div className="bento-card group hover:border-[#FF8C68]/30 transition-all duration-300">
                            <h3 className="text-xl font-bold text-white mb-4">Sequence Diagram</h3>
                            <div className="relative overflow-hidden rounded-2xl bg-[#0A0A0A] p-4">
                                <img
                                    src="/images/architecture/sequence-diagram.png"
                                    alt="Sequence Diagram"
                                    className="w-full h-auto rounded-lg"
                                />
                            </div>
                            <p className="text-gray-400 text-sm mt-4 font-medium">Real-time interaction flow showing sub-100ms response times and parallel processing</p>
                        </div>
                    </div>

                    {/* Database Schema - Full Width */}
                    <div className="bento-card group hover:border-[#FF8C68]/30 transition-all duration-300 mb-12">
                        <h3 className="text-xl font-bold text-white mb-4">Database Schema</h3>
                        <div className="relative overflow-hidden rounded-2xl bg-[#0A0A0A] p-4">
                            <img
                                src="/images/architecture/database-schema.png"
                                alt="Database Schema"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                        <p className="text-gray-400 text-sm mt-4 font-medium">Supabase database schema with optimized tables for users, calls, contacts, and vector embeddings</p>
                    </div>

                    {/* Tech Stack Summary */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <div className="surface p-6 text-center">
                            <div className="text-4xl mb-3">☁️</div>
                            <h4 className="font-bold text-white mb-2">Google Cloud</h4>
                            <p className="text-sm text-gray-400 font-medium">11 services including ADK, Gemini 2.0 Flash, and Cloud Run</p>
                        </div>
                        <div className="surface p-6 text-center">
                            <div className="text-4xl mb-3">🎙️</div>
                            <h4 className="font-bold text-white mb-2">ElevenLabs</h4>
                            <p className="text-sm text-gray-400 font-medium">All 4 features: Voice Cloning, TTS, Conversational AI, Server Tools</p>
                        </div>
                        <div className="surface p-6 text-center">
                            <div className="text-4xl mb-3">📞</div>
                            <h4 className="font-bold text-white mb-2">Twilio + Supabase</h4>
                            <p className="text-sm text-gray-400 font-medium">PSTN gateway and PostgreSQL database with vector search</p>
                        </div>
                    </div>

                    {/* Key Features */}
                    <div className="surface p-8 mb-12">
                        <h2 className="text-3xl font-black mb-6">Key Technical Features</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xl font-bold text-[#FF8C68] mb-3">🤖 Multi-Agent Orchestration</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#FF8C68] mt-1">•</span>
                                        <span>4 parallel agents using Google ADK</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#FF8C68] mt-1">•</span>
                                        <span>Screener, Detector, Decision, and Executor agents</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#FF8C68] mt-1">•</span>
                                        <span>Gemini 2.0 Flash for sub-100ms responses</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#FF8C68] mb-3">🎙️ ElevenLabs Integration</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#FF8C68] mt-1">•</span>
                                        <span>Professional Voice Cloning (30s audio)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#FF8C68] mt-1">•</span>
                                        <span>Text-to-Speech Turbo v2 for natural responses</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#FF8C68] mt-1">•</span>
                                        <span>Conversational AI with Server Tools</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#FF8C68] mb-3">⚡ Performance</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#FF8C68] mt-1">•</span>
                                        <span>0.16ms keyword-based scam detection</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#FF8C68] mt-1">•</span>
                                        <span>120ms end-to-end response time</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#FF8C68] mt-1">•</span>
                                        <span>Real-time transcription with WebSocket streaming</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#FF8C68] mb-3">🔒 Security & Compliance</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#FF8C68] mt-1">•</span>
                                        <span>TCPA compliant AI disclosure</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#FF8C68] mt-1">•</span>
                                        <span>End-to-end encryption for call data</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#FF8C68] mt-1">•</span>
                                        <span>Vector embeddings for semantic search</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <Link href="/" className="btn-primary inline-flex text-lg">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-600 font-medium">
                            © 2025 AI Gatekeeper. Built for AI Partner Catalyst 2025.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <a href="#" className="text-gray-600 hover:text-white transition-colors font-medium">Twitter</a>
                            <a href="https://github.com/vigneshbarani24/ai-gatekeeper" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors font-medium">GitHub</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
