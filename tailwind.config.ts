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
				border: 'rgb(var(--border))',
				input: 'rgb(var(--input))',
				ring: 'rgb(var(--ring))',
				background: 'rgb(var(--background))',
				foreground: 'rgb(var(--foreground))',

				// Apple semantic colors
				'label-primary': 'rgb(var(--label-primary))',
				'label-secondary': 'rgb(var(--label-secondary))',
				'label-tertiary': 'rgb(var(--label-tertiary))',
				'label-quaternary': 'rgb(var(--label-quaternary))',

				// Apple system backgrounds
				'system-background': 'rgb(var(--system-background))',
				'secondary-system-background': 'rgb(var(--secondary-system-background))',
				'tertiary-system-background': 'rgb(var(--tertiary-system-background))',

				// Apple system fills
				'system-fill': 'rgba(var(--system-fill), 0.36)',
				'secondary-system-fill': 'rgba(var(--secondary-system-fill), 0.32)',
				'tertiary-system-fill': 'rgba(var(--tertiary-system-fill), 0.24)',
				'quaternary-system-fill': 'rgba(var(--quaternary-system-fill), 0.18)',

				// Brand gold palette with proper contrast
				gold: {
					50: 'rgb(var(--gold-50))',
					100: 'rgb(var(--gold-100))',
					200: 'rgb(var(--gold-200))',
					300: 'rgb(var(--gold-300))',
					400: 'rgb(var(--gold-400))',
					500: 'rgb(var(--gold-500))', // Primary brand color #F39C0A
					600: 'rgb(var(--gold-600))',
					700: 'rgb(var(--gold-700))',
					800: 'rgb(var(--gold-800))',
					900: 'rgb(var(--gold-900))',
				},

				primary: {
					DEFAULT: 'rgb(var(--primary))',
					foreground: 'rgb(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'rgb(var(--secondary))',
					foreground: 'rgb(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'rgb(var(--destructive))',
					foreground: 'rgb(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'rgb(var(--muted))',
					foreground: 'rgb(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'rgb(var(--accent))',
					foreground: 'rgb(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'rgb(var(--popover))',
					foreground: 'rgb(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'rgb(var(--card))',
					foreground: 'rgb(var(--card-foreground))'
				},

				// Override gray colors to ensure visibility on dark backgrounds
				gray: {
					50: '#FFFFFF',
					100: '#FFFFFF',
					200: '#FFFFFF',
					300: '#FFFFFF',
					400: '#FFFFFF',
					500: '#FFFFFF',
					600: '#FFFFFF',
					700: '#FFFFFF',
					800: '#FFFFFF',
					900: '#FFFFFF',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'apple': '12px', // Apple's standard radius
				'apple-lg': '16px',
				'apple-xl': '20px',
			},
			fontFamily: {
				sans: ['SF Pro Display', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
				system: ['SF Pro Display', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
				mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
			},
			fontSize: {
				// Apple's type scale
				'large-title': ['2.25rem', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.025em' }],
				'title-1': ['1.875rem', { lineHeight: '1.15', fontWeight: '600', letterSpacing: '-0.02em' }],
				'title-2': ['1.5rem', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.015em' }],
				'title-3': ['1.25rem', { lineHeight: '1.25', fontWeight: '500', letterSpacing: '-0.01em' }],
				'headline': ['1.125rem', { lineHeight: '1.3', fontWeight: '500' }],
				'body': ['1rem', { lineHeight: '1.4', fontWeight: '400' }],
				'callout': ['0.875rem', { lineHeight: '1.35', fontWeight: '500' }],
				'subheadline': ['0.875rem', { lineHeight: '1.35', fontWeight: '400' }],
				'footnote': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
				'caption-1': ['0.75rem', { lineHeight: '1.35', fontWeight: '400' }],
				'caption-2': ['0.6875rem', { lineHeight: '1.3', fontWeight: '400' }],
			},
			spacing: {
				// Apple's 8pt grid system
				'apple-xs': '4px',
				'apple-sm': '8px',
				'apple-md': '16px',
				'apple-lg': '24px',
				'apple-xl': '32px',
				'apple-2xl': '48px',
				'apple-3xl': '64px',
				// Touch targets
				'touch': '44px',
				'touch-lg': '48px',
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
				'apple-slide-up': {
					'0%': { opacity: '0', transform: 'translateY(20px) scale(0.99)' },
					'100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
				},
				'apple-spring': {
					'0%': { transform: 'scale(0.95) translateY(5px)', opacity: '0' },
					'50%': { transform: 'scale(1.02) translateY(-2px)', opacity: '0.8' },
					'100%': { transform: 'scale(1) translateY(0)', opacity: '1' }
				},
				'apple-pulse': {
					'0%, 100%': { boxShadow: '0 0 0 0 rgba(var(--primary), 0.4)', transform: 'scale(1)' },
					'50%': { boxShadow: '0 0 0 8px rgba(var(--primary), 0)', transform: 'scale(1.02)' }
				},
				'apple-shimmer': {
					'0%': { backgroundPosition: '-200% 0', opacity: '0' },
					'50%': { opacity: '1' },
					'100%': { backgroundPosition: '200% 0', opacity: '0' }
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'apple-slide-up': 'apple-slide-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'apple-spring': 'apple-spring 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'apple-pulse': 'apple-pulse 2s ease-in-out infinite',
				'apple-shimmer': 'apple-shimmer 2s ease-in-out infinite',
			},
			boxShadow: {
				'apple-sm': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
				'apple-md': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.1)',
				'apple-lg': '0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.08)',
				'apple-xl': '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04), 0 6px 6px rgba(0, 0, 0, 0.06)',
			},
			backdropBlur: {
				'apple': '20px',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
