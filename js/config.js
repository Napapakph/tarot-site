// ===== ตั้งค่าหลัก: แก้ที่ไฟล์นี้ไฟล์เดียว =====
const CONFIG = {
  CARD_COUNT: 13,             // จำนวนไพ่ที่แสดง (รูปต้องมี tarot_1 ... tarot_N)
  FOLDER: "tarot card",       // ชื่อโฟลเดอร์รูป
  FILE_PREFIX: "tarot_",      // คำนำหน้าชื่อไฟล์
  EXT: "jpg",                 // นามสกุลไฟล์ (jpg / png / webp)
  TITLE: "Tarot of Design",
  SUBTITLE: "เปิดไพ่หนึ่งใบ ให้ผลงานออกแบบเล่าเรื่องของคุณ",
  SUBTITLE_EN: "Draw one card and let the artwork tell your story",  // คำโปรยภาษาอังกฤษ
  SHOP_URL: "https://example.com",
  SHOP_LABEL: "ดูผลงานออกแบบทั้งหมด",
  SHOP_LABEL_EN: "See all artworks",
  DEFAULT_DESIGNER: "ชื่อนักออกแบบ",
  DEFAULT_LANG: "th",         // ภาษาเริ่มต้น "th" หรือ "en" (ผู้ชมกดปุ่ม TH/EN เปลี่ยนเองได้ และเว็บจะจำไว้)
  MUSIC_VOLUME: 0.15,         // ความดังดนตรีคลอ 0 - 1
  SFX_VOLUME: 0.4,            // ความดังเสียงไพ่ 0 - 1
  SOUND_LEVELS: {             // ความดังแยกแต่ละเสียง: 1 = ปกติ, 0.5 = เบาลงครึ่งหนึ่ง, 2 = ดังขึ้น 2 เท่า, 0 = ปิดเสียงนั้น
    shuffle: 1,               // สับไพ่
    spin: 1,                  // เสียงลมตอนหมุนวงไพ่
    pick: 1,                  // จับไพ่ / เปิดดูไพ่
    slide: 1,                 // เลื่อนไพ่ใบถัดไป / ก่อนหน้า
    gallery: 0.6,               // เปิดหน้ารวมไพ่
    close: 1,                 // ปิดหน้าดูไพ่
    gather: 1,                // กด "คลี่ไพ่ใหม่"
  },
  MUSIC_URL: "",              // ว่าง = ใช้ดนตรีที่สร้างเอง / ใส่ไฟล์ เช่น "sound/music.mp3" ถ้าอยากใช้เพลงตัวเอง
  WATERMARK: "Tarot Adoptable",                           // ลายน้ำบนไพ่ (ข้อความหลัก)
  WATERMARK_NOTE: "Please do not save without permission", // ข้อความเล็กใต้ลายน้ำ
  WATERMARK_NOTE2: "Not for AI training or image-generation datasets", // บรรทัดที่ 3 ของลายน้ำ
  NOTICE: "© All artwork belongs to its artists. Do not save, repost, or use any image (including screenshots) in AI training or image-generation datasets without permission.", // ข้อความใต้รายละเอียดไพ่
  WATERMARK_OPACITY: 0.15,                                // ความจาง 0 - 1 (เลขน้อย = จางกว่า)
  PROMO_OVERLAY: true,        // true = ทับไพ่ทุกใบด้วยเงาสีขาวตามรูปทรงงาน (โปรโมท/ทีเซอร์) / false = โชว์รูปจริง
  PROMO_OPACITY: 1,           // ความทึบของชั้นสีขาว: 1 = ขาวทึบทั้งหมด, 0.7 = เห็นลายจางๆ, 0.4 = เห็นชัดขึ้น
  PROMO_COVER: 60,           // คลุมยาวแค่ไหน (% ของรูป): 100 = ทั้งใบ, 60 = 60% จากด้านที่เลือก, 0 = ไม่คลุม
  PROMO_FROM: "top",          // เริ่มคลุมจากด้านไหน: "top" บน / "bottom" ล่าง / "left" ซ้าย / "right" ขวา
  PROMO_FADE: 70,             // ความนุ่มของขอบรอยต่อ (%): 0 = ตัดคม, 10-20 = ไล่สีนุ่มๆ
};

