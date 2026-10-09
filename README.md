# 🎮 GameMatch — เว็บหาเกมที่ใช่สำหรับคุณ

เว็บแอปสำหรับช่วยค้นหาเกมที่เข้ากับตัวคุณมากที่สุด โดยผู้ใช้ตอบคำถามเกี่ยวกับสไตล์และความชอบในการเล่นเกม 
แล้วระบบ **rule-based matching algorithm** จะวิเคราะห์และให้คะแนนเกมในฐานข้อมูลยอดนิยมจาก Steam (เริ่มต้น 60 เกม พร้อมระบบ Real-time Steam Search ดึงเกมเพิ่มอัตโนมัติ) 
และแสดงผลลัพธ์ 10 อันดับที่ตรงกับผู้ใช้มากที่สุด พร้อมเหตุผลประกอบ และมีระบบสมาชิก (สมัคร/ล็อกอิน/บันทึกประวัติผลลัพธ์/จัดการโปรไฟล์)

---

## 🛠️ Tech Stack
- **Backend:** Node.js + Express, JWT auth, bcrypt password hashing, JSON-file storage (ไม่ต้องติดตั้งฐานข้อมูลแยก)
- **Frontend:** HTML5 / Modern CSS / Vanilla JavaScript (ไม่ต้อง build step, โหลดเร็วทันที)
- **Matching Engine:** Rule-based scoring ถ่วงน้ำหนักตามหมวดหมู่ (แนวเกม, อารมณ์, ธีม, รูปแบบผู้เล่น, กราฟิก, ราคาเงินบาท, ปีที่วางขาย, จุดเน้นพิเศษ และ Custom Keyword)
- **Data Source:** SteamSpy API + Steam Store API (THB Currency)

---

## 📁 โครงสร้างโปรเจกต์
```
game-matcher/
├── backend/
│   ├── server.js                        # Express entrypoint (เสิร์ฟทั้ง REST API และ frontend)
│   ├── db/
│   │   └── store.js                     # จัดการข้อมูล JSON (users, matches, games)
│   ├── data/                            # ข้อมูล runtime (users.json, matches.json)
│   ├── seed/
│   │   └── games.json                   # ฐานข้อมูลเกมหลัก (60 เกมเริ่มต้นจาก Steam)
│   ├── middleware/
│   │   └── auth.js                      # JWT authentication & role-based middleware
│   ├── routes/
│   │   ├── auth.js                      # /api/register, /api/login, /api/logout, /api/change-password
│   │   ├── users.js                     # /api/me, /api/users (CRUD + pagination + check username)
│   │   └── games.js                     # /api/games, /api/match (matching engine), /api/match/history
│   ├── scripts/
│   │   └── fetch-steam-games.js         # สคริปต์ดึงและอัปเดตข้อมูลเกมจริงจาก SteamSpy & Steam Store
│   ├── package.json
│   └── .env.example
├── frontend/                            # หน้าเว็บและ UI components
│   ├── index.html                       # หน้าแรก แนะนำบริการ และรายชื่อเกมยอดนิยม
│   ├── quiz.html                        # หน้าทำแบบทดสอบหาเกม (8 ขั้นตอน พร้อม Slider)
│   ├── result.html                      # หน้าแสดงผลลัพธ์เกมที่ตรงใจ 10 อันดับแรก
│   ├── login.html                       # หน้าเข้าสู่ระบบ
│   ├── register.html                    # หน้าสมัครสมาชิก (พร้อมตรวจเช็กชื่อผู้ใช้แบบ Realtime)
│   ├── profile.html                     # หน้าโปรไฟล์ส่วนตัว และประวัติผลการค้นหาเกม
│   ├── admin.html                       # หน้าจัดการผู้ใช้สำหรับผู้ดูแลระบบ
│   ├── css/
│   │   └── style.css                    # สไตล์ CSS และ Glassmorphism Design System
│   └── js/
│       ├── api.js                       # Helper functions สำหรับเรียก API และจัดการ Session
│       └── quiz.js                      # ตรรกะคำถามแบบทดสอบและการคำนวณหน้าบ้าน
├── Dockerfile
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

### System Health
| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/health` | ตรวจสอบสถานะการทำงานของเซิร์ฟเวอร์ |

