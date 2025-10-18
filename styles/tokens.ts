export const designTokens = {
  colors: {
    primary: {
      bg: '#0b0f14',
      elevated: '#0f1418',
      accent: '#7C5CFF',
      secondary: '#00D4A2',
    },
    text: {
      primary: '#E6EEF3',
      secondary: '#A6B2BD',
      muted: '#54606B',
    },
    gradients: {
      accent: 'linear-gradient(90deg, #7C5CFF 0%, #4FB3FF 100%)',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  borderRadius: {
    default: '12px',
    large: '20px',
    full: '9999px',
  },
  shadows: {
    soft: '0 6px 30px rgba(0,0,0,0.6)',
    card: '0 4px 20px rgba(0,0,0,0.4)',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const

export type DesignTokens = typeof designTokens

