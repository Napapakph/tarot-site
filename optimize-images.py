# ===== ย่อรูปไพ่ให้โหลดเร็ว =====
# วิธีใช้: เปิด terminal ในโฟลเดอร์เว็บ แล้วพิมพ์   python optimize-images.py
# (ต้องมี Pillow:  pip install pillow)
# - ไม่แตะไฟล์ต้นฉบับ: สร้างไฟล์ใหม่ใน  tarot card/web/  (เปิดดูไพ่) และ  tarot card/thumb/  (แกลเลอรี)
# - ทำเฉพาะรูปที่ใหม่หรือถูกแก้ไขหลังจากครั้งที่แล้ว → รันซ้ำได้เรื่อยๆ ตอนเพิ่มไพ่ใบใหม่
import os, re, sys, glob
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "tarot card")
OUT = {  # โฟลเดอร์: (กว้างสุด, สูงสุด, คุณภาพ)  — คุณภาพ "lossless" = สีและรายละเอียดเหมือนต้นฉบับ 100%
    "web":   (1600, 2400, "lossless"),   # หน้าดูไพ่ / ซูม: ไม่เสียคุณภาพเลย (เล็กกว่าต้นฉบับ ~4-5 เท่า)
    "thumb": (480, 720, 90),             # รูปเล็กในแกลเลอรี: บีบอัดได้ เพราะรูปเล็กและต้องโหลดไว
}
# อยากให้หน้าดูไพ่โหลดไวขึ้นอีก (แลกกับสีเพี้ยนเล็กน้อยในเส้นละเอียด) → เปลี่ยน "lossless" เป็นตัวเลข เช่น 95
force = "--force" in sys.argv

files = [f for f in glob.glob(os.path.join(SRC, "tarot_*.*")) if re.search(r"tarot_\d+\.(jpe?g|png|webp)$", f, re.I)]
files.sort(key=lambda f: int(re.search(r"tarot_(\d+)", f).group(1)))
total_in = total_out = 0
for f in files:
    name = re.search(r"(tarot_\d+)", os.path.basename(f)).group(1)
    targets = {k: os.path.join(SRC, k, name + ".webp") for k in OUT}
    if not force and all(os.path.exists(t) and os.path.getmtime(t) >= os.path.getmtime(f) for t in targets.values()):
        continue
    im = Image.open(f)
    icc = im.info.get("icc_profile")    # โปรไฟล์สี (เช่น Display P3) — ต้องเก็บไว้ ไม่งั้นสีจะซีด
    im = ImageOps.exif_transpose(im)
    im = im.convert("RGBA") if ("A" in im.getbands() or im.mode == "P") else im.convert("RGB")   # เก็บพื้นโปร่งใสไว้
    size_in = os.path.getsize(f); total_in += size_in; line = f"{os.path.basename(f):14} {size_in/1e6:6.1f} MB →"
    for k, (w, h, q) in OUT.items():
        os.makedirs(os.path.join(SRC, k), exist_ok=True)
        r = im.copy(); r.thumbnail((w, h), Image.LANCZOS)
        opts = dict(lossless=True, quality=80, method=4) if q == "lossless" else dict(quality=q, method=6, alpha_quality=100)
        if icc: opts["icc_profile"] = icc
        r.save(targets[k], "WEBP", **opts)
        s = os.path.getsize(targets[k]); total_out += s if k == "web" else 0
        line += f"  {k} {r.width}x{r.height} {s/1024:6.0f} KB"
    print(line, flush=True)
if total_in:
    print(f"\nรวม: ต้นฉบับ {total_in/1e6:.1f} MB → web {total_out/1e6:.1f} MB")
else:
    print("ไม่มีรูปใหม่ให้ย่อ (ใส่ --force เพื่อทำใหม่ทั้งหมด)")
