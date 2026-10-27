// ===== ตั้งค่าหลัก: แก้ที่ไฟล์นี้ไฟล์เดียว =====
const CONFIG = {
  CARD_COUNT: 8,             // จำนวนไพ่ที่แสดง (รูปต้องมี tarot_1 ... tarot_N)
  FOLDER: "tarot card",       // ชื่อโฟลเดอร์รูป
  FILE_PREFIX: "tarot_",      // คำนำหน้าชื่อไฟล์
  EXT: "jpg",                 // นามสกุลไฟล์ (jpg / png / webp)
  TITLE: "Tarot of Design",
  SUBTITLE: "เปิดไพ่หนึ่งใบ ให้ผลงานออกแบบเล่าเรื่องของคุณ",
  SHOP_URL: "https://example.com",
  SHOP_LABEL: "ดูผลงานออกแบบทั้งหมด",
  DEFAULT_DESIGNER: "ชื่อนักออกแบบ",
  WATERMARK: "Tarot Adoptable",                           // ลายน้ำบนไพ่ (ข้อความหลัก)
  WATERMARK_NOTE: "Please do not save without permission", // ข้อความเล็กใต้ลายน้ำ
  WATERMARK_NOTE2: "Not for AI training or image-generation datasets", // บรรทัดที่ 3 ของลายน้ำ
  NOTICE: "© All artwork belongs to its artists. Do not save, repost, or use any image (including screenshots) in AI training or image-generation datasets without permission.", // ข้อความใต้รายละเอียดไพ่
  WATERMARK_OPACITY: 0.15,                                // ความจาง 0 - 1 (เลขน้อย = จางกว่า)
};

// ลำดับในอาเรย์ = เลขไฟล์ (ใบที่ 1 = tarot_1) ถ้าไม่ได้ใส่ ระบบจะใช้ค่าสำรองให้
const CARDS = [
  { name: "Judgement",          th: "การพิพากษา",         designer: "Alice Zo", meaning: "การตื่นรู้ การประเมินตนเอง และการเรียกร้องใหม่" },
  { name: "The High Priestess", th: "สตรีนักบวช",         designer: "YorUsan", meaning: "สัญชาตญาณ ความลับ และปัญญาภายใน" },
  { name: "Justice",            th: "ความยุติธรรม",       designer: "Zojin", meaning: "เหตุและผล ความสมดุล และการตัดสินใจที่ซื่อตรง" },
  { name: "The Sun",            th: "ดวงอาทิตย์",         designer: "宮侑", meaning: "ความสุข ความสำเร็จ และความชัดเจน" },
  { name: "Temperance",         th: "ความพอดี",           designer: "Hydran Yuu", meaning: "ความสมดุล การผสานสิ่งที่ต่างกัน และความอดทน" },
  { name: "The Moon",           th: "ดวงจันทร์",          designer: "คูมผี ต้องการการพักผ่อน", meaning: "ความไม่แน่นอน ความฝัน และสิ่งที่ซ่อนอยู่" },
  { name: "The Magician",       th: "จอมเวท",             designer: "Yuzuu Yu", meaning: "พลังสร้างสรรค์ ทักษะ และการลงมือทำให้เป็นจริง" },
  { name: "The World",          th: "โลก",                designer: "yuuh1me", meaning: "ความสมบูรณ์ การจบวงจร และการก้าวสู่ขั้นถัดไป" },
  { name: "The Fool",           th: "ผู้เริ่มต้นเดินทาง",  designer: "", meaning: "การเริ่มต้นใหม่ ความกล้าเสี่ยง และอิสระ" },
  { name: "The Empress",        th: "จักรพรรดินี",        designer: "", meaning: "ความอุดมสมบูรณ์ ความงาม และการหล่อเลี้ยง" },
  { name: "The Emperor",        th: "จักรพรรดิ",          designer: "", meaning: "โครงสร้าง อำนาจ และความมั่นคง" },
  { name: "The Hierophant",     th: "ผู้นำศาสนา",         designer: "", meaning: "ประเพณี ความเชื่อ และการเรียนรู้จากผู้รู้" },
  { name: "The Lovers",         th: "คู่รัก",             designer: "", meaning: "ความรัก การเลือก และความสอดคล้องของคุณค่า" },
  { name: "The Chariot",        th: "รถศึก",              designer: "", meaning: "ชัยชนะ ความมุ่งมั่น และการควบคุมทิศทาง" },
  { name: "Strength",           th: "พลัง",               designer: "", meaning: "ความกล้าหาญอย่างอ่อนโยน และการควบคุมใจตน" },
  { name: "The Hermit",         th: "ผู้สันโดษ",          designer: "", meaning: "ความสงบ การค้นหาตัวเอง และแสงนำทางภายใน" },
  { name: "Wheel of Fortune",   th: "กงล้อแห่งโชคชะตา",   designer: "", meaning: "วัฏจักร โชคชะตา และจุดเปลี่ยน" },
  { name: "The Hanged Man",     th: "ชายแขวนเท้า",        designer: "", meaning: "การหยุดพัก มุมมองใหม่ และการปล่อยวาง" },
  { name: "Death",              th: "ความตาย",            designer: "", meaning: "การสิ้นสุดเพื่อเริ่มต้นใหม่ และการเปลี่ยนแปลงครั้งใหญ่" },
  { name: "The Devil",          th: "ปีศาจ",              designer: "", meaning: "พันธนาการ ความยึดติด และสิ่งที่ผูกมัดเราไว้" },
  { name: "The Tower",          th: "หอคอย",              designer: "", meaning: "การพังทลายอย่างฉับพลัน และความจริงที่ปรากฏ" },
  { name: "The Star",           th: "ดวงดาว",             designer: "", meaning: "ความหวัง การเยียวยา และแรงบันดาลใจ" },
  
];
