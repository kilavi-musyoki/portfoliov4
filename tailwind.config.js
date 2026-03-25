/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Dark mode — Board on Standby
                'base': '#0A0A0F',
                'pcb-green': '#00FF88',
                'cap-cyan': '#4DFFFF',
                'alert-red': '#FF3D00',
                'solder-gold': '#D4A843',
                // Light mode — Powered-On State
                'pcb-beige': '#F5F0E8',
                'deep-navy': '#1A1A2E',
                'backlit-white': '#FFFDF7',
            },
            fontFamily: {
                'mono': ['"JetBrains Mono"', 'monospace'],
                'display': ['Syne', 'sans-serif'],
            },
            animation: {
                'levitate': 'levitate 3.5s ease-in-out infinite',
                'glow-pulse': 'glow-pulse 3.5s ease-in-out infinite',
                'trace-draw': 'trace-draw 2s ease-in-out forwards',
                'blink-slow': 'blink-slow 1.5s ease-in-out infinite',
                'scanline': 'scanline 8s linear infinite',
                'boot-line': 'boot-line 0.3s ease-out forwards',
            },
            keyframes: {
                'levitate': {
                    '0%, 100%': { transform: 'translateY(0px) rotateX(0deg)' },
                    '50%': { transform: 'translateY(-6px) rotateX(1.5deg)' },
                },
                'glow-pulse': {
                    '0%, 100%': { opacity: '0.4', transform: 'scaleX(1) scaleY(1)' },
                    '50%': { opacity: '0.7', transform: 'scaleX(1.1) scaleY(1.2)' },
                },
                'trace-draw': {
                    from: { strokeDashoffset: '1000' },
                    to: { strokeDashoffset: '0' },
                },
                'blink-slow': {
                    '0%, 100%': { opacity: '0.2' },
                    '50%': { opacity: '1' },
                },
                'scanline': {
                    '0%': { backgroundPosition: '0 0' },
                    '100%': { backgroundPosition: '0 100%' },
                },
                'boot-line': {
                    from: { opacity: '0', transform: 'translateX(-8px)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
            },
            backgroundImage: {
                'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            },
        },
    },
    plugins: [],
}
