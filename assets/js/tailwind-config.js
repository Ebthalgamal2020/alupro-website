// ---------------------------------------------------------------
// ALUPRO design tokens. Palette is derived from the logo.
// Red is an ACCENT only — the base is black / white / gray / metal.
// ---------------------------------------------------------------
tailwind.config = {
  theme: {
    extend: {
      colors: {
        red:   { DEFAULT: '#A6190F', 600: '#8E150D', 400: '#C4291D' }, // ALUPRO red
        ink:   { DEFAULT: '#050505', 900: '#0C0D0D', 800: '#141617', 700: '#1D2022' },
        metal: { DEFAULT: '#A7A7A7', 300: '#C9C9C6', 500: '#8A8A8A', 600: '#6E6E6E' },
        mist:  '#F4F4F2',
      },
      fontFamily: {
        display: ['Archivo', 'Helvetica Neue', 'Arial', 'sans-serif'],
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      // Numeric weight utilities (font-400 … font-800) to match the loaded fonts
      fontWeight: { 400: '400', 500: '500', 600: '600', 700: '700', 800: '800' },
      maxWidth: {
        shell: '1400px',     // standard page shell (header, footer, all pages)
        gallery: '1760px',   // wider shell used by the Projects page imagery
      },
    },
  },
};
