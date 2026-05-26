# Design

## Color

### Palette (OKLCH) - "Vibrant Midnight"

| Token | Value | Usage |
|-------|-------|-------|
| `oklch-16-0.06-270` | Background (Deep Midnight Violet) | `--bg-primary` |
| `oklch-22-0.08-270` | Cards (Surface Violet) | `--bg-elevated` |
| `oklch-98-0.01-270` | Primary text (Pristine) | `--text-primary` |
| `oklch-85-0.04-270` | Secondary text (Lavender Gray) | `--text-secondary` |
| `oklch-82-0.16-150` | Success Accent (Vivid Mint) | `--tuned`, `--success` |
| `oklch-75-0.14-320` | Action Accent (Vibrant Magenta) | `--action`, `--play` |
| `oklch-60-0.06-270` | Labels/Muted (Dim Violet) | `--text-muted` |
| `oklch-30-0.08-270` | Track / Inactive | `--indicator-track` |

### Color Strategy

**Vibrant Professional.**
Saímos do monocromático para uma paleta inspirada em interfaces de sintetizadores modernos e estúdios de produção.
- **Base Vibrante:** O fundo não é cinza, mas um Violeta Profundo saturado que dá "vida" à tela.
- **Contraste Triádico:** Usamos o Mint (Verde) para precisão, Magenta para ação e Off-white para leitura.
- **Contrastes Elevados:** Mantemos taxas de contraste > 7:1 para elementos de leitura, garantindo que seja "feliz" mas totalmente funcional.

## Typography

| Role | Specification |
|------|---------------|
| Font | `system-ui` (sans-serif stack) |
| Display (h1) | 2.5rem / 900 / tracking-tighter / uppercase |
| Note display | 8rem / 900 / tracking-tighter |
| Section labels | 0.75rem / 800 / uppercase / tracking-[0.3em] |
| Technical metrics | 0.875rem / 700 / tabular-nums (font-mono) |

## Spacing

Escala modular baseada em 4px.
- Container padding: `py-10 px-6`
- Component gap: `gap-8` (tuner elements), `gap-12` (metronome)
- Section margin: `mb-12`

## Components

### Cards (Surfaces)

- Background: `oklch-22-0.08-270`
- Border: `1px solid oklch(35% 0.1 270)`
- Shadow: Deep violet ambient shadow.

### Gauge

- **Needle**: Cor `oklch-98` (neutral) ou `oklch-82` (tuned). Glow Magenta quando ativo mas não afinado.
- **Track**: Linha `oklch-30` com brilho sutil.

## Motion

| Animation | Timing | Curve |
|-----------|--------|-------|
| Gauge needle | 150ms | `cubic-bezier(0.2, 0, 0, 1)` |
| Tuned State | 400ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` (soft overshoot) |

Sempre respeitar `prefers-reduced-motion`.
