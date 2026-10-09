const QUESTIONS = [
  {
    key: 'genre',
    shortLabel: '1. แนวเกม',
    title: '1. วันนี้อยากเล่นเกมแนวไหน?',
    subtitle: 'เลือกได้มากกว่า 1 แนว เพื่อให้ระบบค้นหาเกมจาก Steam ที่ตรงใจที่สุด',
    multi: true,
    required: true,
    options: [
      { value: 'RPG', icon: '⚔️', label: 'RPG / สวมบทบาท', desc: 'อัปเลเวล ปั้นตัวละคร ตะลุยดันเจี้ยน' },
      { value: 'FPS', icon: '🔫', label: 'FPS / ยิงปืน', desc: 'เกมยิงปืนแอ็กชันสุดมันส์' },
      { value: 'Adventure', icon: '🗺️', label: 'Adventure / ผจญภัย', desc: 'ออกสำรวจโลกกว้าง เนื้อเรื่องน่าติดตาม' },
      { value: 'Simulation', icon: '🏡', label: 'Simulation / จำลองชีวิต', desc: 'ทำฟาร์ม สร้างเมือง บริหารจัดการ' },
      { value: 'Strategy', icon: '♟️', label: 'Strategy / วางแผนการรบ', desc: 'ชิงไหวชิงพริบ วางกลยุทธ์ MOBA / RTS' },
      { value: 'Sandbox', icon: '🧱', label: 'Sandbox / เอาชีวิตรอด', desc: 'สร้างบ้าน คราฟต์ของ อิสระไร้ขีดจำกัด' },
      { value: 'Sports', icon: '⚽', label: 'Sports / กีฬา', desc: 'ฟุตบอล บาสเกตบอล กอล์ฟ สเก็ตบอร์ด' },
      { value: 'Racing', icon: '🏎️', label: 'Racing / แข่งรถ', desc: 'ซิ่งรถความเร็วสูง ดริฟต์ แรลลี่' },
      { value: 'Horror', icon: '👻', label: 'Horror / สยองขวัญ', desc: 'ลุ้นระทึก หลอน สั่นประสาท' },
      { value: 'Fighting', icon: '🥊', label: 'Fighting / ต่อสู้', desc: 'ดวลหมัด คอมโบสุดเดือด' },
      { value: 'Puzzle', icon: '🧩', label: 'Puzzle / แก้ปริศนา', desc: 'ฝึกสมอง ไขความลับ ลับคมความคิด' },
    ],
  },
  {
    key: 'mood',
    shortLabel: '2. อารมณ์',
    title: '2. อารมณ์และความท้าทายที่คุณต้องการ?',
    subtitle: 'เลือกบรรยากาศหลักในการเล่นเกมครั้งนี้',
    multi: false,
    options: [
      { value: 'Relaxing', icon: '🌿', label: 'ผ่อนคลาย สบายๆ (Relaxing)', desc: 'เล่นชิลล์ๆ ไม่กดดัน ฮีลใจหลังเลิกเรียน/ทำงาน' },
      { value: 'Competitive', icon: '🔥', label: 'แข่งขัน ชิงชัย (Competitive)', desc: 'วัดฝีมือ ไต่แรงค์ ลุ้นทุกวินาที' },
      { value: 'StoryDriven', icon: '📖', label: 'เน้นเนื้อเรื่องเข้มข้น (Story-Driven)', desc: 'เนื้อเรื่องทรงพลัง เหมือนดูหนังชั้นดี' },
      { value: 'Casual', icon: '🎈', label: 'เล่นง่าย เพลินๆ (Casual)', desc: 'เข้าใจง่าย ไม่ซับซ้อน หยิบมาเล่นได้ทันที' },
      { value: 'Hardcore', icon: '💀', label: 'ยากท้าทายฝีมือ (Hardcore)', desc: 'โหดหิน ตายเกิดใหม่สำหรับสายฮาร์ดคอร์' },
      { value: 'Any', icon: '✨', label: 'อารมณ์ไหนก็ได้', desc: 'เปิดรับทุกบรรยากาศ' },
    ],
  },
  {
    key: 'theme',
    shortLabel: '3. ธีมโลก',
    title: '3. ชอบธีมหรือโลกของเกมแบบไหน?',
    subtitle: 'เลือกได้มากกว่า 1 ธีม เพื่อกำหนดเซ็ตติ้งของเกม',
    multi: true,
    options: [
      { value: 'Fantasy', icon: '🐉', label: 'แฟนตาซี / เวทมนตร์', desc: 'อัศวิน มังกร ดินแดนเหนือจินตนาการ' },
      { value: 'SciFi', icon: '🚀', label: 'ไซไฟ / อวกาศ', desc: 'เทคโนโลยีอนาคต หุ่นยนต์ ดวงดาว' },
      { value: 'Modern', icon: '🏙️', label: 'ยุคปัจจุบัน / สมจริง', desc: 'เมืองยุคปัจจุบัน การทหาร กีฬาจริง' },
      { value: 'Zombie', icon: '🧟', label: 'ซอมบี้ / วันสิ้นโลก', desc: 'เอาตัวรอดท่ามกลางวิกฤตไวรัสระบาด' },
      { value: 'Cyberpunk', icon: '🦾', label: 'ไซเบอร์พังก์ (Cyberpunk)', desc: 'เมืองไฟนีออน แฮกเกอร์ โลกอนาคต' },
      { value: 'Medieval', icon: '🏰', label: 'ยุคกลาง / ประวัติศาสตร์', desc: 'สงครามดาบ ปราสาท ยุคโบราณ' },
      { value: 'Any', icon: '🌐', label: 'ธีมไหนก็ได้', desc: 'ไม่จำกัดเซ็ตติ้งของเกม' },
    ],
  },
  {
    key: 'multiplayer',
    shortLabel: '4. ผู้เล่น',
    title: '4. อยากเล่นคนเดียว หรือเล่นกับคนอื่น?',
    subtitle: 'คัดกรองจากโหมดผู้เล่นที่รองรับบนหน้าร้านค้า Steam โดยตรง',
    multi: false,
    options: [
      { value: 'Solo', icon: '🎧', label: 'เล่นคนเดียว (Single-player)', desc: 'ลุยเดี่ยวในโลกส่วนตัว ไม่ต้องรอใคร' },
      { value: 'Coop', icon: '🤝', label: 'ช่วยกันเล่นกับเพื่อน (Co-op)', desc: 'รวมทีมช่วยกันทำภารกิจกับเพื่อน' },
      { value: 'PvP', icon: '⚔️', label: 'สู้กับผู้เล่นอื่น (PvP / Online)', desc: 'ดวลฝีมือกับผู้เล่นออนไลน์ทั่วโลก' },
      { value: 'Any', icon: '🌟', label: 'ได้ทั้งหมด', desc: 'เล่นคนเดียวก็ได้ เล่นกับเพื่อนก็ดี' },
    ],
  },
  {
    key: 'graphics',
    shortLabel: '5. กราฟิก',
    title: '5. ชอบงานภาพกราฟิกสไตล์ไหน?',
    subtitle: 'เลือกรูปแบบศิลปะของเกมที่ถูกจริตคุณ',
    multi: false,
    options: [
      { value: 'Realistic', icon: '📸', label: 'สมจริง (Realistic)', desc: 'กราฟิกคมชัด แสงเงาสมจริง' },
      { value: 'Anime', icon: '🌸', label: 'อนิเมะ (Anime / JRPG)', desc: 'ลายเส้นการ์ตูนญี่ปุ่นสีสันสดใส' },
      { value: 'Cartoon', icon: '🎨', label: 'การ์ตูนมีสไตล์ (Stylized)', desc: 'ภาพอาร์ตเอกลักษณ์เฉพาะตัว ดูสบายตา' },
      { value: 'Pixel', icon: '👾', label: 'พิกเซลคลาสสิก (Pixel Art)', desc: 'เสน่ห์ยุคเรโทร 2D พิกเซลสุดประณีต' },
      { value: 'Any', icon: '🌈', label: 'ภาพแบบไหนก็ได้', desc: 'เน้นเกมเพลย์เป็นหลัก' },
    ],
  },
  {
    key: 'priceRange',
    shortLabel: '6. งบราคา',
    title: '6. ตั้งงบประมาณราคาเกมไว้เท่าไหร่?',
    subtitle: 'เลือกปุ่มด่วนด้านล่าง หรือเลื่อนแถบกำหนดงบสูงสุด (บาท) เองได้เลย',
    multi: false,
    hasPriceSlider: true,
    options: [
      { value: 'Free', icon: '🎁', label: 'เล่นฟรีเท่านั้น (0 บาท)', desc: 'เกม Free-to-Play โหลดเล่นได้เลยไม่ต้องเสียเงิน', maxTHB: 0 },
      { value: 'Under350', icon: '🪙', label: 'สายประหยัด (ไม่เกิน 350 บาท)', desc: 'รวมเกมฟรีและเกมอินดี้ราคาย่อมเยา', maxTHB: 350 },
      { value: 'Under800', icon: '💵', label: 'งบปานกลาง (ไม่เกิน 800 บาท)', desc: 'ครอบคลุมเกมฮิตส่วนใหญ่ในราคาสบายกระเป๋า', maxTHB: 800 },
      { value: 'PaidAll', icon: '💎', label: 'เกมซื้อขาดพรีเมียมเท่านั้น', desc: 'คัดเฉพาะเกมซื้อขาดคุณภาพสูง (ตัดเกมฟรีออก)', maxTHB: 2500 },
      { value: 'Any', icon: '💰', label: 'ราคาไหนก็ได้ทั้งหมด', desc: 'ดูทั้งเกมฟรีและเกมเสียเงินทุกระดับราคา', maxTHB: 2500 },
    ],
  },
  {
    key: 'yearRange',
    shortLabel: '7. ปีที่ขาย',
    title: '7. อยากเล่นเกมที่วางจำหน่ายในช่วงปีไหน?',
    subtitle: 'เลือกยุคของเกม หรือเลื่อนแถบกำหนดปีเก่าสุดที่ยอมรับได้',
    multi: false,
    hasYearSlider: true,
    options: [
      { value: 'New_2023_Now', icon: '🚀', label: 'เกมยุคใหม่ล่าสุด (2023 – ปัจจุบัน)', desc: 'กราฟิกและระบบเกมเพลย์สดใหม่ทันสมัย', minYear: 2023 },
      { value: 'Modern_2018_2022', icon: '🌟', label: 'ยุคฮิตติดลมบน (2018 – 2022)', desc: 'เกมดังที่อัปเดตเนื้อหาและระบบจนสมบูรณ์แล้ว', minYear: 2018 },
      { value: 'Classic_Before_2018', icon: '🏛️', label: 'เกมระดับตำนาน (ก่อนปี 2018)', desc: 'เกมขึ้นหิ้งตลอดกาล สเปกคอมไม่แรงก็เล่นลื่น', minYear: 2000 },
      { value: 'Any', icon: '📅', label: 'วางขายปีไหนก็ได้', desc: 'ขอแค่เกมสนุก ไม่จำกัดปีที่เปิดตัว', minYear: 2000 },
    ],
  },
  {
    key: 'priorityField',
    shortLabel: '8. จุดเน้นพิเศษ',
    title: '8. อยากให้เน้นข้อไหนเป็นพิเศษ หรือมีคำค้นเฉพาะไหม?',
    subtitle: 'หมวดที่คุณเลือกจะได้รับคะแนนความสำคัญเพิ่มขึ้น 2 เท่า!',
    multi: false,
    hasCustomKeyword: true,
    options: [
      { value: 'genre', icon: '🎯', label: 'เน้น "แนวเกม" ต้องเป๊ะที่สุด', desc: 'ให้น้ำหนักแนวเกมที่เลือกเป็นอันดับ 1' },
      { value: 'multiplayer', icon: '🤝', label: 'เน้น "โหมดผู้เล่น" (ลุยเดี่ยว / เล่นกับเพื่อน)', desc: 'ให้ความสำคัญกับรูปแบบผู้เล่นมากที่สุด' },
      { value: 'theme', icon: '🌌', label: 'เน้น "ธีมและบรรยากาศโลกของเกม"', desc: 'เซ็ตติ้งของโลกในเกมต้องตรงใจที่สุด' },
      { value: 'graphics', icon: '🎨', label: 'เน้น "สไตล์ภาพกราฟิก"', desc: 'งานภาพต้องตรงกับที่เลือกไว้' },
      { value: 'Any', icon: '⚖️', label: 'ให้น้ำหนักทุกข้อสมดุลกัน', desc: 'คำนวณคะแนนตามสัดส่วนมาตรฐาน' },
    ],
  },
];

