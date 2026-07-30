/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			container: {
				center: true,
				padding: '1rem',
			},

			fontFamily: {
				montserrat: ['Montserrat', 'sans-serif'],
			},

			colors: {
				// Paleta cálida inspirada en alimentos (tomate/mango) para acciones primarias
				primary: {
					50: '#fef6ee',
					100: '#fdead7',
					200: '#fad2ae',
					300: '#f7b47b',
					400: '#f38b46',
					500: '#f06a22',
					600: '#e14f18',
					700: '#bb3a16',
					800: '#95301a',
					900: '#792a18',
					950: '#41120a',
				},
				// Verde cálido (hogar/familia) para acciones secundarias y estados positivos
				secondary: {
					50: '#f2f8ee',
					100: '#e1efd7',
					200: '#c5e0b3',
					300: '#a0cc85',
					400: '#7cb35e',
					500: '#5c9640',
					600: '#457730',
					700: '#365d27',
					800: '#2e4b22',
					900: '#28401f',
					950: '#12220d',
				},
				success: {
					50: '#f0faf1',
					500: '#2f9e44',
					600: '#227a35',
					700: '#1c612b',
				},
				warning: {
					50: '#fffaeb',
					500: '#e8a317',
					600: '#c9840e',
					700: '#a3660d',
				},
				danger: {
					50: '#fef2f2',
					500: '#dc3545',
					600: '#c22333',
					700: '#9c1c29',
				},
				// Gris cálido para fondos y texto neutro
				neutral: {
					50: '#faf9f7',
					100: '#f2efeb',
					200: '#e6e1da',
					300: '#d3ccc0',
					400: '#aea497',
					500: '#8a7f72',
					600: '#6b6053',
					700: '#524940',
					800: '#3a332c',
					900: '#241f1a',
					950: '#14110d',
				},
			},

			borderRadius: {
				xl: '0.875rem',
				'2xl': '1.25rem',
			},

			boxShadow: {
				card: '0 1px 3px 0 rgb(36 31 26 / 0.08), 0 1px 2px -1px rgb(36 31 26 / 0.08)',
				popover: '0 10px 30px -5px rgb(36 31 26 / 0.18)',
			},

			keyframes: {
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'slide-in': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' },
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' },
				},
				'slide-up': {
					'0%': { transform: 'translateY(0.5rem)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
			},

			animation: {
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'slide-up': 'slide-up 0.2s ease-out',
				'scale-in': 'scale-in 0.15s ease-out',
				'spin-slow': 'spin 2s linear infinite',
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
};
