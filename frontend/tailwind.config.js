/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist Variable", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        "surface-2": token("surface-2"),
        line: token("line"),
        fg: token("fg"),
        muted: token("muted"),
        accent: token("accent"),
        "accent-2": token("accent-2"),
        good: token("good"),
        warn: token("warn"),
        bad: token("bad"),
        // shadcn/ui components in src/components/ui expect these names
        border: token("line"),
        input: token("line"),
        ring: token("accent"),
        background: token("bg"),
        foreground: token("fg"),
        primary: { DEFAULT: token("accent"), foreground: "#fff" },
      },
      borderRadius: {
        card: "var(--radius-card)",
        ctl: "var(--radius-ctl)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        glow: "0 0 0 1px rgb(var(--accent) / 0.35), 0 8px 30px -8px rgb(var(--accent) / 0.45)",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: 0, transform: "translateY(14px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        "pop-in": { "0%": { opacity: 0, transform: "scale(0.92)" }, "100%": { opacity: 1, transform: "scale(1)" } },
        "slide-left": { "0%": { transform: "translateX(100%)" }, "100%": { transform: "translateX(0)" } },
        "slide-up": { "0%": { transform: "translateY(24px)", opacity: 0 }, "100%": { transform: "translateY(0)", opacity: 1 } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        blink: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0 } },
        scan: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(400%)" } },
        "pulse-glow": { "0%,100%": { boxShadow: "0 6px 20px -8px rgb(var(--accent) / 0.6)" }, "50%": { boxShadow: "0 8px 38px -4px rgb(var(--accent) / 0.95)" } },
        "grow-x": { "0%": { transform: "scaleX(0)" }, "100%": { transform: "scaleX(1)" } },
      },
      animation: {
        "fade-up": "fade-up .55s cubic-bezier(.2,.7,.2,1) both",
        "pop-in": "pop-in .35s cubic-bezier(.2,.9,.3,1.2) both",
        "slide-left": "slide-left .35s cubic-bezier(.2,.7,.2,1) both",
        "slide-up": "slide-up .35s cubic-bezier(.2,.7,.2,1) both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
        blink: "blink 1s steps(2) infinite",
        scan: "scan 1.6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        "grow-x": "grow-x .9s cubic-bezier(.2,.7,.2,1) both",
      },
    },
  },
  plugins: [],
}
