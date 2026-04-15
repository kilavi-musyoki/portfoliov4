import React, { useState, useRef, useCallback } from 'react';

// ── Fire a keyboard event that TetrusGame's window listener catches ───────────
const fireKey = (key) => {
    window.dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    );
};

// ── Single arcade button ──────────────────────────────────────────────────────
function ArcadeBtn({ icon, label, gameKey, color = '#4BD8A0', size = 44, repeat = false }) {
    const [pressed, setPressed]   = useState(false);
    const timerRef    = useRef(null);
    const intervalRef = useRef(null);

    const stopRepeat = () => {
        clearTimeout(timerRef.current);
        clearInterval(intervalRef.current);
        timerRef.current    = null;
        intervalRef.current = null;
    };

    const onDown = useCallback((e) => {
        e.preventDefault();
        setPressed(true);
        fireKey(gameKey);
        if (repeat) {
            timerRef.current = setTimeout(() => {
                intervalRef.current = setInterval(() => fireKey(gameKey), 75);
            }, 210);
        }
    }, [gameKey, repeat]);

    const onUp = useCallback(() => {
        setPressed(false);
        stopRepeat();
    }, []);

    const iconSize  = Math.floor(size * 0.38);
    const labelSize = Math.max(5, Math.floor(size * 0.145));
    const halfSize  = size / 2;

    return (
        <button
            onPointerDown={onDown}
            onPointerUp={onUp}
            onPointerLeave={onUp}
            onPointerCancel={onUp}
            style={{
                width:        `${size}px`,
                height:       `${size}px`,
                borderRadius: `${halfSize}px`,
                flexShrink:   0,
                background: pressed
                    ? `radial-gradient(ellipse at 45% 45%, ${color}30 0%, rgba(4,8,4,0.96) 100%)`
                    : `radial-gradient(ellipse at 35% 28%, rgba(72,76,72,0.55) 0%, rgba(10,12,10,0.97) 62%, rgba(0,0,0,1) 100%)`,
                border: `1.5px solid ${pressed ? color + 'bb' : color + '44'}`,
                boxShadow: pressed
                    ? `0 1px 2px rgba(0,0,0,0.9), inset 0 2px 8px rgba(0,0,0,0.75), 0 0 5px ${color}44`
                    : `0 4px 0 rgba(0,0,0,0.65), 0 0 12px ${color}28, inset 0 1px 0 rgba(255,255,255,0.09)`,
                color,
                cursor:     'pointer',
                display:    'flex',
                flexDirection: 'column',
                alignItems:   'center',
                justifyContent: 'center',
                gap:      '2px',
                padding:  0,
                transform: pressed ? 'translateY(3px) scale(0.91)' : 'translateY(0) scale(1)',
                transition: 'transform 0.06s, box-shadow 0.06s, border-color 0.06s, background 0.06s',
                userSelect:              'none',
                touchAction:             'none',
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
            }}
        >
            <span style={{ fontSize: `${iconSize}px`, lineHeight: 1, pointerEvents: 'none' }}>
                {icon}
            </span>
            {label && (
                <span style={{
                    fontFamily:    'JetBrains Mono, monospace',
                    fontSize:      `${labelSize}px`,
                    letterSpacing: '0.02em',
                    opacity:       0.50,
                    lineHeight:    1,
                    pointerEvents: 'none',
                }}>
                    {label}
                </span>
            )}
        </button>
    );
}