let currentStep = 0;
const answers = {
  platform: ['PC'],
  maxPriceTHB: null,
  minYear: null,
  customKeyword: '',
  priorityField: 'Any',
};

const quizBody = document.getElementById('quiz-body');
const progressBar = document.getElementById('progress-bar');
const stepIndicator = document.getElementById('step-indicator');
const stepPillsEl = document.getElementById('step-pills');
const summaryBar = document.getElementById('summary-bar');
const backBtn = document.getElementById('back-btn');
const nextBtn = document.getElementById('next-btn');
const skipBtn = document.getElementById('skip-btn');
const surpriseBtn = document.getElementById('surprise-btn');
const resetBtn = document.getElementById('reset-btn');
const quizActions = document.getElementById('quiz-actions');

function isStepAnswered(q) {
  const val = answers[q.key];
  if (Array.isArray(val)) return val.length > 0;
  return Boolean(val);
}

function renderStepPills() {
  if (!stepPillsEl) return;
  stepPillsEl.innerHTML = QUESTIONS.map((q, idx) => {
    const activeClass = idx === currentStep ? 'active' : '';
    const doneClass = idx !== currentStep && isStepAnswered(q) ? 'done' : '';
    return `<button type="button" class="step-pill ${activeClass} ${doneClass}" data-step="${idx}">
      ${isStepAnswered(q) ? '✓ ' : ''}${q.shortLabel}
    </button>`;
  }).join('');

  stepPillsEl.querySelectorAll('.step-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetStep = parseInt(btn.dataset.step, 10);
      if (targetStep > 0 && (!answers.genre || !answers.genre.length)) {
        alert('กรุณาเลือกแนวเกมในข้อที่ 1 อย่างน้อย 1 แนวก่อนครับ');
        return;
      }
      currentStep = targetStep;
      renderStep();
    });
  });
}

