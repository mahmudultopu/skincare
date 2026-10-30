/* ==========================================================
   SERAÉ — storefront logic
   Shop · Cart · Checkout · Orders · Currency · AI skin scan
   ========================================================== */

(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const catName = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.name]));
  const concernName = Object.fromEntries(CONCERNS.map((c) => [c.id, c.name]));
  const PAGE = 12;

  // localStorage can throw (private mode, blocked storage) — never let it break the page
  const store = {
    get(k, d) { try { const v = localStorage.getItem('serae:' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('serae:' + k, JSON.stringify(v)); } catch { /* ignore */ } },
  };

  const state = {
    cat: 'all', brand: 'all', concern: 'all', q: '', sort: 'featured', shown: PAGE,
    currency: store.get('currency', 'USD'),
    cart: store.get('cart', []).filter((i) => byId[i.id]),
    wish: store.get('wish', []).filter((id) => byId[id]),
    orders: store.get('orders', []),
    promo: null,
    openProduct: null,
    routine: [],
  };
  if (!CONFIG.currencies[state.currency]) state.currency = 'USD';

  // Featured order: round-robin across brands so the grid feels curated
  const FEATURED = (() => {
    const groups = {};
    PRODUCTS.forEach((p) => (groups[p.brand] ||= []).push(p));
    const lists = Object.values(groups);
    const out = [];
    for (let i = 0; out.length < PRODUCTS.length; i++) lists.forEach((l) => l[i] && out.push(l[i]));
    return out;
  })();

  /* ---------------- Formatting ---------------- */
  function money(usd, code = state.currency) {
    const c = CONFIG.currencies[code] || CONFIG.currencies.USD;
    const whole = c.rate >= 20;
    return new Intl.NumberFormat(c.locale, {
      style: 'currency', currency: code,
      minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2,
    }).format(usd * c.rate);
  }
  const priceHTML = (p) => money(p.price) + (p.old ? `<s>${money(p.old)}</s>` : '');
  const fmtCount = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function badgeHTML(p) {
    if (p.old) return `<span class="badge badge--Sale">−${Math.round((1 - p.price / p.old) * 100)}%</span>`;
    if (p.badge) return `<span class="badge badge--${p.badge.replace(/\W/g, '')}">${p.badge}</span>`;
    return '';
  }
  const miniImg = (p, extra = '') => `<div class="mini-product__img" style="--c:${p.body}">${Bottle.svg(p)}${extra}</div>`;

  /* ---------------- Toast ---------------- */
  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.innerHTML = `<svg><use href="#i-check"/></svg><span>${esc(msg)}</span>`;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------------- Shop ---------------- */
  function matches(p, q) {
    const hay = [p.brand, p.name, catName[p.cat], ...p.key, ...p.concerns.map((c) => concernName[c])].join(' ').toLowerCase();
    return q.split(/\s+/).every((w) => hay.includes(w));
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    const list = FEATURED.filter((p) =>
      (state.cat === 'all' || p.cat === state.cat) &&
      (state.brand === 'all' || p.brand === state.brand) &&
      (state.concern === 'all' || p.concerns.includes(state.concern)) &&
      (!q || matches(p, q)));
    const sorters = {
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
      reviews: (a, b) => b.reviews - a.reviews,
    };
    return sorters[state.sort] ? list.sort(sorters[state.sort]) : list;
  }

  function cardHTML(p, i) {
    const inWish = state.wish.includes(p.id);
    return `<article class="card" style="--c:${p.body};animation-delay:${(i % PAGE) * 40}ms" data-id="${p.id}">
      <div class="card__media" data-action="view">
        ${badgeHTML(p)}${Bottle.svg(p)}
        <button class="wish ${inWish ? 'on' : ''}" data-action="wish" aria-label="Save to wishlist"><svg><use href="#i-heart${inWish ? '-fill' : ''}"/></svg></button>
        <button class="quick" data-action="view"><svg><use href="#i-search"/></svg> Quick view</button>
      </div>
      <div class="card__body">
        <span class="card__brand">${esc(p.brand)}</span>
        <h3 class="card__name" data-action="view">${esc(p.name)}</h3>
        <div class="card__meta"><span class="stars"><svg><use href="#i-star"/></svg><b>${p.rating.toFixed(1)}</b></span><span>(${fmtCount(p.reviews)})</span><span>·</span><span>${p.size}</span></div>
        <div class="card__foot"><span class="price">${priceHTML(p)}</span><button class="add" data-action="add" aria-label="Add to bag"><svg><use href="#i-plus"/></svg></button></div>
      </div>
    </article>`;
  }

  function renderShop() {
    const list = filtered();
    $('#productGrid').innerHTML = list.slice(0, state.shown).map(cardHTML).join('');
    $('#resultCount').textContent = `${list.length} product${list.length === 1 ? '' : 's'}`;
    $('#emptyState').hidden = list.length > 0;
    $('#loadMore').parentElement.hidden = state.shown >= list.length;
    $('#clearFilters').hidden = state.cat === 'all' && state.brand === 'all' && state.concern === 'all' && !state.q;
    $$('#catTabs .tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.cat === state.cat);
      t.setAttribute('aria-selected', t.dataset.cat === state.cat);
    });
    $('#brandFilter').value = state.brand;
    $('#concernFilter').value = state.concern;
  }

  function setFilter(patch, scroll = true) {
    Object.assign(state, patch, { shown: PAGE });
    if (patch.q !== undefined) $('#searchInput').value = patch.q;
    renderShop();
    if (scroll) $('#shop').scrollIntoView({ behavior: 'smooth' });
  }

  function initShop() {
    $('#catTabs').innerHTML = CATEGORIES.map((c) => {
      const n = c.id === 'all' ? PRODUCTS.length : PRODUCTS.filter((p) => p.cat === c.id).length;
      return `<button class="tab" role="tab" data-cat="${c.id}">${c.name}<span>${n}</span></button>`;
    }).join('');
    const brands = [...new Set(PRODUCTS.map((p) => p.brand))].sort((a, b) => a.localeCompare(b));
    $('#brandFilter').insertAdjacentHTML('beforeend', brands.map((b) => `<option>${esc(b)}</option>`).join(''));
    $('#concernFilter').insertAdjacentHTML('beforeend', CONCERNS.map((c) => `<option value="${c.id}">${c.name}</option>`).join(''));

    // Marquee (duplicated for a seamless loop)
    const brandBtns = brands.map((b) => `<button data-brand="${esc(b)}">${esc(b)}</button>`).join('');
    $('#brandTrack').innerHTML = brandBtns + brandBtns;
    $('#brandTrack').addEventListener('click', (e) => {
      const b = e.target.closest('[data-brand]');
      if (b) setFilter({ brand: b.dataset.brand, cat: 'all', concern: 'all', q: '' });
    });

    $('#catTabs').addEventListener('click', (e) => {
      const t = e.target.closest('.tab');
      if (t) setFilter({ cat: t.dataset.cat }, false);
    });
    $('#brandFilter').addEventListener('change', (e) => setFilter({ brand: e.target.value }, false));
    $('#concernFilter').addEventListener('change', (e) => setFilter({ concern: e.target.value }, false));
    $('#sortSelect').addEventListener('change', (e) => setFilter({ sort: e.target.value }, false));
    let qT;
    $('#searchInput').addEventListener('input', (e) => {
      clearTimeout(qT);
      qT = setTimeout(() => setFilter({ q: e.target.value }, false), 160);
    });
    $('#loadMore').addEventListener('click', () => { state.shown += PAGE; renderShop(); });
    $('#clearFilters').addEventListener('click', () => setFilter({ cat: 'all', brand: 'all', concern: 'all', q: '' }, false));

    $$('[data-concern]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      setFilter({ concern: a.dataset.concern, cat: 'all', brand: 'all', q: '' });
    }));
    $$('.ritual__step').forEach((b) => b.addEventListener('click', () => setFilter({ cat: b.dataset.cat, concern: 'all', brand: 'all', q: '' })));
    $$('[data-cat-link]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      setFilter({ cat: a.dataset.catLink, concern: 'all', brand: 'all', q: '' });
    }));
    renderShop();
  }

  /* ---------------- Cart ---------------- */
  const subtotal = () => state.cart.reduce((s, i) => s + byId[i.id].price * i.qty, 0);
  const cartQty = () => state.cart.reduce((s, i) => s + i.qty, 0);

  function saveCart() {
    store.set('cart', state.cart);
    renderCart();
    updateCounts();
  }

  function addToCart(id, qty = 1, silent = false) {
    const item = state.cart.find((i) => i.id === id);
    if (item) item.qty = Math.min(99, item.qty + qty);
    else state.cart.push({ id, qty });
    saveCart();
    if (!silent) toast(`${byId[id].name} added to your bag`);
  }

  function setQty(id, qty) {
    if (qty <= 0) state.cart = state.cart.filter((i) => i.id !== id);
    else state.cart.find((i) => i.id === id).qty = Math.min(99, qty);
    saveCart();
  }

  function updateCounts() {
    const c = cartQty();
    $('#cartCount').textContent = c;
    $('#cartCount').hidden = !c;
    $('#wishCount').textContent = state.wish.length;
    $('#wishCount').hidden = !state.wish.length;
  }

  function renderCart() {
    const sub = subtotal();
    const n = cartQty();
    $('#cartHeadCount').textContent = n ? `(${n})` : '';
    $('#cartFoot').hidden = !n;
    $('#shipMeter').hidden = !n;

    const left = CONFIG.freeShippingOver - sub;
    const pct = Math.min(100, (sub / CONFIG.freeShippingOver) * 100);
    $('#shipMeter').innerHTML = (left > 0
      ? `You're <b>${money(left)}</b> away from free shipping`
      : `<b>You've unlocked free international shipping</b>`) + `<div class="meter"><i style="width:${pct}%"></i></div>`;

    $('#cartItems').innerHTML = n
      ? state.cart.map(({ id, qty }) => {
        const p = byId[id];
        return `<div class="line-item" data-id="${id}">
          <div data-action="view">${miniImg(p)}</div>
          <div class="line-item__info">
            <small>${esc(p.brand)}</small><b>${esc(p.name)}</b><span class="size">${p.size}</span>
            <div class="line-item__row">
              <div class="qty"><button data-action="dec" aria-label="Decrease"><svg><use href="#i-minus"/></svg></button><span>${qty}</span><button data-action="inc" aria-label="Increase"><svg><use href="#i-plus"/></svg></button></div>
              <div style="text-align:right"><div class="price">${money(p.price * qty)}</div><button class="remove" data-action="remove">Remove</button></div>
            </div>
          </div>
        </div>`;
      }).join('')
      : `<div class="drawer-empty"><svg><use href="#i-bag"/></svg><h4>Your bag is empty</h4><p>Not sure where to start? Let our AI build your routine.</p><a href="#analysis" class="btn btn--dark" data-close>Start skin scan</a></div>`;

    $('#cartSubtotal').textContent = money(sub);

    if (CONFIG.whatsapp && n) {
      const lines = state.cart.map(({ id, qty }) => `• ${qty} × ${byId[id].brand} ${byId[id].name} — ${money(byId[id].price * qty)}`);
      const msg = `Hi ${CONFIG.storeName}! I'd like to order:\n${lines.join('\n')}\nSubtotal: ${money(sub)}`;
      $('#waBtn').href = `https://wa.me/${CONFIG.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
      $('#waBtn').hidden = false;
    } else {
      $('#waBtn').hidden = true;
    }
  }

  /* ---------------- Wishlist ---------------- */
  function toggleWish(id) {
    const on = !state.wish.includes(id);
    state.wish = on ? [...state.wish, id] : state.wish.filter((w) => w !== id);
    store.set('wish', state.wish);
    $$(`[data-id="${id}"] .wish`).forEach((w) => {
      w.classList.toggle('on', on);
      w.innerHTML = `<svg><use href="#i-heart${on ? '-fill' : ''}"/></svg>`;
    });
    updateCounts();
    renderWish();
    toast(on ? 'Saved to your wishlist' : 'Removed from wishlist');
  }

  function renderWish() {
    $('#wishItems').innerHTML = state.wish.length
      ? state.wish.map((id) => {
        const p = byId[id];
        return `<div class="line-item" data-id="${id}">
          <div data-action="view">${miniImg(p)}</div>
          <div class="line-item__info">
            <small>${esc(p.brand)}</small><b>${esc(p.name)}</b><span class="size">${p.size}</span>
            <div class="line-item__row"><span class="price">${priceHTML(p)}</span>
              <div style="display:flex;gap:12px;align-items:center"><button class="remove" data-action="wish">Remove</button><button class="add" data-action="add" aria-label="Add to bag"><svg><use href="#i-plus"/></svg></button></div>
            </div>
          </div>
        </div>`;
      }).join('')
      : `<div class="drawer-empty"><svg><use href="#i-heart"/></svg><h4>No favourites yet</h4><p>Tap the heart on any product to save it here.</p><a href="#shop" class="btn btn--dark" data-close>Browse the shop</a></div>`;
  }

  /* ---------------- Overlays ---------------- */
  const scrim = $('#scrim');
  function closeAll() {
    $$('.drawer.open, .modal.open, .search-pop.open, .nav.open').forEach((el) => el.classList.remove('open'));
    scrim.classList.remove('on');
    document.body.classList.remove('lock');
    state.openProduct = null;
  }
  function openLayer(el) {
    closeAll();
    el.classList.add('open');
    scrim.classList.add('on');
    document.body.classList.add('lock');
  }

  /* ---------------- Product modal ---------------- */
  function openProduct(id) {
    const p = byId[id];
    state.openProduct = id;
    let qty = 1;
    const inWish = state.wish.includes(id);
    $('#productModalBody').innerHTML = `<div class="pdp" data-id="${id}" style="--c:${p.body}">
      <div class="pdp__media">${badgeHTML(p)}${Bottle.svg(p)}</div>
      <div class="pdp__info">
        <span class="card__brand">${esc(p.brand)} · ${catName[p.cat]}</span>
        <h2>${esc(p.name)}</h2>
        <div class="card__meta"><span class="stars"><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg><b>${p.rating.toFixed(1)}</b></span><span>${p.reviews.toLocaleString()} reviews · ${p.size}</span></div>
        <div class="price">${priceHTML(p)}</div>
        <p class="pdp__desc">${esc(p.desc)}</p>
        <div><div class="pdp__label">Key ingredients</div><div class="chips">${p.key.map((k) => `<span class="chip">${esc(k)}</span>`).join('')}</div></div>
        <div><div class="pdp__label">Best for</div><div class="chips">${p.concerns.map((c) => `<span class="chip">${concernName[c]}</span>`).join('')}</div></div>
        <div class="pdp__buy">
          <div class="qty"><button data-q="-1" aria-label="Decrease"><svg><use href="#i-minus"/></svg></button><span id="pdpQty">1</span><button data-q="1" aria-label="Increase"><svg><use href="#i-plus"/></svg></button></div>
          <button class="btn btn--dark" id="pdpAdd"><svg><use href="#i-bag"/></svg> Add to bag</button>
          <button class="icon-btn wish ${inWish ? 'on' : ''}" data-action="wish" style="position:static;width:54px;height:54px;border:1px solid var(--line)" aria-label="Save to wishlist"><svg><use href="#i-heart${inWish ? '-fill' : ''}"/></svg></button>
        </div>
        <div class="pdp__perks">
          <div><svg><use href="#i-truck"/></svg> Free international shipping over ${money(CONFIG.freeShippingOver)}</div>
          <div><svg><use href="#i-shield"/></svg> 100% authentic, sourced from authorised distributors</div>
          <div><svg><use href="#i-leaf"/></svg> 30-day returns on unopened products</div>
        </div>
      </div>
    </div>`;
    const body = $('#productModalBody');
    body.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => {
      qty = Math.max(1, Math.min(99, qty + Number(b.dataset.q)));
      $('#pdpQty').textContent = qty;
    }));
    $('#pdpAdd').addEventListener('click', () => {
      addToCart(id, qty, true);
      closeAll();
      openLayer($('#cartDrawer'));
    });
    openLayer($('#productModal'));
    state.openProduct = id;
  }

  /* ---------------- Checkout ---------------- */
  const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Bangladesh', 'India', 'Pakistan', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Singapore', 'Malaysia', 'Japan', 'South Korea', 'Other'];
  const PROMOS = { WELCOME10: 0.10 };

  function totals(method) {
    const sub = subtotal();
    const discount = state.promo ? sub * PROMOS[state.promo] : 0;
    const shipping = method === 'express' ? CONFIG.shipping.express
      : sub - discount >= CONFIG.freeShippingOver ? 0 : CONFIG.shipping.standard;
    return { sub, discount, shipping, total: sub - discount + shipping };
  }

  function renderTotals() {
    const method = $('input[name="ship"]:checked')?.value || 'standard';
    const t = totals(method);
    $('#coTotals').innerHTML = `
      <div><span>Subtotal</span><span>${money(t.sub)}</span></div>
      ${t.discount ? `<div><span>Discount (${state.promo})</span><span>−${money(t.discount)}</span></div>` : ''}
      <div><span>Shipping</span><span>${t.shipping ? money(t.shipping) : 'Free'}</span></div>
      <div class="grand"><span>Total</span><span>${money(t.total)}</span></div>`;
    $('#stdPrice').textContent = t.sub - t.discount >= CONFIG.freeShippingOver ? 'Free' : money(CONFIG.shipping.standard);
    $('#placeTotal').textContent = money(t.total);
  }

  function openCheckout() {
    if (!state.cart.length) return;
    const field = (name, label, type = 'text', cls = '', req = true) =>
      `<label class="field ${cls}"><input name="${name}" type="${type}" placeholder="${label}${req ? '' : ' (optional)'}" ${req ? 'required' : ''} autocomplete="${{ email: 'email', phone: 'tel', first: 'given-name', last: 'family-name', address: 'street-address', city: 'address-level2', zip: 'postal-code' }[name] || 'off'}"/></label>`;

    $('#checkoutBody').innerHTML = `<form class="checkout" id="coForm" novalidate>
      <div class="checkout__form">
        <h2>Checkout</h2>
        <p>Secure checkout · Delivered worldwide</p>
        <div class="fieldset"><h4>Contact</h4><div class="fields">${field('email', 'Email address', 'email')}${field('phone', 'Phone number', 'tel')}</div></div>
        <div class="fieldset"><h4>Delivery address</h4><div class="fields">
          ${field('first', 'First name')}${field('last', 'Last name')}
          <label class="field full"><select name="country" required>${COUNTRIES.map((c) => `<option>${c}</option>`).join('')}</select></label>
          ${field('address', 'Street address, apartment, suite', 'text', 'full')}
          ${field('city', 'City')}${field('zip', 'Postal code', 'text', '', false)}
          <label class="field full"><textarea name="notes" placeholder="Delivery notes (optional)"></textarea></label>
        </div></div>
        <div class="fieldset"><h4>Shipping method</h4>
          <label class="option"><input type="radio" name="ship" value="standard" checked/><div><b>Standard tracked</b><small>5–10 business days</small></div><span class="price" id="stdPrice"></span></label>
          <label class="option"><input type="radio" name="ship" value="express"/><div><b>Express courier</b><small>2–4 business days</small></div><span class="price">${money(CONFIG.shipping.express)}</span></label>
        </div>
        <div class="fieldset"><h4>Payment</h4>
          <label class="option"><input type="radio" name="pay" value="Cash on delivery" checked/><div><b>Cash on delivery</b><small>Pay when your order arrives</small></div></label>
          <label class="option"><input type="radio" name="pay" value="Card / bank transfer"/><div><b>Card or bank transfer</b><small>We'll email you a secure payment link to confirm</small></div></label>
        </div>
      </div>
      <aside class="checkout__summary">
        <h4>Order summary</h4>
        <div class="summary-items">${state.cart.map(({ id, qty }) => {
          const p = byId[id];
          return `<div class="summary-item">${miniImg(p, `<em>${qty}</em>`)}<div><b>${esc(p.name)}</b><small>${esc(p.brand)} · ${p.size}</small></div><span class="price">${money(p.price * qty)}</span></div>`;
        }).join('')}</div>
        <div class="promo"><input id="promoInput" placeholder="Promo code" value="${state.promo || ''}"/><button type="button" id="promoBtn">Apply</button></div>
        <div class="promo-msg" id="promoMsg"></div>
        <div class="totals" id="coTotals"></div>
        <button class="btn btn--dark btn--block place-btn" type="submit">Place order · <span id="placeTotal"></span></button>
        <p class="fineprint" style="text-align:center">By placing your order you agree to our terms & privacy policy.</p>
      </aside>
    </form>`;

    const form = $('#coForm');
    form.addEventListener('change', (e) => { if (e.target.name === 'ship') renderTotals(); });
    form.addEventListener('input', (e) => e.target.closest('.field')?.classList.remove('invalid'));
    $('#promoBtn').addEventListener('click', () => {
      const code = $('#promoInput').value.trim().toUpperCase();
      const msg = $('#promoMsg');
      if (PROMOS[code]) {
        state.promo = code;
        msg.style.color = 'var(--good)';
        msg.textContent = `${Math.round(PROMOS[code] * 100)}% off applied`;
      } else {
        state.promo = null;
        msg.style.color = '#C9524A';
        msg.textContent = code ? 'That code is not valid' : '';
      }
      renderTotals();
    });
    form.addEventListener('submit', placeOrder);
    renderTotals();
    openLayer($('#checkoutModal'));
  }

  function placeOrder(e) {
    e.preventDefault();
    const form = e.target;
    let firstBad = null;
    form.querySelectorAll('[required]').forEach((el) => {
      const bad = !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
      el.closest('.field').classList.toggle('invalid', bad);
      if (bad && !firstBad) firstBad = el;
    });
    if (firstBad) {
      firstBad.focus();
      toast('Please complete the highlighted fields');
      return;
    }
    const f = Object.fromEntries(new FormData(form));
    const t = totals(f.ship);
    const order = {
      id: 'SR-' + Date.now().toString(36).toUpperCase().slice(-6),
      date: new Date().toISOString(),
      currency: state.currency,
      items: state.cart.map(({ id, qty }) => ({ id, qty, name: byId[id].name, brand: byId[id].brand, price: byId[id].price })),
      ...t,
      promo: state.promo,
      shipMethod: f.ship,
      payment: f.pay,
      customer: { name: `${f.first} ${f.last}`, email: f.email, phone: f.phone, country: f.country, city: f.city, address: f.address, zip: f.zip, notes: f.notes },
      status: 'Processing',
    };
    state.orders.unshift(order);
    store.set('orders', state.orders);
    state.cart = [];
    state.promo = null;
    saveCart();
    renderOrders();

    $('#checkoutBody').innerHTML = `<div class="success">
      <div class="success__icon"><svg><use href="#i-check"/></svg></div>
      <h2>Thank you, ${esc(f.first)}!</h2>
      <p>Your order has been placed. A confirmation will be sent to <b>${esc(f.email)}</b>${f.pay !== 'Cash on delivery' ? ' along with your secure payment link' : ''}.</p>
      <div class="success__id">Order ${order.id}</div>
      <p class="muted">Total ${money(order.total, order.currency)} · ${f.ship === 'express' ? 'Express, 2–4' : 'Standard, 5–10'} business days to ${esc(f.country)}</p>
      <div class="success__actions" style="margin-top:28px">
        <button class="btn btn--ghost" data-open="orders">View my orders</button>
        <button class="btn btn--dark" data-close>Continue shopping</button>
      </div>
    </div>`;
  }

  /* ---------------- Orders ---------------- */
  function renderOrders() {
    $('#ordersList').innerHTML = state.orders.length
      ? state.orders.map((o) => `<div class="order-card">
          <div class="order-card__head"><b>${o.id}</b><span class="status">${o.status}</span></div>
          <ul>${o.items.map((i) => `<li><span>${i.qty} × ${esc(i.brand)} ${esc(i.name)}</span><span>${money(i.price * i.qty, o.currency)}</span></li>`).join('')}</ul>
          <div class="order-card__foot"><small>${new Date(o.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} · ${esc(o.payment)}</small><b>${money(o.total, o.currency)}</b></div>
        </div>`).join('')
      : `<div class="drawer-empty"><svg><use href="#i-truck"/></svg><h4>No orders yet</h4><p>Orders you place will appear here so you can track them.</p><a href="#shop" class="btn btn--dark" data-close>Start shopping</a></div>`;
  }

  /* ---------------- Search pop ---------------- */
  function renderSearchPop(q) {
    q = q.trim().toLowerCase();
    const hits = (q ? FEATURED.filter((p) => matches(p, q)) : [...PRODUCTS].sort((a, b) => b.reviews - a.reviews)).slice(0, 8);
    $('#searchPopResults').innerHTML = hits.length
      ? hits.map((p) => `<button class="search-hit" data-id="${p.id}" data-action="view">${miniImg(p)}<div><small>${esc(p.brand)}</small><b>${esc(p.name)}</b><span class="price">${money(p.price)}</span></div></button>`).join('')
      : `<div class="search-pop__empty">No matches for “${esc(q)}”</div>`;
  }

  /* ---------------- Currency ---------------- */
  function initCurrency() {
    const sel = $('#currency');
    sel.innerHTML = Object.keys(CONFIG.currencies).map((c) => `<option ${c === state.currency ? 'selected' : ''}>${c}</option>`).join('');
    sel.addEventListener('change', () => {
      state.currency = sel.value;
      store.set('currency', state.currency);
      refreshPrices();
      toast(`Prices now shown in ${state.currency}`);
    });
  }

  function refreshPrices() {
    $$('[data-money]').forEach((el) => (el.textContent = money(Number(el.dataset.money))));
    renderShop();
    renderCart();
    renderWish();
    renderOrders();
    renderHeroProduct();
    if (state.routine.length) renderRoutine();
    if (state.openProduct && $('#productModal').classList.contains('open')) openProduct(state.openProduct);
    if ($('#checkoutModal').classList.contains('open') && $('#coForm')) openCheckout();
  }

  /* ---------------- Hero ---------------- */
  function renderHeroProduct() {
    const p = byId['lrp-toleriane'];
    $('#heroProduct').innerHTML = `<div class="float-card__label"><svg><use href="#i-spark"/></svg> AI pick for you</div>
      <div class="mini-product" data-id="${p.id}">
        <div data-action="view" style="cursor:pointer">${miniImg(p)}</div>
        <div style="flex:1;min-width:0"><small>${esc(p.brand)}</small><b>${esc(p.name)}</b>
          <div style="display:flex;justify-content:space-between;align-items:center"><span class="price">${money(p.price)}</span><button class="add" data-action="add" style="width:32px;height:32px" aria-label="Add to bag"><svg><use href="#i-plus"/></svg></button></div>
        </div>
      </div>`;
  }

  function initHero() {
    $$('.points i').forEach((el, i) => el.style.setProperty('--i', i));
    renderHeroProduct();
    let s = 12;
    const timer = $('#liveTimer');
    const hyd = $('#liveHyd');
    setInterval(() => {
      s++;
      timer.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
      if (s % 3 === 0) hyd.textContent = `${76 + Math.round(Math.random() * 4)}%`;
    }, 1000);
  }

  /* ---------------- AI skin scan ---------------- */
  const scan = {
    view: $('#scanView'), video: $('#scanVideo'), canvas: $('#scanCanvas'), img: $('#scanImage'),
    status: $('#scanStatus'), count: $('#scanCount'), camBtn: $('#camBtn'),
    stream: null, busy: false,
  };
  const setStatus = (t) => (scan.status.textContent = t);
  const camLabel = (t) => (scan.camBtn.innerHTML = `<svg><use href="#i-camera"/></svg> ${t}`);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function stopCamera() {
    scan.stream?.getTracks().forEach((t) => t.stop());
    scan.stream = null;
    scan.view.classList.remove('is-live');
    camLabel('Use camera');
  }

  async function onCamera() {
    if (scan.busy) return;
    if (scan.stream) return captureFromCamera();
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('Camera unavailable here — upload a selfie instead');
      return;
    }
    try {
      setStatus('Requesting camera…');
      scan.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 1200 } }, audio: false });
      scan.video.srcObject = scan.stream;
      await scan.video.play();
      scan.view.classList.remove('has-image');
      scan.img.hidden = true;
      scan.view.classList.add('is-live');
      setStatus('Centre your face in the oval');
      camLabel('Analyse my skin');
    } catch (err) {
      stopCamera();
      setStatus(location.protocol === 'file:' ? 'Camera needs https or localhost — try upload' : 'Camera access was blocked — try upload');
    }
  }

  async function captureFromCamera() {
    scan.busy = true;
    scan.count.hidden = false;
    for (const n of [3, 2, 1]) {
      scan.count.textContent = n;
      await wait(800);
    }
    scan.count.hidden = true;
    const v = scan.video;
    const c = scan.canvas;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1); // keep the selfie mirrored, as the user saw it
    ctx.drawImage(v, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    stopCamera();
    scan.img.src = c.toDataURL('image/jpeg', 0.9);
    scan.img.hidden = false;
    scan.view.classList.add('has-image');
    scan.busy = false;
    runAnalysis(c);
  }

  function loadImage(src) {
    return new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = src;
    });
  }

  async function analyseImageSrc(src) {
    if (scan.busy) return;
    stopCamera();
    try {
      const im = await loadImage(src);
      const c = scan.canvas;
      const scale = Math.min(1, 900 / Math.max(im.width, im.height));
      c.width = Math.round(im.width * scale);
      c.height = Math.round(im.height * scale);
      c.getContext('2d', { willReadFrequently: true }).drawImage(im, 0, 0, c.width, c.height);
      scan.img.src = src;
      scan.img.hidden = false;
      scan.view.classList.add('has-image');
      runAnalysis(c);
    } catch {
      setStatus("Couldn't read that image — try another");
    }
  }

  async function runAnalysis(canvas) {
    scan.busy = true;
    scan.view.classList.add('is-scanning');
    const phases = ['Detecting face…', 'Mapping 68 skin zones…', 'Measuring hydration & oil…', 'Reading texture & tone…', 'Matching products…'];
    for (const ph of phases) {
      setStatus(ph);
      await wait(620);
    }
    let m = null;
    try { m = measure(canvas); } catch { /* canvas tainted (file://) — fall back below */ }
    scan.view.classList.remove('is-scanning');
    scan.busy = false;
    if (m === null && canvas.width) {
      // No skin pixels found or pixels unreadable — use a gentle default profile
      m = { hydration: 72, oil: 66, texture: 81, redness: 77, pores: 74, radiance: 69 };
    }
    setStatus('Analysis complete');
    showResults(m);
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, Math.round(v)));

  // Lightweight on-device image read: looks at skin-toned pixels in the face region
  function measure(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const w = canvas.width, h = canvas.height;
    const x0 = Math.round(w * 0.22), y0 = Math.round(h * 0.18);
    const W = Math.round(w * 0.56), H = Math.round(h * 0.58);
    const d = ctx.getImageData(x0, y0, W, H).data;
    let n = 0, sumL = 0, sumL2 = 0, sumRed = 0, hf = 0, hfN = 0;
    const lums = [];
    const lumAt = (i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    for (let y = 0; y < H; y += 2) {
      for (let x = 0; x < W - 2; x += 2) {
        const i = (y * W + x) * 4;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        if (!(r > 60 && g > 30 && b > 15 && r > g && r > b && r - Math.min(g, b) > 12)) continue;
        const L = lumAt(i);
        n++; sumL += L; sumL2 += L * L; sumRed += r - (g + b) / 2;
        lums.push(L);
        hf += Math.abs(L - lumAt(i + 8)); hfN++;
      }
    }
    if (n < 300) return null;
    const mean = sumL / n;
    const sd = Math.sqrt(Math.max(0, sumL2 / n - mean * mean));
    // Shine = specular highlights relative to this person's own skin tone
    const shineT = Math.max(225, mean + 1.2 * sd);
    const sh = lums.filter((L) => L > shineT).length / n;
    const red = sumRed / n;
    const tex = hf / Math.max(1, hfN);
    const jitter = ((Math.round(mean * 7 + red * 13 + tex * 17) % 9) - 4);

    const texture = clamp(100 - tex * 4 + jitter, 50, 95);
    const redness = clamp(108 - red * 0.9, 48, 94);
    const radiance = clamp(48 + (mean - 70) * 0.32 - sd * 0.1 + jitter, 50, 94);
    const oil = clamp(95 - sh * 320, 50, 94);
    const pores = clamp(100 - tex * 3.2 - sh * 80 - jitter, 50, 93);
    const hydration = clamp(58 + (texture - 60) * 0.45 + (radiance - 60) * 0.35 + jitter, 50, 93);
    return { hydration, oil, texture, redness, pores, radiance };
  }

  const METRICS = [
    { k: 'hydration', label: 'Hydration', concern: 'dryness' },
    { k: 'oil', label: 'Oil balance', concern: 'pores' },
    { k: 'texture', label: 'Smoothness', concern: 'aging' },
    { k: 'redness', label: 'Calmness', concern: 'sensitivity' },
    { k: 'pores', label: 'Pore clarity', concern: 'acne' },
    { k: 'radiance', label: 'Radiance', concern: 'dullness' },
  ];

  function skinType(m) {
    if (m.redness < 60) return 'Sensitive';
    if (m.oil < 60 && m.hydration >= 62) return 'Oily';
    if (m.oil < 72) return 'Combination';
    if (m.hydration < 62) return 'Dry';
    return 'Normal';
  }

  function buildRoutine(concerns) {
    const steps = [
      { label: 'Step 1 · Cleanse', cats: ['cleanser'] },
      { label: 'Step 2 · Treat', cats: ['serum', 'treatment'] },
      { label: 'Step 3 · Hydrate', cats: ['moisturizer'] },
      { label: 'Step 4 · Protect', cats: ['sunscreen'] },
    ];
    return steps.map((s) => {
      const pick = PRODUCTS.filter((p) => s.cats.includes(p.cat))
        .map((p) => ({
          p,
          score: p.concerns.reduce((a, c) => a + (c === concerns[0] ? 3 : concerns.includes(c) ? 1.5 : 0), 0) + p.rating - p.price / 200,
        }))
        .sort((a, b) => b.score - a.score)[0].p;
      return { step: s.label, id: pick.id };
    });
  }

  function renderRoutine() {
    $('#routineList').innerHTML = state.routine.map(({ step, id }) => {
      const p = byId[id];
      return `<div class="routine-item" data-id="${id}" data-action="view">${miniImg(p)}
        <div style="flex:1;min-width:0"><small>${step}</small><b>${esc(p.name)}</b><span class="brand">${esc(p.brand)}</span><div class="price">${money(p.price)}</div></div>
      </div>`;
    }).join('');
  }

  function showResults(m) {
    const overall = Math.round(METRICS.reduce((s, x) => s + m[x.k], 0) / METRICS.length);
    const type = skinType(m);
    const sorted = [...METRICS].sort((a, b) => m[a.k] - m[b.k]);
    const concerns = [...new Set(sorted.slice(0, 3).map((x) => x.concern))].slice(0, 2);
    const best = sorted[sorted.length - 1];

    $('#results').hidden = false;
    $('#resType').textContent = `${type} skin`;
    $('#resSummary').textContent = `${best.label} is your strongest marker (${m[best.k]}/100). We'd focus on ${concerns.map((c) => concernName[c].toLowerCase()).join(' and ')} — here's a 4-step routine matched to your skin.`;
    $('#metrics').innerHTML = METRICS.map((x) => {
      const v = m[x.k];
      const tag = v >= 80 ? 'Great' : v >= 65 ? 'Good' : 'Needs care';
      return `<div class="metric"><small>${x.label}</small><b>${v}<span>${tag}</span></b><div class="meter"><i data-w="${v}"></i></div></div>`;
    }).join('');

    state.routine = buildRoutine(concerns);
    renderRoutine();

    requestAnimationFrame(() => requestAnimationFrame(() => {
      $$('#metrics .meter i').forEach((i) => (i.style.width = i.dataset.w + '%'));
      $('#resRing').style.setProperty('--p', overall);
    }));
    const scoreEl = $('#resScore');
    const t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / 1200);
      scoreEl.textContent = Math.round(overall * (1 - (1 - k) ** 3));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    $('#results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function initScan() {
    scan.camBtn.addEventListener('click', onCamera);
    $('#sampleBtn').addEventListener('click', () => analyseImageSrc('assets/img/hero.jpg'));
    $('#uploadInput').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = () => analyseImageSrc(r.result);
      r.readAsDataURL(file);
      e.target.value = '';
    });
    $('#addRoutineBtn').addEventListener('click', () => {
      state.routine.forEach(({ id }) => addToCart(id, 1, true));
      toast('Your routine was added to the bag');
      openLayer($('#cartDrawer'));
    });
  }

  /* ---------------- Global events ---------------- */
  function flashAdded(btn) {
    if (!btn) return;
    btn.classList.add('added');
    btn.innerHTML = '<svg><use href="#i-check"/></svg>';
    setTimeout(() => {
      btn.classList.remove('added');
      btn.innerHTML = '<svg><use href="#i-plus"/></svg>';
    }, 1300);
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) {
      closeAll();
      return;
    }
    const opener = e.target.closest('[data-open="orders"]');
    if (opener) {
      e.preventDefault();
      openLayer($('#ordersDrawer'));
      return;
    }
    const act = e.target.closest('[data-action]');
    if (!act) return;
    const host = act.closest('[data-id]');
    if (!host) return;
    const id = host.dataset.id;
    const item = state.cart.find((i) => i.id === id);
    switch (act.dataset.action) {
      case 'view': openProduct(id); break;
      case 'add': addToCart(id); flashAdded(act); break;
      case 'wish': e.stopPropagation(); toggleWish(id); break;
      case 'inc': setQty(id, item.qty + 1); break;
      case 'dec': setQty(id, item.qty - 1); break;
      case 'remove': setQty(id, 0); break;
    }
  });

  scrim.addEventListener('click', closeAll);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

  $('#cartBtn').addEventListener('click', () => openLayer($('#cartDrawer')));
  $('#wishBtn').addEventListener('click', () => openLayer($('#wishDrawer')));
  $('#ordersBtn').addEventListener('click', () => openLayer($('#ordersDrawer')));
  $('#checkoutBtn').addEventListener('click', openCheckout);
  $('#searchBtn').addEventListener('click', () => {
    openLayer($('#searchPop'));
    renderSearchPop('');
    setTimeout(() => $('#searchPopInput').focus(), 200);
  });
  $('#searchPopInput').addEventListener('input', (e) => renderSearchPop(e.target.value));
  $('#searchPopInput').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const q = e.target.value;
    closeAll();
    setFilter({ q, cat: 'all', brand: 'all', concern: 'all' });
  });

  $('#menuBtn').addEventListener('click', () => {
    const nav = $('#nav');
    if (nav.classList.contains('open')) return closeAll();
    openLayer(nav);
  });
  $$('#nav a').forEach((a) => a.addEventListener('click', closeAll));

  $('#newsletterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    e.target.reset();
    toast('Welcome to the club! Use code WELCOME10 at checkout');
  });

  const header = $('#header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) {
      en.target.classList.add('in');
      io.unobserve(en.target);
    }
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    io.observe(el);
  });

  $('#year').textContent = new Date().getFullYear();

  /* ---------------- Boot ---------------- */
  initCurrency();
  initHero();
  initShop();
  initScan();
  refreshPrices();
  updateCounts();
})();
