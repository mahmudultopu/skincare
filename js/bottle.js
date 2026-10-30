/* ==========================================================
   Product packshot renderer — draws a stylised SVG pack
   (dropper, pump, tube, jar, bottle, spray) from catalog data.
   ========================================================== */

const Bottle = (() => {
  const lum = (hex) => {
    const n = parseInt(hex.replace('#', ''), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const inkFor = (hex) => (lum(hex) > 0.42 ? '#2A2420' : '#FBF7F2');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

  // Each shape: cap parts, body parts, and the label box (x, y, w, h)
  const SHAPES = {
    dropper: {
      cap: [
        '<rect x="88" y="18" width="24" height="56" rx="12"/>',
        '<rect x="80" y="70" width="40" height="30" rx="4"/>',
      ],
      body: ['<path d="M64,128 Q64,106 84,104 L116,104 Q136,106 136,128 L136,218 Q136,234 120,234 L80,234 Q64,234 64,218 Z"/>'],
      label: [70, 138, 60, 76],
    },
    pump: {
      cap: [
        '<rect x="82" y="36" width="36" height="13" rx="5"/>',
        '<rect x="116" y="39" width="28" height="6" rx="3"/>',
        '<rect x="94" y="48" width="12" height="30"/>',
        '<rect x="84" y="76" width="32" height="24" rx="4"/>',
      ],
      body: ['<path d="M58,124 Q58,98 82,96 L118,96 Q142,98 142,124 L142,218 Q142,234 126,234 L74,234 Q58,234 58,218 Z"/>'],
      label: [64, 124, 72, 92],
    },
    tube: {
      cap: ['<rect x="72" y="194" width="56" height="40" rx="7"/>'],
      body: [
        '<path d="M56,24 L144,24 Q141,118 126,198 L74,198 Q59,118 56,24 Z"/>',
        '<rect x="54" y="14" width="92" height="14" rx="2"/>',
      ],
      label: [68, 58, 64, 110],
    },
    jar: {
      cap: ['<rect x="38" y="108" width="124" height="42" rx="10"/>'],
      body: ['<rect x="42" y="146" width="116" height="88" rx="16"/>'],
      label: [48, 160, 104, 62],
    },
    bottle: {
      cap: ['<rect x="80" y="20" width="40" height="46" rx="6"/>'],
      body: [
        '<rect x="87" y="62" width="26" height="18"/>',
        '<path d="M64,98 Q64,78 86,76 L114,76 Q136,78 136,98 L136,220 Q136,234 122,234 L78,234 Q64,234 64,220 Z"/>',
      ],
      label: [70, 112, 60, 100],
    },
    spray: {
      cap: ['<path d="M74,80 L74,54 Q74,28 100,28 Q126,28 126,54 L126,80 Z"/>'],
      body: ['<rect x="70" y="76" width="60" height="158" rx="12"/>'],
      label: [74, 104, 52, 108],
    },
  };

  function labelText(p, [x, y, w, h], ink) {
    const cx = x + w / 2;
    const lines = p.label || [];
    const longest = Math.max(...lines.map((l) => l.length), 6);
    const fs = Math.min(12, (w * 1.75) / longest);
    const brandFs = Math.min(7, (w * 1.45) / Math.max(p.brand.length, 6));
    const block = brandFs + 8 + lines.length * (fs + 2);
    let ty = y + (h - block) / 2 + brandFs;
    let out = `<text x="${cx}" y="${ty}" font-family="Manrope,sans-serif" font-weight="700" font-size="${brandFs}" letter-spacing="1.4" text-anchor="middle" fill="${ink}" opacity=".85">${esc(p.brand.toUpperCase())}</text>`;
    ty += 5;
    out += `<line x1="${cx - 8}" x2="${cx + 8}" y1="${ty}" y2="${ty}" stroke="${ink}" stroke-width=".6" opacity=".5"/>`;
    ty += 3;
    lines.forEach((l) => {
      ty += fs + 1;
      out += `<text x="${cx}" y="${ty}" font-family="Fraunces,serif" font-size="${fs}" text-anchor="middle" fill="${ink}">${esc(l)}</text>`;
    });
    return out;
  }

  function svg(p, { cls = '' } = {}) {
    // Real packshot when available; the drawn pack is the fallback
    if (p.img) {
      return `<img class="pack pack--photo ${cls}" src="${esc(p.img)}" alt="${esc(p.brand + ' ' + p.name)}" loading="lazy" decoding="async" />`;
    }
    const s = SHAPES[p.shape] || SHAPES.bottle;
    const id = 'b' + p.id.replace(/[^a-z0-9]/gi, '');
    const scale = p.scale || 1;
    const shade = `url(#${id}s)`;
    const paint = (parts, fill) =>
      parts.map((d) => d.replace('/>', ` fill="${fill}" stroke="rgba(40,28,20,.14)" stroke-width=".8"/>`) + d.replace('/>', ` fill="${shade}"/>`)).join('');

    return `<svg class="pack ${cls}" viewBox="0 0 200 250" role="img" aria-label="${esc(p.brand + ' ' + p.name)}">
      <defs>
        <linearGradient id="${id}s" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#000" stop-opacity=".10"/>
          <stop offset=".14" stop-color="#fff" stop-opacity=".55"/>
          <stop offset=".3" stop-color="#fff" stop-opacity="0"/>
          <stop offset=".78" stop-color="#000" stop-opacity=".03"/>
          <stop offset="1" stop-color="#000" stop-opacity=".18"/>
        </linearGradient>
        <radialGradient id="${id}g" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#000" stop-opacity=".22"/>
          <stop offset="1" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="236" rx="${66 * scale}" ry="${8 * scale}" fill="url(#${id}g)"/>
      <g transform="translate(100 234) scale(${scale}) translate(-100 -234)">
        ${paint(s.cap, p.cap)}
        ${paint(s.body, p.body)}
        ${labelText(p, s.label, inkFor(p.body))}
      </g>
    </svg>`;
  }

  return { svg };
})();