function renderSummary() {
  const chips = [];
  if (answers.genre?.length) chips.push(`🎮 แนว: ${answers.genre.join(', ')}`);
  if (answers.mood && answers.mood !== 'Any') chips.push(`🎭 อารมณ์: ${answers.mood}`);
  if (answers.theme?.length && !answers.theme.includes('Any')) chips.push(`✨ ธีม: ${answers.theme.join(', ')}`);
  if (answers.multiplayer && answers.multiplayer !== 'Any') chips.push(`👥 โหมด: ${answers.multiplayer}`);
  if (answers.graphics && answers.graphics !== 'Any') chips.push(`🎨 ภาพ: ${answers.graphics}`);
  if (typeof answers.maxPriceTHB === 'number') {
    chips.push(`💰 งบไม่เกิน: ${answers.maxPriceTHB === 0 ? 'ฟรี (0฿)' : '฿' + answers.maxPriceTHB}`);
  } else if (answers.priceRange && answers.priceRange !== 'Any') {
    chips.push(`💰 งบ: ${answers.priceRange}`);
  }
  if (typeof answers.minYear === 'number') {
    chips.push(`📅 ปี: ${answers.minYear}+`);
  } else if (answers.yearRange && answers.yearRange !== 'Any') {
    chips.push(`📅 ปี: ${answers.yearRange}`);
  }
  if (answers.customKeyword?.trim()) {
    chips.push(`🔍 คำค้น: "${answers.customKeyword.trim()}"`);
  }

  if (!chips.length) {
    summaryBar.style.display = 'none';
    return;
  }
  summaryBar.style.display = 'flex';
  summaryBar.innerHTML = chips.map((c) => `<span class="summary-chip">${c}</span>`).join('');
}