### Authentication
| Method | Endpoint | คำอธิบาย |
|---|---|---|
| POST | `/api/register` | สมัครสมาชิกใหม่ (คนแรกของระบบจะได้สิทธิ์ `admin` อัตโนมัติ) |
| POST | `/api/login` | เข้าสู่ระบบและรับ JWT Token |
| POST | `/api/logout` | ออกจากระบบ (ต้องแนบ Token) |
| POST | `/api/change-password` | เปลี่ยนรหัสผ่าน (ต้องแนบ Token) |

### User Management
| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/me` | ดึงข้อมูลโปรไฟล์ของตนเอง |
| GET | `/api/users/:id` | ดูข้อมูลผู้ใช้ตาม ID (เจ้าของบัญชี หรือ admin เท่านั้น) |
| GET | `/api/users?page=1&limit=10` | ดึงรายชื่อผู้ใช้ทั้งหมดแบบแบ่งหน้า (admin เท่านั้น) |
| PUT | `/api/users/:id` | แก้ไขข้อมูลผู้ใช้ |
| DELETE | `/api/users/:id` | ลบบัญชีผู้ใช้ |
| GET | `/api/check-username/:name` | ตรวจสอบความพร้อมใช้งานของชื่อผู้ใช้ (เรียลไทม์) |

### Games & Matching
| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/games` | ดูฐานข้อมูลเกมทั้งหมดในระบบ |
| GET | `/api/games/:id` | ดูรายละเอียดเกมรายตัว |
| GET | `/api/meta/options` | ดึงตัวเลือกคำถามและหมวดหมู่แบบทดสอบ |
| POST | `/api/match` | ส่งคำตอบแบบทดสอบ ➔ รับผลลัพธ์ 10 อันดับเกมที่ตรงกัน (ใช้ได้ทั้งแขกและสมาชิก) |
| GET | `/api/match/history` | ดูประวัติผลการทำแบบทดสอบย้อนหลัง (ต้องล็อกอิน) |

---

## 🎯 การทำงานของระบบจับคู่เกม (Matching Engine)

ระบบประมวลผลการจับคู่เกมทำงานด้วยหลักการ **Weighted Scoring & Heuristic Filtering**:

1. **ผู้ใช้ตอบคำถาม 8 ข้อ:**
   - **1. แนวเกม (Genre):** RPG, FPS, Adventure, Simulation, Strategy, Sandbox, Sports, Racing, Horror, Fighting, Puzzle (เลือกได้หลายแนว)
   - **2. อารมณ์ (Mood):** Relaxing (ชิลล์ๆ), Competitive (แข่งขัน), Story-Driven (เนื้อเรื่องเข้มข้น), Casual (เล่นง่าย), Hardcore (ท้าทายโหดหิน) หรือ Any
   - **3. ธีมโลกของเกม (Theme):** Fantasy, Sci-Fi, Modern/สมจริง, Zombie, Cyberpunk, Medieval หรือ Any
   - **4. รูปแบบผู้เล่น (Multiplayer):** Solo (เล่นคนเดียว), Coop (เล่นกับเพื่อน), PvP (แข่งออนไลน์) หรือ Any
   - **5. สไตล์ภาพกราฟิก (Graphics):** Realistic, Anime, Stylized Cartoon, Pixel Art หรือ Any
   - **6. ช่วงงบประมาณ (Price):** เล่นฟรี, สายประหยัด (≤350 บาท), งบปานกลาง (≤800 บาท), พรีเมียม หรือ **Slider กำหนดงบสูงสุดเอง (0 – 2,500 บาท)**
   - **7. ปีที่วางจำหน่าย (Release Year):** เกมใหม่ล่าสุด (2023+), ยุคฮิต (2018–2022), ระดับตำนาน (ก่อน 2018) หรือ **Slider กำหนดปีเก่าสุด**
   - **8. จุดเน้นพิเศษ & คำค้น (Priority & Custom Keyword):** เลือกหมวดที่ต้องการให้ความสำคัญพิเศษ (คะแนน x2) และช่องค้นหา Custom Keyword เจาะจง
