# 🎮 GameMatch — เว็บหาเกมที่ใช่สำหรับคุณ

เว็บแอปสำหรับช่วยหาเกมที่เข้ากับตัวเอง โดยผู้ใช้ตอบคำถามเกี่ยวกับสไตล์การเล่น
แล้วระบบ **rule-based matching** จะให้คะแนนเกมในฐานข้อมูล (คัดสรรไว้ในเว็บ ~30 เกม)
และแสดงผลลัพธ์ 10 อันดับที่ตรงกับผู้ใช้มากที่สุด พร้อมมีระบบสมาชิก (สมัคร/ล็อกอิน/จัดการโปรไฟล์)

## Stack
- **Backend:** Node.js + Express, JWT auth, bcrypt password hashing, JSON-file storage (ไม่ต้องติดตั้งฐานข้อมูลแยก)
- **Frontend:** HTML/CSS/vanilla JS (ไม่ต้อง build step)
- **Matching engine:** rule-based scoring ถ่วงน้ำหนักตามหมวดหมู่ (แนวเกม, อารมณ์, ผู้เล่น, แพลตฟอร์ม, ความยาก, กราฟิก, ราคา ฯลฯ)

## โครงสร้างโปรเจกต์
```
game-matcher/
├── backend/
│   ├── server.js            # Express entrypoint (เสิร์ฟทั้ง API และ frontend)
│   ├── db/store.js          # เก็บข้อมูล user/history เป็นไฟล์ JSON
│   ├── seed/games.json      # ฐานข้อมูลเกมที่คัดสรรไว้ (read-only)
│   ├── middleware/auth.js   # JWT middleware
│   └── routes/
│       ├── auth.js          # register / login / logout / change-password
│       ├── users.js         # me / users (pagination) / update / delete / check-username
│       └── games.js         # games list / match (matching engine) / history
├── frontend/                # หน้าเว็บ (index, register, login, quiz, result, profile, admin)
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint | คำอธิบาย |
|---|---|---|
| POST | /api/register | สมัครสมาชิก |
| POST | /api/login | เข้าสู่ระบบ |
| POST | /api/logout | ออกจากระบบ (ต้องแนบ token) |
| POST | /api/change-password | เปลี่ยนรหัสผ่าน (ต้องแนบ token) |

### User Management
| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | /api/me | ดึงข้อมูลตัวเอง |
| GET | /api/users/:id | ดึงข้อมูล user (เจ้าของหรือ admin เท่านั้น) |
| GET | /api/users?page=&limit= | ดึงข้อมูล user ทั้งหมดแบบแบ่งหน้า (admin เท่านั้น) |
| PUT | /api/users/:id | แก้ไขข้อมูล user |
| DELETE | /api/users/:id | ลบ user |
| GET | /api/check-username/:name | ตรวจสอบ username ว่างไหม |

### Games / Matching
| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | /api/games | ดูฐานข้อมูลเกมทั้งหมด |
| GET | /api/games/:id | ดูรายละเอียดเกมเดียว |
| GET | /api/meta/options | ดึงตัวเลือกคำถามแบบทดสอบ |
| POST | /api/match | ส่งคำตอบแบบทดสอบ → ได้ผลลัพธ์เกมที่ตรงกัน (ใช้งานได้แม้ไม่ล็อกอิน) |
| GET | /api/match/history | ดูประวัติการทำแบบทดสอบ (ต้องล็อกอิน) |

**หมายเหตุ:** ผู้ใช้คนแรกที่สมัครสมาชิกจะได้สิทธิ์ `admin` โดยอัตโนมัติ เพื่อเข้าหน้า `/admin.html` และดู endpoint `GET /api/users` ได้

## วิธีรันแบบ Local (ผ่าน VS Code)

1. เปิดโฟลเดอร์ `game-matcher` ด้วย VS Code
2. เปิด Terminal ใน VS Code แล้วรัน:
   ```bash
   cd backend
   npm install
   cp .env.example .env    # แล้วแก้ JWT_SECRET ตามต้องการ
   npm start
   ```
3. เปิดเบราว์เซอร์ไปที่ **http://localhost:3000**

ระหว่างพัฒนา ใช้ `npm run dev` แทนได้ (auto-restart เมื่อไฟล์เปลี่ยน ผ่าน `node --watch`)

## วิธีรันด้วย Docker

ต้องติดตั้ง [Docker Desktop](https://www.docker.com/products/docker-desktop/) ก่อน

```bash
docker compose up --build
```

แล้วเปิด **http://localhost:3000**

- ข้อมูลผู้ใช้ (users.json / matches.json) จะถูกเก็บไว้ใน Docker volume ชื่อ `game_matcher_data` ทำให้ข้อมูลไม่หายเมื่อ restart container
- ปิดการทำงาน: `docker compose down`
- ปิดและลบข้อมูลทั้งหมด: `docker compose down -v`
- ตั้งค่า JWT secret เอง: สร้างไฟล์ `.env` ที่ root โปรเจกต์แล้วใส่ `JWT_SECRET=your-long-random-string`

## แหล่งข้อมูลเกม (Data Source): Steam

ฐานข้อมูลเกมใน `backend/seed/games.json` ดึงมาจาก **Steam** จริงผ่าน 2 API สาธารณะ:

- **[SteamSpy API](https://steamspy.com/api.php)** — รายชื่อเกมยอดนิยม, community tags, ราคา, จำนวนผู้เล่น
- **[Steam Store API](https://store.steampowered.com/api/appdetails)** — genre, categories (single/co-op/pvp), คำอธิบายเกม, วันวางจำหน่าย

สคริปต์ `backend/scripts/fetch-steam-games.js` จะดึงข้อมูลจริงจากทั้งสอง API แล้ว **map เป็น tag ที่ระบบใช้เอง** เพราะ Steam ไม่มี field `mood` / `difficulty` / `graphics style` โดยตรง — สคริปต์จะเดา (heuristic) จาก community tags เช่น
- tag `"Relaxing"` → mood = Relaxing, tag `"Difficult"` / `"Souls-like"` → difficulty = Hard
- tag `"Pixel Graphics"` → graphics = Pixel, tag `"Anime"` → graphics = Anime

**ข้อจำกัด:** ข้อมูล mood/difficulty/graphics เป็นการเดาจาก tag ไม่ใช่ field ทางการของ Steam จึงอาจไม่แม่นยำ 100% และเนื่องจาก Steam เป็นแพลตฟอร์ม PC เท่านั้น เกมทุกเกมที่ดึงมาจะถูกกำหนด `platform: ["PC"]` เสมอ (ถ้าต้องการเพิ่มค่าย console ให้แก้ไฟล์ JSON เพิ่มเอง)

### วิธีดึงข้อมูลจริงจาก Steam (regenerate seed file)

ต้องมีอินเทอร์เน็ต (สคริปต์นี้รันไม่ได้ในแซนด์บ็อกซ์ที่ผมใช้สร้างโปรเจกต์ เพราะไม่มีเน็ตออก จึงยังไม่ได้รันจริงให้ — กรุณารันเองครั้งแรกในเครื่องคุณ):

```bash
cd backend
npm install
npm run seed:steam                # ดึง 60 เกม (default)
npm run seed:steam -- --count 100 # หรือกำหนดจำนวนเอง
```

สคริปต์จะ:
1. ดึงรายชื่อเกมยอดนิยมจาก SteamSpy (`top100in2weeks` + `top100forever`)
2. ดึงรายละเอียดแต่ละเกมจาก SteamSpy + Steam Store API (หน่วงเวลาระหว่าง request เพื่อไม่ให้โดน rate limit)
3. Map ข้อมูลเป็น schema ที่ระบบใช้ แล้วสำรองไฟล์เดิมไว้ที่ `games.backup.json` ก่อนเขียนทับ `games.json`

ถ้าไม่รันสคริปต์นี้ ระบบจะใช้ไฟล์ `games.json` ตัวอย่าง 30 เกมที่มีอยู่แล้วในโปรเจกต์ (คัดเลือกและ tag ด้วยมือ ไม่ได้มาจาก Steam) เว็บยังใช้งานได้ปกติทันทีโดยไม่ต้องรันสคริปต์นี้ก่อน



1. ผู้ใช้ตอบคำถาม 8 ข้อ: แนวเกม, อารมณ์การเล่น, รูปแบบผู้เล่น, แพลตฟอร์ม, ระยะเวลาเล่น, ความยาก, กราฟิก, ราคา
2. สำหรับเกมแต่ละเกมในฐานข้อมูล ระบบจะให้คะแนนตามความตรงกันในแต่ละหมวด โดยถ่วงน้ำหนักไม่เท่ากัน (เช่น แนวเกม/อารมณ์ มีน้ำหนักสูงสุด)
3. คำนวณ % ความตรงกัน (matchPercent) เทียบกับคะแนนสูงสุดที่เป็นไปได้จากคำตอบของผู้ใช้
4. เรียงลำดับคะแนนจากมากไปน้อย แสดงผล 10 อันดับแรกพร้อมเหตุผลประกอบ (reasons)
5. ถ้าผู้ใช้ล็อกอินอยู่ ระบบจะบันทึกผลลัพธ์ลงประวัติอัตโนมัติ ดูย้อนหลังได้ที่หน้าโปรไฟล์

## หมายเหตุด้านความปลอดภัย (สำหรับ production)
- เปลี่ยน `JWT_SECRET` เป็นค่าสุ่มที่ยาวและปลอดภัย
- พิจารณาเปลี่ยนจาก JSON-file storage ไปใช้ฐานข้อมูลจริง (PostgreSQL/MongoDB) หากมีผู้ใช้จำนวนมาก
- เพิ่ม rate limiting สำหรับ /api/login และ /api/register เพื่อป้องกัน brute force
