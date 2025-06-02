
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				// Futuristic primary orange theme
				gold: {
					50: 'hsl(var(--gold-50))',
					100: 'hsl(var(--gold-100))',
					200: 'hsl(var(--gold-200))',
					300: 'hsl(var(--gold-300))',
					400: 'hsl(var(--gold-400))',
					500: 'hsl(var(--gold-500))', // #F39C0A
					600: 'hsl(var(--gold-600))',
					700: 'hsl(var(--gold-700))',
					800: 'hsl(var(--gold-800))',
					900: 'hsl(var(--gold-900))',
				},
				// Futuristic color palette
				'cyber': {
					'dark': 'hsl(var(--dark-bg))', // #08080C
					'card': 'hsl(var(--card-bg))', // #0F0F14
					'surface': 'hsl(var(--surface))', // #18181E
					'white': 'hsl(var(--clean-white))', // #FAFAFA
					'text': 'hsl(var(--text-secondary))', // #A0A0A5
					'cyan': 'hsl(var(--neon-cyan))', // #06B6D4
					'purple': 'hsl(var(--neon-purple))', // #9333EA
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				inter: ['Inter', 'system-ui', 'sans-serif'],
				poppins: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
				orbitron: ['Orbitron', 'Poppins', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'title': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }],
				'body': ['0.875rem', { lineHeight: '1.25rem' }],
				'button': ['1rem', { lineHeight: '1.5rem', fontWeight: '700' }],
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'cyber-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(243, 156, 10, 0.4)' },
					'50%': { boxShadow: '0 0 40px rgba(243, 156, 10, 0.8), 0 0 60px rgba(243, 156, 10, 0.4)' }
				},
				'neon-flicker': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'data-flow': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'hologram-shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'cyber-fade-in': {
					'0%': { opacity: '0', transform: 'translateY(30px) scale(0.95)' },
					'100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'cyber-fade-in': 'cyber-fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'cyber-pulse': 'cyber-pulse 2s infinite',
				'neon-flicker': 'neon-flicker 3s infinite',
				'data-flow': 'data-flow 3s linear infinite',
				'hologram-shimmer': 'hologram-shimmer 2s infinite'
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'100': '25rem',
				'112': '28rem',
				'128': '32rem',
			},
			maxWidth: {
				'8xl': '88rem',
				'9xl': '96rem',
			},
			boxShadow: {
				'cyber': '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(243, 156, 10, 0.05)',
				'neon': '0 0 20px rgba(243, 156, 10, 0.4), 0 0 40px rgba(243, 156, 10, 0.2)',
				'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
				'neon-lg': '0 0 40px rgba(243, 156, 10, 0.4), 0 0 60px rgba(243, 156, 10, 0.2)',
			},
			backgroundImage: {
				'cyber-grid': 'linear-gradient(rgba(243, 156, 10, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(243, 156, 10, 0.1) 1px, transparent 1px)',
				'futuristic-gradient': 'linear-gradient(135deg, #F39C0A 0%, #FFA726 50%, #F39C0A 100%)',
				'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
				'cyber-bg': 'radial-gradient(circle at 25% 25%, rgba(243, 156, 10, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.05) 0%, transparent 50%)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
