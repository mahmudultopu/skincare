/* ==========================================================
   SERAÉ — Admin console
   Dashboard · Orders · Products · Customers · Settings
   Data lives in this browser's localStorage, shared with the store.
   ========================================================== */

(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const DAY = 864e5;
  const DEFAULT_PASS = 'serae2026';

  const store = {
    get(k, d) { try { const v = localStorage.getItem('serae:' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('serae:' + k, JSON.stringify(v)); } catch { toast('Could not save — browser storage is unavailable'); } },
    remove(k) { try { localStorage.removeItem('serae:' + k); } catch { /* ignore */ } },
  };

  const catName = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.name]));
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const byId = () => Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

  /* ---------------- Formatting ---------------- */
  const usd = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: Math.abs(v) >= 1000 ? 0 : 2 }).format(v);
  const compact = (v, money = true) => {
    const a = Math.abs(v);
    const s = a >= 1e6 ? (v / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
      : a >= 1e4 ? (v / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
        : Math.round(v).toLocaleString('en-US');
    return money ? '$' + s : s;
  };
  const fmtDate = (d, opts = { day: 'numeric', month: 'short' }) => new Date(d).toLocaleDateString('en-US', opts);
  const fmtDateTime = (d) => new Date(d).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  const initials = (name) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const hueFor = (s) => ['#EBA3B2', '#B98AA8', '#8FB3A3', '#D7B46A', '#9AA6D6', '#D98C8C'][[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 6];

  const STATUSES = [
    { id: 'Processing', icon: 'a-clock', c: 'var(--st-processing)' },
    { id: 'Shipped', icon: 'a-truck', c: 'var(--st-shipped)' },
    { id: 'Delivered', icon: 'a-check', c: 'var(--st-delivered)' },
    { id: 'Cancelled', icon: 'a-x', c: 'var(--st-cancelled)' },
  ];
  const statusMeta = Object.fromEntries(STATUSES.map((s) => [s.id, s]));
  const pill = (s) => `<span class="pill pill--${s}"><svg><use href="#${statusMeta[s]?.icon || 'a-check'}"/></svg>${s}</span>`;
  const thumb = (p) => (p ? `<div class="thumb" style="--c:${p.body}">${Bottle.svg(p)}</div>` : '<div class="thumb"></div>');

  /* ---------------- UI helpers ---------------- */
  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.innerHTML = `<svg><use href="#a-check"/></svg>${esc(msg)}`;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2400);
  }
  const tip = $('#tooltip');
  function showTip(html, x, y) {
    tip.innerHTML = html;
    tip.classList.add('show');
    const r = tip.getBoundingClientRect();
    const left = Math.min(window.innerWidth - r.width - 12, Math.max(12, x - r.width / 2));
    const top = y - r.height - 14 < 8 ? y + 18 : y - r.height - 14;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }
  const hideTip = () => tip.classList.remove('show');

  /* ---------------- Sample data (deterministic) ---------------- */
  function rng(seed) {
    return () => {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const PEOPLE = [
    ['Emma', 'Roberts', 'United Kingdom', 'London'], ['Amara', 'Okafor', 'United Arab Emirates', 'Dubai'], ['Sofia', 'Martins', 'Canada', 'Toronto'],
    ['Nadia', 'Rahman', 'Bangladesh', 'Dhaka'], ['Priya', 'Sharma', 'India', 'Mumbai'], ['Hana', 'Kim', 'South Korea', 'Seoul'],
    ['Olivia', 'Brown', 'United States', 'New York'], ['Lea', 'Müller', 'Germany', 'Berlin'], ['Chloé', 'Dubois', 'France', 'Paris'],
    ['Aisha', 'Khan', 'Pakistan', 'Lahore'], ['Mia', 'Johansson', 'Sweden', 'Stockholm'], ['Yuki', 'Tanaka', 'Japan', 'Tokyo'],
    ['Fatima', 'Al-Sayed', 'Saudi Arabia', 'Riyadh'], ['Isabella', 'Rossi', 'Italy', 'Milan'], ['Grace', 'Lim', 'Singapore', 'Singapore'],
    ['Zara', 'Ahmed', 'Bangladesh', 'Chattogram'], ['Ava', 'Wilson', 'Australia', 'Sydney'], ['Lucía', 'García', 'Spain', 'Madrid'],
    ['Noor', 'Hassan', 'Qatar', 'Doha'], ['Sarah', 'Cohen', 'United States', 'Los Angeles'], ['Meera', 'Nair', 'India', 'Bengaluru'],
    ['Emily', 'Clarke', 'United Kingdom', 'Manchester'], ['Anika', 'Islam', 'Bangladesh', 'Sylhet'], ['Siti', 'Aminah', 'Malaysia', 'Kuala Lumpur'],
    ['Julia', 'de Vries', 'Netherlands', 'Amsterdam'], ['Maya', 'Patel', 'Canada', 'Vancouver'], ['Layla', 'Haddad', 'United Arab Emirates', 'Abu Dhabi'],
    ['Charlotte', 'Evans', 'Australia', 'Melbourne'], ['Rina', 'Sato', 'Japan', 'Osaka'], ['Tasnim', 'Chowdhury', 'Bangladesh', 'Dhaka'],
  ];
  const PAYMENTS = ['Cash on delivery', 'Card / bank transfer'];

  let demoCache = null;
  function demoOrders() {
    if (demoCache) return demoCache;
    const r = rng(2026);
    const pool = PRODUCTS.filter((p) => !p.added);
    // Weight by popularity only, so editing a price doesn't reshuffle the sample history
    const weights = pool.map((p) => Math.sqrt(p.reviews || 100));
    const totalW = weights.reduce((a, b) => a + b, 0);
    const pick = () => {
      let x = r() * totalW;
      for (let i = 0; i < pool.length; i++) if ((x -= weights[i]) <= 0) return pool[i];
      return pool[0];
    };
    const now = Date.now();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const out = [];
    for (let d = 89; d >= 0; d--) {
      const trend = 1 + ((89 - d) / 89) * 0.9;
      const dow = new Date(today.getTime() - d * DAY).getDay();
      const weekend = dow === 5 || dow === 6 ? 1.35 : 1;
      const n = Math.floor(r() * 3.4 * trend * weekend + (r() < 0.35 ? 1 : 0));
      for (let i = 0; i < n; i++) {
        const t = today.getTime() - d * DAY + (8 + r() * 14) * 3600e3;
        if (t > now) continue;
        const [first, last, country, city] = PEOPLE[Math.floor(r() * PEOPLE.length)];
        const items = [];
        const count = 1 + Math.floor(r() * r() * 3.6);
        for (let k = 0; k < count; k++) {
          const p = pick();
          const ex = items.find((it) => it.id === p.id);
          if (ex) ex.qty++;
          else items.push({ id: p.id, qty: r() < 0.12 ? 2 : 1, name: p.name, brand: p.brand, price: p.price });
        }
        const sub = items.reduce((s, it) => s + it.price * it.qty, 0);
        const promo = r() < 0.12 ? 'WELCOME10' : null;
        const discount = promo ? sub * 0.1 : 0;
        const express = r() < 0.15;
        const shipping = express ? 19.99 : sub - discount >= 75 ? 0 : 7.99;
        const age = (now - t) / DAY;
        const status = age > 9 ? (r() < 0.05 ? 'Cancelled' : 'Delivered') : age > 2.5 ? (r() < 0.04 ? 'Cancelled' : 'Shipped') : 'Processing';
        out.push({
          id: 'SR-' + Math.floor(t / 1000).toString(36).toUpperCase().slice(-5) + i,
          date: new Date(t).toISOString(), currency: 'USD', items, sub, discount, shipping,
          total: sub - discount + shipping, promo, shipMethod: express ? 'express' : 'standard',
          payment: PAYMENTS[r() < 0.62 ? 0 : 1],
          customer: {
            name: `${first} ${last}`, email: `${first}.${last}`.toLowerCase().normalize('NFD').replace(/[^a-z.]/g, '') + '@example.com',
            phone: '+' + Math.floor(1e10 + r() * 9e10), country, city, address: `${10 + Math.floor(r() * 180)} ${['Park', 'Lake', 'Garden', 'Rose', 'Hill'][Math.floor(r() * 5)]} Road`,
          },
          status, demo: true,
        });
      }
    }
    demoCache = out;
    return out;
  }

  function demoScans() {
    const r = rng(77);
    const types = [['Combination', 0.34], ['Normal', 0.22], ['Oily', 0.18], ['Dry', 0.16], ['Sensitive', 0.1]];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const out = [];
    for (let d = 89; d >= 0; d--) {
      const n = Math.floor(r() * 7 * (1 + (89 - d) / 120));
      for (let i = 0; i < n; i++) {
        let x = r(), type = types[0][0];
        for (const [t, w] of types) { if ((x -= w) <= 0) { type = t; break; } }
        out.push({ date: new Date(today.getTime() - d * DAY + r() * 20 * 3600e3).toISOString(), score: 58 + Math.floor(r() * 34), type, demo: true });
      }
    }
    return out.filter((s) => Date.parse(s.date) <= Date.now());
  }

  /* ---------------- Data access ---------------- */
  const prefs = store.get('admin', { showDemo: true });
  let demoScanCache = null;

  function allOrders() {
    const overrides = store.get('orderStatus', {});
    const real = store.get('orders', []).map((o) => ({ ...o, demo: false }));
    const list = [...real, ...(prefs.showDemo ? demoOrders().map((o) => ({ ...o })) : [])];
    list.forEach((o) => { if (overrides[o.id]) o.status = overrides[o.id]; });
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }

  function allScans() {
    const real = store.get('scans', []);
    if (!prefs.showDemo) return real;
    demoScanCache ||= demoScans();
    return [...real, ...demoScanCache];
  }

  function setStatus(id, status) {
    const orders = store.get('orders', []);
    const o = orders.find((x) => x.id === id);
    if (o) {
      o.status = status;
      store.set('orders', orders);
    } else {
      const m = store.get('orderStatus', {});
      m[id] = status;
      store.set('orderStatus', m);
    }
  }

  const validOnly = (list) => list.filter((o) => o.status !== 'Cancelled');
  const revenueOf = (list) => validOnly(list).reduce((s, o) => s + o.total, 0);
  function inWindow(o, days, back = 0) {
    const end = Date.now() - back * days * DAY;
    const t = Date.parse(o.date);
    return t > end - days * DAY && t <= end;
  }

  // Default stock per product until an admin sets one (stable per id)
  const defaultStock = (id) => 8 + ([...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % 130);
  const stockOf = (p) => (p.stock ?? defaultStock(p.id));

  /* ---------------- State ---------------- */
  const state = { view: 'dashboard', range: 30, status: 'all', q: '', shownOrders: 25, cat: 'all', revMode: 'chart' };

  /* ---------------- Charts ---------------- */
  function niceMax(v) {
    if (v <= 0) return 100;
    const e = 10 ** Math.floor(Math.log10(v));
    const f = v / e;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e;
  }

  function sparkline(values) {
    const w = 110, h = 38, n = values.length;
    const max = Math.max(...values, 1), min = Math.min(...values, 0);
    const x = (i) => (i / (n - 1)) * (w - 6) + 3;
    const y = (v) => h - 4 - ((v - min) / (max - min || 1)) * (h - 10);
    const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true">
      <path d="${d}" fill="none" stroke="var(--spark)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${x(n - 1)}" cy="${y(values[n - 1])}" r="4" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>
    </svg>`;
  }

  // Single-series area chart with crosshair tooltip
  function areaChart(el, series, { fmtY = (v) => compact(v), tipHtml }) {
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !series.length) return;
    const pad = { l: 50, r: 14, t: 14, b: 28 };
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    const max = niceMax(Math.max(...series.map((s) => s.v)) * 1.08);
    const n = series.length;
    const x = (i) => pad.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
    const y = (v) => pad.t + ih - (v / max) * ih;
    const line = series.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s.v).toFixed(1)}`).join('');
    const area = `${line}L${x(n - 1).toFixed(1)},${pad.t + ih}L${x(0).toFixed(1)},${pad.t + ih}Z`;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
    const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 90))));
    const xl = series.map((s, i) => ((n - 1 - i) % every === 0 ? `<text x="${x(i)}" y="${h - 8}" text-anchor="middle">${s.label}</text>` : '')).join('');

    el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Revenue over the selected range">
      <defs><linearGradient id="revFill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="var(--accent)" stop-opacity=".22"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/>
      </linearGradient></defs>
      <g class="axis">${ticks.map((t) => `<line class="gridline" x1="${pad.l}" x2="${w - pad.r}" y1="${y(t)}" y2="${y(t)}"/><text x="${pad.l - 10}" y="${y(t) + 4}" text-anchor="end">${fmtY(t)}</text>`).join('')}${xl}</g>
      <path d="${area}" fill="url(#revFill)"/>
      <path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${x(n - 1)}" cy="${y(series[n - 1].v)}" r="4.5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>
      <g class="hover" style="display:none">
        <line class="cross" y1="${pad.t}" y2="${pad.t + ih}" stroke="rgba(255,255,255,.35)" stroke-width="1"/>
        <circle class="cdot" r="5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>
      </g>
      <rect class="hit" x="${pad.l}" y="${pad.t}" width="${iw}" height="${ih}" fill="transparent"/>
    </svg>`;

    const svg = el.firstElementChild;
    const hover = $('.hover', svg), cross = $('.cross', svg), cdot = $('.cdot', svg);
    const move = (e) => {
      const box = svg.getBoundingClientRect();
      const px = ((e.clientX - box.left) / box.width) * w;
      const i = Math.max(0, Math.min(n - 1, Math.round(((px - pad.l) / iw) * (n - 1))));
      hover.style.display = '';
      cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i));
      cdot.setAttribute('cx', x(i)); cdot.setAttribute('cy', y(series[i].v));
      showTip(tipHtml(series[i]), box.left + (x(i) / w) * box.width, box.top + (y(series[i].v) / h) * box.height);
    };
    const hit = $('.hit', svg);
    hit.addEventListener('pointermove', move);
    hit.addEventListener('pointerleave', () => { hover.style.display = 'none'; hideTip(); });
  }

  // Horizontal bars: one hue, value at the tip, tooltip per bar
  function hbars(el, rows, fmt) {
    if (!rows.length) {
      el.innerHTML = '<p class="empty-note">No data in this range yet.</p>';
      return;
    }
    const max = Math.max(...rows.map((r) => r.value), 1);
    el.innerHTML = rows.map((r, i) => `<div class="hbar" data-i="${i}">
      <span class="hbar__label">${esc(r.label)}</span>
      <div class="hbar__track"><div class="hbar__bar" style="width:0" data-w="${Math.max(1, (r.value / max) * 82)}"></div><span class="hbar__val">${fmt(r.value)}</span></div>
    </div>`).join('');
    requestAnimationFrame(() => requestAnimationFrame(() => $$('.hbar__bar', el).forEach((b) => (b.style.width = b.dataset.w + '%'))));
    $$('.hbar', el).forEach((row) => {
      const r = rows[row.dataset.i];
      row.addEventListener('pointermove', (e) => showTip(r.tip, e.clientX, e.clientY));
      row.addEventListener('pointerleave', hideTip);
    });
  }

  /* ---------------- Dashboard ---------------- */
  function bucketSeries(list, days, fn) {
    const buckets = 12;
    const end = Date.now();
    const size = (days * DAY) / buckets;
    return Array.from({ length: buckets }, (_, b) => {
      const from = end - days * DAY + b * size;
      return fn(list.filter((o) => { const t = Date.parse(o.date); return t > from && t <= from + size; }));
    });
  }

  function renderDashboard() {
    const orders = allOrders();
    const days = state.range;
    const cur = orders.filter((o) => inWindow(o, days));
    const prev = orders.filter((o) => inWindow(o, days, 1));
    const aov = (l) => { const v = validOnly(l); return v.length ? revenueOf(l) / v.length : 0; };
    const custs = (l) => new Set(l.map((o) => o.customer.email)).size;

    const kpis = [
      { label: 'Revenue', fn: revenueOf, fmt: (v) => compact(v) },
      { label: 'Orders', fn: (l) => l.length, fmt: (v) => compact(v, false) },
      { label: 'Avg. order value', fn: aov, fmt: (v) => usd(v) },
      { label: 'Customers', fn: custs, fmt: (v) => compact(v, false) },
    ];
    $('#kpis').innerHTML = kpis.map((k) => {
      const c = k.fn(cur), p = k.fn(prev);
      const pct = p ? ((c - p) / p) * 100 : null;
      const dir = pct === null || Math.abs(pct) < 0.5 ? 'flat' : pct > 0 ? 'up' : 'down';
      const delta = pct === null ? '<span class="delta delta--flat">New</span>'
        : `<span class="delta delta--${dir}">${dir !== 'flat' ? `<svg><use href="#a-${dir === 'up' ? 'up' : 'dn'}"/></svg>` : ''}${Math.abs(pct).toFixed(1)}%</span>`;
      return `<article class="kpi glass">
        <div class="kpi__label">${k.label}</div>
        <div class="kpi__value">${k.fmt(c)}</div>
        <div class="kpi__row"><div>${delta}<small>vs previous ${days} days</small></div>${sparkline(bucketSeries(cur, days, k.fn))}</div>
      </article>`;
    }).join('');

    // Daily revenue
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const series = Array.from({ length: days }, (_, i) => {
      const start = today.getTime() - (days - 1 - i) * DAY;
      const dayOrders = cur.filter((o) => { const t = Date.parse(o.date); return t >= start && t < start + DAY; });
      return { label: fmtDate(start), v: revenueOf(dayOrders), n: dayOrders.length, start };
    });
    state.series = series;
    $('#revSub').textContent = `Daily revenue · ${compact(revenueOf(cur))} over the last ${days} days`;
    drawRevenue();
    $('#revTable').innerHTML = `<table class="table"><thead><tr><th>Date</th><th class="r">Orders</th><th class="r">Revenue</th></tr></thead><tbody>${[...series].reverse().map((s) => `<tr><td>${fmtDate(s.start, { weekday: 'short', day: 'numeric', month: 'short' })}</td><td class="r">${s.n}</td><td class="r">${usd(s.v)}</td></tr>`).join('')}</tbody></table>`;

    // Status tiles
    $('#statusGrid').innerHTML = STATUSES.map((s) => `<button class="status-tile" style="--c:${s.c}" data-status-jump="${s.id}">
      <span class="status-tile__icon"><svg><use href="#${s.icon}"/></svg></span>
      <div><b>${cur.filter((o) => o.status === s.id).length}</b><small>${s.id}</small></div>
    </button>`).join('');

    // Scans by skin type
    const scans = allScans().filter((s) => inWindow(s, days));
    const types = {};
    scans.forEach((s) => (types[s.type] = (types[s.type] || 0) + 1));
    const avg = scans.length ? Math.round(scans.reduce((a, s) => a + s.score, 0) / scans.length) : 0;
    $('#scanSub').textContent = scans.length ? `${scans.length.toLocaleString()} scans · average score ${avg}` : 'From AI skin analysis';
    hbars($('#scanBars'), Object.entries(types).sort((a, b) => b[1] - a[1]).map(([t, v]) => ({
      label: t, value: v, tip: `<b>${t}</b>${v} scans · ${Math.round((v / scans.length) * 100)}%`,
    })), (v) => v.toLocaleString());
    $('#sideScans').textContent = allScans().filter((s) => inWindow(s, 30)).length.toLocaleString();

    // Category revenue + top products
    const cat = {}, prod = {};
    const products = byId();
    validOnly(cur).forEach((o) => o.items.forEach((it) => {
      const p = products[it.id];
      const c = p ? p.cat : 'other';
      const v = it.price * it.qty;
      cat[c] = cat[c] || { v: 0, u: 0 };
      cat[c].v += v; cat[c].u += it.qty;
      prod[it.id] = prod[it.id] || { v: 0, u: 0, name: it.name, brand: it.brand };
      prod[it.id].v += v; prod[it.id].u += it.qty;
    }));
    hbars($('#catBars'), Object.entries(cat).sort((a, b) => b[1].v - a[1].v).map(([c, d]) => ({
      label: catName[c] || 'Other', value: d.v, tip: `<b>${catName[c] || 'Other'}</b>${usd(d.v)} · ${d.u} units`,
    })), (v) => compact(v));

    const top = Object.entries(prod).sort((a, b) => b[1].v - a[1].v).slice(0, 5);
    $('#topProducts').innerHTML = top.length ? top.map(([id, d], i) => `<li>
        <span class="rank">${i + 1}</span>${thumb(products[id])}
        <div style="min-width:0"><b>${esc(d.name)}</b><small>${esc(d.brand)}</small></div>
        <div class="num">${compact(d.v)}<small>${d.u} sold</small></div>
      </li>`).join('') : '<p class="empty-note">No sales in this range yet.</p>';

    $('#recentOrders').innerHTML = orderTable(orders.slice(0, 6), true);
    $('#demoBanner').hidden = !prefs.showDemo;
    updateBadges(orders);
  }

  function drawRevenue() {
    if (!state.series || state.view !== 'dashboard') return;
    areaChart($('#revChart'), state.series, {
      tipHtml: (s) => `<small>${fmtDate(s.start, { weekday: 'short', day: 'numeric', month: 'short' })}</small><b>${usd(s.v)}</b><small>${s.n} order${s.n === 1 ? '' : 's'}</small>`,
    });
  }

  function updateBadges(orders = allOrders()) {
    const n = orders.filter((o) => o.status === 'Processing').length;
    $('#navOrders').textContent = n;
    $('#navOrders').hidden = !n;
  }

  /* ---------------- Orders ---------------- */
  function orderTable(list, compactRows = false) {
    if (!list.length) return '<tbody><tr><td class="muted" style="padding:28px 16px">No orders found.</td></tr></tbody>';
    return `<thead><tr><th>Order</th><th>Date</th><th>Customer</th>${compactRows ? '' : '<th>Country</th><th class="r">Items</th>'}<th class="r">Total</th>${compactRows ? '' : '<th>Payment</th>'}<th>Status</th></tr></thead>
      <tbody>${list.map((o) => `<tr data-order="${o.id}">
        <td class="strong">${o.id}${o.demo ? '<span class="tag-demo">SAMPLE</span>' : ''}</td>
        <td class="muted">${fmtDate(o.date)}</td>
        <td><div class="cell-user"><span class="initials" style="--c:${hueFor(o.customer.name)}">${initials(o.customer.name)}</span><div>${esc(o.customer.name)}<small>${esc(o.customer.email)}</small></div></div></td>
        ${compactRows ? '' : `<td>${esc(o.customer.country)}</td><td class="r">${o.items.reduce((s, i) => s + i.qty, 0)}</td>`}
        <td class="r strong">${usd(o.total)}</td>
        ${compactRows ? '' : `<td class="muted">${esc(o.payment)}</td>`}
        <td>${pill(o.status)}</td>
      </tr>`).join('')}</tbody>`;
  }

  function filteredOrders() {
    const q = state.q.trim().toLowerCase();
    return allOrders().filter((o) => (state.status === 'all' || o.status === state.status) &&
      (!q || [o.id, o.customer.name, o.customer.email, o.customer.country, ...o.items.map((i) => i.name)].join(' ').toLowerCase().includes(q)));
  }

  function renderOrders() {
    const list = filteredOrders();
    $('#ordersTable').innerHTML = orderTable(list.slice(0, state.shownOrders));
    $('#ordersFoot').innerHTML = `<span>Showing ${Math.min(state.shownOrders, list.length)} of ${list.length} orders</span>${list.length > state.shownOrders ? '<button class="link" id="moreOrders">Load more</button>' : ''}`;
    $$('#statusFilter button').forEach((b) => b.classList.toggle('active', b.dataset.status === state.status));
    $('#moreOrders')?.addEventListener('click', () => { state.shownOrders += 25; renderOrders(); });
    setSub(`${list.length} orders${state.status !== 'all' ? ` · ${state.status}` : ''}`);
  }

  function openOrder(id) {
    const o = allOrders().find((x) => x.id === id);
    if (!o) return;
    const products = byId();
    const sheet = $('#orderSheet');
    sheet.innerHTML = `<div class="sheet__head">
        <div><h2>${o.id}${o.demo ? '<span class="tag-demo">SAMPLE</span>' : ''}</h2><p>${fmtDateTime(o.date)} · ${esc(o.payment)}</p></div>
        <button class="icon-btn" data-close aria-label="Close"><svg><use href="#a-close"/></svg></button>
      </div>
      <div class="sheet__body">
        <div><div class="sheet__label">Status</div>
          <div class="status-pick">${STATUSES.map((s) => `<button class="${o.status === s.id ? 'on' : ''}" style="--c:${s.c}" data-set-status="${s.id}"><svg><use href="#${s.icon}"/></svg>${s.id}</button>`).join('')}</div>
        </div>
        <div><div class="sheet__label">Customer</div>
          <div class="info-card"><b>${esc(o.customer.name)}</b><span>${esc(o.customer.email)}</span><span>${esc(o.customer.phone || '')}</span>
          <span>${esc([o.customer.address, o.customer.city, o.customer.zip, o.customer.country].filter(Boolean).join(', '))}</span>
          ${o.customer.notes ? `<span>Note: ${esc(o.customer.notes)}</span>` : ''}</div>
        </div>
        <div><div class="sheet__label">Items</div>
          <ul class="line-items">${o.items.map((it) => `<li>${thumb(products[it.id])}<div style="min-width:0"><b>${esc(it.name)}</b><small>${esc(it.brand)} · ${it.qty} × ${usd(it.price)}</small></div><span class="strong">${usd(it.price * it.qty)}</span></li>`).join('')}</ul>
          <div class="sum" style="margin-top:14px">
            <div><span>Subtotal</span><span>${usd(o.sub)}</span></div>
            ${o.discount ? `<div><span>Discount${o.promo ? ` (${esc(o.promo)})` : ''}</span><span>−${usd(o.discount)}</span></div>` : ''}
            <div><span>Shipping · ${o.shipMethod === 'express' ? 'Express' : 'Standard'}</span><span>${o.shipping ? usd(o.shipping) : 'Free'}</span></div>
            <div class="grand"><span>Total</span><span>${usd(o.total)}</span></div>
          </div>
        </div>
      </div>`;
    $$('[data-set-status]', sheet).forEach((b) => b.addEventListener('click', () => {
      setStatus(o.id, b.dataset.setStatus);
      toast(`${o.id} marked as ${b.dataset.setStatus}`);
      openOrder(o.id);
      renderCurrent();
    }));
    openLayer(sheet);
  }

  function exportCsv() {
    const rows = [['Order', 'Date', 'Customer', 'Email', 'Country', 'Items', 'Subtotal', 'Discount', 'Shipping', 'Total', 'Payment', 'Status', 'Sample']];
    filteredOrders().forEach((o) => rows.push([o.id, o.date, o.customer.name, o.customer.email, o.customer.country,
      o.items.map((i) => `${i.qty}x ${i.brand} ${i.name}`).join(' | '), o.sub.toFixed(2), o.discount.toFixed(2), o.shipping.toFixed(2), o.total.toFixed(2), o.payment, o.status, o.demo ? 'yes' : 'no']));
    download(`serae-orders-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv');
  }

  function download(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = Object.assign(document.createElement('a'), { href: url, download: name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------------- Products ---------------- */
  function unitsSold() {
    const u = {};
    validOnly(allOrders()).forEach((o) => o.items.forEach((it) => (u[it.id] = (u[it.id] || 0) + it.qty)));
    return u;
  }

  function renderProducts() {
    const q = state.q.trim().toLowerCase();
    const sold = unitsSold();
    const list = PRODUCTS.filter((p) => (state.cat === 'all' || p.cat === state.cat) &&
      (!q || [p.name, p.brand, p.cat, ...(p.key || [])].join(' ').toLowerCase().includes(q)));
    $('#productsTable').innerHTML = `<thead><tr><th>Product</th><th>Category</th><th class="r">Price</th><th class="r">Stock</th><th class="r">Sold</th><th>Status</th></tr></thead>
      <tbody>${list.map((p) => {
        const st = stockOf(p);
        return `<tr data-product="${p.id}">
          <td><div class="cell-prod">${thumb(p)}<div><b>${esc(p.name)}</b><small>${esc(p.brand)} · ${esc(p.size || '')}</small></div></div></td>
          <td class="muted">${catName[p.cat] || p.cat}</td>
          <td class="r strong">${usd(p.price)}${p.old ? `<s class="muted">${usd(p.old)}</s>` : ''}</td>
          <td class="r ${st === 0 ? 'stock-out' : st < 15 ? 'stock-low' : ''}">${st === 0 ? 'Sold out' : st}</td>
          <td class="r">${(sold[p.id] || 0).toLocaleString()}</td>
          <td><button class="pill pill--${p.hidden ? 'Hidden' : 'Active'}" data-toggle="${p.id}" title="Click to ${p.hidden ? 'show in' : 'hide from'} store"><svg><use href="#a-${p.hidden ? 'x' : 'check'}"/></svg>${p.hidden ? 'Hidden' : 'Active'}</button></td>
        </tr>`;
      }).join('')}</tbody>`;
    setSub(`${list.length} of ${PRODUCTS.length} products · ${PRODUCTS.filter((p) => p.hidden).length} hidden`);
  }

  const EDIT_FIELDS = ['name', 'brand', 'cat', 'size', 'price', 'old', 'stock', 'badge', 'img', 'shape', 'body', 'cap', 'label', 'desc', 'key', 'concerns', 'hidden'];

  function persistProduct(p) {
    const cat = store.get('catalog', { edits: {}, added: [] });
    cat.edits ||= {}; cat.added ||= [];
    if (p.added) {
      const i = cat.added.findIndex((x) => x.id === p.id);
      if (i >= 0) cat.added[i] = { ...p }; else cat.added.push({ ...p });
    } else {
      cat.edits[p.id] = Object.fromEntries(EDIT_FIELDS.map((f) => [f, p[f]]));
    }
    store.set('catalog', cat);
  }

  function toggleHidden(id) {
    const p = PRODUCTS.find((x) => x.id === id);
    p.hidden = !p.hidden;
    persistProduct(p);
    toast(`${p.name} is now ${p.hidden ? 'hidden from' : 'visible in'} the store`);
    renderProducts();
  }

  function openEditor(id) {
    const existing = id ? PRODUCTS.find((p) => p.id === id) : null;
    const p = existing ? { ...existing, stock: stockOf(existing) } : {
      name: '', brand: '', cat: 'serum', size: '30 ml', price: 25, old: null, stock: 50, badge: '', shape: 'dropper',
      body: '#EAE5DD', cap: '#FFFFFF', label: ['New', 'Product'], desc: '', key: [], concerns: [], hidden: false,
      rating: 4.5, reviews: 0, added: true,
    };
    const opt = (list, val) => list.map(([v, l]) => `<option value="${v}" ${String(v) === String(val ?? '') ? 'selected' : ''}>${l}</option>`).join('');
    const form = $('#productForm');
    form.innerHTML = `<div class="editor">
      <div class="editor__preview">
        <div class="editor__stage" id="edStage"></div>
        <small>Live packshot preview</small>
      </div>
      <div class="editor__form">
        <div style="display:flex;justify-content:space-between;align-items:center"><h2>${existing ? 'Edit product' : 'New product'}</h2><button type="button" class="icon-btn" data-close aria-label="Close"><svg><use href="#a-close"/></svg></button></div>
        <div class="fields">
          <label class="field full"><span>Product name</span><input name="name" value="${esc(p.name)}" required /></label>
          <label class="field"><span>Brand</span><input name="brand" value="${esc(p.brand)}" required /></label>
          <label class="field"><span>Category</span><select name="cat">${opt(CATEGORIES.filter((c) => c.id !== 'all').map((c) => [c.id, c.name]), p.cat)}</select></label>
          <label class="field"><span>Price (USD)</span><input name="price" type="number" step="0.01" min="0.01" value="${p.price}" required /></label>
          <label class="field"><span>Compare-at price (optional)</span><input name="old" type="number" step="0.01" min="0" value="${p.old ?? ''}" /></label>
          <label class="field"><span>Stock</span><input name="stock" type="number" step="1" min="0" value="${p.stock}" /></label>
          <label class="field"><span>Size</span><input name="size" value="${esc(p.size)}" /></label>
          <label class="field"><span>Badge</span><select name="badge">${opt([['', 'None'], ['Bestseller', 'Bestseller'], ['New', 'New'], ['Luxury', 'Luxury'], ['K-Beauty', 'K-Beauty']], p.badge)}</select></label>
          <label class="field full"><span>Product image URL (leave empty to use a drawn pack)</span><input name="img" value="${esc(p.img || '')}" placeholder="https://… or assets/products/my-product.webp" /></label>
          <label class="field"><span>Pack shape</span><select name="shape">${opt(['dropper', 'pump', 'tube', 'jar', 'bottle', 'spray'].map((s) => [s, s[0].toUpperCase() + s.slice(1)]), p.shape)}</select></label>
          <label class="field"><span>Pack colour</span><input name="body" type="color" value="${p.body}" /></label>
          <label class="field"><span>Cap colour</span><input name="cap" type="color" value="${p.cap}" /></label>
          <label class="field"><span>Label line 1</span><input name="label1" value="${esc(p.label?.[0] || '')}" maxlength="16" /></label>
          <label class="field"><span>Label line 2</span><input name="label2" value="${esc(p.label?.[1] || '')}" maxlength="16" /></label>
          <label class="field full"><span>Description</span><textarea name="desc">${esc(p.desc)}</textarea></label>
          <label class="field full"><span>Key ingredients (comma separated)</span><input name="key" value="${esc((p.key || []).join(', '))}" /></label>
          <div class="field full"><span>Best for</span><div class="checks">${CONCERNS.map((c) => `<label><input type="checkbox" name="concerns" value="${c.id}" ${p.concerns?.includes(c.id) ? 'checked' : ''}/>${c.name}</label>`).join('')}</div></div>
        </div>
        <label class="switch-row" style="margin:0"><div><b>Hide from store</b><small>Keep the product but stop selling it</small></div><input type="checkbox" class="switch" name="hidden" ${p.hidden ? 'checked' : ''}/></label>
        <div class="editor__foot">
          ${existing?.added ? '<button type="button" class="btn btn--danger" id="edDelete">Delete product</button>' : ''}
          <button type="button" class="btn btn--glass" data-close>Cancel</button>
          <button type="submit" class="btn btn--accent"><svg><use href="#a-check"/></svg> Save product</button>
        </div>
      </div>
    </div>`;

    const read = () => {
      const f = new FormData(form);
      const num = (k) => (f.get(k) === '' ? null : Number(f.get(k)));
      return {
        ...p,
        name: f.get('name').trim(), brand: f.get('brand').trim(), cat: f.get('cat'), size: f.get('size').trim(),
        price: num('price'), old: num('old') || null, stock: num('stock') ?? 0, badge: f.get('badge') || '',
        img: f.get('img').trim(), shape: f.get('shape'), body: f.get('body'), cap: f.get('cap'),
        label: [f.get('label1'), f.get('label2')].map((s) => s.trim()).filter(Boolean),
        desc: f.get('desc').trim(), key: f.get('key').split(',').map((s) => s.trim()).filter(Boolean),
        concerns: f.getAll('concerns'), hidden: f.get('hidden') === 'on',
      };
    };
    const preview = () => {
      const d = read();
      const stage = $('#edStage');
      stage.style.setProperty('--c', d.body);
      stage.innerHTML = Bottle.svg({ ...d, id: 'preview', brand: d.brand || 'Brand' });
    };
    form.oninput = preview;
    preview();

    form.onsubmit = (e) => {
      e.preventDefault();
      const d = read();
      if (!d.name || !d.brand || !(d.price > 0)) { toast('Name, brand and a price are required'); return; }
      if (existing) {
        Object.assign(existing, d);
        persistProduct(existing);
      } else {
        const base = (d.brand + '-' + d.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
        let nid = base, i = 2;
        while (PRODUCTS.some((x) => x.id === nid)) nid = `${base}-${i++}`;
        const np = { ...d, id: nid, added: true };
        PRODUCTS.push(np);
        persistProduct(np);
      }
      closeAll();
      toast(existing ? 'Product updated' : 'Product added to the store');
      renderCurrent();
    };
    $('#edDelete')?.addEventListener('click', () => {
      if (!confirm(`Delete “${existing.name}”? This cannot be undone.`)) return;
      const cat = store.get('catalog', { edits: {}, added: [] });
      cat.added = (cat.added || []).filter((x) => x.id !== existing.id);
      store.set('catalog', cat);
      PRODUCTS.splice(PRODUCTS.indexOf(existing), 1);
      closeAll();
      toast('Product deleted');
      renderCurrent();
    });
    openLayer($('#productModal'));
  }

  /* ---------------- Customers ---------------- */
  function renderCustomers() {
    const q = state.q.trim().toLowerCase();
    const map = {};
    allOrders().forEach((o) => {
      const k = o.customer.email;
      const c = (map[k] ||= { ...o.customer, orders: 0, spent: 0, last: o.date, demo: o.demo });
      c.orders++;
      if (o.status !== 'Cancelled') c.spent += o.total;
      if (o.date > c.last) c.last = o.date;
    });
    const list = Object.values(map).filter((c) => !q || [c.name, c.email, c.country, c.city].join(' ').toLowerCase().includes(q))
      .sort((a, b) => b.spent - a.spent);
    $('#customersTable').innerHTML = list.length ? `<thead><tr><th>Customer</th><th>Location</th><th class="r">Orders</th><th class="r">Total spent</th><th>Last order</th></tr></thead>
      <tbody>${list.map((c) => `<tr>
        <td><div class="cell-user"><span class="initials" style="--c:${hueFor(c.name)}">${initials(c.name)}</span><div>${esc(c.name)}${c.demo ? '<span class="tag-demo">SAMPLE</span>' : ''}<small>${esc(c.email)}</small></div></div></td>
        <td class="muted">${esc([c.city, c.country].filter(Boolean).join(', '))}</td>
        <td class="r">${c.orders}</td><td class="r strong">${usd(c.spent)}</td><td class="muted">${fmtDate(c.last, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
      </tr>`).join('')}</tbody>` : '<tbody><tr><td class="muted" style="padding:28px 16px">No customers yet.</td></tr></tbody>';
    setSub(`${list.length} customers`);
  }

  /* ---------------- Settings ---------------- */
  function renderSettings() {
    const f = $('#settingsForm');
    f.freeShippingOver.value = CONFIG.freeShippingOver;
    f.standard.value = CONFIG.shipping.standard;
    f.express.value = CONFIG.shipping.express;
    f.whatsapp.value = CONFIG.whatsapp || '';
    f.showDemo.checked = !!prefs.showDemo;
    f.password.value = '';
    $('#rateFields').innerHTML = Object.entries(CONFIG.currencies).filter(([c]) => c !== 'USD')
      .map(([c, v]) => `<label class="field"><span>${c}</span><input type="number" step="0.0001" min="0" name="rate_${c}" value="${v.rate}" /></label>`).join('');
    setSub('Store configuration');
  }

  function saveSettings(e) {
    e.preventDefault();
    const f = e.target;
    const rates = {};
    Object.keys(CONFIG.currencies).filter((c) => c !== 'USD').forEach((c) => {
      const v = Number(f['rate_' + c].value);
      if (v > 0) { rates[c] = v; CONFIG.currencies[c].rate = v; }
    });
    const cfg = {
      freeShippingOver: Number(f.freeShippingOver.value) || 0,
      shipping: { standard: Number(f.standard.value) || 0, express: Number(f.express.value) || 0 },
      whatsapp: f.whatsapp.value.trim(),
      rates,
    };
    Object.assign(CONFIG, { freeShippingOver: cfg.freeShippingOver, whatsapp: cfg.whatsapp });
    Object.assign(CONFIG.shipping, cfg.shipping);
    store.set('config', cfg);
    prefs.showDemo = f.showDemo.checked;
    store.set('admin', prefs);
    if (f.password.value) store.set('adminPass', f.password.value);
    f.password.value = '';
    toast('Settings saved');
  }

  /* ---------------- Navigation & layers ---------------- */
  const TITLES = { dashboard: 'Dashboard', orders: 'Orders', products: 'Products', customers: 'Customers', settings: 'Settings' };
  const setSub = (t) => ($('#viewSub').textContent = t);

  function renderCurrent() {
    hideTip();
    ({ dashboard: renderDashboard, orders: renderOrders, products: renderProducts, customers: renderCustomers, settings: renderSettings })[state.view]();
    if (state.view === 'dashboard') {
      setSub(`${new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Last ${state.range} days`);
    } else {
      updateBadges();
    }
  }

  function showView(v) {
    state.view = v;
    $$('.view').forEach((s) => s.classList.toggle('active', s.dataset.view === v));
    $$('#sideNav button').forEach((b) => b.classList.toggle('active', b.dataset.view === v));
    $('#viewTitle').textContent = TITLES[v];
    $('#rangeSeg').hidden = v !== 'dashboard';
    $('.search').hidden = v === 'settings';
    $('#side').classList.remove('open');
    renderCurrent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const scrim = $('#scrim');
  function openLayer(el) {
    closeAll();
    el.classList.add('open');
    scrim.classList.add('on');
  }
  function closeAll() {
    $$('.sheet.open, .modal.open, .side.open').forEach((el) => el.classList.remove('open'));
    scrim.classList.remove('on');
    hideTip();
  }

  /* ---------------- Boot ---------------- */
  function startApp() {
    $('#login').hidden = true;
    $('#app').hidden = false;

    $('#catFilter').innerHTML = CATEGORIES.map((c) => `<option value="${c.id}">${c.id === 'all' ? 'All categories' : c.name}</option>`).join('');

    $('#sideNav').addEventListener('click', (e) => { const b = e.target.closest('[data-view]'); if (b) showView(b.dataset.view); });
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) return closeAll();
      const go = e.target.closest('[data-goto]');
      if (go) return showView(go.dataset.goto);
      const jump = e.target.closest('[data-status-jump]');
      if (jump) { state.status = jump.dataset.statusJump; state.shownOrders = 25; return showView('orders'); }
      const tg = e.target.closest('[data-toggle]');
      if (tg) { e.stopPropagation(); return toggleHidden(tg.dataset.toggle); }
      const row = e.target.closest('[data-order]');
      if (row) return openOrder(row.dataset.order);
      const prow = e.target.closest('[data-product]');
      if (prow) return openEditor(prow.dataset.product);
    });

    $('#rangeSeg').addEventListener('click', (e) => {
      const b = e.target.closest('[data-range]');
      if (!b) return;
      state.range = Number(b.dataset.range);
      $$('#rangeSeg button').forEach((x) => x.classList.toggle('active', x === b));
      renderCurrent();
    });
    $('#revView').addEventListener('click', (e) => {
      const b = e.target.closest('[data-mode]');
      if (!b) return;
      state.revMode = b.dataset.mode;
      $$('#revView button').forEach((x) => x.classList.toggle('active', x === b));
      $('#revChart').hidden = state.revMode !== 'chart';
      $('#revTable').hidden = state.revMode !== 'table';
      if (state.revMode === 'chart') drawRevenue();
    });
    $('#statusFilter').addEventListener('click', (e) => {
      const b = e.target.closest('[data-status]');
      if (b) { state.status = b.dataset.status; state.shownOrders = 25; renderOrders(); }
    });
    $('#catFilter').addEventListener('change', (e) => { state.cat = e.target.value; renderProducts(); });
    $('#addProduct').addEventListener('click', () => openEditor(null));
    $('#exportCsv').addEventListener('click', exportCsv);

    let qT;
    $('#globalSearch').addEventListener('input', (e) => {
      clearTimeout(qT);
      qT = setTimeout(() => {
        state.q = e.target.value;
        if (state.view === 'dashboard' && state.q) showView('orders');
        else renderCurrent();
      }, 150);
    });

    $('#settingsForm').addEventListener('submit', saveSettings);
    $('#exportJson').addEventListener('click', () => download(`serae-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({
      orders: store.get('orders', []), orderStatus: store.get('orderStatus', {}), catalog: store.get('catalog', null),
      config: store.get('config', null), scans: store.get('scans', []), exportedAt: new Date().toISOString(),
    }, null, 2), 'application/json'));
    $('#resetCatalog').addEventListener('click', () => {
      if (!confirm('Reset all product edits, added products and hidden states?')) return;
      store.remove('catalog');
      location.reload();
    });
    $('#clearOrders').addEventListener('click', () => {
      if (!confirm('Delete all real orders saved in this browser? Sample data is not affected.')) return;
      store.set('orders', []);
      toast('Real orders deleted');
    });

    $('#menuBtn').addEventListener('click', () => openLayer($('#side')));
    $('#logoutBtn').addEventListener('click', () => {
      try { sessionStorage.removeItem('serae:auth'); } catch { /* ignore */ }
      location.reload();
    });
    scrim.addEventListener('click', closeAll);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

    // Re-draw the chart when its panel changes size
    let rz;
    new ResizeObserver(() => { clearTimeout(rz); rz = setTimeout(drawRevenue, 80); }).observe($('#revChart'));
    // Pick up orders placed in the store from another tab
    window.addEventListener('storage', (e) => { if (e.key?.startsWith('serae:')) renderCurrent(); });

    showView('dashboard');
  }

  const authed = () => { try { return sessionStorage.getItem('serae:auth') === '1'; } catch { return false; } };
  if (authed()) {
    startApp();
  } else {
    $('#loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      if ($('#loginPass').value === store.get('adminPass', DEFAULT_PASS)) {
        try { sessionStorage.setItem('serae:auth', '1'); } catch { /* ignore */ }
        startApp();
      } else {
        $('#loginErr').hidden = false;
        $('#loginPass').select();
      }
    });
    $('#loginPass').focus();
  }
})();
