import React, { useEffect, useState } from 'react';

const DebugOverlay = ({ visible, fps, isDark = true }) => {
    const [heap, setHeap] = useState(47);
    const [stack, setStack] = useState(12);

    const sections = [
        { name: 'hero',       bounds: '[0 - 100vh]',     var: 'bootComplete, layer, mousePos'      },
        { name: 'about',      bounds: '[100vh - 200vh]',  var: 'skills[], datasheetVisible'         },
        { name: 'projects',   bounds: '[200vh - 300vh]',  var: 'activeCard, expandedId'             },
        { name: 'milestones', bounds: '[300vh - 400vh]',  var: 'changelog[], hoverEntry'            },
        { name: 'contact',    bounds: '[400vh - 500vh]',  var: 'waveform, formState, emailStatus'   },
    ];

    // ── Palette ──────────────────────────────────────────────────────────────
    const overlayBg       = isDark ? 'rgba(0,0,0,0.92)'              : 'rgba(240,244,252,0.96)';
    const headerBorder    = isDark ? 'rgba(75,216,160,0.4)'           : 'rgba(80,177,206,0.4)';
    const activeLabel     = isDark ? '#FF5A3C'                        : '#e05c3a';   // alert-red both modes
    const operatorColor   = isDark ? '#ced0ce'                        : '#2A2A3A';
    const clearanceColor  = isDark ? '#D4A843'                        : '#c4973a';
    const statValue       = isDark ? '#79bfc9'                        : '#50b1ce';
    const fpsOk           = isDark ? '#4BD8A0'                        : '#3aa87e';
    const fpsBad          = isDark ? '#FF5A3C'                        : '#e05c3a';
    const buildColor      = isDark ? '#D4A843'                        : '#c4973a';
    const sectionHeader   = isDark ? 'rgba(75,216,160,0.55)'          : 'rgba(80,177,206,0.65)';
    const sectionName     = isDark ? '#ced0ce'                        : '#50b1ce';
    const sectionBounds   = isDark ? 'rgba(75,216,160,0.45)'          : 'rgba(80,177,206,0.5)';
    const sectionVar      = isDark ? '#79bfc9'                        : '#2A2A3A';
    const dismissColor    = isDark ? 'rgba(75,216,160,0.35)'          : 'rgba(80,177,206,0.45)';
    const outlineSection  = isDark ? 'rgba(75,216,160,0.15)'          : 'rgba(80,177,206,0.2)';
    const outlineDebug    = isDark ? 'rgba(77,255,255,0.3)'           : 'rgba(80,177,206,0.45)';
    const textBase        = isDark ? '#ced0ce'                        : '#2A2A3A';

    useEffect(() => {
        if (!visible) return;
        const interval = setInterval(() => {
            setHeap(Math.round(40 + Math.random() * 20));
            setStack(Math.round(8  + Math.random() * 12));
        }, 2000);
        return () => clearInterval(interval);
    }, [visible]);

    if (!visible) return null;

    return (
        <div
            className="debug-overlay"
            style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                background: overlayBg,
                color: textBase,
            }}
        >
            {/* ── Header ── */}
            <div style={{ borderBottom: `1px solid ${headerBorder}`, paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ color: activeLabel }}>■ DEBUG MODE ACTIVE</span>
                {'  '}
                <span style={{ color: operatorColor }}>OPERATOR: Kilavi Musyoki</span>
                {'  '}
                <span style={{ color: clearanceColor }}>CLEARANCE: LEVEL 4</span>
            </div>

            {/* ── System stats ── */}
            <div style={{ marginBottom: '8px', display: 'flex', gap: '24px' }}>
                <span>HEAP:  <span style={{ color: statValue }}>{heap}%</span></span>
                <span>STACK: <span style={{ color: statValue }}>{stack}%</span></span>
                <span>FPS:   <span style={{ color: fps < 30 ? fpsBad : fpsOk }}>{fps}</span></span>
                <span>BUILD: <span style={{ color: buildColor }}>REV2</span></span>
            </div>

            {/* ── Section registers ── */}
            <div style={{ marginBottom: '8px' }}>
                <div style={{ color: sectionHeader, marginBottom: '4px' }}>// SECTION REGISTERS</div>
                {sections.map((s) => (
                    <div key={s.name} style={{ display: 'flex', gap: '16px', marginBottom: '2px' }}>
                        <span style={{ color: sectionName,   width: '80px'  }}>{s.name.toUpperCase()}</span>
                        <span style={{ color: sectionBounds, width: '140px' }}>{s.bounds}</span>
                        <span style={{ color: sectionVar                    }}>{s.var}</span>
                    </div>
                ))}
            </div>

            {/* ── Dismiss hint ── */}
            <div style={{ marginTop: '12px', color: dismissColor }}>
                // TYPE "debug" AGAIN TO DISMISS
            </div>

            {/* ── Bounding box overlays ── */}
            <style>{`
                section    { outline: 1px dashed ${outlineSection} !important; }
                [data-debug] { outline: 1px solid  ${outlineDebug}   !important; }
            `}</style>
        </div>
    );
};

export default DebugOverlay;