// ลำดับในอาเรย์ = เลขไฟล์ (ใบที่ 1 = tarot_1)
// name = ชื่อไพ่ (อังกฤษ), th = ชื่อไทย, designer = ชื่อนักวาด, designer_url = ลิงก์เฟซบุ๊กนักวาด
// meaning / meaning_en = ความหมายแบบสั้น (ไทย / อังกฤษ)
// detail / detail_en = ความหมายแบบยาว (กดปุ่ม "อ่านเพิ่มเติม") — ขึ้นบรรทัดใหม่ด้วย \n
//   บรรทัดที่ขึ้นต้นด้วย "หัวข้อ: " จะแสดงหัวข้อเป็นตัวสีทอง เช่น "ความรัก: ...\nการงาน: ..."
const CARDS = [
  {
    name: "Judgement", th: "การพิพากษา",
    designer: "Alice Zo",
    designer_url: "https://www.facebook.com/alicezo.zz/",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "การตื่นรู้ การประเมินตนเอง และการเรียกร้องใหม่",
    meaning_en: "Awakening, self-reflection, and a new calling",
    detail: "ภาพรวม: เสียงเรียกให้ตื่นขึ้นมามองชีวิตอย่างซื่อตรง ถึงเวลาทบทวนสิ่งที่ผ่านมา ให้อภัยตัวเอง และเริ่มบทใหม่ที่ตรงกับตัวตนจริงๆ\nความรัก: ความสัมพันธ์ได้โอกาสเริ่มต้นใหม่ หรือได้คุยเรื่องที่ค้างคาใจ คนเก่าอาจกลับมา แต่ให้ดูว่ามันยังพาเราเติบโตไหม\nการงาน: เวลาประเมินผลงานและตัดสินใจครั้งสำคัญ งานที่ตั้งใจทำมานานจะได้รับการมองเห็น\nคำแนะนำ: ฟังเสียงข้างใน แล้วตอบรับมันอย่างกล้าหาญ อย่าปล่อยให้ความผิดพลาดเก่ามากำหนดอนาคต",
    detail_en: "Overview: A call to wake up and look at your life honestly. Reflect on the past, forgive yourself, and step into a new chapter that fits who you really are.\nLove: A relationship gets a fresh start, or an old issue is finally talked through. Someone from the past may return. Ask if they still help you grow.\nWork: A time for review and big decisions. Long, careful effort is finally noticed.\nAdvice: Listen to your inner voice and answer it with courage. Don't let old mistakes decide your future.",
  },
  {
    name: "The High Priestess", th: "สตรีนักบวช",
    designer: "YorUsan",
    designer_url: "https://www.facebook.com/yorusan.878026",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "สัญชาตญาณ ความลับ และปัญญาภายใน",
    meaning_en: "Intuition, secrets, and inner wisdom",
    detail: "ภาพรวม: ความรู้บางอย่างไม่ได้มาจากเหตุผล แต่มาจากใจที่สงบ ไพ่ใบนี้ชวนให้นิ่ง ฟัง และสังเกตสิ่งที่ซ่อนอยู่ใต้ผิวน้ำ\nความรัก: มีความรู้สึกที่ยังไม่ได้พูดออกมา หรือมีเรื่องที่อีกฝ่ายยังไม่เปิดเผย ให้เวลาความสัมพันธ์ค่อยๆ ชัดเจน\nการงาน: อย่าเพิ่งรีบตัดสินใจ เก็บข้อมูลให้ครบ และเชื่อสัญชาตญาณของตัวเองมากกว่าเสียงรอบข้าง\nคำแนะนำ: ความเงียบคือคำตอบในตอนนี้ เขียนบันทึก นั่งสมาธิ หรือฟังความฝันของตัวเองดู",
    detail_en: "Overview: Some knowledge comes not from logic but from a quiet mind. This card asks you to be still, listen, and notice what is hidden under the surface.\nLove: There are feelings not yet spoken, or things the other person hasn't shared. Give the relationship time to become clear.\nWork: Don't rush a decision. Gather all the information, and trust your intuition more than the noise around you.\nAdvice: Silence is the answer for now. Try journaling, meditating, or paying attention to your dreams.",
  },
  {
    name: "Justice", th: "ความยุติธรรม",
    designer: "Zojin",
    designer_url: "https://www.facebook.com/zo.jin.2024",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "เหตุและผล ความสมดุล และการตัดสินใจที่ซื่อตรง",
    meaning_en: "Cause and effect, balance, and honest decisions",
    detail: "ภาพรวม: ทุกการกระทำมีผลของมัน ไพ่ใบนี้พูดถึงความยุติธรรม ความจริง และการรับผิดชอบต่อสิ่งที่เราเลือก\nความรัก: ความสัมพันธ์ต้องการความสมดุลและความซื่อสัตย์ ทั้งให้และรับอย่างเท่าเทียม ถ้ามีเรื่องค้างคา ถึงเวลาพูดกันตรงๆ\nการงาน: เรื่องสัญญา เอกสาร หรือการตัดสินใจทางกฎหมายจะออกมาตามความจริง ทำทุกอย่างให้ถูกต้องและโปร่งใส\nคำแนะนำ: มองเรื่องราวจากทุกด้านก่อนตัดสิน และยอมรับผลของการกระทำของตัวเองอย่างกล้าหาญ",
    detail_en: "Overview: Every action has a result. This card is about fairness, truth, and taking responsibility for your choices.\nLove: The relationship needs balance and honesty, with giving and receiving in equal measure. If something is unresolved, talk about it openly.\nWork: Contracts, paperwork, or legal matters will follow the truth. Keep everything correct and transparent.\nAdvice: Look at every side before you judge, and accept the results of your own actions with courage.",
  },
  {
    name: "The Sun", th: "ดวงอาทิตย์",
    designer: "宮侑",
    designer_url: "https://www.facebook.com/Pavaen.0802",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "ความสุข ความสำเร็จ และความชัดเจน",
    meaning_en: "Joy, success, and clarity",
    detail: "ภาพรวม: หนึ่งในไพ่ที่สดใสที่สุด แสงอาทิตย์ส่องให้ทุกอย่างชัดเจน ความสุข ความสำเร็จ และพลังบวกกำลังมา\nความรัก: ความสัมพันธ์อบอุ่น จริงใจ และมีความสุขแบบเรียบง่าย คนโสดอาจได้เจอคนที่ทำให้ยิ้มได้ทั้งวัน\nการงาน: งานประสบความสำเร็จ ได้รับคำชม มีพลังทำสิ่งใหม่ๆ เรื่องเงินก็มีแนวโน้มดี\nคำแนะนำ: ให้ตัวเองได้สนุกและภูมิใจกับสิ่งที่ทำ แบ่งปันความสุขนี้ให้คนรอบตัวด้วย",
    detail_en: "Overview: One of the brightest cards. The sun makes everything clear. Joy, success, and positive energy are on the way.\nLove: The relationship is warm, honest, and simply happy. If you're single, you may meet someone who makes you smile all day.\nWork: Success and praise. You have the energy to start new things, and money looks good too.\nAdvice: Let yourself have fun and feel proud of what you do. Share this joy with the people around you.",
  },
  {
    name: "Temperance", th: "ความพอดี",
    designer: "Hydran Yuu",
    designer_url: "https://www.facebook.com/YuuyakmiiTang",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "ความสมดุล การผสานสิ่งที่ต่างกัน และความอดทน",
    meaning_en: "Balance, blending opposites, and patience",
    detail: "ภาพรวม: ศิลปะของความพอดี การผสมสิ่งที่ต่างกันให้กลมกลืน ไม่มากไป ไม่น้อยไป ทุกอย่างค่อยๆ เข้าที่ด้วยความอดทน\nความรัก: ความสัมพันธ์ที่ต่างคนต่างปรับเข้าหากัน ใจเย็นและประนีประนอม รักจะค่อยๆ มั่นคงขึ้น\nการงาน: ทำงานเป็นทีมได้ดี หาทางสายกลางระหว่างความเร็วกับคุณภาพ เรื่องเงินควรวางแผนอย่างพอดี\nคำแนะนำ: ไม่ต้องรีบ ผสมผสานส่วนดีของแต่ละทางเข้าด้วยกัน แล้วผลลัพธ์ที่ลงตัวจะตามมาเอง",
    detail_en: "Overview: The art of 'just right' — blending different things into harmony, not too much and not too little. Things fall into place with patience.\nLove: Two different people adjust to each other. Stay calm and meet in the middle, and love grows more stable over time.\nWork: Good teamwork. Find the middle path between speed and quality. Plan your money in a balanced way.\nAdvice: No need to rush. Combine the best parts of each path, and a balanced result will come.",
  },
  {
    name: "The Moon", th: "ดวงจันทร์",
    designer: "คูมผี ต้องการการพักผ่อน",
    designer_url: "https://www.facebook.com/khum.phi.txngkar.kar.phak.phxn",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "ความไม่แน่นอน ความฝัน และสิ่งที่ซ่อนอยู่",
    meaning_en: "Uncertainty, dreams, and hidden things",
    detail: "ภาพรวม: ใต้แสงจันทร์ ทุกอย่างดูไม่ชัดเจน อาจมีความกังวล ความสับสน หรือภาพลวงตา แต่ก็เป็นช่วงที่จินตนาการและความฝันมีพลังมาก\nความรัก: อาจมีความไม่แน่ใจ หรือมีเรื่องที่ยังมองไม่เห็นทั้งหมด อย่าเพิ่งเชื่อความคิดฟุ้งซ่านของตัวเองจนเกินไป\nการงาน: ข้อมูลยังไม่ครบ ระวังข่าวลือและการตัดสินใจจากความกลัว เหมาะกับงานสร้างสรรค์ที่ใช้จินตนาการ\nคำแนะนำ: เดินช้าๆ ในความมืด เชื่อสัญชาตญาณ แต่ตรวจสอบความจริงก่อนเสมอ แล้ววันที่ฟ้าสว่างจะมาถึง",
    detail_en: "Overview: Under moonlight, nothing looks clear. There may be worry, confusion, or illusion — but it's also a time when imagination and dreams are powerful.\nLove: There may be doubt, or something you can't fully see yet. Don't believe your anxious thoughts too much.\nWork: The information isn't complete. Watch out for rumors and decisions made from fear. Great for creative, imaginative work.\nAdvice: Walk slowly through the dark. Trust your intuition, but always check the facts. Clear skies will come.",
  },
  {
    name: "The Magician", th: "จอมเวท",
    designer: "Yuzuu Yu",
    designer_url: "https://www.facebook.com/yuzuu.san.2025",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "พลังสร้างสรรค์ ทักษะ และการลงมือทำให้เป็นจริง",
    meaning_en: "Creative power, skill, and making things real",
    detail: "ภาพรวม: คุณมีทุกอย่างที่ต้องใช้อยู่ในมือแล้ว ทั้งทักษะ ความคิด และพลังใจ ถึงเวลาเปลี่ยนไอเดียให้กลายเป็นของจริง\nความรัก: เสน่ห์และความมั่นใจของคุณโดดเด่น เป็นช่วงดีที่จะเป็นฝ่ายเริ่มต้นหรือสื่อสารความรู้สึกให้ชัด\nการงาน: เหมาะกับการเริ่มโปรเจกต์ใหม่ นำเสนองาน หรือลงมือทำสิ่งที่วางแผนไว้ ฝีมือของคุณจะเป็นที่ประจักษ์\nคำแนะนำ: อย่ารอให้พร้อมร้อยเปอร์เซ็นต์ เริ่มจากสิ่งที่มีอยู่ แล้วใช้มันอย่างตั้งใจ",
    detail_en: "Overview: You already have everything you need — skill, ideas, and willpower. It's time to turn an idea into something real.\nLove: Your charm and confidence shine. A good time to make the first move or say clearly how you feel.\nWork: Great for starting a new project, presenting your work, or acting on your plans. Your talent will be seen.\nAdvice: Don't wait until you're 100% ready. Start with what you have and use it with intention.",
  },
  {
    name: "The World", th: "โลก",
    designer: "yuuh1me",
    designer_url: "https://www.facebook.com/yuu.h1me",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "ความสมบูรณ์ การจบวงจร และการก้าวสู่ขั้นถัดไป",
    meaning_en: "Completion, closing a cycle, and moving to the next stage",
    detail: "ภาพรวม: การเดินทางหนึ่งมาถึงจุดสมบูรณ์ สิ่งที่ตั้งใจไว้สำเร็จ และคุณพร้อมแล้วสำหรับบทใหม่ที่กว้างกว่าเดิม\nความรัก: ความสัมพันธ์เติบโตจนลงตัว รู้สึกครบและสมบูรณ์ อาจมีก้าวสำคัญร่วมกัน\nการงาน: โปรเจกต์สำเร็จลุล่วง ได้รับการยอมรับ อาจมีโอกาสเกี่ยวกับต่างประเทศหรือขยายงานออกไปไกล\nคำแนะนำ: ฉลองความสำเร็จของตัวเอง ขอบคุณเส้นทางที่ผ่านมา แล้วก้าวต่อไปอย่างภูมิใจ",
    detail_en: "Overview: A journey reaches completion. What you aimed for is done, and you're ready for a new, bigger chapter.\nLove: The relationship has grown into something whole and fulfilling. An important step together may come.\nWork: A project is completed and recognized. There may be chances abroad or to expand your work further.\nAdvice: Celebrate your success, be thankful for the road behind you, and step forward with pride.",
  },
  {
    name: "The Hermit", th: "ผู้สันโดษ",
    designer: "Pastel ch",
    designer_url: "https://www.facebook.com/pastel.ch.9",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "ความสงบ การค้นหาตัวเอง และแสงนำทางภายใน",
    meaning_en: "Stillness, self-discovery, and an inner guiding light",
    detail: "ภาพรวม: ช่วงเวลาที่ต้องถอยออกจากความวุ่นวาย เพื่อฟังตัวเองให้ชัด แสงตะเกียงในมือคือปัญญาที่อยู่ข้างในคุณเอง\nความรัก: อาจต้องการพื้นที่ส่วนตัว หรือกำลังทบทวนว่าอยากได้ความรักแบบไหนจริงๆ การอยู่คนเดียวไม่ได้แปลว่าเหงาเสมอไป\nการงาน: เหมาะกับงานที่ต้องโฟกัสลึก ศึกษาค้นคว้า หรือวางแผนระยะยาว อาจได้คำแนะนำดีจากผู้มีประสบการณ์\nคำแนะนำ: ปิดเสียงรอบข้างสักพัก คำตอบที่ตามหาอาจอยู่ในความเงียบของตัวเอง",
    detail_en: "Overview: A time to step back from the noise and hear yourself clearly. The lantern in his hand is the wisdom inside you.\nLove: You may need personal space, or you're thinking about what kind of love you truly want. Being alone doesn't always mean being lonely.\nWork: Good for deep focus, research, or long-term planning. Wise advice may come from someone experienced.\nAdvice: Turn down the outside noise for a while. The answer you're looking for may be in your own quiet.",
  },
  {
    name: "Death", th: "ความตาย",
    designer: "อามามิยะ มะม่วง",
    designer_url: "https://www.facebook.com/profile.php?id=100075551163988",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "การสิ้นสุดเพื่อเริ่มต้นใหม่ และการเปลี่ยนแปลงครั้งใหญ่",
    meaning_en: "An ending that makes room for a new beginning",
    detail: "ภาพรวม: ไม่ได้หมายถึงความตายจริงๆ แต่คือการจบสิ่งเก่าเพื่อเปิดทางให้สิ่งใหม่ เหมือนใบไม้ร่วงก่อนฤดูใหม่จะมา\nความรัก: ความสัมพันธ์กำลังเปลี่ยนรูปแบบ อาจเป็นการปล่อยวางสิ่งที่ไม่ใช่ หรือเปลี่ยนจากแบบเดิมไปสู่ความผูกพันที่ลึกขึ้น\nการงาน: การเปลี่ยนแปลงครั้งใหญ่ เช่น เปลี่ยนงาน ปิดโปรเจกต์ หรือเปลี่ยนวิธีทำงาน แม้จะน่ากลัวแต่ก็จำเป็น\nคำแนะนำ: อย่ายื้อสิ่งที่หมดเวลาแล้ว ปล่อยมันไปด้วยความขอบคุณ แล้วพื้นที่ใหม่จะเกิดขึ้น",
    detail_en: "Overview: Not literal death — it's the end of something old to make room for something new, like leaves falling before a new season.\nLove: The relationship is changing shape. You may let go of what isn't right, or move from the old pattern to a deeper bond.\nWork: A big change, like a new job, closing a project, or a new way of working. Scary, but necessary.\nAdvice: Don't hold on to what has run its course. Let it go with gratitude, and new space will open up.",
  },
  {
    name: "Strength", th: "พลัง",
    designer: "ช็อกโกแลต ในตู้เย็น",
    designer_url: "https://www.facebook.com/das.saion",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "ความกล้าหาญอย่างอ่อนโยน และการควบคุมใจตน",
    meaning_en: "Gentle courage and mastery of your own heart",
    detail: "ภาพรวม: ความแข็งแกร่งที่แท้จริงไม่ใช่การใช้กำลัง แต่คือความอ่อนโยน ความอดทน และการควบคุมอารมณ์ของตัวเองได้\nความรัก: ความรักที่มั่นคงเกิดจากความเข้าใจและใจเย็น ความอ่อนโยนของคุณจะช่วยคลี่คลายปัญหาได้ดีกว่าการโต้เถียง\nการงาน: คุณรับมือกับแรงกดดันได้ดีกว่าที่คิด ใช้ความอดทนและความมั่นใจแบบสงบ แล้วจะผ่านไปได้\nคำแนะนำ: เชื่อในพลังของตัวเอง และใจดีกับตัวเองเหมือนที่ใจดีกับคนอื่น",
    detail_en: "Overview: True strength isn't force. It's gentleness, patience, and being able to manage your own emotions.\nLove: Steady love comes from understanding and calm. Your gentleness will solve problems better than arguing.\nWork: You handle pressure better than you think. Use patience and quiet confidence, and you'll get through.\nAdvice: Believe in your own power, and be as kind to yourself as you are to others.",
  },
  {
    name: "The Empress", th: "จักรพรรดินี",
    designer: "Onna Daro",
    designer_url: "https://www.facebook.com/onna.daro",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "ความอุดมสมบูรณ์ ความงาม และการหล่อเลี้ยง",
    meaning_en: "Abundance, beauty, and nurturing",
    detail: "ภาพรวม: พลังแห่งความอุดมสมบูรณ์ ความงาม และการเลี้ยงดู สิ่งที่คุณดูแลอย่างตั้งใจกำลังเบ่งบาน\nความรัก: ความรักอบอุ่น อ่อนโยน และเต็มไปด้วยการใส่ใจ อาจเกี่ยวกับการสร้างครอบครัวหรือความผูกพันที่ลึกซึ้งขึ้น\nการงาน: งานสร้างสรรค์และงานศิลปะรุ่งเรือง ไอเดียงอกงาม การเงินมีแนวโน้มมั่นคงและเติบโต\nคำแนะนำ: ดูแลร่างกายและใจตัวเอง ใช้เวลากับธรรมชาติและสิ่งสวยงาม แล้วความคิดสร้างสรรค์จะไหลมาเอง",
    detail_en: "Overview: The energy of abundance, beauty, and care. What you've nurtured with love is starting to bloom.\nLove: Warm, gentle, caring love. It may be about building a family or a deeper bond.\nWork: Creative and artistic work flourishes. Ideas grow, and money looks stable and growing.\nAdvice: Take care of your body and mind. Spend time with nature and beautiful things, and creativity will flow.",
  },
  {
    name: "Wheel of Fortune", th: "กงล้อแห่งโชคชะตา",
    designer: "SA AS",
    designer_url: "https://www.facebook.com/sa.as.990645",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "วัฏจักร โชคชะตา และจุดเปลี่ยน",
    meaning_en: "Cycles, destiny, and turning points",
    detail: "ภาพรวม: กงล้อแห่งชีวิตกำลังหมุน ทุกอย่างมีขึ้นมีลง และตอนนี้คือจุดเปลี่ยนที่โชคชะตาเข้ามาเกี่ยวข้อง\nความรัก: อาจมีการพบเจอที่เหมือนพรหมลิขิต หรือความสัมพันธ์เข้าสู่ช่วงใหม่แบบไม่คาดคิด\nการงาน: โอกาสใหม่เข้ามาอย่างรวดเร็ว จังหวะเวลาสำคัญมาก เตรียมตัวให้พร้อมแล้วคว้าไว้\nคำแนะนำ: ยอมรับว่าบางอย่างควบคุมไม่ได้ แต่สิ่งที่ควบคุมได้คือวิธีที่เราตอบรับมัน",
    detail_en: "Overview: The wheel of life is turning. Everything has ups and downs, and right now is a turning point where fate is involved.\nLove: A meeting that feels like destiny, or a relationship suddenly entering a new phase.\nWork: New chances arrive quickly. Timing matters — be ready and grab them.\nAdvice: Accept that some things are out of your control. What you can control is how you respond.",
  },
  {
    name: "The Fool", th: "ผู้เริ่มต้นเดินทาง",
    designer: "",
    designer_url: "",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "การเริ่มต้นใหม่ ความกล้าเสี่ยง และอิสระ",
    meaning_en: "New beginnings, brave risks, and freedom",
    detail: "ภาพรวม: จุดเริ่มต้นของการเดินทางครั้งใหม่ หัวใจเปิดกว้าง อยากรู้อยากเห็น และกล้าก้าวไปข้างหน้าโดยไม่ต้องรู้ทุกคำตอบ\nความรัก: ความรักแบบสดใสและเป็นธรรมชาติ ลองเปิดใจกับคนใหม่ หรือเติมความสนุกให้ความสัมพันธ์เดิม\nการงาน: เหมาะกับการเริ่มสิ่งใหม่ ลองงานที่ไม่เคยทำ แต่อย่าลืมดูความเสี่ยงสักนิดก่อนกระโดด\nคำแนะนำ: เชื่อในการเดินทาง ทุกการเริ่มต้นต้องมีความกล้าแบบไร้เดียงสาบ้าง",
    detail_en: "Overview: The start of a new journey. An open, curious heart that steps forward without needing every answer.\nLove: Fresh, natural love. Open your heart to someone new, or bring more fun into your relationship.\nWork: Great for starting something new or trying unfamiliar work — just check the risks a little before you jump.\nAdvice: Trust the journey. Every beginning needs a bit of innocent courage.",
  },
  {
    name: "The Emperor", th: "จักรพรรดิ",
    designer: "",
    designer_url: "",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "โครงสร้าง อำนาจ และความมั่นคง",
    meaning_en: "Structure, authority, and stability",
    detail: "ภาพรวม: พลังของความเป็นผู้นำ ระเบียบวินัย และการสร้างรากฐานที่มั่นคง ถึงเวลาจัดการชีวิตให้เป็นระบบ\nความรัก: ความสัมพันธ์ที่มั่นคง มีความรับผิดชอบ แต่ระวังการควบคุมหรือความดื้อรั้นจนเกินไป\nการงาน: เหมาะกับการวางแผน จัดโครงสร้าง และรับบทบาทผู้นำ อาจได้รับการสนับสนุนจากผู้มีอำนาจ\nคำแนะนำ: ตั้งกฎและเป้าหมายให้ชัด แล้วทำตามอย่างมีวินัย ความมั่นคงจะเกิดจากความสม่ำเสมอ",
    detail_en: "Overview: The energy of leadership, discipline, and building a strong foundation. Time to bring order to your life.\nLove: A stable, responsible relationship — but watch out for being too controlling or stubborn.\nWork: Good for planning, building structure, and taking the lead. Support may come from people in power.\nAdvice: Set clear rules and goals, then follow them with discipline. Stability comes from consistency.",
  },
  {
    name: "The Hierophant", th: "ผู้นำศาสนา",
    designer: "",
    designer_url: "",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "ประเพณี ความเชื่อ และการเรียนรู้จากผู้รู้",
    meaning_en: "Tradition, belief, and learning from a mentor",
    detail: "ภาพรวม: ไพ่แห่งการเรียนรู้ ประเพณี และคุณค่าที่ส่งต่อกันมา อาจมีครูหรือผู้รู้เข้ามาชี้ทาง\nความรัก: ความสัมพันธ์ที่จริงจัง มีพิธีการหรือคำมั่นสัญญา ครอบครัวอาจมีบทบาทในการตัดสินใจ\nการงาน: ทำตามระบบและขั้นตอนที่พิสูจน์แล้วว่าได้ผล เหมาะกับการเรียนต่อ อบรม หรือหาพี่เลี้ยง\nคำแนะนำ: เรียนรู้จากผู้ที่เดินมาก่อน แต่ก็อย่าลืมถามตัวเองว่าความเชื่อไหนเป็นของเราจริงๆ",
    detail_en: "Overview: A card of learning, tradition, and values passed down. A teacher or mentor may appear to guide you.\nLove: A serious relationship, with commitment or ceremony. Family may play a role in your decisions.\nWork: Follow proven systems and steps. Good for further study, training, or finding a mentor.\nAdvice: Learn from those who walked before you, but also ask which beliefs are truly your own.",
  },
  {
    name: "The Lovers", th: "คู่รัก",
    designer: "",
    designer_url: "",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "ความรัก การเลือก และความสอดคล้องของคุณค่า",
    meaning_en: "Love, choices, and shared values",
    detail: "ภาพรวม: ไพ่แห่งความรักและการเลือก การตัดสินใจที่ต้องฟังทั้งหัวใจและคุณค่าที่เรายึดถือ\nความรัก: ความสัมพันธ์ที่ลึกซึ้ง เข้าใจกัน และดึงดูดกันอย่างแรง อาจต้องเลือกระหว่างทางสองทาง\nการงาน: ความร่วมมือหรือหุ้นส่วนที่ลงตัว เลือกงานที่ตรงกับคุณค่าของตัวเอง ไม่ใช่แค่สิ่งที่ง่ายที่สุด\nคำแนะนำ: ซื่อตรงกับหัวใจตัวเอง การเลือกที่ดีที่สุดคือการเลือกที่ทำให้เราเป็นตัวเองได้เต็มที่",
    detail_en: "Overview: A card of love and choice — a decision that needs both your heart and your values.\nLove: A deep connection with strong attraction and understanding. You may need to choose between two paths.\nWork: A well-matched partnership. Choose work that fits your values, not just the easiest option.\nAdvice: Be honest with your heart. The best choice is the one that lets you be fully yourself.",
  },
  {
    name: "The Chariot", th: "รถศึก",
    designer: "",
    designer_url: "",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "ชัยชนะ ความมุ่งมั่น และการควบคุมทิศทาง",
    meaning_en: "Victory, determination, and steering your direction",
    detail: "ภาพรวม: พลังแห่งความมุ่งมั่นและชัยชนะ คุณกำลังขับเคลื่อนชีวิตไปข้างหน้าด้วยแรงใจของตัวเอง\nความรัก: ต้องการความชัดเจนและความพยายามจากทั้งสองฝ่าย อาจมีการเดินทางหรือก้าวข้ามอุปสรรคไปด้วยกัน\nการงาน: เป้าหมายใกล้ความจริง ถ้าโฟกัสและควบคุมทิศทางได้ดี อาจมีการเดินทางหรือการเลื่อนตำแหน่ง\nคำแนะนำ: ตั้งเป้าให้ชัด จับบังเหียนให้มั่น แล้วอย่าให้ความวอกแวกดึงคุณออกนอกเส้นทาง",
    detail_en: "Overview: The energy of determination and victory. You are driving your life forward with your own willpower.\nLove: It needs clarity and effort from both sides. You may travel together or overcome obstacles as a team.\nWork: Your goal is close, if you stay focused and in control. Travel or a promotion is possible.\nAdvice: Set a clear goal, hold the reins firmly, and don't let distractions pull you off the road.",
  },
  {
    name: "The Hanged Man", th: "ชายแขวนเท้า",
    designer: "",
    designer_url: "",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "การหยุดพัก มุมมองใหม่ และการปล่อยวาง",
    meaning_en: "A pause, a new perspective, and letting go",
    detail: "ภาพรวม: บางครั้งการหยุดก็คือการไปข้างหน้า ลองมองโลกกลับหัวดูบ้าง แล้วจะเห็นสิ่งที่ไม่เคยเห็น\nความรัก: ความสัมพันธ์อาจรู้สึกค้างๆ ไม่ไปไหน ใช้ช่วงนี้ทำความเข้าใจตัวเองและอีกฝ่ายให้มากขึ้น\nการงาน: งานอาจล่าช้า แต่เป็นโอกาสดีที่จะทบทวนวิธีคิด เปลี่ยนมุมมอง หรือเสียสละบางอย่างเพื่อเป้าหมายที่ใหญ่กว่า\nคำแนะนำ: ปล่อยวางความอยากควบคุม ยอมรับช่วงรอ แล้วคำตอบจะมาในมุมที่คาดไม่ถึง",
    detail_en: "Overview: Sometimes stopping is a way of moving forward. Look at the world upside down, and you'll see what you never saw before.\nLove: The relationship may feel stuck. Use this time to understand yourself and the other person better.\nWork: Things may be delayed, but it's a good time to rethink, change your view, or give something up for a bigger goal.\nAdvice: Let go of the need to control. Accept the waiting, and the answer will come from an unexpected angle.",
  },
  {
    name: "The Devil", th: "ปีศาจ",
    designer: "",
    designer_url: "",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "พันธนาการ ความยึดติด และสิ่งที่ผูกมัดเราไว้",
    meaning_en: "Chains, attachment, and what binds us",
    detail: "ภาพรวม: ไพ่ที่ชวนให้มองโซ่ที่ผูกเราไว้ ทั้งนิสัย ความกลัว หรือความอยาก ข่าวดีคือโซ่นั้นมักหลวมพอให้เราถอดออกเองได้\nความรัก: ความดึงดูดที่แรงมาก แต่ระวังความหึงหวง ความยึดติด หรือความสัมพันธ์ที่ไม่ดีต่อใจ\nการงาน: ระวังการทำงานหนักเกินไปเพราะเงินหรือความกลัว และระวังการใช้จ่ายตามอารมณ์\nคำแนะนำ: ซื่อตรงกับตัวเองว่าอะไรกำลังควบคุมคุณอยู่ แล้วค่อยๆ ดึงพลังของตัวเองกลับมา",
    detail_en: "Overview: This card asks you to look at the chains that hold you — habits, fears, or desires. The good news: the chains are often loose enough to take off yourself.\nLove: Very strong attraction, but watch out for jealousy, attachment, or a relationship that isn't good for your heart.\nWork: Be careful of overworking out of fear or for money, and of emotional spending.\nAdvice: Be honest about what is controlling you, then slowly take your power back.",
  },
  {
    name: "The Tower", th: "หอคอย",
    designer: "",
    designer_url: "",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "การพังทลายอย่างฉับพลัน และความจริงที่ปรากฏ",
    meaning_en: "Sudden collapse and a truth revealed",
    detail: "ภาพรวม: สิ่งที่สร้างบนฐานไม่มั่นคงกำลังพังลงอย่างฉับพลัน อาจตกใจ แต่ความจริงที่เผยออกมาจะทำให้เราสร้างใหม่ได้แข็งแรงกว่าเดิม\nความรัก: อาจมีเรื่องที่ทำให้ความสัมพันธ์สั่นคลอน หรือความจริงบางอย่างถูกเปิดเผย สิ่งที่ไม่ใช่จะหลุดออกไปเอง\nการงาน: การเปลี่ยนแปลงไม่คาดคิด แผนอาจต้องรื้อใหม่ ตั้งสติและมองหาโอกาสในความวุ่นวาย\nคำแนะนำ: อย่ายื้อสิ่งที่กำลังพัง ปล่อยให้มันพัง แล้วสร้างใหม่บนความจริง",
    detail_en: "Overview: Something built on a weak base is suddenly falling. It may be a shock, but the truth that comes out lets you rebuild stronger.\nLove: Something may shake the relationship, or a truth comes to light. What isn't right will fall away.\nWork: Unexpected change — plans may need rebuilding. Stay calm and look for the opportunity in the chaos.\nAdvice: Don't hold up what's falling. Let it fall, and rebuild on the truth.",
  },
  {
    name: "The Star", th: "ดวงดาว",
    designer: "",
    designer_url: "",   // ลิงก์เฟซบุ๊กของนักวาด เช่น "https://www.facebook.com/xxxx" (ว่าง = ไม่มีลิงก์)
    meaning: "ความหวัง การเยียวยา และแรงบันดาลใจ",
    meaning_en: "Hope, healing, and inspiration",
    detail: "ภาพรวม: หลังพายุผ่านไป ดวงดาวส่องแสงอีกครั้ง ไพ่แห่งความหวัง การเยียวยา และศรัทธาในอนาคต\nความรัก: หัวใจกำลังฟื้นตัว ความรักที่อ่อนโยนและจริงใจกำลังมา หรือความสัมพันธ์เดิมได้เยียวยากัน\nการงาน: แรงบันดาลใจกลับมา เหมาะกับงานสร้างสรรค์และการตั้งเป้าหมายระยะยาว สิ่งที่หวังมีโอกาสเป็นจริง\nคำแนะนำ: เชื่อว่าสิ่งดีๆ กำลังมา ดูแลใจตัวเอง แล้วปล่อยให้แสงของคุณส่องออกไป",
    detail_en: "Overview: After the storm, the star shines again. A card of hope, healing, and faith in the future.\nLove: Your heart is healing. Gentle, sincere love is coming, or an existing relationship heals.\nWork: Inspiration returns. Great for creative work and long-term goals — your hopes can come true.\nAdvice: Believe good things are coming. Take care of your heart, and let your light shine.",
  },
];
