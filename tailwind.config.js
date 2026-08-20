/* ==========================================================================
   ALUPRO — Tailwind configuration
   THIS IS THE SINGLE SOURCE OF TRUTH FOR THE DESIGN TOKENS.

   The site no longer uses the Tailwind Play CDN (which shipped ~124 KiB of
   JavaScript and generated the CSS in the browser on every page load).
   Instead this config is compiled ahead of time into:

       assets/css/site.min.css      <- generated, do NOT edit by hand

   After changing anything in this file, or in assets/css/alupro.css, run:

       npm install      (first time only)
       npm run build:css

   Palette is derived from the logo. Red is an ACCENT only — the base is
   black / white / gray / metal.
   ========================================================================== */

module.exports = {
  // Every file that can contain class names, including script.js, which adds
  // classes at runtime (bg-white, rotate-45, translate-y-[7px], …). If those
  // are not scanned, the utilities get tree-shaken out and the header, mobile
  // menu and project filters break.
  content: [
    './*.html',
    './script.js',
  ],

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
        shell: '2100px',     // standard page shell (header, footer, all pages)
        gallery: '2100px',   // wider shell used by the Projects page imagery
      },
    },
  },
};