2. **การให้คะแนน (Scoring):** แต่ละเกมในฐานข้อมูลจะถูกตรวจความตรงกันในแต่ละมิติ โดยให้น้ำหนักคะแนนต่างกัน (เช่น แนวเกมและหมวดที่เลือก Priority มีน้ำหนักสูง)
3. **Real-time Fallback Search:** หากเงื่อนไขที่เลือกเจาะจงจนผลลัพธ์ในเครื่องมีน้อยกว่า 6 เกม ระบบจะเชื่อมต่อไปยัง Steam API แบบเรียลไทม์เพื่อค้นหาและดึงเกมจริงเพิ่มเติมเข้ามาคำนวณทันที
4. **การแสดงผล:** จัดเรียงคะแนนและคำนวณร้อยละความตรงกัน (`matchPercent`) คัด 10 อันดับแรกพร้อมแสดงเหตุผลประกอบว่าตรงกับความต้องการอย่างไร
5. **บันทึกประวัติ:** หากผู้ใช้ล็อกอินอยู่ ระบบจะบันทึกประวัติผลการจับคู่ลงในโปรไฟล์ให้อัตโนมัติ

---

## 🌐 แหล่งข้อมูลเกม (Data Source): Steam

ฐานข้อมูลเกมใน `backend/seed/games.json` ดึงมาจาก **Steam** จริงผ่าน 2 API สาธารณะ:
- **[SteamSpy API](https://steamspy.com/api.php)** — ดึงรายชื่อเกมยอดนิยม, community tags, ยอดผู้เล่น
- **[Steam Store API](https://store.steampowered.com/api/appdetails)** — ดึงแนวเกมทางการ, รายละเอียดภาษาไทย/อังกฤษ, หมวดหมู่ผู้เล่น, ราคาเงินบาท (THB) และวันวางจำหน่าย

### การรันสคริปต์อัปเดตเกมจาก Steam (Optional)
หากต้องการดึงข้อมูลเกมสดใหม่จาก Steam อีกครั้ง:
```bash
cd backend
npm install
npm run seed:steam                # ดึง 60 เกมยอดนิยม (ค่าเริ่มต้น)
npm run seed:steam -- --count 100 # กำหนดจำนวนเกมเองตามต้องการ
```

---

## 🚀 วิธีการติดตั้งและรันโปรเจกต์

### วิธีที่ 1: รันแบบ Local (Node.js)

1. ตรวจสอบว่าติดตั้ง **Node.js** (v18 ขึ้นไป) เรียบร้อยแล้ว
2. เข้าโฟลเดอร์ backend แล้วติดตั้ง dependencies:
   ```bash
   cd backend
   npm install
   ```
3. สร้างไฟล์ `.env` สำหรับตั้งค่าตัวแปรสภาพแวดล้อม:
   ```bash
   # Windows PowerShell:
   Copy-Item .env.example .env

   # macOS / Linux:
   cp .env.example .env
   ```
4. เริ่มต้นเซิร์ฟเวอร์:
   ```bash
   npm start
   # หรือใช้โหมดพัฒนาที่รีสตาร์ทอัตโนมัติ:
   npm run dev
   ```
5. เปิดเบราว์เซอร์ไปที่ **http://localhost:3000**

---

### วิธีที่ 2: รันด้วย Docker

1. ติดตั้งและเปิดใช้งาน [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. สั่งรัน container:
   ```bash
   docker compose up --build
   ```
3. เปิดเบราว์เซอร์ไปที่ **http://localhost:3000**
   - ข้อมูลผู้ใช้และประวัติจะถูกจัดเก็บไว้ใน Docker volume ชื่อ `game_matcher_data`
   - ปิดการทำงาน: `docker compose down`
   - ปิดและล้างข้อมูลทั้งหมด: `docker compose down -v`

---

## ☁️ วิธีการ Deploy ขึ้น Cloud (ออนไลน์ฟรี เข้าผ่าน URL ได้จริง)

โปรเจกต์นี้ได้รับการตั้งค่าไฟล์คอนฟิกสำหรับ Cloud Platform ไว้เรียบร้อยแล้ว (`render.yaml`, `Procfile`, `package.json`, `Dockerfile`) สามารถเลือก Deploy ได้ตามช่องทางที่สะดวก:

### ทางเลือกที่ 1: Deploy บน Render.com (แนะนำ ฟรี 100%)

Render ให้บริการ Web Service ฟรี และรองรับ Node.js หรือ Docker:

1. สมัคร/ล็อกอินที่ **[Render.com](https://render.com/)** (แนะนำให้ล็อกอินด้วย GitHub)
2. นำโค้ดขึ้น GitHub Repository ของคุณ (ถ้ายังไม่ได้ push):
   ```bash
   git add .
   git commit -m "feat: add cloud deployment configurations"
   git push origin main
   ```
3. **วิธีที่ 1.1 (ผ่าน Blueprint — ง่ายที่สุด 1-Click):**
   - ในแดชบอร์ด Render คลิกปุ่ม **New +** ➔ เลือก **Blueprint**
   - เลือก GitHub Repository `game-matcher`
   - Render จะตรวจพบไฟล์ `render.yaml` อัตโนมัติ พร้อมตั้งค่า Build/Start command และสุ่ม `JWT_SECRET` ให้โดยอัตโนมัติ
   - คลิก **Apply** รอระบบ Build ประมาณ 1-2 นาที คุณจะได้ URL เว็บไซต์จริงทันที!
4. **วิธีที่ 1.2 (ผ่าน Web Service):**
   - ในแดชบอร์ด Render คลิก **New +** ➔ **Web Service**
   - เชื่อมต่อ Repository ของคุณ
   - ตั้งค่า:
     - **Runtime:** `Node`
     - **Build Command:** `npm run build`
     - **Start Command:** `npm start`
     - **Environment Variables:**
       - `NODE_ENV` = `production`
       - `JWT_SECRET` = (ใส่คีย์สุ่มยาวๆ เช่น `my-secret-key-game-matcher-2026`)
   - คลิก **Create Web Service**

---

### ทางเลือกที่ 2: Deploy บน Railway.app

1. สมัคร/ล็อกอินที่ **[Railway.app](https://railway.app/)**
2. คลิก **New Project** ➔ เลือก **Deploy from GitHub repo**
3. เลือก repository `game-matcher`
4. ไปที่แท็บ **Variables** ใน Service แล้วเพิ่ม:
   - `JWT_SECRET` = (สุ่มสตริงลับของคุณ)
   - `NODE_ENV` = `production`
5. ไปที่แท็บ **Settings** ➔ คลิก **Generate Domain** ในหัวข้อ **Networking** เพื่อรับ URL สาธารณะ

---

## 🔒 Security Best Practices
- กำหนดค่า `JWT_SECRET` ใน `.env` ให้เป็นสตริงสุ่มที่มีความปลอดภัยสูง
- รหัสผ่านผู้ใช้ผ่านการเข้ารหัสแบบแฮชด้วย `bcryptjs` (salt rounds: 10)
- รหัสผ่านจะไม่ถูกส่งกลับไปใน API Response ใดๆ
- ซ่อนไฟล์ข้อมูลผู้ใช้และ Environment ด้วย `.gitignore`
