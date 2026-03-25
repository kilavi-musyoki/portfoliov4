import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Responsive hook ────────────────────────────────────────────────────────────
const useWindowWidth = () => {
    const [width, setWidth] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth : 1024
    );
    useEffect(() => {
        const handler = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return width;
};

// ── Oscilloscope waveform generator ───────────────────────────────────────────
const generateWavePath = (text, isTyping, width = 480, height = 100) => {
    const amplitude = Math.min(8 + text.length * 0.4, 32);
    const freq = isTyping ? 0.06 : 0.03;
    const points = [];
    for (let x = 0; x <= width; x += 4) {
        const y = height / 2 + Math.sin(x * freq + Date.now() * 0.004) * amplitude * (1 + 0.2 * Math.sin(x * 0.02));
        points.push(`${x},${y}`);
    }
    return `M${points.join(' L')}`;
};

// ── ECG pulse path: flat → spike → flat ───────────────────────────────────────
const generateEcgPath = (progress, width = 480, height = 100) => {
    // progress 0→1 sweeps the pulse across the screen
    const mid = height / 2;
    const pulseCenter = progress * width;
    const points = [];
    for (let x = 0; x <= width; x += 3) {
        const dx = x - pulseCenter;
        let y = mid;
        if (Math.abs(dx) < 60) {
            // QRS complex shape
            if (dx < -30) y = mid + (dx + 30) * 0.3;
            else if (dx < -10) y = mid - (dx + 30) * 1.4;
            else if (dx < 0)   y = mid + dx * 4.5;
            else if (dx < 10)  y = mid - dx * 5.5;
            else if (dx < 20)  y = mid + (dx - 10) * 1.8;
            else               y = mid - (dx - 20) * 0.4;
        }
        points.push(`${x},${y}`);
    }
    return `M${points.join(' L')}`;
};

const Contact = ({ isDark }) => {
    const formRef        = useRef(null);
    const rafRef         = useRef(null);
    const typingTimerRef = useRef(null);

    const [formData,    setFormData]    = useState({ name: '', email: '', subject: '', message: '' });
    const [status,      setStatus]      = useState('idle'); // idle | sending | sent | error
    const [isTyping,    setIsTyping]    = useState(false);
    const [wavePath,    setWavePath]    = useState('');
    const [ecgProgress, setEcgProgress] = useState(0);   // 0→1 for pulse sweep
    const [ecgPath,     setEcgPath]     = useState('');
    const [ecgPhase,    setEcgPhase]    = useState(0);   // counts completed sweeps

    // ── Google Sheets webhook ──────────────────────────────────────────────────
    const webhook = import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK;

    // ── Responsive breakpoints ─────────────────────────────────────────────────
    const windowWidth = useWindowWidth();
    const isMobile  = windowWidth < 640;
    const isTablet  = windowWidth < 900;

    // ── Palette ────────────────────────────────────────────────────────────────
    const textColor        = isDark ? '#ffffff'                     : '#1C2226';
    const dimColor         = isDark ? 'rgba(206,208,206,0.55)'      : 'rgba(104,112,120,0.65)';
    const accentColor      = isDark ? '#ced0ce'                     : '#C07838';
    const accentGlow       = isDark ? 'rgba(206,208,206,0.35)'      : 'rgba(192,120,56,0.35)';
    const accentHover      = isDark ? '#ffffff'                     : '#1C2226';
    const borderColor      = isDark ? 'rgba(107,113,107,0.65)'      : 'rgba(104,112,120,0.5)';
    const borderHover      = isDark ? 'rgba(206,208,206,0.55)'      : 'rgba(192,120,56,0.6)';
    const cardBg           = isDark ? 'rgba(156,160,156,0.04)'      : 'rgba(54,66,74,0.08)';
    const cardBgHover      = isDark ? 'rgba(206,208,206,0.07)'      : 'rgba(54,66,74,0.12)';
    const sectionBg        = isDark ? 'rgba(57,65,57,1)'            : '#C9CFC8';
    const scopeBg          = isDark ? '#000810'                     : '#36424A';
    const scopeBorderColor = isDark ? 'rgba(107,113,107,0.6)'       : 'rgba(192,120,56,0.5)';
    const scopeGridColor   = isDark ? 'rgba(107,113,107,0.07)'      : 'rgba(192,120,56,0.08)';
    const scopeLabelColor  = isDark ? 'rgba(107,113,107,0.7)'       : 'rgba(192,120,56,0.7)';
    const waveColor        = isDark ? '#9ca09c'                     : '#C07838';
    const btnColor         = isDark ? '#394139'                     : '#C9CFC8';
    const errorColor       = '#FF5A3C';
    const ecgColor         = isDark ? '#4ade80'                     : '#C07838';

    // ── Idle/typing oscilloscope animation ────────────────────────────────────
    useEffect(() => {
        if (status !== 'idle' && status !== 'sending') {
            cancelAnimationFrame(rafRef.current);
            return;
        }
        const animateWave = () => {
            const text = formData.name + formData.email + formData.subject + formData.message;
            setWavePath(generateWavePath(text, isTyping));
            rafRef.current = requestAnimationFrame(animateWave);
        };
        rafRef.current = requestAnimationFrame(animateWave);
        return () => cancelAnimationFrame(rafRef.current);
    }, [formData, isTyping, status]);

    // ── ECG success animation: 3 sweeps then hold flatline ───────────────────
    useEffect(() => {
        if (status !== 'sent') {
            setEcgProgress(0);
            setEcgPhase(0);
            return;
        }
        let progress = 0;
        let phase    = 0;
        const totalSweeps = 3;
        const speed = 0.008; // progress per frame

        const animate = () => {
            progress += speed;
            if (progress >= 1.15) {
                progress = 0;
                phase += 1;
            }
            if (phase >= totalSweeps) {
                // flatline after 3 pulses
                setEcgPath(generateEcgPath(2, 480, 100)); // off-screen → flat
                setEcgPhase(phase);
                return;
            }
            setEcgProgress(progress);
            setEcgPath(generateEcgPath(progress, 480, 100));
            setEcgPhase(phase);
            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [status]);

    // ── Input handler ──────────────────────────────────────────────────────────
    const handleInput = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsTyping(true);
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setIsTyping(false), 500);
    }, []);

    // ── Shared Google Sheets logger ────────────────────────────────────────────
    const logToSheet = useCallback((payload) => {
        if (!webhook) return;
        fetch(webhook, {
            method:  'POST',
            mode:    'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload),
        }).catch(() => {});
    }, [webhook]);

    // ── Form submit → Google Sheets ────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            logToSheet({
                type:      'contact',
                timestamp: new Date().toISOString(),
                name:      formData.name,
                email:     formData.email,
                subject:   formData.subject,
                message:   formData.message,
            });
            setStatus('sent');
            setTimeout(() => {
                setStatus('idle');
                setFormData({ name: '', email: '', subject: '', message: '' });
            }, 6000);
        } catch (err) {
            console.error('Contact send error:', err);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 4000);
        }
    };

    // ── Shared style helpers ───────────────────────────────────────────────────
    const labelStyle = {
        fontFamily:    'JetBrains Mono, monospace',
        fontSize:      '0.6rem',
        color:         dimColor,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        display:       'block',
        marginBottom:  '4px',
    };

    // ── Scope labels ───────────────────────────────────────────────────────────
    const isFlatline = status === 'sent' && ecgPhase >= 3;
    const isHeart    = status === 'sent' && ecgPhase >= 3;
    const scopeStatusLabel =
        isHeart              ? '❤ MESSAGE DELIVERED'
        : status === 'sent'    ? 'TRANSMITTING PULSE...'
        : status === 'sending' ? 'TRANSMITTING...'
        : isTyping             ? 'RECEIVING...'
        : 'STANDBY';

    return (
        <section
            id="contact"
            className="section-base"
            data-debug="contact-section"
            style={{ background: sectionBg }}
        >
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>

                {/* ── Section header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: dimColor, letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
                        04 — CONTACT
                    </div>
                    <h2 style={{
                        fontFamily:   'Syne, sans-serif',
                        fontWeight:   800,
                        fontSize:     'clamp(1.6rem, 5vw, 3.5rem)',
                        color:        textColor,
                        marginBottom: '0.75rem',
                    }}>
                        Let's Build Something Real.
                    </h2>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: dimColor, maxWidth: '520px', lineHeight: 1.7, marginBottom: '3rem' }}>
                        If you're working on something meaningful in networking, electronics, or ICT systems — let's talk.
                    </p>
                </motion.div>

                {/* ── Main grid ── */}
                <div style={{
                    display:             'grid',
                    gridTemplateColumns: isTablet ? '1fr' : 'clamp(260px, 35%, 360px) 1fr',
                    gap:                 isMobile ? '2rem' : '3rem',
                    alignItems:          'start',
                }}>

                    {/* ── Left: contact links ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: dimColor, letterSpacing: '0.1em', marginBottom: '16px' }}>
                            // CONTACT TERMINALS
                        </div>

                        <div style={{
                            display:             'grid',
                            gridTemplateColumns: (isTablet && !isMobile) ? '1fr 1fr' : '1fr',
                            gap:                 '8px',
                        }}>
                            {[
                                {
                                    icon:  '📧',
                                    label: 'Email',
                                    value: 'musyokikilavi870@gmail.com',
                                    href:  'mailto:musyokikilavi870@gmail.com',
                                },
                                {
                                    icon:  '📞',
                                    label: 'Phone',
                                    value: '+254 700 663 557',
                                    href:  'tel:+254700663557',
                                },
                                {
                                    icon:  '💼',
                                    label: 'LinkedIn',
                                    value: 'linkedin.com/in/kilavi-musyoki',
                                    href:  'https://www.linkedin.com/in/kilavi-musyoki',
                                },
                                {
                                    icon:  '🐙',
                                    label: 'GitHub',
                                    value: 'github.com/kilavi-musyoki',
                                    href:  'https://github.com/kilavi-musyoki',
                                },
                            ].map((item, i) => (
                                <motion.a
                                    key={item.label}
                                    href={item.href}
                                    target={item.href.startsWith('http') ? '_blank' : undefined}
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                    style={{
                                        display:        'flex',
                                        alignItems:     'center',
                                        gap:            '12px',
                                        padding:        '12px 16px',
                                        border:         `1px solid ${borderColor}`,
                                        borderRadius:   '3px',
                                        textDecoration: 'none',
                                        background:     cardBg,
                                        transition:     'border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease',
                                        cursor:         'pointer',
                                        minWidth:       0,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = borderHover;
                                        e.currentTarget.style.background  = cardBgHover;
                                        e.currentTarget.style.boxShadow   = `0 0 14px ${accentGlow}`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = borderColor;
                                        e.currentTarget.style.background  = cardBg;
                                        e.currentTarget.style.boxShadow   = 'none';
                                    }}
                                >
                                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: dimColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                            {item.label}
                                        </div>
                                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: accentColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.value}
                                        </div>
                                    </div>
                                    <span style={{ marginLeft: 'auto', color: dimColor, flexShrink: 0 }}>→</span>
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Right: oscilloscope + form ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {/* ── Oscilloscope display ── */}
                        <div style={{
                            marginBottom:  '16px',
                            height:        '100px',
                            position:      'relative',
                            background:    status === 'sent' ? (isDark ? '#000f04' : '#f0faf2') : scopeBg,
                            border:        `2px solid ${status === 'sent' ? ecgColor + '88' : status === 'error' ? errorColor + '88' : scopeBorderColor}`,
                            borderRadius:  '8px',
                            overflow:      'hidden',
                            transition:    'background 0.5s, border-color 0.5s',
                            boxShadow:     status === 'sent' ? `0 0 20px ${ecgColor}22` : 'none',
                        }}>
                            {/* Grid */}
                            <div style={{
                                position:        'absolute',
                                inset:           0,
                                backgroundImage: `
                                    linear-gradient(${status === 'sent' ? ecgColor + '09' : scopeGridColor} 1px, transparent 1px),
                                    linear-gradient(90deg, ${status === 'sent' ? ecgColor + '09' : scopeGridColor} 1px, transparent 1px)
                                `,
                                backgroundSize: '40px 40px',
                                transition: 'all 0.5s',
                            }} />

                            {/* Wave / ECG / Heart SVG */}
                            <svg
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                                viewBox="0 0 480 100"
                                preserveAspectRatio="none"
                            >
                                <defs>
                                    <filter id="glow" x="-20%" y="-50%" width="140%" height="200%">
                                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                    <filter id="heart-glow" x="-40%" y="-40%" width="180%" height="180%">
                                        <feGaussianBlur stdDeviation="4" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {status === 'sent' && !isHeart ? (
                                    /* ECG pulse phase */
                                    <>
                                        <path
                                            d={ecgPath}
                                            stroke={ecgColor}
                                            strokeWidth="2"
                                            fill="none"
                                            opacity="0.9"
                                            filter="url(#glow)"
                                        />
                                        <path
                                            d={ecgPath}
                                            stroke={ecgColor}
                                            strokeWidth="5"
                                            fill="none"
                                            opacity="0.15"
                                        />
                                    </>
                                ) : isHeart ? (
                                    /* Heart phase — centred in view */
                                    <g transform="translate(240,50)" filter="url(#heart-glow)">
                                        {/* Beating heart using animateTransform */}
                                        <g style={{ animation: 'heartbeat 0.82s ease-in-out infinite', transformOrigin: 'center' }}>
                                            {/* Heart path centred at 0,0 — scale ~30px */}
                                            <path
                                                d="M0,-14 C6,-22 18,-22 18,-10 C18,0 0,14 0,14 C0,14 -18,0 -18,-10 C-18,-22 -6,-22 0,-14 Z"
                                                fill="#FF5A3C"
                                                opacity="0.92"
                                            />
                                            {/* Highlight glint */}
                                            <ellipse cx="-6" cy="-10" rx="4" ry="3" fill="rgba(255,255,255,0.25)" transform="rotate(-25)" />
                                        </g>
                                        {/* Outer glow ring */}
                                        <circle r="26" fill="none" stroke="#FF5A3C" strokeWidth="1" opacity="0.25"
                                            style={{ animation: 'heart-ring 0.82s ease-out infinite' }} />
                                    </g>
                                ) : status === 'error' ? (
                                    <line x1="0" y1="50" x2="480" y2="50" stroke={errorColor} strokeWidth="1.5" opacity="0.8" />
                                ) : (
                                    <path d={wavePath} stroke={waveColor} strokeWidth="1.5" fill="none" opacity="0.85" />
                                )}
                            </svg>

                            {/* Scope readouts */}
                            <div style={{
                                position: 'absolute', top: '6px', left: '10px',
                                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem',
                                color: status === 'sent' ? ecgColor + 'cc' : scopeLabelColor,
                                transition: 'color 0.4s',
                            }}>
                                {status === 'sent' ? 'BIO · PULSE DETECTED' : 'CH1: SIGNAL · 50mV/div'}
                            </div>
                            <div style={{
                                position: 'absolute', top: '6px', right: '10px',
                                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem',
                                color: status === 'sent' ? ecgColor : status === 'error' ? errorColor : scopeLabelColor,
                                transition: 'color 0.3s',
                            }}>
                                {scopeStatusLabel}
                            </div>

                            {/* BPM readout on success */}
                            <AnimatePresence>
                                {status === 'sent' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: 0.3 }}
                                        style={{
                                            position:   'absolute',
                                            bottom:     '7px',
                                            right:      '10px',
                                            fontFamily: 'JetBrains Mono, monospace',
                                            fontSize:   '0.6rem',
                                            color:      ecgColor,
                                            letterSpacing: '0.06em',
                                        }}
                                    >
                                        {isFlatline ? '— BPM' : '72 BPM'}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Status messages */}
                        <AnimatePresence mode="wait">
                            {status === 'sent' && !isHeart && (
                                <motion.div
                                    key="ecg-msg"
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    style={{
                                        fontFamily: 'JetBrains Mono, monospace',
                                        fontSize: '0.75rem',
                                        color: ecgColor,
                                        textAlign: 'center',
                                        marginBottom: '12px',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    ⚡ TRANSMITTING PULSE...
                                </motion.div>
                            )}
                            {isHeart && (
                                <motion.div
                                    key="heart-msg"
                                    initial={{ opacity: 0, scale: 0.85, y: -6 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                    style={{
                                        fontFamily: 'JetBrains Mono, monospace',
                                        fontSize: '0.8rem',
                                        color: '#FF5A3C',
                                        textAlign: 'center',
                                        marginBottom: '12px',
                                        letterSpacing: '0.06em',
                                        textShadow: '0 0 12px rgba(255,90,60,0.45)',
                                    }}
                                >
                                    ❤ MESSAGE DELIVERED
                                </motion.div>
                            )}
                            {status === 'sent' && (
                                <motion.div
                                    key="sent-sub"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: isHeart ? 0 : 0 }}
                                    style={{ display: 'none' }}
                                />
                            )}
                            {status === 'error' && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        fontFamily: 'JetBrains Mono, monospace',
                                        fontSize: '0.75rem',
                                        color: errorColor,
                                        textAlign: 'center',
                                        marginBottom: '12px',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    ✗ TRANSMISSION FAILED. CHECK SIGNAL.
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                            {/* Name + Email */}
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={labelStyle}>NAME</label>
                                    <input className="hud-input" type="text" name="name" value={formData.name} onChange={handleInput} placeholder="Your name" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>EMAIL</label>
                                    <input className="hud-input" type="email" name="email" value={formData.email} onChange={handleInput} placeholder="your@email.com" required />
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label style={labelStyle}>SUBJECT</label>
                                <input className="hud-input" type="text" name="subject" value={formData.subject} onChange={handleInput} placeholder="What do you want to build?" />
                            </div>

                            {/* Message */}
                            <div>
                                <label style={labelStyle}>MESSAGE</label>
                                <textarea className="hud-input" name="message" value={formData.message} onChange={handleInput} placeholder="Describe what you're building..." required rows={5} style={{ resize: 'vertical' }} />
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                style={{
                                    fontFamily:    'JetBrains Mono, monospace',
                                    fontSize:      '0.8rem',
                                    fontWeight:    700,
                                    letterSpacing: '0.1em',
                                    padding:       '14px 28px',
                                    width:         '100%',
                                    background:    status === 'sending' ? `${accentColor}55` : accentColor,
                                    color:         btnColor,
                                    border:        'none',
                                    borderRadius:  '2px',
                                    cursor:        status === 'sending' ? 'not-allowed' : 'pointer',
                                    textTransform: 'uppercase',
                                    transition:    'all 0.2s ease',
                                    boxShadow:     `0 0 20px ${accentGlow}`,
                                }}
                                onMouseEnter={(e) => {
                                    if (status !== 'sending') {
                                        e.currentTarget.style.transform  = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow  = `0 4px 28px ${accentGlow}`;
                                        e.currentTarget.style.background = accentHover;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform  = 'translateY(0)';
                                    e.currentTarget.style.boxShadow  = `0 0 20px ${accentGlow}`;
                                    e.currentTarget.style.background = status === 'sending' ? `${accentColor}55` : accentColor;
                                }}
                            >
                                {status === 'sending' ? 'TRANSMITTING...' : 'SEND MESSAGE →'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;