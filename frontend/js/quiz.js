// Thai display labels for each option value
const LABELS = {
  genre: { RPG: 'RPG', FPS: 'ยิงปืน (FPS)', Puzzle: 'ไขปริศนา', Strategy: 'วางแผน', Simulation: 'จำลองชีวิต', Sports: 'กีฬา', Racing: 'แข่งรถ', Horror: 'สยองขวัญ', Adventure: 'ผจญภัย', Fighting: 'ต่อสู้', Sandbox: 'สร้างโลกอิสระ' },
  mood: { Relaxing: 'ผ่อนคลาย', Competitive: 'แข่งขัน', StoryDriven: 'เน้นเนื้อเรื่อง', Casual: 'เล่นง่ายสบายๆ', Hardcore: 'ท้าทายจัดเต็ม' },
  multiplayer: { Solo: 'เล่นคนเดียว', Coop: 'เล่นร่วมมือ (Co-op)', PvP: 'แข่งกับผู้เล่นอื่น (PvP)', Any: 'ไม่จำกัด' },
  platform: { PC: 'PC', PlayStation: 'PlayStation', Xbox: 'Xbox', Switch: 'Nintendo Switch', Mobile: 'มือถือ' },
  sessionLength: { Short: 'สั้นๆ ไม่กี่นาที', Long: 'ยาวๆ เป็นชั่วโมง' },
  difficulty: { Easy: 'ง่าย', Medium: 'ปานกลาง', Hard: 'ยาก', Any: 'ไม่จำกัด' },
  graphics: { Realistic: 'สมจริง', Pixel: 'พิกเซล/เรโทร', Cartoon: 'การ์ตูน', Anime: 'อนิเมะ', Any: 'ไม่จำกัด' },
  price: { Free: 'ฟรี', Paid: 'เสียเงิน', Any: 'ไม่จำกัด' },
};

const STEP_CONFIG = [
  { key: 'genre', title: 'คุณชอบเกมแนวไหน?', desc: 'เลือกได้มากกว่า 1 ข้อ', multi: true },
  { key: 'mood', title: 'อารมณ์การเล่นที่คุณต้องการ?', desc: 'เลือก 1 ข้อ', multi: false },
  { key: 'multiplayer', title: 'อยากเล่นคนเดียวหรือกับคนอื่น?', desc: 'เลือก 1 ข้อ', multi: false },
  { key: 'platform', title: 'คุณมีแพลตฟอร์มอะไรบ้าง?', desc: 'เลือกได้มากกว่า 1 ข้อ', multi: true },
  { key: 'sessionLength', title: 'ปกติเล่นเกมครั้งละนานแค่ไหน?', desc: 'เลือก 1 ข้อ', multi: false },
  { key: 'difficulty', title: 'ความยากที่คุณชอบ?', desc: 'เลือก 1 ข้อ', multi: false },
  { key: 'graphics', title: 'สไตล์กราฟิกที่ชอบ?', desc: 'เลือก 1 ข้อ', multi: false },
  { key: 'price', title: 'งบประมาณ?', desc: 'เลือก 1 ข้อ', multi: false },
];

let currentStep = 0;
const answers = {};

const quizBody = document.getElementById('quiz-body');
const progressBar = document.getElementById('progress-bar');
const nextBtn = document.getElementById('next-btn');
const backBtn = document.getElementById('back-btn');

function renderStep() {
  const step = STEP_CONFIG[currentStep];
  progressBar.style.width = `${(currentStep / STEP_CONFIG.length) * 100}%`;
  backBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
  nextBtn.textContent = currentStep === STEP_CONFIG.length - 1 ? 'ดูผลลัพธ์' : 'ถัดไป';

  const options = Object.keys(LABELS[step.key]);
  const selected = answers[step.key];
  const selectedSet = new Set(step.multi ? (selected || []) : selected ? [selected] : []);

  quizBody.innerHTML = `
    <h2>${step.title}</h2>
    <p class="subtitle">${step.desc}</p>
    <div class="options-grid">
      ${options.map((opt) => `
        <div class="option-chip ${selectedSet.has(opt) ? 'selected' : ''}" data-value="${opt}">
          ${LABELS[step.key][opt]}
        </div>
      `).join('')}
    </div>
  `;

  quizBody.querySelectorAll('.option-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const value = chip.dataset.value;
      if (step.multi) {
        const arr = answers[step.key] || [];
        const idx = arr.indexOf(value);
        if (idx === -1) arr.push(value); else arr.splice(idx, 1);
        answers[step.key] = arr;
      } else {
        answers[step.key] = value;
      }
      renderStep();
    });
  });
}

async function submitQuiz() {
  quizBody.innerHTML = '<p class="center">กำลังค้นหาเกมที่เข้ากับคุณ...</p>';
  nextBtn.disabled = true;
  backBtn.style.visibility = 'hidden';

  try {
    const token = getToken();
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(answers),
    });
    const data = await res.json();
    sessionStorage.setItem('gm_results', JSON.stringify(data.results));
    window.location.href = '/result.html';
  } catch (err) {
    quizBody.innerHTML = `<div class="alert alert-error">เกิดข้อผิดพลาด: ${err.message}</div>`;
    nextBtn.disabled = false;
  }
}

nextBtn.addEventListener('click', () => {
  if (currentStep < STEP_CONFIG.length - 1) {
    currentStep += 1;
    renderStep();
  } else {
    submitQuiz();
  }
});

backBtn.addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep -= 1;
    renderStep();
  }
});

renderStep();
