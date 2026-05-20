# 🗡️ English Quest

매일 5분, 던전을 클리어하며 영어 정복 — 두 아이를 위한 RPG형 영어 자습 앱.

**Live:** https://jwj-nick.github.io/english-quest/

## 컨셉

5개 학습 영역 = 5개 던전. 한 주가 하나의 챕터.

| 던전 | 영역 | 메커닉 |
|---|---|---|
| 🌳 어휘의 숲 | 단어 | 카드 매칭, 빈칸 채우기, 단어 둘러보기 |
| 🎧 메아리 동굴 | 듣기 | 받아쓰기, 객관식 *(준비 중)* |
| 📖 책의 도서관 | 독해 | 지문 + 문제 *(준비 중)* |
| 🎤 말의 무대 | 말하기 | 따라 읽기 / Q&A / 상황극 *(준비 중)* |
| ✍️ 글의 탑 | 쓰기 | 영작 + AI 첨삭 *(준비 중)* |

콘텐츠 난이도: **수능 1-2등급 목표**.

## 스택

React 19 + Vite 8 + TS 6 · Tailwind v4 · zustand · idb (IndexedDB) · lucide-react · vite-plugin-pwa · HashRouter (GH Pages 대응).

## 개발

```bash
npm install --legacy-peer-deps
npm run dev      # http://localhost:5173/english-quest/
npm run build
```

## 콘텐츠

`public/content/{YYYY-Www}/` 폴더에 주차별 JSON:

- `week-meta.json` — 주간 목표 / XP 가중치
- `vocabulary.json` — 단어 (V1 사용)
- `listening.json` / `reading.json` / `speaking-*.json` / `writing.json` — 영역별
- `boss-battle.json` — 주말 보스전

스키마: `../01_Initial_Trial/sample/SCHEMA.md`.

## 데이터

- 학습 로그: IndexedDB (브라우저 로컬)
- 프로필 (이름·아바타·직업·테마 색): IndexedDB `kv` 저장소
- JSON 내보내기: 프로필 페이지 → "학습 로그 JSON 내보내기"

## 배포

`main` 브랜치 push 시 GitHub Actions가 자동 빌드·배포.
