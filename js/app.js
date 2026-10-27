(() => {
  const $ = s => document.querySelector(s);
  const N = Math.max(1, Math.floor(CONFIG.CARD_COUNT));
  const ring = $('#ring'), stage = $('#stage'), viewer = $('#viewer'), slide = $('#slide');
  const img = $('#img'), ph = $('#ph'), lb = $('#lightbox'), lbImg = $('#lbImg');
  const hint = $('#hint'), again = $('#again');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HINT = { fan: 'แตะหน้าจอเพื่อสับไพ่', orbit: 'แตะไพ่ที่ดึงดูดคุณ 1 ใบ' };

  const src = id => encodeURI(`${CONFIG.FOLDER}/${CONFIG.FILE_PREFIX}${id}.${CONFIG.EXT}`);
  const info = id => {
    const c = CARDS[id - 1] || {};
    return { name: c.name || `Card ${id}`, th: c.th || '',
      designer: c.designer || CONFIG.DEFAULT_DESIGNER,
      meaning: c.meaning || 'ยังไม่ได้ใส่ความหมายของไพ่ใบนี้' };
  };

  document.title = CONFIG.TITLE;
  $('#title').textContent = CONFIG.TITLE;
  $('#sub').textContent = CONFIG.SUBTITLE;
  document.querySelectorAll('.shop').forEach(a => { a.href = CONFIG.SHOP_URL; a.textContent = CONFIG.SHOP_LABEL; });

  /* ---------- สร้างไพ่ ---------- */
  let order = Array.from({ length: N }, (_, i) => i + 1);
  const els = {};
  order.forEach(id => {
    const d = document.createElement('div');
    d.className = 'card'; d.dataset.id = id;
    d.style.setProperty('--sx', (15 + Math.random() * 70) + '%');
    d.style.setProperty('--sy', (10 + Math.random() * 80) + '%');
    d.style.setProperty('--d', (Math.random() * -3) + 's');
    ring.appendChild(d); els[id] = d;
  });
  const shuffle = () => { for (let i = N - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [order[i], order[j]] = [order[j], order[i]]; } };

  /* ---------- ขนาด / ดาว ---------- */
  let cw, Ro, Rf, spread, stars = [], dpr = 1;
  const cv = $('#sky'), cx = cv.getContext('2d');
  function layout() {
    cw = Math.max(58, Math.min(120, Math.min(innerWidth, innerHeight) * 0.14));
    document.documentElement.style.setProperty('--cw', cw + 'px');
    Ro = Math.max(cw * 2.2, N * cw * 1.12 / (2 * Math.PI));
    Rf = Math.min(innerWidth * 0.46, innerHeight * 0.62);
    spread = Math.min(150, N * 10);
    dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    const n = Math.min(220, innerWidth * innerHeight / 7000 | 0);
    stars = Array.from({ length: n }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      r: .4 + Math.random() * 1.3, ph: Math.random() * 6.28, sp: .8 + Math.random() * 2.2, g: Math.random() < .45 }));
  }
  function drawSky(now) {
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, innerWidth, innerHeight);
    for (const s of stars) {
      const a = .15 + .85 * Math.abs(Math.sin(now / 1000 * s.sp + s.ph));
      cx.fillStyle = s.g ? `rgba(240,205,120,${a})` : `rgba(255,255,255,${a})`;
      cx.beginPath(); cx.arc(s.x, s.y, s.r * a, 0, 6.283); cx.fill();
      if (s.r > 1.1) {
        cx.strokeStyle = cx.fillStyle; cx.lineWidth = .6; const l = s.r * 5 * a;
        cx.beginPath(); cx.moveTo(s.x - l, s.y); cx.lineTo(s.x + l, s.y); cx.moveTo(s.x, s.y - l); cx.lineTo(s.x, s.y + l); cx.stroke();
      }
    }
  }

  /* ---------- วนลูปหลัก: t = 0 คลี่เป็นครึ่งวงกลม, t = 1 หมุนเป็นวง 3 มิติ ---------- */
  let mode = 'fan', t = 0, spin = 0, boost = 0, last = performance.now();
  const norm = x => ((x % 360) + 540) % 360 - 180;
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const target = mode === 'orbit' ? 1 : 0;
    t += (target - t) * Math.min(1, dt * 2.6);
    if (Math.abs(target - t) < .0005) t = target;
    boost *= Math.pow(.25, dt);
    if (mode === 'orbit') spin += ((reduce ? 6 : 14) + boost) * dt;
    drawSky(now);
    if (viewer.hidden) {
      const e = t * t * (3 - 2 * t), L = (a, b) => a + (b - a) * e;
      ring.style.transform = `rotateX(${-12 * e}deg)`;
      order.forEach((id, p) => {
        const a = (N > 1 ? p / (N - 1) - .5 : 0) * spread, ar = a * Math.PI / 180;
        const th = norm(p * 360 / N + spin), tr = th * Math.PI / 180;
        const x = L(Rf * Math.sin(ar), Ro * Math.sin(tr));
        const y = L(Rf * (.5 - Math.cos(ar)), Math.sin(tr * 2 + now / 900) * cw * .12);
        const z = L(p * .5, Ro * Math.cos(tr));
        els[id].style.transform = `translate3d(${x}px,${y}px,${z}px) rotateZ(${L(a, 0)}deg) rotateY(${L(0, th)}deg)`;
      });
    }
    requestAnimationFrame(frame);
  }

  const setMode = m => { mode = m; hint.textContent = HINT[m]; again.hidden = m === 'fan'; };
  stage.addEventListener('click', e => {
    if (mode === 'fan') { shuffle(); boost = 420; setMode('orbit'); return; }
    const c = e.target.closest('.card');
    if (c) openAt(order.indexOf(+c.dataset.id));
  });
  again.addEventListener('click', () => setMode('fan'));

  /* ---------- หน้าดูไพ่ ---------- */
  let cur = 0;
  function show(p, dir) {
    cur = (p % N + N) % N;
    const id = order[cur], d = info(id);
    $('#no').textContent = `${cur + 1} / ${N}`;
    $('#nm').textContent = d.name; $('#th').textContent = d.th;
    $('#ds').textContent = d.designer; $('#mn').textContent = d.meaning;
    ph.textContent = id; ph.hidden = false; img.hidden = true;
    img.alt = d.name; img.src = src(id);
    slide.classList.remove('l'); void slide.offsetWidth; if (dir < 0) slide.classList.add('l');
  }
  img.onload = () => { img.hidden = false; ph.hidden = true; };
  img.onerror = () => { img.hidden = true; ph.hidden = false; };
  const openAt = p => { viewer.hidden = false; show(p, 1); };
  const closeViewer = () => { viewer.hidden = true; };
  $('#close').onclick = closeViewer;
  $('#next').onclick = () => show(cur + 1, 1);
  $('#prev').onclick = () => show(cur - 1, -1);
  $('#pic').onclick = () => { if (!img.hidden) { lbImg.src = img.src; lb.hidden = false; } };
  lb.onclick = () => { lb.hidden = true; };

  let sx = 0, sy = 0;
  viewer.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
  viewer.addEventListener('pointerup', e => {
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) show(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { lb.hidden ? closeViewer() : (lb.hidden = true); }
    if (viewer.hidden) return;
    if (e.key === 'ArrowRight') show(cur + 1, 1);
    if (e.key === 'ArrowLeft') show(cur - 1, -1);
  });

  addEventListener('resize', layout);
  layout(); setMode('fan'); requestAnimationFrame(frame);
})();
