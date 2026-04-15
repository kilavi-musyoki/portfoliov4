import React, { useEffect, useRef, useCallback, memo } from 'react';
import { clamp, norm } from '../utils.js';

// ── Character pools ───────────────────────────────────────────────────────────
const KATAKANA =
    'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
    'ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ';
const CJK      = '電脳魂機能信号波形回路接続処理演算制御命令記憶';
const BINARY   = '01010110100101110100';
const SYMBOLS  = '∞≈∫∂∑Ω√π×÷±≠≤≥∴∵⊕⊗';
const CIRCUIT  = '⏚⏛⏁⌇⎍⎎◈◇◆▪▫▬▭';
const HEX      = '0123456789ABCDEFabcdef';
const MISC     = '#!@$%&*<>{}[]|^~';
const ALL_CHARS = KATAKANA + CJK + BINARY + SYMBOLS + CIRCUIT + HEX + MISC;

const randChar = () => ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];

// ── Depth layer configurations ────────────────────────────────────────────────
// Each layer has different char size, speed range, opacity, and density
const DEPTH_LAYERS = [
    { id: 'bg',  charScale: 0.7,  speedMin: 0.3,  speedMax: 0.8,  alphaMax: 0.35, density: 0.6,  lenMin: 8,  lenMax: 20, blur: true  },
    { id: 'mid', charScale: 1.0,  speedMin: 0.55, speedMax: 1.55, alphaMax: 0.84, density: 1.0,  lenMin: 5,  lenMax: 15, blur: false },
    { id: 'fg',  charScale: 1.35, speedMin: 1.2,  speedMax: 2.8,  alphaMax: 1.0,  density: 0.35, lenMin: 3,  lenMax: 10, blur: false },
];