function renderStep() {
  const q = QUESTIONS[currentStep];
  const pct = Math.round(((currentStep + 1) / QUESTIONS.length) * 100);
  progressBar.style.width = `${pct}%`;
  stepIndicator.textContent = `คำถามที่ ${currentStep + 1} / ${QUESTIONS.length}`;

  renderStepPills();

  const currentVal = answers[q.key];
  const selectedList = Array.isArray(currentVal) ? currentVal : (currentVal ? [currentVal] : []);

  let extraHtml = '';
  if (q.hasPriceSlider) {
    const sliderVal = typeof answers.maxPriceTHB === 'number' ? answers.maxPriceTHB : 2500;
    const labelText = sliderVal === 0
      ? 'เล่นฟรีเท่านั้น (0 บาท)'
      : (sliderVal >= 2500 ? 'ไม่จำกัดงบประมาณ (แสดงทุกราคา)' : `ไม่เกิน ฿${sliderVal.toLocaleString()} บาท`);

    extraHtml = `
      <div class="slider-panel">
        <div class="slider-header">
          <span style="font-weight:500; font-size:0.9rem;">🎚️ หรือเลื่อนกำหนดงบสูงสุดด้วยตัวเอง:</span>
          <span id="price-slider-label" class="slider-val-badge">${labelText}</span>
        </div>
        <input type="range" id="price-slider" class="range-input" min="0" max="2500" step="50" value="${sliderVal}" />
        <div class="slider-ticks">
          <span>ฟรี (0฿)</span>
          <span>฿500</span>
          <span>฿1,000</span>
          <span>฿1,500</span>
          <span>฿2,000</span>
          <span>ไม่จำกัดงบ</span>
        </div>
      </div>
    `;
  }

  if (q.hasYearSlider) {
    const minYearVal = typeof answers.minYear === 'number' ? answers.minYear : 2000;
    const yearText = minYearVal <= 2000 ? 'ทุกปี (ตั้งแต่ปี 2000 – ปัจจุบัน)' : `เกมที่วางขายตั้งแต่ปี ค.ศ. ${minYearVal} เป็นต้นไป`;

    extraHtml = `
      <div class="slider-panel">
        <div class="slider-header">
          <span style="font-weight:500; font-size:0.9rem;">🎚️ หรือเลื่อนกำหนดปีเก่าสุดที่อยากเล่น:</span>
          <span id="year-slider-label" class="slider-val-badge">${yearText}</span>
        </div>
        <input type="range" id="year-slider" class="range-input" min="2000" max="2026" step="1" value="${minYearVal}" />
        <div class="slider-ticks">
          <span>2000 (ทุกยุค)</span>
          <span>2010</span>
          <span>2015</span>
          <span>2020</span>
          <span>2023</span>
          <span>2026</span>
        </div>
      </div>
    `;
  }

  if (q.hasCustomKeyword) {
    const kwVal = answers.customKeyword || '';
    const sampleTags = ['Souls-like', 'Cozy Farming', 'Survival Crafting', 'Parkour', 'Detective', 'Card Battler', 'Roguelike', 'Base Building'];
    extraHtml = `
      <div class="custom-input-box">
        <label style="font-weight:600; font-size:0.92rem;">🔍 ระบุคำค้นพิเศษ / สไตล์เกม หรือชื่อเกมที่อยากได้แนวเดียวกัน (ไม่บังคับ):</label>
        <input type="text" id="custom-kw-input" placeholder="เช่น Souls-like, ทำฟาร์ม, สร้างฐาน, Cyberpunk, Stardew..." value="${kwVal.replace(/"/g, '&quot;')}" />
        <div class="quick-kw-row">
          <span style="font-size:0.75rem; color:var(--text-dim); align-self:center;">คำยอดฮิต:</span>
          ${sampleTags.map((t) => `<button type="button" class="kw-chip" data-kw="${t.trim()}">+ ${t.trim()}</button>`).join('')}
        </div>
      </div>
    `;
  }

  quizBody.innerHTML = `
    <h2 class="quiz-question-title">${q.title}</h2>
    <p class="quiz-question-sub">${q.subtitle}</p>
    ${extraHtml}
    <div class="option-grid">
      ${q.options.map((opt) => {
        const isSelected = selectedList.includes(opt.value);
        return `
          <button type="button" class="option-card ${isSelected ? 'selected' : ''}" data-val="${opt.value}">
            <span class="option-check">✓</span>
            <span class="option-icon">${opt.icon}</span>
            <span>
              <span class="option-title">${opt.label}</span>
              <span class="option-desc">${opt.desc}</span>
            </span>
          </button>
        `;
      }).join('')}
    </div>
  `;

  const priceSlider = document.getElementById('price-slider');
  if (priceSlider) {
    priceSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      answers.maxPriceTHB = val >= 2500 ? null : val;
      answers.priceRange = val === 0 ? 'Free' : (val >= 2500 ? 'Any' : 'Custom');
      const labelEl = document.getElementById('price-slider-label');
      if (labelEl) {
        labelEl.textContent = val === 0
          ? 'เล่นฟรีเท่านั้น (0 บาท)'
          : (val >= 2500 ? 'ไม่จำกัดงบประมาณ (แสดงทุกราคา)' : `ไม่เกิน ฿${val.toLocaleString()} บาท`);
      }
      renderSummary();
    });
  }

  const yearSlider = document.getElementById('year-slider');
  if (yearSlider) {
    yearSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      answers.minYear = val <= 2000 ? null : val;
      answers.yearRange = val <= 2000 ? 'Any' : 'Custom';
      const labelEl = document.getElementById('year-slider-label');
      if (labelEl) {
        labelEl.textContent = val <= 2000
          ? 'ทุกปี (ตั้งแต่ปี 2000 – ปัจจุบัน)'
          : `เกมที่วางขายตั้งแต่ปี ค.ศ. ${val} เป็นต้นไป`;
      }
      renderSummary();
    });
  }

  const kwInput = document.getElementById('custom-kw-input');
  if (kwInput) {
    kwInput.addEventListener('input', (e) => {
      answers.customKeyword = e.target.value;
      renderSummary();
    });
    quizBody.querySelectorAll('.kw-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        answers.customKeyword = chip.dataset.kw;
        kwInput.value = chip.dataset.kw;
        renderSummary();
      });
    });
  }

  quizBody.querySelectorAll('.option-card').forEach((card) => {
    card.addEventListener('click', () => {
      const val = card.dataset.val;
      if (q.multi) {
        let arr = Array.isArray(answers[q.key]) ? [...answers[q.key]] : [];
        if (val === 'Any') {
          arr = ['Any'];
        } else {
          arr = arr.filter((v) => v !== 'Any');
          if (arr.includes(val)) {
            arr = arr.filter((v) => v !== val);
          } else {
            arr.push(val);
          }
        }
        answers[q.key] = arr;
        renderStep();
      } else {
        answers[q.key] = val;
        if (q.key === 'priceRange') {
          const matchedOpt = q.options.find((o) => o.value === val);
          answers.maxPriceTHB = matchedOpt && matchedOpt.maxTHB < 2500 ? matchedOpt.maxTHB : null;
        }
        if (q.key === 'yearRange') {
          const matchedOpt = q.options.find((o) => o.value === val);
          answers.minYear = matchedOpt && matchedOpt.minYear > 2000 ? matchedOpt.minYear : null;
        }
        renderStep();
        if (currentStep < QUESTIONS.length - 1) {
          setTimeout(() => {
            currentStep += 1;
            renderStep();
          }, 200);
        }
      }
    });
  });

  backBtn.disabled = currentStep === 0;
  skipBtn.style.display = q.required ? 'none' : 'inline-block';
  nextBtn.textContent = currentStep === QUESTIONS.length - 1 ? '🔍 ค้นหาเกมที่ใช่!' : 'ถัดไป →';

  renderSummary();
}

