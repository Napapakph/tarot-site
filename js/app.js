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
  const FAN_DROP = 0.2; // ดันไพ่ตอนคลี่ลงมา (สัดส่วนของ Rf) เพิ่มเลขเพื่อให้ต่ำลงอีก
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
    if (viewer.hidden && gal.hidden) {
      const e = t * t * (3 - 2 * t), L = (a, b) => a + (b - a) * e;
      ring.style.transform = `rotateX(${-12 * e}deg)`;
      order.forEach((id, p) => {
        const a = (N > 1 ? p / (N - 1) - .5 : 0) * spread, ar = a * Math.PI / 180;
        const th = norm(p * 360 / N + spin), tr = th * Math.PI / 180;
        const x = L(Rf * Math.sin(ar), Ro * Math.sin(tr));
        const y = L(Rf * (.5 - Math.cos(ar)) + Rf * FAN_DROP, Math.sin(tr * 2 + now / 900) * cw * .12);
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
  let fromGallery = false;
  const openAt = (p, g) => { fromGallery = !!g; if (g) gal.hidden = true; viewer.hidden = false; show(p, 1); sync(); };
  const closeViewer = () => {
    viewer.hidden = true;
    if (fromGallery) { fromGallery = false; gal.hidden = false; }
    sync();
  };
  $('#close').onclick = closeViewer;
  $('#next').onclick = () => show(cur + 1, 1);
  $('#prev').onclick = () => show(cur - 1, -1);
  $('#pic').onclick = () => { if (!img.hidden) { lbImg.src = img.src; lb.hidden = false; } };
  lb.onclick = () => { if (swallowClick) return; lb.hidden = true; };

  /* ---------- ปัดซ้าย/ขวา (มือถือ) ----------
     touch-action: pan-y ทำให้เบราว์เซอร์ไม่แย่งท่าทางปัดแนวนอนไปใช้เอง
     (ปัญหาเดิม: pointerup ไม่ถูกยิงบนมือถือเพราะโดน pointercancel) */
  viewer.style.touchAction = 'pan-y';
  lb.style.touchAction = 'pan-y';
  let sx = 0, sy = 0, tracking = false;
  const swipeStart = e => { sx = e.clientX; sy = e.clientY; tracking = true; };
  const swipeEnd = e => {
    if (!tracking) return; tracking = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      const dir = dx < 0 ? 1 : -1;
      show(cur + dir, dir);
      swallowClick = true; setTimeout(() => swallowClick = false, 350);
    }
  };
  let swallowClick = false;
  viewer.addEventListener('pointerdown', swipeStart);
  viewer.addEventListener('pointerup', swipeEnd);
  viewer.addEventListener('pointercancel', () => { tracking = false; });
  // กันไม่ให้การปัดไปกดโดนรูป (เปิด lightbox) โดยไม่ตั้งใจ
  viewer.addEventListener('click', e => { if (swallowClick) { e.stopPropagation(); e.preventDefault(); } }, true);
  // ปัดในโหมดขยายรูป = เลื่อนไพ่เช่นกัน
  lb.addEventListener('pointerdown', swipeStart);
  lb.addEventListener('pointerup', e => {
    const x0 = sx, y0 = sy, wasTracking = tracking;
    swipeEnd(e);
    if (wasTracking && Math.abs(e.clientX - x0) > 45 && Math.abs(e.clientX - x0) > Math.abs(e.clientY - y0) * 1.2) {
      lbImg.src = img.src; // อัปเดตรูปขยายให้ตรงใบใหม่
    }
  });
  img.addEventListener('load', () => { if (!lb.hidden) lbImg.src = img.src; });

  /* ---------- แกลเลอรี: รวมไพ่ทั้งหมดจัดเรียงสวยๆ ---------- */
  const css = document.createElement('style');
  css.textContent = `
  #galBtn{position:relative;z-index:6;display:flex;align-items:center;justify-content:center;gap:8px;flex-basis:100%;width:fit-content;margin:10px auto 0;
    padding:9px 16px;border-radius:999px;border:1px solid rgba(240,205,120,.55);color:#f0cd78;font:inherit;font-size:14px;
    background:rgba(18,14,36,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);cursor:pointer;
    transition:background .2s,transform .2s,box-shadow .2s}
  #galBtn[hidden]{display:none}
  #galBtn:hover{background:rgba(240,205,120,.16);box-shadow:0 0 18px rgba(240,205,120,.3)}
  #galBtn:active{transform:scale(.96)}
  #galBtn svg{width:16px;height:16px;fill:currentColor}
  #gallery{position:fixed;inset:0;z-index:30;overflow-y:auto;-webkit-overflow-scrolling:touch;
    background:radial-gradient(ellipse at 50% 0%,rgba(60,40,110,.55),rgba(8,6,20,.97) 70%);
    padding:max(18px,env(safe-area-inset-top)) 18px max(28px,env(safe-area-inset-bottom));animation:galIn .35s ease}
  #gallery[hidden]{display:none}
  @keyframes galIn{from{opacity:0}to{opacity:1}}
  #galHead{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:12px;
    width:100%;max-width:1100px;margin:0 auto 18px;padding:10px 0}
  #galHead h2{margin:0;font-size:clamp(17px,4.5vw,22px);font-weight:600;color:#f0cd78;letter-spacing:.02em}
  #galHead small{display:block;font-size:12px;font-weight:400;color:rgba(255,255,255,.55);margin-top:2px}
  #galClose{width:40px;height:40px;border-radius:50%;border:1px solid rgba(240,205,120,.5);background:rgba(18,14,36,.8);
    color:#f0cd78;font-size:20px;line-height:1;cursor:pointer;flex:none}
  #galGrid{width:100%;max-width:1100px;margin:0 auto;display:grid;gap:clamp(12px,2.5vw,22px);
    grid-template-columns:repeat(auto-fill,minmax(clamp(96px,28vw,170px),1fr))}
  .gc{position:relative;padding:0;border:0;background:none;cursor:pointer;font:inherit;color:inherit;text-align:center;
    opacity:0;animation:gcIn .5s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(var(--i) * 28ms)}
  @keyframes gcIn{from{opacity:0;transform:translateY(18px) scale(.94)}to{opacity:1;transform:none}}
  .gc .fr{display:block;aspect-ratio:2/3.2;border-radius:10px;overflow:hidden;position:relative;
    border:1.5px solid rgba(240,205,120,.45);background:linear-gradient(160deg,#2a1f4f,#120d28);
    box-shadow:0 6px 18px rgba(0,0,0,.45);transition:transform .25s,box-shadow .25s,border-color .25s}
  .gc:hover .fr,.gc:focus-visible .fr{transform:translateY(-6px);border-color:#f0cd78;box-shadow:0 12px 28px rgba(240,205,120,.28)}
  .gc:focus-visible{outline:none}
  .gc img{width:100%;height:100%;object-fit:cover;display:block}
  .gc .ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:28px;color:rgba(240,205,120,.6)}
  .gc .nm{display:block;margin-top:8px;font-size:12px;line-height:1.3;color:rgba(255,255,255,.85)}
  .gc .th{display:block;font-size:11px;color:rgba(240,205,120,.7)}
  @media (prefers-reduced-motion:reduce){.gc{animation:none;opacity:1}#gallery{animation:none}}
  `;
  document.head.appendChild(css);

  const gBtn = document.createElement('button');
  gBtn.id = 'galBtn'; gBtn.type = 'button'; gBtn.setAttribute('aria-label', 'ดูไพ่ทั้งหมด');
  gBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/></svg><span>รวมไพ่ทั้งหมด</span>';
  if (again) again.insertAdjacentElement('afterend', gBtn);
  else { gBtn.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:max(16px,env(safe-area-inset-bottom))'; document.body.appendChild(gBtn); }

  const gal = document.createElement('div');
  gal.id = 'gallery'; gal.hidden = true;
  gal.setAttribute('role', 'dialog'); gal.setAttribute('aria-label', 'ไพ่ทั้งหมด');
  gal.innerHTML = `<div id="galHead"><h2>ไพ่ทั้งหมด<small>แตะไพ่เพื่อดูรายละเอียด</small></h2><button id="galClose" type="button" aria-label="ปิด">✕</button></div><div id="galGrid"></div>`;
  document.body.appendChild(gal);
  const grid = gal.querySelector('#galGrid');

  const buildGallery = () => {
    grid.textContent = '';
    for (let id = 1; id <= N; id++) {
      const d = info(id), b = document.createElement('button');
      b.className = 'gc'; b.type = 'button'; b.style.setProperty('--i', id - 1);
      b.innerHTML = '<span class="fr"><span class="ph"></span><img loading="lazy" alt=""></span><span class="nm"></span><span class="th"></span>';
      b.querySelector('.ph').textContent = id;
      b.querySelector('.nm').textContent = d.name;
      b.querySelector('.th').textContent = d.th;
      const im = b.querySelector('img'); im.alt = d.name;
      im.onload = () => { b.querySelector('.ph').hidden = true; };
      im.onerror = () => { im.remove(); };
      im.src = src(id);
      b.onclick = () => openAt(order.indexOf(id), true);
      grid.appendChild(b);
    }
  };
  const openGallery = () => { viewer.hidden = true; lb.hidden = true; fromGallery = false; buildGallery(); gal.hidden = false; gal.scrollTop = 0; sync(); };
  const closeGallery = () => { gal.hidden = true; sync(); };
  gBtn.onclick = openGallery;
  gal.querySelector('#galClose').onclick = closeGallery;
  gal.addEventListener('click', e => { if (e.target === gal) closeGallery(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !gal.hidden && viewer.hidden) closeGallery(); });

  // ซ่อนปุ่มรวมไพ่ ขณะเปิดหน้าดูไพ่/แกลเลอรีอยู่
  // ถ้า SHOP_URL ว่าง หรือยังเป็น example.com (ยังไม่มีหน้าเว็บจริง)
  // ปุ่ม .shop เดิมในหน้าเว็บจะเปิดแกลเลอรีรวมไพ่แทนการเปิดลิงก์
  const shopReal = !!CONFIG.SHOP_URL && !/example\.com/i.test(CONFIG.SHOP_URL);
  const shops = document.querySelectorAll('.shop');
  if (!shopReal) shops.forEach(a => {
    a.href = '#'; a.removeAttribute('target');
    a.addEventListener('click', e => { e.preventDefault(); openGallery(); });
  });
  const useShopBtn = false;
  function sync() { gBtn.hidden = useShopBtn || !viewer.hidden || !gal.hidden; }
  sync();

  addEventListener('resize', layout);
  layout(); setMode('fan'); requestAnimationFrame(frame);
})();