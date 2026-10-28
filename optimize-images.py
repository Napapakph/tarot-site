# ===== ย่อรูปไพ่ให้โหลดเร็ว =====
# วิธีใช้: เปิด terminal ในโฟลเดอร์เว็บ แล้วพิมพ์   python optimize-images.py
# (ต้องมี Pillow:  pip install pillow)
# - ไม่แตะไฟล์ต้นฉบับ: สร้างไฟล์ใหม่ใน  tarot card/web/  (เปิดดูไพ่) และ  tarot card/thumb/  (แกลเลอรี)
# - ทำเฉพาะรูปที่ใหม่หรือถูกแก้ไขหลังจากครั้งที่แล้ว → รันซ้ำได้เรื่อยๆ ตอนเพิ่มไพ่ใบใหม่
# - โหมดโปรโมท (PROMO_OVERLAY ใน js/config.js): "อบ" ชั้นสีขาวลงในไฟล์  tarot card/promo/  เลย
#   → เว็บส่งแค่รูปที่ขาวแล้ว กด Inspect ก็ไม่เห็นรูปจริง
# - สร้างไฟล์ .vercelignore ให้อัตโนมัติ: ไม่อัปโหลดไฟล์ต้นฉบับ (และรูปจริงตอนเปิดโหมดโปรโมท) ขึ้น Vercel
# *** เปลี่ยนค่า PROMO_... ใน config.js แล้ว ต้องรันสคริปต์นี้ใหม่ทุกครั้ง แล้วค่อย push ***
import os, re, sys, glob
import numpy as np
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "tarot card")
OUT = {  # โฟลเดอร์: (กว้างสุด, สูงสุด, คุณภาพ)  — คุณภาพ "lossless" = สีและรายละเอียดเหมือนต้นฉบับ 100%
    "web":   (1600, 2400, "lossless"),   # หน้าดูไพ่ / ซูม: ไม่เสียคุณภาพเลย (เล็กกว่าต้นฉบับ ~4-5 เท่า)
    "thumb": (480, 720, 90),             # รูปเล็กในแกลเลอรี: บีบอัดได้ เพราะรูปเล็กและต้องโหลดไว
}
# อยากให้หน้าดูไพ่โหลดไวขึ้นอีก (แลกกับสีเพี้ยนเล็กน้อยในเส้นละเอียด) → เปลี่ยน "lossless" เป็นตัวเลข เช่น 95
force = "--force" in sys.argv

# ---------- อ่านค่าโปรโมทจาก js/config.js (แก้ที่เดียว ใช้ทั้งเว็บและสคริปต์) ----------
cfg = open(os.path.join(HERE, "js", "config.js"), encoding="utf-8").read()
def cval(key, default):
    m = re.search(r"^\s*" + key + r"\s*:\s*([^,/\n]+)", cfg, re.M)
    if not m: return default
    v = m.group(1).strip().strip('"\'')
    if v in ("true", "false"): return v == "true"
    try: return float(v)
    except ValueError: return v
PROMO = cval("PROMO_OVERLAY", False)
P_OP, P_COVER = float(cval("PROMO_OPACITY", 1)), float(cval("PROMO_COVER", 100))
P_FROM, P_FADE = str(cval("PROMO_FROM", "top")), float(cval("PROMO_FADE", 0))
promo_sig = f"{PROMO}|{P_OP}|{P_COVER}|{P_FROM}|{P_FADE}"
sig_file = os.path.join(SRC, "promo", ".settings")
old_sig = open(sig_file).read() if os.path.exists(sig_file) else ""
promo_force = PROMO and promo_sig != old_sig        # เปลี่ยนค่าโปรโมท → ทำรูปโปรโมทใหม่ทั้งหมด

def bake_promo(im):
    """ทับสีขาวตามรูปทรงงาน (เหมือนในเว็บ): ส่วนที่คลุม = ขาว, ขอบไล่นุ่มแบบ smoothstep, ส่วนโปร่งใสยังโปร่งใส"""
    a = np.asarray(im.convert("RGBA")).astype(np.float32)
    h, w = a.shape[:2]
    c = max(0.0, min(100.0, P_COVER)); f = max(0.0, min(100.0, P_FADE))
    lo, hi = max(0.0, c - f / 2), min(100.0, c + f / 2)
    n = h if P_FROM in ("top", "bottom") else w
    t = (np.arange(n) + 0.5) / n * 100                 # ตำแหน่ง % จากด้านที่เริ่มคลุม
    if P_FROM in ("bottom", "right"): t = t[::-1]
    if c >= 100: m = np.ones(n)
    elif c <= 0: m = np.zeros(n)
    else:
        x = np.clip((t - lo) / max(hi - lo, 1e-6), 0, 1)
        m = np.where(t <= lo, 1.0, np.where(t >= hi, 0.0, 1 - x * x * (3 - 2 * x)))
    k = (m[:, None] if P_FROM in ("top", "bottom") else m[None, :]) * max(0.0, min(1.0, P_OP))
    a[..., :3] = a[..., :3] * (1 - k[..., None]) + 255 * k[..., None]
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), "RGBA")