async function submitQuiz() {
  quizActions.style.display = 'none';
  surpriseBtn.style.display = 'none';
  if (resetBtn) resetBtn.style.display = 'none';
  if (stepPillsEl) stepPillsEl.style.display = 'none';
  summaryBar.style.display = 'none';

  quizBody.innerHTML = `
    <div class="loading-box">
      <div class="spinner"></div>
      <h3>กำลังค้นหาและดึงข้อมูลเกมสดจาก Steam...</h3>
      <p class="quiz-question-sub">ระบบกำลังตรวจสอบแนวเกม งบประมาณ ปีที่วางขาย และคำค้นพิเศษของคุณ</p>
    </div>
  `;

  try {
    const data = await apiRequest('/match', {
      method: 'POST',
      auth: Boolean(getCurrentUser()),
      body: answers,
    });
    sessionStorage.setItem('gm_results', JSON.stringify(data.results || []));
    window.location.href = '/result.html';
  } catch (err) {
    quizActions.style.display = 'flex';
    surpriseBtn.style.display = 'inline-block';
    if (resetBtn) resetBtn.style.display = 'inline-block';
    if (stepPillsEl) stepPillsEl.style.display = 'flex';
    renderStep();
    alert(err.message || 'เกิดข้อผิดพลาดในการจับคู่เกม');
  }
}

