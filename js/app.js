(() => {
  const $ = s => document.querySelector(s);
  const N = Math.max(1, Math.floor(CONFIG.CARD_COUNT));
  const ring = $('#ring'), stage = $('#stage'), viewer = $('#viewer'), slide = $('#slide');
  const picEl = $('#pic'), img = $('#img'), ph = $('#ph'), lb = $('#lightbox'), lbImg = $('#lbImg');
  const hint = $('#hint'), again = $('#again');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touchUI = matchMedia('(hover:none) and (pointer:coarse)').matches;
  const HINT = touchUI
    ? { fan: 'แตะหรือปัดเพื่อสับไพ่', orbit: 'ปัดเพื่อหมุน · แตะเลือกไพ่ 1 ใบ' }
    : { fan: 'คลิกหรือเลื่อนเมาส์เพื่อสับไพ่', orbit: 'เลื่อนเมาส์ / ลาก เพื่อหมุน · คลิกไพ่ที่ดึงดูดคุณ 1 ใบ' };

  const src = id => encodeURI(`${CONFIG.FOLDER}/${CONFIG.FILE_PREFIX}${id}.${CONFIG.EXT}`);
  const info = id => {
    const c = CARDS[id - 1] || {};
    return { name: c.name || `Card ${id}`, th: c.th || '',
      designer: c.designer || CONFIG.DEFAULT_DESIGNER,
      meaning: c.meaning || 'ยังไม่ได้ใส่ความหมายของไพ่ใบนี้' };
  };

  /* ---------- ลายน้ำ: สร้างรูป SVG แล้วใส่เป็น CSS variable --wm ---------- */
  const esc = x => String(x || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
  const wmOp = CONFIG.WATERMARK_OPACITY ?? 0.05;
  const wmSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="280" viewBox="0 0 360 280">
    <g transform="rotate(-30 180 140)" text-anchor="middle" font-family="Georgia,'Times New Roman',serif"
       fill="#FDFDFE" fill-opacity="${wmOp}" stroke="#fff" stroke-opacity="${Math.min(1, wmOp * 1.2)}" stroke-width=".8" paint-order="stroke">
      <text x="180" y="138" font-size="25" font-weight="300" letter-spacing="2">${esc(CONFIG.WATERMARK).toUpperCase()}</text>
      <text x="180" y="160" font-size="11.5" letter-spacing=".5" stroke-width=".35">${esc(CONFIG.WATERMARK_NOTE)}</text>
      <text x="180" y="177" font-size="10" letter-spacing=".4" stroke-width=".3">${esc(CONFIG.WATERMARK_NOTE2)}</text>
    </g></svg>`;
  if (CONFIG.WATERMARK || CONFIG.WATERMARK_NOTE)
    document.documentElement.style.setProperty('--wm', `url("data:image/svg+xml,${encodeURIComponent(wmSvg)}")`);
  // กันคลิกขวา "บันทึกรูป" และลากรูปออก (กันได้แค่ระดับพื้นฐาน)
  addEventListener('contextmenu', e => { if (e.target.closest('.wm, .gc')) e.preventDefault(); });
  addEventListener('dragstart', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });

  document.title = CONFIG.TITLE;
  $('#title').textContent = CONFIG.TITLE;
  $('#sub').textContent = CONFIG.SUBTITLE;
  $('#notice').textContent = CONFIG.NOTICE || '';
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
    // ไพ่ 3D: ออร่า + ขอบหนา 4 ด้าน + หน้า/หลัง (แต่ละหน้ามีแสงวาบ .sh)
    d.innerHTML = '<i class="aura"></i><i class="ed el"></i><i class="ed er"></i><i class="ed et"></i><i class="ed eb"></i>'
      + '<b class="face f1"><i class="sh"></i></b><b class="face f2"><i class="sh"></i></b>';
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
  const AUTO = reduce ? 6 : 14;          // ความเร็วหมุนเองตอนไม่มีคนแตะ (องศา/วินาที)
  const MAXV = 900;                        // ความเร็วสูงสุด
  let mode = 'fan', t = 0, spin = 0, vel = 0, tilt = 0, glow = 0, lastGlow = -1, last = performance.now();
  let ptr = null, justDragged = false;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const norm = x => ((x % 360) + 540) % 360 - 180;
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const target = mode === 'orbit' ? 1 : 0;
    t += (target - t) * Math.min(1, dt * 2.6);
    if (Math.abs(target - t) < .0005) t = target;
    // ฟิสิกส์การหมุน: ปล่อยมือแล้วไหลต่อ (แรงเฉื่อย) แล้วค่อยๆ กลับไปหมุนช้าๆ เอง
    if (mode === 'orbit') {
      if (!ptr || !ptr.moved) vel += (AUTO - vel) * (1 - Math.exp(-dt * 1.1));
      if (!ptr || !ptr.moved) spin += vel * dt;
    } else vel *= Math.pow(.05, dt);
    if (!ptr) tilt *= Math.pow(.6, dt);
    const gT = mode === 'orbit' ? clamp(Math.abs(vel - AUTO) / 380, 0, 1) : 0;
    glow += (gT - glow) * Math.min(1, dt * 5);
    if (Math.abs(glow - lastGlow) > .01) { stage.style.setProperty('--glow', glow.toFixed(3)); lastGlow = glow; }
    drawSky(now);
    if (viewer.hidden && gal.hidden) {
      const e = t * t * (3 - 2 * t), L = (a, b) => a + (b - a) * e;
      const lean = clamp(-(vel - AUTO) * .03, -16, 16) * e;   // ไพ่เอียงตามแรงหมุน
      ring.style.transform = `rotateX(${(-12 + tilt) * e}deg)`;
      ring.style.setProperty('--e', e.toFixed(2));   // แสงวาบโผล่เฉพาะตอนเป็นวงหมุน
      order.forEach((id, p) => {
        const a = (N > 1 ? p / (N - 1) - .5 : 0) * spread, ar = a * Math.PI / 180;
        const th = norm(p * 360 / N + spin), tr = th * Math.PI / 180;
        const x = L(Rf * Math.sin(ar), Ro * Math.sin(tr));
        const y = L(Rf * (.5 - Math.cos(ar)) + Rf * FAN_DROP, Math.sin(tr * 2 + now / 900) * cw * .12);
        const z = L(p * .5, Ro * Math.cos(tr));
        const c = els[id];
        c.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateZ(${L(a, 0) + lean}deg) rotateY(${L(0, th)}deg)`;
        // --f = ใบที่หันหน้าเข้าหาเรา (ออร่าแรงกว่า), --a = ตำแหน่งแสงวาบ
        const f = Math.max(0, Math.cos(tr)) ** 3 * e;
        c.style.setProperty('--f', f.toFixed(2));
        c.style.setProperty('--a', (Math.sin(tr) * e).toFixed(2));
      });
    }
    requestAnimationFrame(frame);
  }

  const setMode = m => { mode = m; hint.textContent = HINT[m]; again.hidden = m === 'fan'; stage.classList.toggle('orbit', m === 'orbit'); };
  const startOrbit = v => { shuffle(); vel = v; setMode('orbit'); };
  stage.addEventListener('click', e => {
    if (justDragged) return;
    if (mode === 'fan') { startOrbit(AUTO + 420); return; }
    const c = e.target.closest('.card');
    if (c) openAt(order.indexOf(+c.dataset.id));
  });
  again.addEventListener('click', () => setMode('fan'));

  /* ---------- หมุนวงไพ่เอง: สกรอเมาส์ (คอม) / ลากหรือปัด (มือถือ) ---------- */
  const degPerPx = () => 180 / (Math.PI * Ro);   // ลาก 1px = ไพ่ใบหน้าเลื่อนตามนิ้วพอดี
  stage.addEventListener('wheel', e => {
    e.preventDefault();
    let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (e.deltaMode === 1) d *= 16; else if (e.deltaMode === 2) d *= innerHeight;
    if (mode === 'fan') { startOrbit(AUTO + 300 * (d < 0 ? -1 : 1)); return; }
    spin += clamp(d, -120, 120) * .06;                 // ขยับทันทีให้รู้สึกตอบสนอง
    vel = clamp(vel + clamp(d, -120, 120) * 1.4, -MAXV, MAXV);
  }, { passive: false });

  stage.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    ptr = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t: performance.now(), moved: false };
  });
  addEventListener('pointermove', e => {
    if (!ptr || e.pointerId !== ptr.id) return;
    const dx = e.clientX - ptr.x, dy = e.clientY - ptr.y, now = performance.now(), dt = Math.max(1, now - ptr.t);
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = now;
    if (!ptr.moved && Math.hypot(e.clientX - ptr.x0, e.clientY - ptr.y0) > 8) {
      ptr.moved = true; stage.classList.add('grab');
      if (mode === 'fan') startOrbit(AUTO);
    }
    if (!ptr.moved) return;
    const dd = dx * degPerPx();
    spin += dd;
    vel = vel * .5 + clamp(dd / dt * 1000, -MAXV, MAXV) * .5;   // จำความเร็วนิ้วไว้ใช้ตอนปล่อย
    tilt = clamp(tilt - dy * .12, -28, 22);                      // ลากขึ้น-ลง = เอียงมุมมอง
  });
  const endDrag = e => {
    if (!ptr || (e && e.pointerId !== ptr.id)) return;
    if (ptr.moved) {
      justDragged = true; setTimeout(() => justDragged = false, 60);
      if (performance.now() - ptr.t > 90) vel = vel * .3 + AUTO * .7;   // ค้างนิ้วนิ่งก่อนปล่อย = ไม่ไหลต่อ
    }
    ptr = null; stage.classList.remove('grab');
  };
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);
  addEventListener('keydown', e => {
    if (!viewer.hidden || !gal.hidden) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      if (mode === 'fan') return startOrbit(AUTO + 300);
      vel = clamp(vel + (e.key === 'ArrowRight' ? 160 : -160), -MAXV, MAXV);
    }
  });

  /* ---------- หน้าดูไพ่ ---------- */
  let cur = 0;
  function show(p, dir) {
    cur = (p % N + N) % N;
    const id = order[cur], d = info(id);
    $('#no').textContent = `${cur + 1} / ${N}`;
    $('#nm').textContent = d.name; $('#th').textContent = d.th;
    $('#ds').textContent = d.designer; $('#mn').textContent = d.meaning;
    ph.textContent = id; ph.hidden = false; img.hidden = true;
    picEl.style.aspectRatio = ''; picEl.style.removeProperty('--msk');
    img.alt = d.name; img.src = src(id);
    slide.classList.remove('l'); void slide.offsetWidth; if (dir < 0) slide.classList.add('l');
  }
  img.onload = () => {
    img.hidden = false; ph.hidden = true;
    // ไม่มีกรอบแล้ว: ให้กล่องรูปมีสัดส่วนเท่ารูปจริง + ลายน้ำโชว์เฉพาะบนตัวรูป (ไม่ลอยบนพื้นโปร่งใส)
    if (img.naturalWidth) picEl.style.aspectRatio = img.naturalWidth + ' / ' + img.naturalHeight;
    // (เปิดไฟล์ตรงๆ แบบ file:// เบราว์เซอร์ไม่ยอมใช้รูปเป็น mask → ข้ามไป ลายน้ำจะเต็มกรอบแทน)
    if (/^https?:/.test(location.protocol)) picEl.style.setProperty('--msk', `url("${img.src}")`);
  };
  img.onerror = () => { img.hidden = true; ph.hidden = false; };
  let fromGallery = false;
  const tip = document.createElement('div'); tip.id = 'swipeTip'; tip.textContent = '← ปัดซ้าย-ขวาเพื่อเปลี่ยนไพ่ →'; document.body.appendChild(tip);
  let tipShown = false;
  const showTip = () => {
    if (tipShown || !matchMedia('(hover:none) and (pointer:coarse)').matches) return;
    tipShown = true; tip.classList.add('on'); setTimeout(() => tip.classList.remove('on'), 2800);
  };
  const openAt = (p, g) => { showTip(); fromGallery = !!g; if (g) gal.hidden = true; viewer.hidden = false; show(p, 1); sync(); };
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
  let sx = 0, sy = 0, tracking = false, swallowClick = false;
  const swipeStart = (x, y) => { sx = x; sy = y; tracking = true; };
  const swipeEnd = (x, y) => {
    if (!tracking) return false; tracking = false;
    const dx = x - sx, dy = y - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      const dir = dx < 0 ? 1 : -1;
      show(cur + dir, dir);
      swallowClick = true; setTimeout(() => swallowClick = false, 350);
      return true;
    }
    return false;
  };
  // มือถือ: ใช้ touch events (เสถียรกว่า pointer events บน Chrome/Android) / เมาส์: ใช้ pointer events
  viewer.addEventListener('touchstart', e => { const t = e.touches[0]; swipeStart(t.clientX, t.clientY); }, { passive: true });
  viewer.addEventListener('touchend', e => { const t = e.changedTouches[0]; swipeEnd(t.clientX, t.clientY); }, { passive: true });
  viewer.addEventListener('touchcancel', () => { tracking = false; }, { passive: true });
  viewer.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') swipeStart(e.clientX, e.clientY); });
  viewer.addEventListener('pointerup', e => { if (e.pointerType === 'mouse') swipeEnd(e.clientX, e.clientY); });
  // กันไม่ให้การปัดไปกดโดนรูป (เปิด lightbox) โดยไม่ตั้งใจ
  viewer.addEventListener('click', e => { if (swallowClick) { e.stopPropagation(); e.preventDefault(); } }, true);
  // ปัดในโหมดขยายรูป = เลื่อนไพ่เช่นกัน
  lb.addEventListener('touchstart', e => { const t = e.touches[0]; swipeStart(t.clientX, t.clientY); }, { passive: true });
  lb.addEventListener('touchend', e => { const t = e.changedTouches[0]; if (swipeEnd(t.clientX, t.clientY)) lbImg.src = img.src; }, { passive: true });
  img.addEventListener('load', () => { if (!lb.hidden) lbImg.src = img.src; });

  /* ---------- แกลเลอรี: รวมไพ่ทั้งหมดจัดเรียงสวยๆ ---------- */
  const css = document.createElement('style');
  css.textContent = `
  #galBtn{position:relative;z-index:6;display:flex;align-items:center;justify-content:center;gap:8px;flex-basis:100%;width:fit-content;margin:10px auto 0;
    padding:9px 16px;border-radius:999px;border:1px solid rgba(240,205,120,.55);color:#f0cd78;font:inherit;font-size:14px;
    background:rgba(18,14,36,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);cursor:pointer;
    transition:background .2s,transform .2s,box-shadow .2s}
  @media (hover:none) and (pointer:coarse){#prev,#next{display:none !important}}
  #swipeTip{position:fixed;left:50%;bottom:max(22px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:50;
    padding:8px 16px;border-radius:999px;background:rgba(18,14,36,.85);border:1px solid rgba(240,205,120,.5);
    color:#f0cd78;font-size:13px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .4s}
  #swipeTip.on{opacity:1}
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
      b.innerHTML = '<span class="fr wm"><span class="ph"></span><img loading="lazy" alt=""></span><span class="nm"></span><span class="th"></span>';
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
  function sync() { gBtn.hidden = useShopBtn || !viewer.hidden || !gal.hidden; if (!viewer.hidden) startVfx(); }
  sync();


  /* ---------- เอฟเฟกต์หน้าดูไพ่: ดาวรอบไพ่ + ดาวโคจร + ดาวตก ---------- */
  const auraBox = $('#auraBox');
  const cvB = $('#vfxBack'), cvF = $('#vfxFront'), gB = cvB.getContext('2d'), gF = cvF.getContext('2d');
  let vfxOn = false, vLast = 0, vW = 0, vH = 0, vDpr = 1, nextShoot = 0;
  let sparks = [], shoots = [], bgStars = [], motes = [];
  const AC = { c: [216, 182, 92] };                    // สีออร่า/ดาว ปัจจุบัน
  const rnd = (a, b) => a + Math.random() * (b - a);
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  function vfxSize() {
    vDpr = Math.min(2, devicePixelRatio || 1); vW = innerWidth; vH = innerHeight;
    for (const c of [cvB, cvF]) { c.width = vW * vDpr; c.height = vH * vDpr; }
    bgStars = Array.from({ length: Math.min(90, vW * vH / 12000 | 0) }, () =>
      ({ x: Math.random() * vW, y: Math.random() * vH, r: rnd(.3, 1.2), ph: rnd(0, 6.3), sp: rnd(.6, 2) }));
    motes = Array.from({ length: 4 }, (_, i) => ({ a: i * Math.PI / 2 + rnd(0, .6), sp: rnd(.45, .75), tilt: rnd(-.35, .35), trail: [] }));
  }

  // ดาว 4 แฉก
  function star4(g, x, y, r, col) {
    g.fillStyle = col; g.beginPath();
    g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r);
    g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r); g.fill();
  }

  // ดึงสีเด่นของรูปไพ่ ให้ออร่าเข้ากับไพ่แต่ละใบ (ถ้าเปิดไฟล์ตรงๆ แล้วเบราว์เซอร์ไม่ให้อ่านสี จะใช้สีทองแทน)
  function sampleColor() {
    let c = [216, 182, 92];
    try {
      const k = document.createElement('canvas'); k.width = k.height = 24;
      const g = k.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, 24, 24);
      const d = g.getImageData(0, 0, 24, 24).data; let r = 0, gg = 0, b = 0, w = 0;
      for (let i = 0; i < d.length; i += 4) {
        const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
        const s = (mx - mn) / 255 + .02, wt = s * s * (d[i + 3] / 255);       // เน้นสีสด ไม่เอาขาว/ดำ
        r += d[i] * wt; gg += d[i + 1] * wt; b += d[i + 2] * wt; w += wt;
      }
      if (w > 0) {
        c = [r / w, gg / w, b / w];
        const mx = Math.max(...c, 1), boost = 235 / mx;                       // ทำให้สว่างพอจะเรืองแสง
        c = c.map(v => Math.min(255, Math.round(v * boost * .85 + 40)));
      }
    } catch (e) { /* ใช้สีทอง */ }
    AC.c = c;
    viewer.style.setProperty('--ac', c.join(','));
  }
  img.addEventListener('load', sampleColor);

  function vfxFrame(now) {
    if (viewer.hidden) { vfxOn = false; gB.clearRect(0, 0, cvB.width, cvB.height); gF.clearRect(0, 0, cvF.width, cvF.height); return; }
    const dt = Math.min(.05, (now - vLast) / 1000 || 0); vLast = now;
    const R = picEl.getBoundingClientRect(), cx0 = R.left + R.width / 2, cy0 = R.top + R.height / 2;
    auraBox.style.width = R.width + 'px'; auraBox.style.height = R.height + 'px';
    auraBox.style.transform = `translate(${R.left}px,${R.top}px)`;
    for (const g of [gB, gF]) { g.setTransform(vDpr, 0, 0, vDpr, 0, 0); g.clearRect(0, 0, vW, vH); }
    const col = AC.c, white = [255, 250, 235];

    // 1) ดาวพื้นหลังกะพริบ
    for (const s of bgStars) {
      const a = .12 + .5 * Math.abs(Math.sin(now / 1000 * s.sp + s.ph));
      gB.fillStyle = `rgba(255,255,255,${a})`; gB.beginPath(); gB.arc(s.x, s.y, s.r, 0, 6.283); gB.fill();
    }

    // 2) ดาวตกจางๆ
    if (!reduce && now > nextShoot) {
      nextShoot = now + rnd(1400, 3800);
      const ang = rnd(.3, .6), sp = rnd(650, 1000);              // พุ่งลงซ้ายเฉียงๆ
      shoots.push({ x: rnd(vW * .25, vW * 1.1), y: rnd(-40, vH * .45), vx: -Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        len: rnd(110, 230), life: 0, max: rnd(.8, 1.3), a: rnd(.3, .6) });
    }
    shoots = shoots.filter(s => (s.life += dt) < s.max);
    for (const s of shoots) {
      s.x += s.vx * dt; s.y += s.vy * dt;
      const p = s.life / s.max, a = s.a * Math.sin(p * Math.PI), m = Math.hypot(s.vx, s.vy);
      const tx = s.x - s.vx / m * s.len, ty = s.y - s.vy / m * s.len;
      const gr = gB.createLinearGradient(s.x, s.y, tx, ty);
      gr.addColorStop(0, `rgba(255,248,225,${a})`); gr.addColorStop(.3, rgba(col, a * .45)); gr.addColorStop(1, 'rgba(255,255,255,0)');
      gB.strokeStyle = gr; gB.lineWidth = 1.6; gB.lineCap = 'round';
      gB.beginPath(); gB.moveTo(s.x, s.y); gB.lineTo(tx, ty); gB.stroke();
      gB.fillStyle = `rgba(255,255,255,${a})`; gB.beginPath(); gB.arc(s.x, s.y, 1.6, 0, 6.283); gB.fill();
    }

    // 3) ประกายดาวเกิดรอบขอบไพ่ แล้วลอยออก/ลอยขึ้น
    const rate = reduce ? 4 : 22;
    let n = rate * dt; while (n > 0 && sparks.length < 140) {
      if (n < 1 && Math.random() > n) break; n--;
      const side = Math.random() * 2 * (R.width + R.height); let x, y;
      if (side < R.width) { x = R.left + side; y = R.top; }
      else if (side < R.width + R.height) { x = R.right; y = R.top + side - R.width; }
      else if (side < 2 * R.width + R.height) { x = R.right - (side - R.width - R.height); y = R.bottom; }
      else { x = R.left; y = R.bottom - (side - 2 * R.width - R.height); }
      const dx = x - cx0, dy = y - cy0, dl = Math.hypot(dx, dy) || 1, out = rnd(4, 26);
      sparks.push({ x: x + dx / dl * out, y: y + dy / dl * out, vx: dx / dl * rnd(4, 18), vy: dy / dl * rnd(4, 18) - rnd(6, 20),
        r: rnd(1, 3.8), life: 0, max: rnd(1.2, 2.8), tw: rnd(6, 14), c: Math.random() < .45 ? white : col });
    }
    sparks = sparks.filter(s => (s.life += dt) < s.max);
    gF.globalCompositeOperation = 'lighter';
    for (const s of sparks) {
      s.x += s.vx * dt; s.y += s.vy * dt;
      const p = s.life / s.max, a = Math.sin(p * Math.PI) * (.55 + .45 * Math.sin(s.life * s.tw));
      if (s.r > 2.2) { star4(gF, s.x, s.y, s.r * 2.2, rgba(s.c, a * .9)); }
      gF.fillStyle = rgba(s.c, a * .35); gF.beginPath(); gF.arc(s.x, s.y, s.r * 1.8, 0, 6.283); gF.fill();
      gF.fillStyle = rgba(white, a); gF.beginPath(); gF.arc(s.x, s.y, s.r * .55, 0, 6.283); gF.fill();
    }

    // 4) ดาวโคจรรอบไพ่ (ผ่านหน้า = วาดทับไพ่, ผ่านหลัง = ซ่อนหลังไพ่)
    const rx = R.width * .78, ry = R.height * .2;
    for (const m of motes) {
      m.a += m.sp * dt * (reduce ? .3 : 1);
      const ca = Math.cos(m.a), sa = Math.sin(m.a);
      const x = cx0 + rx * ca, y = cy0 + ry * sa + rx * ca * m.tilt, front = sa > 0;
      m.trail.push({ x, y, front }); if (m.trail.length > 26) m.trail.shift();
      m.trail.forEach((q, i) => {
        const g = q.front ? gF : gB, a = (i / m.trail.length) ** 2 * .55;
        g.fillStyle = rgba(col, a); g.beginPath(); g.arc(q.x, q.y, 1 + i / m.trail.length * 1.8, 0, 6.283); g.fill();
      });
      const g = front ? gF : gB, sz = front ? 4.2 : 2.6;
      const halo = g.createRadialGradient(x, y, 0, x, y, sz * 5);
      halo.addColorStop(0, rgba(white, .9)); halo.addColorStop(.25, rgba(col, .5)); halo.addColorStop(1, rgba(col, 0));
      g.fillStyle = halo; g.beginPath(); g.arc(x, y, sz * 5, 0, 6.283); g.fill();
      star4(g, x, y, sz * 2.2, rgba(white, .95));
    }
    gF.globalCompositeOperation = 'source-over';
    requestAnimationFrame(vfxFrame);
  }
  function startVfx() {
    if (vfxOn) return; vfxOn = true; vfxSize(); vLast = performance.now(); nextShoot = vLast + 600;
    requestAnimationFrame(vfxFrame);
  }
  addEventListener('resize', () => { if (vfxOn) vfxSize(); });

  addEventListener('resize', layout);
  layout(); setMode('fan'); requestAnimationFrame(frame);
})();