// ── Ripple effect types ──────────────────────────────────────────────────────
const RIPPLE_FX = [
    {
        name: 'shockwave',
        lifetime: 65,
        apply: (colX, colY, W, H, r) => {
            const dx = colX - r.cx, dy = colY - r.cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const radius = r.age * (W * 0.025);
            const ring = Math.max(0, 1 - Math.abs(dist - radius) / (W * 0.12));
            const decay = 1 - r.age / r.lifetime;
            const push = ring * decay;
            return {
                speedMul: 1 + push * 2.2,
                xOff: dx !== 0 ? (dx / dist) * push * W * 0.06 : 0,
                brightBoost: push * 0.7,
                sizeBoost: push * 0.3,
            };
        },
    },
    {
        name: 'antigravity',
        lifetime: 80,
        apply: (colX, _colY, W, _H, r) => {
            const dx = colX - r.cx;
            const prox = Math.max(0, 1 - Math.abs(dx) / (W * 0.32));
            const decay = 1 - r.age / r.lifetime;
            const ease = decay * decay;
            return { speedMul: 1 - prox * ease * 2.6, xOff: 0, brightBoost: prox * ease * 0.4, sizeBoost: 0 };
        },
    },
    {
        name: 'scatter',
        lifetime: 55,
        apply: (colX, _colY, W, _H, r) => {
            const dx = colX - r.cx;
            const dist = Math.abs(dx);
            const prox = Math.max(0, 1 - dist / (W * 0.4));
            const decay = 1 - r.age / r.lifetime;
            const ease = Math.sin(decay * Math.PI * 0.5);
            return { speedMul: 1 + prox * ease * 1.6, xOff: dx * prox * ease * 0.35, brightBoost: prox * ease * 0.55, sizeBoost: prox * ease * 0.2 };
        },
    },
    {
        name: 'freeze',
        lifetime: 72,
        apply: (colX, _colY, W, _H, r) => {
            const dx = colX - r.cx;
            const prox = Math.max(0, 1 - Math.abs(dx) / (W * 0.28));
            const phase = r.age / r.lifetime;
            const frozen = phase < 0.45;
            const burstPhase = frozen ? 0 : norm(phase, 0.45, 0.75);
            return {
                speedMul: frozen ? prox * 0.02 + (1 - prox) : 1 + burstPhase * prox * 3.5,
                xOff: frozen ? 0 : (Math.random() - 0.5) * burstPhase * prox * W * 0.04,
                brightBoost: frozen ? prox * 0.28 : burstPhase * prox * 0.85,
                sizeBoost: frozen ? prox * 0.15 : burstPhase * prox * 0.4,
            };
        },
    },
    {
        name: 'spiral',
        lifetime: 70,
        apply: (colX, _colY, W, _H, r) => {
            const dx = colX - r.cx;
            const dist = Math.abs(dx);
            const prox = Math.max(0, 1 - dist / (W * 0.36));
            const decay = 1 - r.age / r.lifetime;
            const angle = r.age * 0.15 * decay;
            return {
                speedMul: 1 + Math.sin(angle + dist * 0.008) * prox * decay * 1.8,
                xOff: Math.cos(angle + dist * 0.012) * prox * decay * W * 0.05,
                brightBoost: prox * decay * 0.45,
                sizeBoost: 0,
            };
        },
    },
    {
        name: 'waterfall',
        lifetime: 60,
        apply: (colX, _colY, W, _H, r) => {
            const dx = colX - r.cx;
            const dist = Math.abs(dx);
            const waveDelay = dist / (W * 0.6);
            const localPhase = clamp((r.age / r.lifetime) - waveDelay, 0, 1);
            const pulse = Math.sin(localPhase * Math.PI);
            const prox = Math.max(0, 1 - dist / (W * 0.5));
            return { speedMul: 1 + pulse * prox * 3.2, xOff: 0, brightBoost: pulse * prox * 0.6, sizeBoost: pulse * prox * 0.25 };
        },
    },
    {
        name: 'glitch',
        lifetime: 40,
        apply: (colX, _colY, W, _H, r) => {
            const dx = colX - r.cx;
            const prox = Math.max(0, 1 - Math.abs(dx) / (W * 0.35));
            const decay = 1 - r.age / r.lifetime;
            const glitchX = (Math.random() - 0.5) * prox * decay * W * 0.08;
            const speedJitter = (Math.random() - 0.5) * prox * decay * 4;
            return { speedMul: 1 + speedJitter, xOff: glitchX, brightBoost: prox * decay * (0.3 + Math.random() * 0.5), sizeBoost: 0 };
        },
    },
    {
        name: 'converge',
        lifetime: 68,
        apply: (colX, _colY, W, _H, r) => {
            const dx = colX - r.cx;
            const dist = Math.abs(dx);
            const prox = Math.max(0, 1 - dist / (W * 0.4));
            const phase = r.age / r.lifetime;
            const pull = phase < 0.4 ? -norm(phase, 0, 0.4) : norm(phase, 0.4, 0.8) * 0.7;
            const decay = 1 - norm(phase, 0.6, 1);
            return { speedMul: 1, xOff: dx * pull * prox * 0.4 * decay, brightBoost: prox * (1 - phase) * 0.5, sizeBoost: 0 };
        },
    },
    {
        name: 'vortex',
        lifetime: 75,
        apply: (colX, colY, W, H, r) => {
            const dx = colX - r.cx, dy = colY - r.cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const prox = Math.max(0, 1 - dist / (W * 0.4));
            const decay = 1 - r.age / r.lifetime;
            const angle = Math.atan2(dy, dx) + r.age * 0.08 * decay;
            const pullStrength = prox * decay * 0.6;
            return {
                speedMul: 1 + prox * decay * 0.8,
                xOff: Math.cos(angle) * pullStrength * W * 0.08,
                brightBoost: prox * decay * 0.5,
                sizeBoost: prox * decay * 0.2,
            };
        },
    },
    {
        name: 'pulse',
        lifetime: 50,
        apply: (colX, colY, W, H, r) => {
            const dx = colX - r.cx, dy = colY - r.cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const prox = Math.max(0, 1 - dist / (W * 0.45));
            const decay = 1 - r.age / r.lifetime;
            const beat = Math.sin(r.age * 0.25) * 0.5 + 0.5;
            return {
                speedMul: 1 + beat * prox * decay * 2,
                xOff: 0,
                brightBoost: beat * prox * decay * 0.8,
                sizeBoost: beat * prox * decay * 0.35,
            };
        },
    },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default memo(function MatrixFace({ leverValue, mousePosRef }) {
    const canvasRef  = useRef(null);
    const rafRef     = useRef(null);
    const ripplesRef = useRef([]);
    const lastFxRef  = useRef(-1);
    const stateRef   = useRef(null);
    const hoverRef   = useRef({ active: false, cx: 0, cy: 0 });

    const handleClick = useCallback((e) => {
        const state = stateRef.current;
        if (!state) return;
        const { dpr } = state;
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = (e.clientX - rect.left) * dpr;
        const cy = (e.clientY - rect.top) * dpr;

        let idx;
        do { idx = Math.floor(Math.random() * RIPPLE_FX.length); }
        while (idx === lastFxRef.current && RIPPLE_FX.length > 1);
        lastFxRef.current = idx;

        const fx = RIPPLE_FX[idx];
        ripplesRef.current.push({ cx, cy, age: 0, lifetime: fx.lifetime, fxIdx: idx });
    }, []);

    const handleMouseMove = useCallback((e) => {
        const state = stateRef.current;
        if (!state) return;
        const rect = e.currentTarget.getBoundingClientRect();
        hoverRef.current = {
            active: true,
            cx: (e.clientX - rect.left) * state.dpr,
            cy: (e.clientY - rect.top) * state.dpr,
        };
    }, []);

    const handleMouseLeave = useCallback(() => {
        hoverRef.current.active = false;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const BASE_CHAR_W = 9;
        const BASE_CHAR_H = 11;

        let W = 0, H = 0;
        // Multi-layer column arrays
        let layers = [];

        const makeCol = (cfg, startY, charW) => ({
            y:     startY ?? Math.random() * -100,
            speed: cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin),
            len:   Math.floor(cfg.lenMin + Math.random() * (cfg.lenMax - cfg.lenMin)),
            chars: Array.from({ length: 25 }, () => randChar()),
            windX: 0,
            charW,
        });

        const init = () => {
            const rect = canvas.getBoundingClientRect();
            W = Math.round(rect.width  * dpr);
            H = Math.round(rect.height * dpr);
            canvas.width  = W;
            canvas.height = H;
            stateRef.current = { W, H, dpr };

            layers = DEPTH_LAYERS.map(cfg => {
                const charW = Math.round(BASE_CHAR_W * cfg.charScale * dpr);
                const numCols = Math.floor(W / charW * cfg.density);
                return {
                    cfg,
                    charW,
                    charH: Math.round(BASE_CHAR_H * cfg.charScale * dpr),
                    cols: Array.from({ length: numCols }, () => makeCol(cfg, Math.random() * H, charW)),
                };
            });

            ctx.fillStyle = 'rgba(3, 11, 5, 1)';
            ctx.fillRect(0, 0, W, H);
        };

        const ro = new ResizeObserver(init);
        ro.observe(canvas);
        init();

        // ── Pre-computed color caches per layer ──────────────────────────────
        const headColors = [
            'rgb(180,240,200)',   // bg — dimmer
            'rgb(210,255,235)',   // mid — standard
            'rgb(240,255,255)',   // fg — bright white
        ];
        const tailColors = [
            'rgb(40,120,80)',     // bg — dim
            'rgb(75,216,160)',    // mid — standard green
            'rgb(120,255,200)',   // fg — vivid
        ];

        let frame = 0;

        const loop = () => {
            rafRef.current = requestAnimationFrame(loop);
            frame++;
            const mp = mousePosRef.current || { x: 0.5, y: 0.5 };
            const ripples = ripplesRef.current;
            const hover = hoverRef.current;

            // Ghost-fade — slower for denser trails
            ctx.fillStyle = 'rgba(3, 11, 5, 0.13)';
            ctx.fillRect(0, 0, W, H);

            // ── Ripple flash rings ──────────────────────────────────────────
            for (const r of ripples) {
                if (r.age < 8) {
                    const flashR = r.age * W * 0.028;
                    const flashA = (1 - r.age / 8) * 0.18;
                    ctx.beginPath();
                    ctx.arc(r.cx, r.cy, flashR, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(75,216,160,${flashA})`;
                    ctx.lineWidth = 2.5 * dpr;
                    ctx.stroke();
                    // Secondary ring (afterimage)
                    if (r.age > 2) {
                        ctx.beginPath();
                        ctx.arc(r.cx, r.cy, flashR * 0.6, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(111,212,255,${flashA * 0.5})`;
                        ctx.lineWidth = 1.5 * dpr;
                        ctx.stroke();
                    }
                }
            }

            // ── Hover proximity glow ────────────────────────────────────────
            if (hover.active) {
                const glowR = 35 * dpr;
                const grad = ctx.createRadialGradient(hover.cx, hover.cy, 0, hover.cx, hover.cy, glowR);
                grad.addColorStop(0, 'rgba(75,216,160,0.06)');
                grad.addColorStop(1, 'rgba(75,216,160,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(hover.cx - glowR, hover.cy - glowR, glowR * 2, glowR * 2);
            }

            // ── Render each depth layer ─────────────────────────────────────
            for (let li = 0; li < layers.length; li++) {
                const layer = layers[li];
                const { cfg, charW, charH, cols } = layer;
                const fSize = charW;
                const isBlurLayer = cfg.blur;

                ctx.font = `bold ${fSize}px "JetBrains Mono", monospace`;

                // Background layer gets a slight blur via shadow trick
                if (isBlurLayer) {
                    ctx.shadowColor = 'rgba(75,216,160,0.15)';
                    ctx.shadowBlur = 3 * dpr;
                } else {
                    ctx.shadowBlur = 0;
                }

                for (let i = 0; i < cols.length; i++) {
                    const col = cols[i];
                    const baseX = (i + 0.5) * charW / cfg.density;

                    // ── Accumulate ripple modifiers ──────────────────────────
                    let totalSpeedMul = 1;
                    let totalXOff = 0;
                    let totalBright = 0;
                    let totalSizeBoost = 0;

                    for (const r of ripples) {
                        const fx = RIPPLE_FX[r.fxIdx];
                        const mod = fx.apply(baseX, col.y, W, H, r);
                        totalSpeedMul *= mod.speedMul;
                        totalXOff     += mod.xOff;
                        totalBright    = Math.min(1, totalBright + mod.brightBoost);
                        totalSizeBoost = Math.min(0.5, totalSizeBoost + (mod.sizeBoost || 0));
                    }

                    // ── Hover interaction — subtle continuous influence ──────
                    if (hover.active) {
                        const hdx = baseX - hover.cx;
                        const hProx = Math.max(0, 1 - Math.abs(hdx) / (W * 0.18));
                        if (hProx > 0) {
                            totalBright += hProx * 0.2;
                            totalSpeedMul *= 1 + hProx * 0.4;
                            totalXOff += hdx * hProx * 0.06;
                        }
                    }

                    // ── Mouse wind ───────────────────────────────────────────
                    const ndx    = mp.x - baseX / W;
                    const wForce = Math.max(0, 1 - Math.abs(ndx) / 0.26) * 24 * dpr;
                    const wDir   = ndx > 0 ? 1 : -1;
                    col.windX   += (wForce * wDir + totalXOff - col.windX) * 0.12;

                    const drawX = baseX + col.windX;

                    // ── Dynamic font size boost from ripples ─────────────────
                    const boostedSize = fSize * (1 + totalSizeBoost);
                    if (totalSizeBoost > 0.05) {
                        ctx.font = `bold ${boostedSize}px "JetBrains Mono", monospace`;
                    }

                    // ── Compute column head/tail colors with brightness ─────
                    const bR = Math.min(255, Math.round(parseInt(headColors[li].slice(4), 10) + totalBright * 45));
                    const headC = totalBright > 0.01
                        ? `rgb(${bR},255,${Math.min(255, 235 + Math.round(totalBright * 20))})`
                        : headColors[li];
                    const tailC = totalBright > 0.01
                        ? `rgb(${Math.min(255, 75 + Math.round(totalBright * 80))},${Math.min(255, 216 + Math.round(totalBright * 39))},${Math.min(255, 160 + Math.round(totalBright * 40))})`
                        : tailColors[li];

                    const prevAlpha = ctx.globalAlpha;

                    // ── Draw characters ──────────────────────────────────────
                    for (let j = 0; j < col.len; j++) {
                        const charY = col.y - j * charH;
                        if (charY < -charH || charY > H + charH) continue;

                        // Character scramble — faster near ripples
                        const scrambleRate = 0.035 + totalBright * 0.18;
                        if (Math.random() < scrambleRate) {
                            col.chars[j] = randChar();
                        }

                        // Alpha: head char is brightest, fades toward tail
                        const baseAlpha = j === 0
                            ? Math.min(1, 1.0 + totalBright)
                            : Math.min(1, (1 - j / col.len) * cfg.alphaMax + totalBright * 0.6);

                        ctx.globalAlpha = baseAlpha;
                        ctx.fillStyle = j === 0 ? headC : tailC;

                        // Head character gets extra glow
                        if (j === 0 && li >= 1) {
                            ctx.shadowColor = headC;
                            ctx.shadowBlur = (4 + totalBright * 6) * dpr;
                        }

                        ctx.fillText(col.chars[j], drawX - fSize / 2, charY);

                        // Reset shadow after head
                        if (j === 0 && li >= 1) {
                            ctx.shadowBlur = isBlurLayer ? 3 * dpr : 0;
                            ctx.shadowColor = isBlurLayer ? 'rgba(75,216,160,0.15)' : 'transparent';
                        }
                    }

                    ctx.globalAlpha = prevAlpha;

                    // Reset font if it was boosted
                    if (totalSizeBoost > 0.05) {
                        ctx.font = `bold ${fSize}px "JetBrains Mono", monospace`;
                    }

                    // ── Advance column ───────────────────────────────────────
                    col.y += col.speed * dpr * clamp(totalSpeedMul, -2, 6);
                    if (col.y - col.len * charH > H) {
                        layers[li].cols[i] = makeCol(cfg, -charH * 2, charW);
                    }
                    if (col.y < -col.len * charH * 3) {
                        layers[li].cols[i] = makeCol(cfg, H + charH * 2, charW);
                    }
                }

                // Clear blur for non-blur layers
                ctx.shadowBlur = 0;
                ctx.shadowColor = 'transparent';
            }

            // ── Age & cull ripples ───────────────────────────────────────────
            for (let k = ripples.length - 1; k >= 0; k--) {
                ripples[k].age++;
                if (ripples[k].age > ripples[k].lifetime) ripples.splice(k, 1);
            }

            // ── HUD corner brackets ─────────────────────────────────────────
            const m = 4 * dpr, s = 10 * dpr;
            ctx.strokeStyle = 'rgba(75,216,160,0.30)';
            ctx.lineWidth   = Math.max(1, dpr * 0.8);

            ctx.beginPath();
            ctx.moveTo(m, m + s);      ctx.lineTo(m, m);           ctx.lineTo(m + s, m);
            ctx.moveTo(W-m-s, m);      ctx.lineTo(W-m, m);         ctx.lineTo(W-m, m+s);
            ctx.moveTo(m, H-m-s);      ctx.lineTo(m, H-m);         ctx.lineTo(m+s, H-m);
            ctx.moveTo(W-m-s, H-m);    ctx.lineTo(W-m, H-m);       ctx.lineTo(W-m, H-m-s);
            ctx.stroke();

            // ── HUD labels ──────────────────────────────────────────────────
            const labelSize = Math.max(6, 7 * dpr);
            ctx.font      = `${labelSize}px "JetBrains Mono", monospace`;
            ctx.fillStyle = 'rgba(75,216,160,0.38)';
            ctx.textAlign = 'left';
            ctx.fillText('INTERFACE', m + 2*dpr, H - m - 2*dpr);
            ctx.textAlign = 'right';
            ctx.fillStyle = 'rgba(75,216,160,0.46)';
            ctx.fillText('ONLINE', W - m - 2*dpr, H - m - 2*dpr);

            // ── Ripple count indicator ───────────────────────────────────────
            if (ripples.length > 0) {
                ctx.textAlign = 'right';
                ctx.fillStyle = 'rgba(111,212,255,0.35)';
                ctx.fillText(`FX:${ripples.length}`, W - m - 2*dpr, m + labelSize + 2*dpr);
            }

            ctx.textAlign = 'left';
        };

        loop();

        return () => {
            cancelAnimationFrame(rafRef.current);
            ro.disconnect();
        };
    }, []);

    const faceOpacity = 1 - norm(leverValue, 0.05, 0.46);

    return (
        <canvas
            ref={canvasRef}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                zIndex: 1,
                opacity: faceOpacity,
                transition: 'opacity 0.5s ease',
                display: 'block',
                imageRendering: 'pixelated',
                cursor: 'crosshair',
            }}
        />
    );
});