// ── Full arcade controller panel ──────────────────────────────────────────────
export default function GamePad({ leverValue = 0, isDark = true }) {
    // Mirror the same threshold used in TetrusGame (GLITCH_LIGHT = 0.09)
    const isGlitching  = leverValue > 0.09;
    const glitchNorm   = Math.min(1, Math.max(0, (leverValue - 0.09) / 0.19));

    const panelBg = isDark
        ? 'linear-gradient(165deg, rgba(20,24,20,0.97) 0%, rgba(10,12,10,0.99) 100%)'
        : 'linear-gradient(165deg, rgba(196,200,196,0.97) 0%, rgba(176,180,176,0.99) 100%)';

    const accentColor  = isDark ? '#4BD8A0' : '#C07838';
    const panelBorder  = isDark ? 'rgba(75,216,160,0.18)' : 'rgba(192,120,56,0.22)';
    const screwBg      = isDark ? '#181c18' : '#b8bcb8';
    const screwBorder  = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.14)';
    const dividerClr   = isDark ? 'rgba(75,216,160,0.15)' : 'rgba(192,120,56,0.20)';
    const ctrlLabel    = isDark ? 'rgba(75,216,160,0.30)' : 'rgba(192,120,56,0.35)';
    const dimClr       = isDark ? 'rgba(206,208,206,0.22)' : 'rgba(28,34,38,0.22)';

    // Screw positions: 4 corners
    const screws = [
        { left: '4px',           top: '4px'            },
        { left: 'calc(100% - 10px)', top: '4px'        },
        { left: '4px',           top: 'calc(100% - 10px)' },
        { left: 'calc(100% - 10px)', top: 'calc(100% - 10px)' },
    ];

    return (
        <div style={{
            position:   'relative',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap:        '0.65rem',
            padding:    '0.55rem 0.75rem 0.65rem',
            background: panelBg,
            border:     `1px solid ${panelBorder}`,
            borderRadius: '10px',
            boxShadow: isDark
                ? `0 6px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(0,0,0,0.4)`
                : `0 4px 16px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.5)`,
            opacity:        isGlitching ? Math.max(0.18, 1 - glitchNorm * 0.82) : 1,
            pointerEvents:  isGlitching ? 'none' : 'auto',
            transition:     'opacity 0.35s ease',
            userSelect:     'none',
        }}>
            {/* Corner screws */}
            {screws.map((pos, i) => (
                <div key={i} style={{
                    position:     'absolute',
                    width:        '6px',
                    height:       '6px',
                    borderRadius: '50%',
                    background:   screwBg,
                    border:       `1px solid ${screwBorder}`,
                    boxShadow:    'inset 0 0 2px rgba(0,0,0,0.7)',
                    ...pos,
                }}>
                    {/* Phillips cross */}
                    <div style={{
                        position: 'absolute', inset: '1px',
                        background: `linear-gradient(${screwBorder},${screwBorder}) center/1px 100% no-repeat,
                                     linear-gradient(${screwBorder},${screwBorder}) center/100% 1px no-repeat`,
                    }} />
                </div>
            ))}

            {/* ── LEFT CLUSTER: D-pad ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                {/* ROTATE on top */}
                <ArcadeBtn icon="↺" label="ROT" gameKey="ArrowUp" color="#6FD4FF" size={42} />

                {/* LEFT / center dot / RIGHT */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <ArcadeBtn icon="◄" gameKey="ArrowLeft" color="#4BD8A0" size={42} repeat />

                    {/* Center hub */}
                    <div style={{
                        width:        '28px',
                        height:       '42px',
                        display:      'flex',
                        alignItems:   'center',
                        justifyContent: 'center',
                    }}>
                        <div style={{
                            width:        '10px',
                            height:       '10px',
                            borderRadius: '50%',
                            background:   isDark ? '#141814' : '#c8ccc8',
                            border:       `1px solid ${panelBorder}`,
                            boxShadow:    'inset 0 1px 2px rgba(0,0,0,0.6)',
                        }} />
                    </div>

                    <ArcadeBtn icon="►" gameKey="ArrowRight" color="#4BD8A0" size={42} repeat />
                </div>

                {/* SOFT DROP on bottom */}
                <ArcadeBtn icon="▼" label="SLOW" gameKey="ArrowDown" color="#D4A843" size={42} repeat />
            </div>

            {/* ── CENTER LABEL ── */}
            <div style={{
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                gap:            '4px',
                padding:        '0 0.3rem',
                minWidth:       '38px',
            }}>
                <div style={{
                    fontFamily:    'JetBrains Mono, monospace',
                    fontSize:      '0.48rem',
                    fontWeight:    700,
                    color:         ctrlLabel,
                    letterSpacing: '0.16em',
                    textAlign:     'center',
                }}>
                    TETRUS
                </div>
                {/* Divider */}
                <div style={{
                    width:      '1px',
                    height:     '20px',
                    background: `linear-gradient(to bottom, transparent, ${dividerClr}, transparent)`,
                }} />
                <div style={{
                    fontFamily:    'JetBrains Mono, monospace',
                    fontSize:      '0.36rem',
                    color:         dimClr,
                    letterSpacing: '0.10em',
                    textAlign:     'center',
                }}>
                    CTRL
                </div>
            </div>

            {/* ── RIGHT CLUSTER: action button ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <ArcadeBtn icon="⬇" gameKey=" " color="#E040FB" size={56} />
                <div style={{
                    fontFamily:    'JetBrains Mono, monospace',
                    fontSize:      '0.36rem',
                    color:         'rgba(224,64,251,0.38)',
                    letterSpacing: '0.08em',
                    textAlign:     'center',
                }}>
                    HARD DROP
                </div>
            </div>

            {/* Glitch overlay text when signallost */}
            {isGlitching && glitchNorm > 0.5 && (
                <div style={{
                    position:     'absolute',
                    inset:        0,
                    display:      'flex',
                    alignItems:   'center',
                    justifyContent: 'center',
                    borderRadius: '10px',
                    background:   'rgba(0,0,0,0.3)',
                    pointerEvents: 'none',
                }}>
                    <span style={{
                        fontFamily:    'JetBrains Mono, monospace',
                        fontSize:      '0.42rem',
                        color:         `rgba(255,45,45,${0.4 + glitchNorm * 0.5})`,
                        letterSpacing: '0.15em',
                        textShadow:    `0 0 8px rgba(255,45,45,${glitchNorm * 0.6})`,
                    }}>
                        SIGNAL LOST
                    </span>
                </div>
            )}
        </div>
    );
}
