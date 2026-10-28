/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			container: {
				center: true,
				padding: '1rem',
			},

			// Onest (texto) + Fraunces (titulares): una sans geométrica cálida y
			// una serif "suave" con carácter, lejos de las Inter/Poppins/Montserrat
			// de siempre. Se empaquetan con @fontsource (ver src/main.tsx).
			fontFamily: {
				sans: ['Onest Variable', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				display: ['Fraunces Variable', 'ui-serif', 'Georgia', 'serif'],
			},

			colors: {
				// Paleta "Modern Design": naranja vibrante (#F26C24) para acciones.
				// 500 es el tono elegido por el usuario; 600+ se oscurecen para que el
				// texto blanco encima cumpla contraste AA (≥ 4.5:1).
				primary: {
					50: '#fff4ee',
					100: '#ffe6d6',
					200: '#ffcbad',
					300: '#ffa875',
					400: '#ff8a4a',
					500: '#f26c24',
					600: '#c9470b',
					700: '#a8390d',
					800: '#862f10',
					900: '#6c2911',
					950: '#3b1206',
				},
				// Verde menta: 200 = fondo de sección (#B9E6CD), 400 = íconos
				// (#65BC9A), 600 = texto secundario (#2B8055).
				secondary: {
					50: '#f0faf5',
					100: '#dcf3e6',
					200: '#b9e6cd',
					300: '#8fd4b1',
					400: '#65bc9a',
					500: '#3f9f72',
					600: '#2b8055',
					700: '#21613f',
					800: '#1c4e35',
					900: '#17402c',
					950: '#0b2418',
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
				// Grises neutros: 50 = fondo de tarjeta (#FBFBFB), 100 = gris claro
				// (#F8F8F8), 900 = texto carbón (#333338).
				neutral: {
					50: '#fbfbfb',
					100: '#f8f8f8',
					200: '#e8e8ea',
					300: '#d4d4d8',
					400: '#a1a1a8',
					500: '#6b6b73',
					600: '#55555c',
					700: '#44444a',
					800: '#3a3a40',
					900: '#333338',
					950: '#1e1e22',
				},
			},

			borderRadius: {
				xl: '0.875rem',
				'2xl': '1.25rem',
			},

			boxShadow: {
				card: '0 1px 3px 0 rgb(51 51 56 / 0.08), 0 1px 2px -1px rgb(51 51 56 / 0.08)',
				popover: '0 10px 30px -5px rgb(51 51 56 / 0.18)',
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
				// Rebote del badge del carrito al añadir un artículo
				pop: {
					'0%': { transform: 'scale(1)' },
					'35%': { transform: 'scale(1.4)' },
					'70%': { transform: 'scale(0.9)' },
					'100%': { transform: 'scale(1)' },
				},
				// Entrada suave del contenido al cambiar de página (la tienda)
				'page-in': {
					'0%': { opacity: '0', transform: 'translateY(8px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				// Aparición de secciones al hacer scroll ( componente <Reveal/>)
				reveal: {
					'0%': { opacity: '0', transform: 'translateY(1.5rem)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				// Igual que `reveal`, pero entrando desde arriba (al hacer scroll hacia arriba)
				'reveal-down': {
					'0%': { opacity: '0', transform: 'translateY(-1.5rem)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				// Logo del hero: sube y baja como un globo de helio
				float: {
					'0%, 100%': { transform: 'translateY(0) rotate(-1deg)' },
					'50%': { transform: 'translateY(-14px) rotate(1deg)' },
				},
				// Sombra bajo el logo: se encoge cuando el logo sube
				'float-shadow': {
					'0%, 100%': { transform: 'scaleX(1)', opacity: '0.45' },
					'50%': { transform: 'scaleX(0.75)', opacity: '0.25' },
				},
			},

			animation: {
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'slide-up': 'slide-up 0.2s ease-out',
				'scale-in': 'scale-in 0.15s ease-out',
				'spin-slow': 'spin 2s linear infinite',
				pop: 'pop 0.4s ease-out',
				'page-in': 'page-in 0.25s ease-out',
				reveal: 'reveal 0.6s ease-out both',
				'reveal-down': 'reveal-down 0.6s ease-out both',
				float: 'float 4s ease-in-out infinite',
				'float-shadow': 'float-shadow 4s ease-in-out infinite',
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
};