files = [f for f in glob.glob(os.path.join(SRC, "tarot_*.*")) if re.search(r"tarot_\d+\.(jpe?g|png|webp)$", f, re.I)]
files.sort(key=lambda f: int(re.search(r"tarot_(\d+)", f).group(1)))
total_in = total_out = 0
for f in files:
    name = re.search(r"(tarot_\d+)", os.path.basename(f)).group(1)
    targets = {k: os.path.join(SRC, k, name + ".webp") for k in OUT}
    ptargets = {k: os.path.join(SRC, "promo", k, name + ".webp") for k in OUT}
    fresh = lambda ts: all(os.path.exists(t) and os.path.getmtime(t) >= os.path.getmtime(f) for t in ts.values())
    need_main = force or not fresh(targets)
    need_promo = PROMO and (force or promo_force or not fresh(ptargets))
    if not need_main and not need_promo:
        continue
    im = Image.open(f)
    icc = im.info.get("icc_profile")    # โปรไฟล์สี (เช่น Display P3) — ต้องเก็บไว้ ไม่งั้นสีจะซีด
    im = ImageOps.exif_transpose(im)
    im = im.convert("RGBA") if ("A" in im.getbands() or im.mode == "P") else im.convert("RGB")   # เก็บพื้นโปร่งใสไว้
    size_in = os.path.getsize(f); total_in += size_in; line = f"{os.path.basename(f):14} {size_in/1e6:6.1f} MB →"
    for k, (w, h, q) in OUT.items():
        r = im.copy(); r.thumbnail((w, h), Image.LANCZOS)
        opts = dict(lossless=True, quality=80, method=4) if q == "lossless" else dict(quality=q, method=6, alpha_quality=100)
        if icc: opts["icc_profile"] = icc
        if need_main:
            os.makedirs(os.path.join(SRC, k), exist_ok=True)
            r.save(targets[k], "WEBP", **opts)
            s = os.path.getsize(targets[k]); total_out += s if k == "web" else 0
            line += f"  {k} {r.width}x{r.height} {s/1024:6.0f} KB"
        if need_promo:                                   # เวอร์ชันโปรโมท (ขาวแล้วในไฟล์)
            os.makedirs(os.path.join(SRC, "promo", k), exist_ok=True)
            bake_promo(r).save(ptargets[k], "WEBP", **opts)
            line += f"  promo/{k} {os.path.getsize(ptargets[k])/1024:5.0f} KB"
    print(line, flush=True)
if total_in:
    print(f"\nรวม: ต้นฉบับ {total_in/1e6:.1f} MB → web {total_out/1e6:.1f} MB")
else:
    print("ไม่มีรูปใหม่ให้ย่อ (ใส่ --force เพื่อทำใหม่ทั้งหมด)")
if PROMO:
    os.makedirs(os.path.join(SRC, "promo"), exist_ok=True)
    open(sig_file, "w").write(promo_sig)

# ---------- .vercelignore: ไฟล์ที่ห้ามขึ้นเว็บ ----------
ignore = [
    "# สร้างอัตโนมัติโดย optimize-images.py — ไฟล์ในรายการนี้จะไม่ถูกอัปโหลด/เปิดให้ดูบน Vercel",
    "optimize-images.py",
    "tarot card/README.txt",
    "tarot card/tarot_*",            # ต้นฉบับความละเอียดเต็ม: ไม่ขึ้นเว็บเลย
]
if PROMO:
    ignore += ["# โหมดโปรโมท: รูปจริงไม่ขึ้นเว็บ ส่งเฉพาะรูปที่ทับสีขาวแล้ว", "tarot card/web/", "tarot card/thumb/"]
else:
    ignore += ["tarot card/promo/"]
open(os.path.join(HERE, ".vercelignore"), "w", encoding="utf-8").write("\n".join(ignore) + "\n")
print("\nโหมดโปรโมท:", "เปิด → เว็บใช้ tarot card/promo/ (รูปจริงไม่ขึ้นเว็บ)" if PROMO else "ปิด → เว็บใช้รูปจริง")
print("อัปเดต .vercelignore แล้ว")
