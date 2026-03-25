import React, { useRef, useState, useEffect } from 'react';

/**
 * PCBBoard — 7-layer deconstructable ESP32 PCB SVG
 * Always green PCB palette regardless of theme (matches real green PCB aesthetic)
 */
const PCBBoard = ({ layer = 'casing', className = '', isDark = true }) => {
    const [tooltip, setTooltip] = useState(null);
    const [signalPos, setSignalPos] = useState(0); // 0..1 along trace path
    const [ledOn, setLedOn] = useState(true);
    const tooltipTimer = useRef(null);
    const rafRef = useRef(null);
    const ledTimerRef = useRef(null);

    // ── Palette ──────────────────────────────────────────────────────────────
    // Dark  → PCB-green family  (green traces, gold pads, dark substrate)
    // Light → Earthy industrial (burnt-orange traces, slate substrate, silver pads)
    const traceColor        = isDark ? '#4BD8A0'                  : '#C07838';
    const traceColorDim     = isDark ? 'rgba(75,216,160,0.55)'    : 'rgba(192,120,56,0.55)';
    const traceGlow         = isDark ? 'rgba(75,216,160,0.4)'     : 'rgba(192,120,56,0.4)';
    const padColor          = isDark ? '#D4A843'                  : '#C9CFC8';
    const padColorDim       = isDark ? 'rgba(212,168,67,0.4)'     : 'rgba(201,207,200,0.4)';
    const padColorMuted     = isDark ? 'rgba(212,168,67,0.7)'     : 'rgba(201,207,200,0.7)';
    const pcbSubstrate      = isDark ? '#1a2e1a'                  : '#36424A';
    const pcbBorder         = isDark ? 'rgba(75,216,160,0.4)'     : 'rgba(192,120,56,0.4)';
    const casingFill        = isDark ? '#2a2a2a'                  : '#4A5560';
    const casingStroke      = isDark ? '#444'                     : '#687078';
    const casingInner       = isDark ? '#222'                     : '#36424A';
    const casingInnerStroke = isDark ? '#333'                     : '#4A5560';
    const casingLine        = isDark ? '#2f2f2f'                  : '#3e4e58';
    const screwFill         = isDark ? '#1a1a1a'                  : '#2a3840';
    const screwStroke       = isDark ? '#555'                     : '#687078';
    const screwCross        = isDark ? '#777'                     : '#8a9aA4';
    const silkLabel         = isDark ? 'rgba(255,255,255,0.18)'   : 'rgba(201,207,200,0.22)';
    const silkAccent        = isDark ? 'rgba(75,216,160,0.55)'    : 'rgba(192,120,56,0.65)';
    const silkDim           = isDark ? 'rgba(75,216,160,0.32)'    : 'rgba(192,120,56,0.38)';
    const serialColor       = isDark ? 'rgba(75,216,160,0.55)'    : 'rgba(192,120,56,0.6)';
    const serialColorDim    = isDark ? 'rgba(75,216,160,0.3)'     : 'rgba(192,120,56,0.32)';
    const usbFill           = isDark ? '#333'                     : '#4A5560';
    const usbInner          = isDark ? '#111'                     : '#2a3840';
    const esp32Fill         = isDark ? '#1a1a1a'                  : '#2a3840';
    const esp32Inner        = isDark ? '#0d0d0d'                  : '#1C2226';
    const esp32Label        = isDark ? 'rgba(255,255,255,0.6)'    : 'rgba(201,207,200,0.7)';
    const esp32Sub          = isDark ? 'rgba(75,216,160,0.4)'     : 'rgba(192,120,56,0.55)';
    const tooltipPartColor  = isDark ? '#D4A843'                  : '#C07838';
    const tooltipOwner      = isDark ? 'rgba(75,216,160,0.5)'     : 'rgba(192,120,56,0.6)';
    const dieBg             = isDark ? '#000810'                  : '#1C2226';
    const dieGrid           = isDark ? 'rgba(0,255,136,0.15)'     : 'rgba(192,120,56,0.18)';
    const dieRing1          = isDark ? 'rgba(77,255,255,0.3)'     : 'rgba(192,120,56,0.35)';
    const dieRing2          = isDark ? 'rgba(0,255,136,0.4)'      : 'rgba(192,120,56,0.5)';
    const dieCenter         = isDark ? 'rgba(77,255,255,0.5)'     : 'rgba(192,120,56,0.6)';
    const dieLabel          = isDark ? 'rgba(77,255,255,0.5)'     : 'rgba(192,120,56,0.6)';
    const dieCellA          = isDark ? 'rgba(0,255,136,0.3)'      : 'rgba(192,120,56,0.3)';
    const dieCellB          = isDark ? 'rgba(77,255,255,0.1)'     : 'rgba(192,120,56,0.1)';
    const quantumBg         = isDark ? '#000005'                  : '#1C2226';
    const quantumLabel1     = isDark ? 'rgba(77,255,255,0.6)'     : 'rgba(201,207,200,0.7)';
    const quantumLabel2     = isDark ? 'rgba(0,255,136,0.5)'      : 'rgba(192,120,56,0.6)';
    const glowStop1         = isDark ? '#4BD8A0'                  : '#C07838';
    const glowStop2         = isDark ? '#4BD8A0'                  : '#C07838';
    const qGlowA            = isDark ? '#6FD4FF'                  : '#D4A843';
    const qGlowB            = isDark ? '#4BD8A0'                  : '#C07838';
    const qGlowC            = isDark ? '#FF5A3C'                  : '#687078';
    const dieGlowA          = isDark ? '#4DFFFF'                  : '#D4A843';
    const dieGlowB          = isDark ? '#00FF88'                  : '#C07838';
    const thermalLabel      = isDark ? 'rgba(255,170,0,0.8)'      : 'rgba(212,168,67,0.85)';
    const resistorColor     = isDark ? '#8a6cd4'                  : '#7a5c98';
    const capColor          = '#D4A843';
    const capBodyColor      = isDark ? '#c8a82a'                  : '#b89820';
    const vregColor         = isDark ? '#2a4a2a'                  : '#2a3840'; // board IC body

    // ── Signal pulse animation along traces ──────────────────────────────────
    useEffect(() => {
        if (layer !== 'traces' && layer !== 'components') {
            cancelAnimationFrame(rafRef.current);
            return;
        }
        let t = 0;
        const animate = () => {
            t = (t + 0.003) % 1;
            setSignalPos(t);
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [layer]);

    // ── LED blink ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const schedule = () => {
            // random blink every 1.5–4s
            const delay = 1500 + Math.random() * 2500;
            ledTimerRef.current = setTimeout(() => {
                setLedOn(false);
                setTimeout(() => {
                    setLedOn(true);
                    schedule();
                }, 120);
            }, delay);
        };
        schedule();
        return () => clearTimeout(ledTimerRef.current);
    }, []);

    const components = [
        { id: 'C1', x: 25, y: 30, w: 8,  h: 6,  label: 'C1 100nF', func: 'Decoupling cap',    rating: '50V X7R',  color: capColor      },
        { id: 'C2', x: 38, y: 30, w: 8,  h: 6,  label: 'C2 10uF',  func: 'Bulk capacitor',    rating: '16V',      color: capColor      },
        { id: 'C3', x: 25, y: 50, w: 8,  h: 6,  label: 'C3 100nF', func: 'Decoupling cap',    rating: '50V X7R',  color: capColor      },
        { id: 'C4', x: 38, y: 50, w: 8,  h: 6,  label: 'C4 4.7uF', func: 'Filter cap',        rating: '25V',      color: capColor      },
        { id: 'C5', x: 51, y: 30, w: 7,  h: 6,  label: 'C5 220uF', func: 'Bulk electrolytic', rating: '16V',      color: capBodyColor   },
        { id: 'C6', x: 51, y: 50, w: 7,  h: 6,  label: 'C6 470nF', func: 'Filter cap',        rating: '50V',      color: capColor      },
        { id: 'R1', x: 25, y: 72, w: 10, h: 5,  label: 'R1 10kΩ',  func: 'Pull-up resistor',  rating: '1/4W',     color: resistorColor },
        { id: 'R2', x: 40, y: 72, w: 10, h: 5,  label: 'R2 4.7kΩ', func: 'Pull-up resistor',  rating: '1/4W',     color: resistorColor },
        { id: 'R3', x: 25, y: 82, w: 10, h: 5,  label: 'R3 330Ω',  func: 'LED current limit', rating: '1/4W',     color: resistorColor },
        { id: 'R4', x: 40, y: 82, w: 10, h: 5,  label: 'R4 1kΩ',   func: 'Base resistor',     rating: '1/4W',     color: resistorColor },
        { id: 'R5', x: 25, y: 92, w: 10, h: 5,  label: 'R5 2.2kΩ', func: 'Pulldown resistor', rating: '1/4W',     color: resistorColor },
        { id: 'R6', x: 40, y: 92, w: 10, h: 5,  label: 'R6 100kΩ', func: 'Bias resistor',     rating: '1/4W',     color: resistorColor },
    ];

    const handleComponentHover = (e, comp) => {
        clearTimeout(tooltipTimer.current);
        const rect = e.currentTarget.closest('svg').getBoundingClientRect();
        setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top - 70, comp });
    };
    const handleComponentLeave = () => {
        tooltipTimer.current = setTimeout(() => setTooltip(null), 200);
    };

    const layerVisibility = {
        casing:     { casing: 1,   thermal: 0,   pcb: 0,   traces: 0,   components: 0,   die: 0,   quantum: 0 },
        thermal:    { casing: 0,   thermal: 1,   pcb: 1,   traces: 0,   components: 0,   die: 0,   quantum: 0 },
        pcb:        { casing: 0,   thermal: 0,   pcb: 1,   traces: 1,   components: 0,   die: 0,   quantum: 0 },
        traces:     { casing: 0,   thermal: 0,   pcb: 1,   traces: 1,   components: 1,   die: 0,   quantum: 0 },
        components: { casing: 0,   thermal: 0,   pcb: 1,   traces: 1,   components: 1,   die: 0,   quantum: 0 },
        die:        { casing: 0,   thermal: 0,   pcb: 0.3, traces: 0.4, components: 0.5, die: 1,   quantum: 0 },
        quantum:    { casing: 0,   thermal: 0,   pcb: 0,   traces: 0,   components: 0,   die: 0.2, quantum: 1 },
    };
    const vis = layerVisibility[layer] || layerVisibility.casing;

    // Signal dot position along a simplified path (horizontal + vertical segments)
    // Total path length approximation: 340 units
    const totalLen = 340;
    const dist = signalPos * totalLen;
    const signalDot = (() => {
        // Path: M12,80 → L22,80 → L22,68 → L90,68 → L90,65 → [turn back] L90,103 → L100,103 → L100,120 → L114,120 → L114,135 → L85,148
        const segs = [
            { x1:12,y1:80, x2:22,y2:80 },
            { x1:22,y1:80, x2:22,y2:68 },
            { x1:22,y1:68, x2:90,y2:68 },
            { x1:90,y1:68, x2:90,y2:103 },
            { x1:90,y1:103, x2:100,y2:103 },
            { x1:100,y1:103, x2:100,y2:120 },
            { x1:100,y1:120, x2:114,y2:120 },
            { x1:114,y1:120, x2:114,y2:135 },
            { x1:114,y1:135, x2:85,y2:135 },
            { x1:85,y1:135, x2:85,y2:148 },
        ];
        let rem = dist;
        for (const seg of segs) {
            const len = Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1);
            if (rem <= len) {
                const t = rem / len;
                return { x: seg.x1 + (seg.x2 - seg.x1) * t, y: seg.y1 + (seg.y2 - seg.y1) * t };
            }
            rem -= len;
        }
        return { x: 85, y: 148 };
    })();

    return (
        <div className={`relative board-container ${className}`}>
            <svg
                viewBox="0 0 200 160"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
                <defs>
                    <radialGradient id="board-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%"   stopColor={glowStop1} stopOpacity="0.15" />
                        <stop offset="100%" stopColor={glowStop2} stopOpacity="0"    />
                    </radialGradient>
                    <radialGradient id="quantum-glow" cx="50%" cy="50%" r="60%">
                        <stop offset="0%"   stopColor={qGlowA} stopOpacity="0.3"  />
                        <stop offset="50%"  stopColor={qGlowB} stopOpacity="0.18" />
                        <stop offset="100%" stopColor={qGlowC} stopOpacity="0"    />
                    </radialGradient>
                    <filter id="pcb-glow">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="led-glow">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="signal-glow">
                        <feGaussianBlur stdDeviation="1.2" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <linearGradient id="thermal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%"   stopColor="#0000FF" stopOpacity="0.3"  />
                        <stop offset="30%"  stopColor="#00FF00" stopOpacity="0.25" />
                        <stop offset="60%"  stopColor="#FFAA00" stopOpacity="0.3"  />
                        <stop offset="100%" stopColor="#FF0000" stopOpacity="0.4"  />
                    </linearGradient>
                    <pattern id="wafer-grid" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                        <rect width="8" height="8" fill="none" stroke={dieGrid} strokeWidth="0.3" />
                    </pattern>
                    <radialGradient id="die-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%"   stopColor={dieGlowA} stopOpacity="0.4"  />
                        <stop offset="100%" stopColor={dieGlowB} stopOpacity="0.05" />
                    </radialGradient>
                    {/* Substrate texture pattern */}
                    <pattern id="pcb-texture" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                        <rect width="4" height="4" fill="none" />
                        <circle cx="2" cy="2" r="0.3" fill="rgba(75,216,160,0.06)" />
                    </pattern>
                </defs>

                {/* ══════ LAYER: CASING ══════ */}
                <g opacity={vis.casing} style={{ transition: 'opacity 0.8s ease' }}>
                    <rect x="2" y="2" width="196" height="156" rx="6" fill={casingFill} stroke={casingStroke} strokeWidth="1" />
                    <rect x="8" y="8" width="184" height="144" rx="4" fill={casingInner} stroke={casingInnerStroke} strokeWidth="0.5" />
                    {[...Array(14)].map((_, i) => (
                        <line key={i} x1="8" y1={14 + i * 10} x2="192" y2={14 + i * 10} stroke={casingLine} strokeWidth="0.3" />
                    ))}
                    {[[14,14],[186,14],[14,146],[186,146]].map(([cx, cy], i) => (
                        <g key={i}>
                            <circle cx={cx} cy={cy} r="5"  fill={screwFill}  stroke={screwStroke} strokeWidth="0.8" />
                            <line x1={cx-3} y1={cy} x2={cx+3} y2={cy}   stroke={screwCross} strokeWidth="0.8" />
                            <line x1={cx} y1={cy-3} x2={cx} y2={cy+3}   stroke={screwCross} strokeWidth="0.8" />
                        </g>
                    ))}
                    <text x="100" y="86" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="5.5" fill={serialColor} letterSpacing="0.3">
                        SN-2024-KM-PORTFOLIO-REV2
                    </text>
                    <text x="100" y="94" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="3.5" fill={serialColorDim} letterSpacing="0.1">
                        SILICON SOUL · KILAVI MUSYOKI · DEKUT
                    </text>
                    {[...Array(6)].map((_, i) => (
                        <rect key={i} x={170} y={30 + i * 16} width="18" height="4" rx="2" fill="#111" />
                    ))}
                </g>

                {/* ══════ LAYER: THERMAL ══════ */}
                <g opacity={vis.thermal} style={{ transition: 'opacity 0.8s ease' }}>
                    <rect x="2" y="2" width="196" height="156" rx="6" fill="url(#thermal-grad)" />
                    <text x="100" y="85" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="4" fill={thermalLabel}>
                        THERMAL PROFILE — ACTIVE
                    </text>
                    <circle cx="114" cy="84" r="20" fill="rgba(255,60,0,0.25)"  />
                    <circle cx="114" cy="84" r="12" fill="rgba(255,120,0,0.2)"  />
                </g>

                {/* ══════ LAYER: PCB BASE ══════ */}
                <g opacity={vis.pcb} style={{ transition: 'opacity 0.8s ease' }}>
                    {/* Green substrate */}
                    <rect x="4" y="4" width="192" height="152" rx="5" fill={pcbSubstrate} />
                    {/* Subtle fiberglass texture */}
                    <rect x="4" y="4" width="192" height="152" rx="5" fill="url(#pcb-texture)" />
                    {/* Board edge highlight */}
                    <rect x="4" y="4" width="192" height="152" rx="5" fill="none" stroke={traceColor} strokeWidth="0.5" strokeOpacity="0.4" />

                    {/* Mounting hole pads */}
                    {[[14,14],[186,14],[14,146],[186,146]].map(([cx, cy], i) => (
                        <g key={i}>
                            <circle cx={cx} cy={cy} r="5"  fill="none"    stroke={padColor} strokeWidth="1.5" />
                            <circle cx={cx} cy={cy} r="3"  fill={pcbSubstrate} stroke={padColor} strokeWidth="0.8" />
                            <circle cx={cx} cy={cy} r="1.2" fill={padColor} opacity="0.6" />
                        </g>
                    ))}

                    {/* 40-pin GPIO header */}
                    {[...Array(20)].map((_, i) => (
                        <g key={i}>
                            <rect x="5"   y={20 + i * 6} width="6" height="4" rx="0.5" fill={padColor} />
                            <rect x="6.5" y={21 + i * 6} width="3" height="2" rx="0"   fill="#111" />
                        </g>
                    ))}
                    <text x="13" y="10" fontFamily="JetBrains Mono, monospace" fontSize="3" fill={silkAccent}>GPIO</text>

                    {/* USB-C port */}
                    <rect x="86" y="148" width="28" height="8" rx="2" fill={usbFill}  stroke={padColor} strokeWidth="0.8" />
                    <rect x="90" y="150" width="20" height="4" rx="1" fill={usbInner} />
                    <text x="100" y="155" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="2.5" fill={padColor}>USB-C</text>

                    {/* RF antenna trace — inverted-F */}
                    <g stroke={traceColor} strokeWidth="1.5" fill="none" opacity="0.7" filter="url(#pcb-glow)">
                        <path d="M150 8 L160 8 L160 20 L175 20 L175 8 L185 8" />
                        <path d="M160 12 L167 12" />
                        <path d="M168 12 L175 12" />
                    </g>
                    <text x="167" y="7" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="2.5" fill={silkDim}>ANT1</text>

                    {/* Crystal oscillator — 8MHz */}
                    <g>
                        <rect x="155" y="60" width="12" height="6" rx="1" fill="#b8a060" stroke={padColor} strokeWidth="0.6" />
                        <rect x="155" y="65" width="3"  height="3" rx="0.3" fill={padColor} opacity="0.8" />
                        <rect x="164" y="65" width="3"  height="3" rx="0.3" fill={padColor} opacity="0.8" />
                        <text x="161" y="65" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="2" fill="rgba(0,0,0,0.7)">8M</text>
                        <text x="161" y="59" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="2" fill={silkDim}>Y1</text>
                    </g>

                    {/* Voltage regulator AMS1117 */}
                    <g>
                        <rect x="155" y="80" width="18" height="10" rx="1" fill={vregColor} stroke={traceColor} strokeWidth="0.5" strokeOpacity="0.6" />
                        <rect x="156" y="89" width="4" height="3" rx="0.3" fill={padColor} opacity="0.8" />
                        <rect x="161" y="89" width="4" height="3" rx="0.3" fill={padColor} opacity="0.8" />
                        <rect x="166" y="89" width="4" height="3" rx="0.3" fill={padColor} opacity="0.8" />
                        <text x="164" y="87" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="2" fill={silkAccent}>VR1</text>
                        <text x="164" y="83" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="1.8" fill="rgba(75,216,160,0.4)">3.3V</text>
                    </g>

                    {/* NE555 / DIP-8 style IC */}
                    <g>
                        <rect x="155" y="105" width="18" height="20" rx="1" fill="#1a1a2a" stroke={padColor} strokeWidth="0.5" />
                        {/* pin notch */}
                        <path d="M162 105 a3,3 0 0,0 6,0" fill="#111" />
                        {[0,1,2,3].map(i => (
                            <g key={i}>
                                <rect x={153} y={108 + i * 4} width="3" height="2" rx="0.3" fill={padColor} opacity="0.8" />
                                <rect x={174} y={108 + i * 4} width="3" height="2" rx="0.3" fill={padColor} opacity="0.8" />
                            </g>
                        ))}
                        <text x="164" y="117" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="2.5" fill="rgba(255,255,255,0.4)">U2</text>
                        <text x="164" y="121" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="2" fill="rgba(75,216,160,0.35)">555</text>
                    </g>

                    {/* Electrolytic capacitors (through-hole) */}
                    <g>
                        {[[63,130],[72,130],[81,130]].map(([cx,cy],i) => (
                            <g key={i}>
                                <circle cx={cx} cy={cy} r="5" fill={capBodyColor} stroke={padColor} strokeWidth="0.5" />
                                <circle cx={cx} cy={cy} r="3" fill="#8a7020" />
                                <line x1={cx-1} y1={cy} x2={cx+1} y2={cy} stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
                                <line x1={cx} y1={cy-1} x2={cx} y2={cy+1} stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
                                <text x={cx} y={cy-6} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="1.8" fill={silkAccent}>{`C${7+i}`}</text>
                                {/* leads */}
                                <line x1={cx-1.5} y1={cy+5} x2={cx-1.5} y2={cy+8} stroke={padColor} strokeWidth="0.8" />
                                <line x1={cx+1.5} y1={cy+5} x2={cx+1.5} y2={cy+8} stroke={padColor} strokeWidth="0.8" />
                            </g>
                        ))}
                    </g>

                    {/* Ferrite bead / inductor */}
                    <g>
                        <rect x="62" y="25" width="12" height="6" rx="3" fill="#2a2a3a" stroke={traceColor} strokeWidth="0.5" strokeOpacity="0.6" />
                        <line x1="59" y1="28" x2="62" y2="28" stroke={traceColor} strokeWidth="0.8" />
                        <line x1="74" y1="28" x2="77" y2="28" stroke={traceColor} strokeWidth="0.8" />
                        <text x="68" y="23" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="2" fill={silkDim}>FB1</text>
                    </g>

                    {/* Silk labels */}
                    <text x="100" y="155" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="2" fill={silkLabel}>SN-2024-KM-PORTFOLIO-REV2</text>
                    <text x="5"   y="140" fontFamily="JetBrains Mono, monospace"                    fontSize="2" fill={silkLabel}>UART</text>
                    <text x="5"   y="17"  fontFamily="JetBrains Mono, monospace"                    fontSize="2" fill={silkLabel}>J1</text>
                </g>

                {/* ══════ LAYER: TRACES ══════ */}
                <g opacity={vis.traces} style={{ transition: 'opacity 0.8s ease' }}>
                    {/* Power & data traces */}
                    <g stroke={traceColor} strokeWidth="1" fill="none" filter="url(#pcb-glow)">
                        {/* Main signal bus */}
                        <path d="M12 80 L22 80 L22 68 L90 68 L90 65"         strokeWidth="1.5" opacity="0.65" />
                        <path d="M12 90 L22 90 L22 95 L90 95 L90 103"        strokeWidth="1.2" opacity="0.65" />
                        {/* Branch traces */}
                        <path d="M55 35 L70 35 L70 50 L90 50"                strokeWidth="0.8" opacity="0.55" />
                        <path d="M55 55 L70 55 L70 60 L90 60"                strokeWidth="0.8" opacity="0.55" />
                        <path d="M55 75 L80 75 L80 80 L90 80"                strokeWidth="0.8" opacity="0.55" />
                        <path d="M55 87 L80 87 L80 90 L90 90"                strokeWidth="0.8" opacity="0.55" />
                        {/* Right-side output traces */}
                        <path d="M133 84 L150 84 L150 60 L155 60"            strokeWidth="0.8" opacity="0.55" />
                        <path d="M133 74 L145 74 L145 28 L155 28"            strokeWidth="0.8" opacity="0.55" />
                        <path d="M133 94 L150 94 L150 80 L155 80"            strokeWidth="0.8" opacity="0.55" />
                        {/* Ground / power rails */}
                        <path d="M100 103 L100 120 L55 120"                  strokeWidth="1"   opacity="0.6"  />
                        <path d="M114 103 L114 135 L100 135 L85 135 L85 148" strokeWidth="1.2" opacity="0.65" />
                        {/* Additional routing */}
                        <path d="M55 120 L55 130"                             strokeWidth="0.8" opacity="0.45" />
                        <path d="M150 84 L150 105 L155 105"                  strokeWidth="0.8" opacity="0.45" />
                        {/* Ferrite to ESP */}
                        <path d="M77 28 L90 28 L90 60"                       strokeWidth="0.8" opacity="0.45" />
                    </g>

                    {/* Via pads — plated through-holes */}
                    {[[75,50],[75,60],[150,84],[85,148],[100,120],[90,28],[55,120],[150,105]].map(([cx, cy], i) => (
                        <g key={i}>
                            <circle cx={cx} cy={cy} r="3"   fill="none"    stroke={padColor} strokeWidth="1.2" />
                            <circle cx={cx} cy={cy} r="1.8" fill="none"    stroke={padColor} strokeWidth="0.5" strokeOpacity="0.5" />
                            <circle cx={cx} cy={cy} r="1"   fill={padColor} opacity="0.7" />
                        </g>
                    ))}

                    {/* Signal travel dot */}
                    {(layer === 'traces' || layer === 'components') && (
                        <g filter="url(#signal-glow)">
                            <circle
                                cx={signalDot.x}
                                cy={signalDot.y}
                                r="2.5"
                                fill="#00FFAA"
                                opacity="0.9"
                            />
                            <circle
                                cx={signalDot.x}
                                cy={signalDot.y}
                                r="1.2"
                                fill="#ffffff"
                                opacity="0.95"
                            />
                        </g>
                    )}
                </g>

                {/* ══════ LAYER: COMPONENTS ══════ */}
                <g opacity={vis.components} style={{ transition: 'opacity 0.8s ease' }}>
                    {/* ESP32 Module */}
                    <g
                        onMouseEnter={(e) => handleComponentHover(e, { id: 'U1', label: 'ESP32-WROOM-32', func: 'Core Processing Unit', rating: '240MHz dual-core Xtensa LX6' })}
                        onMouseLeave={handleComponentLeave}
                        style={{ cursor: 'crosshair' }}
                    >
                        <rect x="90" y="60" width="48" height="48" rx="2" fill={esp32Fill}  stroke={padColor} strokeWidth="1" />
                        <rect x="92" y="62" width="44" height="44" rx="1" fill={esp32Inner} />
                        {/* Metal shield pattern */}
                        {[...Array(5)].map((_,i) => (
                            <line key={i} x1={92} y1={64+i*8} x2={136} y2={64+i*8} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                        ))}
                        {/* Top / bottom pads */}
                        {[...Array(8)].map((_, i) => <rect key={`tp-${i}`} x={93 + i * 5.5} y="59"  width="3" height="3" rx="0.5" fill={padColor} />)}
                        {[...Array(8)].map((_, i) => <rect key={`bp-${i}`} x={93 + i * 5.5} y="106" width="3" height="3" rx="0.5" fill={padColor} />)}
                        {[...Array(5)].map((_, i) => <rect key={`rp-${i}`} x="137" y={63 + i * 8}   width="3" height="3" rx="0.5" fill={padColor} />)}
                        <text x="114" y="84" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="3.5" fill={esp32Label}>ESP32</text>
                        <text x="114" y="89" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="2.5" fill={esp32Sub}>WROOM-32</text>
                        <text x="96"  y="58" fontFamily="JetBrains Mono, monospace" fontSize="3" fill={silkAccent}>U1</text>
                    </g>

                    {/* Caps + resistors */}
                    {components.map((comp) => (
                        <g key={comp.id} onMouseEnter={(e) => handleComponentHover(e, comp)} onMouseLeave={handleComponentLeave} style={{ cursor: 'crosshair' }}>
                            <rect x={comp.x} y={comp.y} width={comp.w} height={comp.h} rx="1" fill={comp.color} stroke={padColorDim} strokeWidth="0.5" />
                            {/* Stripe on resistors */}
                            {comp.id.startsWith('R') && (
                                <>
                                    <line x1={comp.x+3} y1={comp.y} x2={comp.x+3} y2={comp.y+comp.h} stroke="rgba(255,200,0,0.6)" strokeWidth="1" />
                                    <line x1={comp.x+6} y1={comp.y} x2={comp.x+6} y2={comp.y+comp.h} stroke="rgba(255,100,0,0.6)" strokeWidth="1" />
                                </>
                            )}
                            <text x={comp.x + comp.w / 2} y={comp.y - 1} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="2" fill={silkAccent}>{comp.id}</text>
                        </g>
                    ))}

                    {/* LED1 — blinks */}
                    <g id="board-led" filter="url(#led-glow)">
                        <circle cx="170" cy="55" r="4.5"
                            fill={ledOn ? '#FF5A3C' : 'rgba(255,90,60,0.25)'}
                            opacity={ledOn ? 0.9 : 0.5}
                            className="board-eye"
                            style={{ transition: 'fill 0.05s, opacity 0.05s' }}
                        />
                        <circle cx="170" cy="55" r="2" fill={ledOn ? '#FF8060' : 'rgba(255,128,96,0.3)'} style={{ transition: 'fill 0.05s' }} />
                        {/* LED body */}
                        <rect x="167.5" y="58" width="5" height="3" rx="0.5" fill="rgba(255,90,60,0.3)" />
                        <text x="174" y="54" fontFamily="JetBrains Mono, monospace" fontSize="2.5" fill="rgba(255,90,60,0.7)">LED1</text>
                    </g>

                    {/* LED2 — green status */}
                    <g filter="url(#led-glow)">
                        <circle cx="170" cy="70" r="3" fill={traceColor} opacity="0.8" className="pcb-led-green" />
                        <circle cx="170" cy="70" r="1.5" fill="#aaffcc" opacity="0.9" />
                        <text x="174" y="69" fontFamily="JetBrains Mono, monospace" fontSize="2.5" fill={silkDim}>LED2</text>
                    </g>

                    {/* Silk screen */}
                    <text x="22" y="17" fontFamily="JetBrains Mono, monospace" fontSize="2.5" fill={silkLabel}>KILAVI MUSYOKI</text>
                    <text x="22" y="13" fontFamily="JetBrains Mono, monospace" fontSize="2"   fill={silkDim}>DeKUT · ELECTRONICS</text>
                    <text x="57" y="23" fontFamily="JetBrains Mono, monospace" fontSize="2"   fill={silkDim}>GPIO26</text>
                </g>

                {/* ══════ LAYER: SILICON DIE ══════ */}
                <g opacity={vis.die} style={{ transition: 'opacity 0.8s ease' }}>
                    <rect x="4" y="4" width="192" height="152" rx="5" fill={dieBg} />
                    <rect x="60" y="40" width="80" height="80" fill="url(#wafer-grid)" />
                    <rect x="60" y="40" width="80" height="80" fill="url(#die-glow)"  />
                    <circle cx="100" cy="80" r="30" fill="none" stroke={dieRing1} strokeWidth="0.5" />
                    <circle cx="100" cy="80" r="15" fill="none" stroke={dieRing2} strokeWidth="0.5" />
                    <circle cx="100" cy="80" r="5"  fill={dieCenter} />
                    <text x="100" y="130" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="3.5" fill={dieLabel}>SILICON · DIE · VIEW</text>
                    {[...Array(10)].map((_, i) =>
                        [...Array(10)].map((_, j) => (
                            <rect key={`${i}-${j}`}
                                x={62 + j * 8} y={42 + i * 8} width="6" height="6" rx="0.5"
                                fill={Math.random() > 0.7 ? dieCellA : dieCellB}
                            />
                        ))
                    )}
                </g>

                {/* ══════ LAYER: QUANTUM CORE ══════ */}
                <g opacity={vis.quantum} style={{ transition: 'opacity 0.8s ease' }}>
                    <rect x="0" y="0" width="200" height="160" fill={quantumBg} />
                    <ellipse cx="100" cy="80" rx="80" ry="60" fill="url(#quantum-glow)" />
                    <text x="100" y="76" textAnchor="middle" fontFamily="Syne, sans-serif"          fontSize="7" fontWeight="700" fill={quantumLabel1}>QUANTUM</text>
                    <text x="100" y="86" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="4" fill={quantumLabel2}>CORE ENERGY</text>
                </g>

                {/* Board ambient glow */}
                <ellipse
                    cx="100" cy="160" rx="70" ry="20"
                    fill="url(#board-glow)"
                    style={{ animation: 'glow-pulse 3.5s ease-in-out infinite' }}
                />
            </svg>

            {/* Component tooltip */}
            {tooltip && (
                <div className="pcb-tooltip" style={{ left: tooltip.x + 10, top: tooltip.y }}>
                    <div style={{ color: tooltipPartColor, marginBottom: '2px' }}>PART: {tooltip.comp.id}</div>
                    <div>FUNCTION: {tooltip.comp.label || tooltip.comp.func}</div>
                    {tooltip.comp.rating && <div>RATING: {tooltip.comp.rating}</div>}
                    <div style={{ color: tooltipOwner, marginTop: '2px' }}>OWNER: Kilavi Musyoki</div>
                </div>
            )}
        </div>
    );
};

export default PCBBoard;