backBtn.addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep -= 1;
    renderStep();
  }
});

skipBtn.addEventListener('click', () => {
  const q = QUESTIONS[currentStep];
  answers[q.key] = q.multi ? [] : 'Any';
  if (currentStep < QUESTIONS.length - 1) {
    currentStep += 1;
    renderStep();
  } else {
    submitQuiz();
  }
});

nextBtn.addEventListener('click', () => {
  const q = QUESTIONS[currentStep];
  const val = answers[q.key];
  const hasAnswer = Array.isArray(val) ? val.length > 0 : Boolean(val);

  if (q.required && !hasAnswer) {
    alert('กรุณาเลือกอย่างน้อย 1 ตัวเลือกในข้อนี้ครับ');
    return;
  }

  if (currentStep < QUESTIONS.length - 1) {
    currentStep += 1;
    renderStep();
  } else {
    submitQuiz();
  }
});

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    Object.keys(answers).forEach((k) => delete answers[k]);
    answers.platform = ['PC'];
    answers.maxPriceTHB = null;
    answers.minYear = null;
    answers.customKeyword = '';
    answers.priorityField = 'Any';
    currentStep = 0;
    renderStep();
  });
}

surpriseBtn.addEventListener('click', () => {
  const allGenres = ['RPG', 'FPS', 'Adventure', 'Simulation', 'Strategy', 'Sandbox', 'Sports', 'Racing', 'Horror', 'Fighting', 'Puzzle'];
  const moods = ['Relaxing', 'Competitive', 'StoryDriven', 'Casual', 'Hardcore'];
  const themes = ['Fantasy', 'SciFi', 'Modern', 'Zombie', 'Cyberpunk', 'Medieval'];
  const priceRanges = ['Free', 'Under350', 'Under800', 'PaidAll', 'Any'];

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  answers.genre = [pick(allGenres)];
  answers.mood = pick(moods);
  answers.theme = [pick(themes)];
  answers.multiplayer = 'Any';
  answers.graphics = 'Any';
  answers.priceRange = pick(priceRanges);
  answers.yearRange = 'Any';
  answers.platform = ['PC'];

  submitQuiz();
});

renderStep();