/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f0ff',
                    100: '#e0e0ff',
                    200: '#c4b5fd',
                    300: '#a29bfe',
                    400: '#8b7cf6',
                    500: '#6c5ce7',
                    600: '#5b4bd5',
                    700: '#4c3ec2',
                    800: '#3d31af',
                    900: '#2e249c',
                },
                accent: {
                    teal: '#00cec9',
                    pink: '#fd79a8',
                    green: '#00b894',
                    orange: '#fdcb6e',
                },
                dark: {
                    900: '#0a0a1a',
                    800: '#12122a',
                    700: '#1a1a3e',
                    600: '#222260',
                    500: '#2a2a6e',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
                'slide-up': 'slide-up 0.5s ease-out',
                'fade-in': 'fade-in 0.4s ease-out',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(108, 92, 231, 0.2)' },
                    '50%': { boxShadow: '0 0 40px rgba(108, 92, 231, 0.4)' },
                },
                'slide-up': {
                    '0%': { opacity: 0, transform: 'translateY(20px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                'fade-in': {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
            },
        },
    },
    plugins: [],
};
