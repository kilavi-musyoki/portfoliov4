import React from 'react';

const ThemeToggle = ({ isDark, onToggle }) => {
    const labelColor = isDark ? 'rgba(206,208,206,0.8)' : 'rgba(26,26,46,0.5)';
    const accentColor = isDark ? '#ffffff' : '#D4A843';

    return (
        <button
            onClick={onToggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 10px',
                borderRadius: 2,
                border: `1px solid ${isDark ? 'rgba(156,160,156,0.7)' : 'rgba(212,168,67,0.3)'}`,
                background: isDark ? 'rgba(57,65,57,0.9)' : 'rgba(245,240,232,0.7)',
                cursor: 'pointer',
                transition: 'background 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = accentColor;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = isDark
                    ? 'rgba(156,160,156,0.7)'
                    : 'rgba(212,168,67,0.3)';
            }}
        >
            {/* tiny mode chip */}
            <span
                style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: accentColor,
                    boxShadow: `0 0 4px ${accentColor}`,
                }}
            />
            <span
                style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.55rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: labelColor,
                }}
            >
                {isDark ? 'DARK MODE' : 'LIGHT MODE'}
            </span>
        </button>
    );
};

export default ThemeToggle;
