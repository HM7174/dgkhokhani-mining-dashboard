/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2563eb', // blue-600
                secondary: '#475569', // slate-600
                accent: '#f59e0b', // amber-500
                danger: '#dc2626', // red-600
                success: '#16a34a', // green-600
                background: '#f8fafc', // slate-50
                surface: '#ffffff',
            }
        },
    },
    plugins: [],
}
