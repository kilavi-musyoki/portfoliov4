import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const LAYERS = [
    { threshold: 0.2, name: 'PRODUCT', desc: 'Consumer interface layer', status: 'SYS.ONLINE', color: '#ced0ce' },
    { threshold: 0.4, name: 'TENSION', desc: 'Abstraction layer weakening', status: 'SYS.WARN', color: '#D4A843' },
    { threshold: 0.6, name: 'TEARDOWN', desc: 'Structural breakdown', status: 'SYS.UNSTABLE', color: '#FF8C42' },
    { threshold: 0.8, name: 'SYSTEM', desc: 'Electronic substrate revealed', status: 'SYS.CALIBRATED', color: '#4BD8A0' },
    { threshold: 1.01, name: 'SIGNAL', desc: 'Raw signal domain', status: 'SYS.RAW_DATA', color: '#6FD4FF' },
];

const getLayer = (lv) => LAYERS.find(l => lv < l.threshold) || LAYERS[LAYERS.length - 1];

export default function LayerLabel({ leverValue, isDark }) {
    const layer = getLayer(leverValue);
    const dim = isDark ? 'rgba(206,208,206,0.36)' : 'rgba(28,34,38,0.34)';
    const pct = Math.round(leverValue * 100);

    return (
        <div style={{
            position: 'absolute', bottom: '0.85rem', left: '0.85rem',
            zIndex: 10, pointerEvents: 'none',
        }}>
            <AnimatePresence mode="wait">
                {leverValue < 0.8 && (
                    <motion.div
                        key={layer.name}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                    {/* Name + status badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
                        <div style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.62rem',
                            color: layer.color,
                            letterSpacing: '0.15em',
                            fontWeight: 700,
                            textShadow: `0 0 9px ${layer.color}75`,
                        }}>
                            ◈ {layer.name}
                        </div>
                        <div style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.42rem',
                            padding: '1.5px 4px',
                            background: 'rgba(0,0,0,0.38)',
                            border: `0.5px solid ${layer.color}38`,
                            color: layer.color,
                            borderRadius: '2px',
                            letterSpacing: '0.05em',
                        }}>
                            {layer.status}
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.48rem',
                        color: dim,
                        letterSpacing: '0.04em',
                    }}>
                        {layer.desc}{' '}
                        <span style={{ opacity: 0.45 }}>// DEPTH: {pct}%</span>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}