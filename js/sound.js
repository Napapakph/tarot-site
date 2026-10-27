// ===== เสียง: ดนตรีคลอแนวหมอดู + เสียงไพ่ =====
// สร้างเสียงสดด้วย Web Audio API ทั้งหมด (ไม่ต้องมีไฟล์เสียง ไม่ติดลิขสิทธิ์)
// ถ้าอยากใช้เพลงของตัวเอง ใส่ path ไฟล์ใน CONFIG.MUSIC_URL (เช่น "sound/music.mp3")
window.Snd = (() => {
  const C = typeof CONFIG !== 'undefined' ? CONFIG : {};   // อ่านค่าจาก js/config.js
  const VOL_MUSIC = C.MUSIC_VOLUME ?? 0.5;   // ความดังเพลง 0 - 1
  const VOL_SFX = C.SFX_VOLUME ?? 0.8;       // ความดังเสียงไพ่ 0 - 1
  let on = true;
  try { on = localStorage.getItem('tarot-sound') !== 'off'; } catch (e) { }

  let ctx = null, master, musicBus, sfxBus, noiseBuf, spinG, spinF, timer = 0, musicOn = false, fileAudio = null;
  let nextChord = 0, nextBell = 0, chordIdx = 0;
  const R = (a, b) => a + Math.random() * (b - a);
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);          // เลขโน้ต MIDI → ความถี่

  // สเกล D Phrygian Dominant (D Eb F# G A Bb C) — ฟีลลึกลับ ตะวันออกกลาง แบบเต็นท์หมอดู
  const SCALE = [0, 1, 4, 5, 7, 8, 10];
  const ROOT = 50;                                            // D3
  const CHORDS = [[0, 4, 7], [1, 5, 8], [5, 8, 12], [-2, 1, 5]];  // D → Eb → Gm → Cm

  /* ---------- เตรียมระบบเสียง ---------- */
  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = on ? 1 : 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp); comp.connect(ctx.destination);

    // เสียงก้อง (reverb) แบบห้องกว้างมืดๆ
    const verb = ctx.createConvolver(); verb.buffer = impulse(5, 2.4);
    const wet = ctx.createGain(); wet.gain.value = .6; verb.connect(wet); wet.connect(master);

    musicBus = ctx.createGain(); musicBus.gain.value = 0;
    const mSend = ctx.createGain(); mSend.gain.value = .8;
    musicBus.connect(master); musicBus.connect(mSend); mSend.connect(verb);

    sfxBus = ctx.createGain(); sfxBus.gain.value = VOL_SFX;
    const sSend = ctx.createGain(); sSend.gain.value = .35;
    sfxBus.connect(master); sfxBus.connect(sSend); sSend.connect(verb);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    // เสียงลมตอนหมุนวงไพ่ (เปิดค้างไว้ ปรับดังตามความเร็ว)
    const n = ctx.createBufferSource(); n.buffer = noiseBuf; n.loop = true;
    spinF = ctx.createBiquadFilter(); spinF.type = 'bandpass'; spinF.frequency.value = 500; spinF.Q.value = .8;
    spinG = ctx.createGain(); spinG.gain.value = 0;
    n.connect(spinF); spinF.connect(spinG); spinG.connect(sfxBus); n.start();
    return true;
  }
  function impulse(sec, decay) {
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }

  /* ---------- เครื่องมือสร้างเสียง ---------- */
  function env(g, t, a, peak, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dur);
  }
  function tone(f, t, { type = 'sine', a = .005, dur = 1, vol = .2, dest = sfxBus, detune = 0 } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f; o.detune.value = detune;
    env(g, t, a, vol, dur); o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + a + dur + .05);
  }
  // ระฆังแก้ว: หลายความถี่ที่ไม่ลงตัวกัน = เสียงวิ้งๆ แบบเวทมนตร์
  function bell(f, t, vol = .12, dest = sfxBus, len = 2.6) {
    [[1, 1], [2.01, .45], [2.76, .3], [5.4, .14], [8.93, .06]].forEach(([r, a], i) =>
      tone(f * r, t, { vol: vol * a, dur: len / (1 + i * .7), a: .003, dest }));
  }
  function noise(t, dur, { type = 'bandpass', f = 2000, f2 = f, q = 1, vol = .2, a = .004, dest = sfxBus } = {}) {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; s.playbackRate.value = R(.8, 1.2);
    fl.type = type; fl.Q.value = q;
    fl.frequency.setValueAtTime(f, t); fl.frequency.exponentialRampToValueAtTime(f2, t + a + dur);
    env(g, t, a, vol, dur);
    s.connect(fl); fl.connect(g); g.connect(dest);
    s.start(t, R(0, 1.5)); s.stop(t + a + dur + .05);
  }
  const ready = () => ctx && on && ctx.state === 'running';
  // ความดังแยกแต่ละเสียง (ตั้งใน CONFIG.SOUND_LEVELS) — 1 = ปกติ, 0.5 = ครึ่งหนึ่ง, 0 = ปิด
  const LV = C.SOUND_LEVELS || {}, outs = {};
  function out(name) {
    if (!outs[name]) { outs[name] = ctx.createGain(); outs[name].gain.value = LV[name] ?? 1; outs[name].connect(sfxBus); }
    return outs[name];
  }

  /* ---------- เสียงไพ่ ---------- */
  const fx = {
    // สับไพ่: เสียงไพ่ดีดรัวๆ แล้วจบด้วยประกาย
    shuffle() {
      if (!ready()) return; const o = out('shuffle'); let t = ctx.currentTime + .01;
      for (let i = 0; i < 20; i++) {
        noise(t, .03, { f: R(2600, 5200), q: 1.4, vol: .3 * (1 - i / 26), dest: o });
        noise(t, .02, { type: 'lowpass', f: 700, vol: .08, dest: o });
        t += R(.022, .042);
      }
      noise(t, .14, { type: 'lowpass', f: 380, vol: .35, dest: o });
      [0, 4, 7, 12].forEach((s, i) => bell(hz(ROOT + 24 + s), t + .08 + i * .07, .05, o));
    },
    // คลี่ไพ่กลับเป็นแผง
    gather() {
      if (!ready()) return; const o = out('gather'); let t = ctx.currentTime + .01;
      for (let i = 0; i < 12; i++) { noise(t, .035, { f: R(1800, 3600), q: 1.2, vol: .08 + i * .015, dest: o }); t += .055 - i * .003; }
      noise(t, .12, { type: 'lowpass', f: 300, vol: .3, dest: o });
    },
    // เลือกไพ่: วูบลม + ระฆัง + ฆ้องทุ้ม
    pick() {
      if (!ready()) return; const o = out('pick'); const t = ctx.currentTime + .01;
      noise(t, .55, { f: 280, f2: 3200, q: 1.6, vol: .22, a: .25, dest: o });
      tone(hz(ROOT - 12), t + .3, { vol: .22, dur: 3.5, a: .02, dest: o });                 // ฆ้องต่ำ
      tone(hz(ROOT - 12) * 2.02, t + .3, { vol: .06, dur: 2.5, a: .02, dest: o });
      [12, 16, 19, 24, 28].forEach((s, i) => bell(hz(ROOT + 12 + s), t + .32 + i * .075, .07, o));
    },
    // เลื่อนไปใบอื่น
    slide() {
      if (!ready()) return; const o = out('slide'); const t = ctx.currentTime + .01;
      noise(t, .2, { f: 2400, f2: 700, q: .9, vol: .16, a: .03, dest: o });
      bell(hz(ROOT + 24 + SCALE[Math.random() * SCALE.length | 0]), t + .1, .045, o, 1.8);
    },
    close() {
      if (!ready()) return; const o = out('close'); const t = ctx.currentTime + .01;
      noise(t, .28, { f: 1600, f2: 300, q: .9, vol: .1, a: .05, dest: o });
    },
    gallery() {
      if (!ready()) return; const o = out('gallery'); const t = ctx.currentTime + .01;
      [7, 12, 16, 19].forEach((s, i) => bell(hz(ROOT + 12 + s), t + i * .06, .045, o));
    },
    // level 0-1 = ความเร็วการหมุน
    spin(level) {
      if (!ctx || !spinG) return;
      const now = ctx.currentTime, v = on ? Math.min(1, level) : 0;
      spinG.gain.setTargetAtTime(v * v * .14 * (LV.spin ?? 1), now, .12);
      spinF.frequency.setTargetAtTime(350 + v * 1500, now, .15);
    },
  };

  /* ---------- ดนตรีคลอ ---------- */
  function startMusic() {
    if (musicOn) return; musicOn = true;
    if (C.MUSIC_URL) {                            // ใช้ไฟล์เพลงของตัวเอง
      fileAudio = new Audio(C.MUSIC_URL); fileAudio.loop = true; fileAudio.volume = VOL_MUSIC * .6;
      fileAudio.play().catch(() => { });
      return;
    }
    const t = ctx.currentTime;
    musicBus.gain.setValueAtTime(0, t); musicBus.gain.linearRampToValueAtTime(VOL_MUSIC, t + 5);   // ค่อยๆ ดังขึ้น

    // เสียงโดรนต่ำ (D + A) ฟิลเตอร์ขยับช้าๆ เหมือนหายใจ
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; lp.Q.value = 3;
    const lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.frequency.value = .06; lfoG.gain.value = 130;
    lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start();
    const dg = ctx.createGain(); dg.gain.value = .07; lp.connect(dg); dg.connect(musicBus);
    [[ROOT - 12, 0], [ROOT - 12, 9], [ROOT - 5, -6]].forEach(([m, det]) => {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = det;
      o.connect(lp); o.start();
    });

    // ลมเบาๆ ในเต็นท์
    const w = ctx.createBufferSource(); w.buffer = noiseBuf; w.loop = true;
    const wf = ctx.createBiquadFilter(); wf.type = 'lowpass'; wf.frequency.value = 420;
    const wg = ctx.createGain(); wg.gain.value = .02;
    const wl = ctx.createOscillator(), wlg = ctx.createGain(); wl.frequency.value = .09; wlg.gain.value = .015;
    wl.connect(wlg); wlg.connect(wg.gain); wl.start();
    w.connect(wf); wf.connect(wg); wg.connect(musicBus); w.start();

    nextChord = t + .2; nextBell = t + 3;
    timer = setInterval(schedule, 250);
  }
  function schedule() {
    if (!ctx || ctx.state !== 'running') return;
    const ahead = ctx.currentTime + .6;
    while (nextChord < ahead) {                   // คอร์ดแพดนุ่มๆ เปลี่ยนทุก 8 วิ
      const ch = CHORDS[chordIdx++ % CHORDS.length], t = nextChord;
      ch.forEach(s => {
        const f = hz(ROOT + s);
        tone(f, t, { type: 'triangle', a: 3, dur: 7.5, vol: .03, dest: musicBus });
        tone(f, t, { type: 'sine', a: 3, dur: 7.5, vol: .025, dest: musicBus, detune: 8 });
      });
      nextChord += 8;
    }
    while (nextBell < ahead) {                    // โน้ตระฆังสุ่มประปราย
      const deg = SCALE[Math.random() * SCALE.length | 0], oct = Math.random() < .3 ? 36 : 24;
      bell(hz(ROOT + oct + deg), nextBell, R(.025, .05), musicBus, 3.5);
      if (Math.random() < .3) {                   // บางทีเล่นต่อเป็นวลีสั้นๆ
        const d2 = SCALE[(SCALE.indexOf(deg) + (Math.random() < .5 ? 1 : -1) + 7) % 7];
        bell(hz(ROOT + oct + d2), nextBell + R(.35, .6), R(.02, .04), musicBus, 3);
      }
      nextBell += R(1.6, 4.2);
    }
  }

  /* ---------- เปิด/ปิดเสียง ---------- */
  function setOn(v) {
    on = v; try { localStorage.setItem('tarot-sound', on ? 'on' : 'off'); } catch (e) { }
    btn.classList.toggle('off', !on); btn.setAttribute('aria-pressed', on);
    btn.title = on ? 'ปิดเสียง' : 'เปิดเสียง';
    if (on) {
      if (!init()) return;
      ctx.resume().then(() => { master.gain.setTargetAtTime(1, ctx.currentTime, .2); startMusic(); });
      if (fileAudio) fileAudio.play().catch(() => { });
    } else {
      if (ctx) master.gain.setTargetAtTime(0, ctx.currentTime, .15);
      if (fileAudio) fileAudio.pause();
    }
  }
  // เบราว์เซอร์อนุญาตให้มีเสียงหลังผู้ใช้แตะ/คลิกครั้งแรกเท่านั้น
  function unlock(e) {
    if (e.target.closest && e.target.closest('#sndBtn')) return;
    removeEventListener('pointerdown', unlock, true); removeEventListener('keydown', unlock, true);
    if (!on || !init()) return;
    ctx.resume().then(startMusic);
  }
  addEventListener('pointerdown', unlock, true);
  addEventListener('keydown', unlock, true);
  // สลับแท็บ = หยุดเสียงชั่วคราว
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) { ctx.suspend(); if (fileAudio) fileAudio.pause(); }
    else if (on) { ctx.resume(); if (fileAudio) fileAudio.play().catch(() => { }); }
  });

  const btn = document.createElement('button');
  btn.id = 'sndBtn'; btn.type = 'button';
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="nt" d="M9 18.5a2.5 2.5 0 1 1-2-2.45V5.5l11-2.5v11.5a2.5 2.5 0 1 1-2-2.45V7.3l-7 1.6z"/><path class="sl" d="M3 3l18 18" /></svg>';
  btn.setAttribute('aria-label', 'เปิด/ปิดเสียงดนตรี');
  btn.classList.toggle('off', !on); btn.setAttribute('aria-pressed', on); btn.title = on ? 'ปิดเสียง' : 'เปิดเสียง';
  btn.addEventListener('click', e => { e.stopPropagation(); setOn(!on); });
  document.body.appendChild(btn);

  return fx;
})();
