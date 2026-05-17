# 강의실 지각 러너

대학생의 공감 1순위 상황 "지각"을 소재로 한 2D 횡스크롤 캐주얼 러너. Phaser 3 + Vite로 만든 웹게임.

> 게임공학 과목 작품 — 김성환 (202021469)

## 플레이

| 키 | 동작 |
|---|---|
| → | 가속 (오래 누를수록 더 빨라짐) |
| ← | 브레이크 |
| ↑ ↓ | 레인 이동 (상/중/하) |
| Space | 점프 |
| R | 재시작 |
| Esc | 메뉴로 |

## 게임 규칙

스피드런 — 메뉴에서 난이도를 골라 그 코스를 최대한 빨리 통과하는 것이 목표.

- 난이도별 코스 (각각 배경이 다름)
  - **하 · 복도** — 장애물 2종, ~60초
  - **중 · 계단** — 장애물 2종, ~180초
  - **상 · 본관 앞** — 장애물 4종, ~300초
- 장애물 회피 방식
  - **사람 무리 / 닫히는 문** — 다른 레인으로 이동 (이 둘은 큰 장애물이라 **2개 레인을 동시 차단**)
  - **청소카트 / 쏟아진 물** — 점프
- 충돌 시 **+3초 패널티 + 즉시 정지**, 충돌 3회 시 실패
- 완주 시간이 베스트 기록보다 짧으면 NEW RECORD (난이도별 localStorage 저장)

## 실행 (로컬)

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5173 으로 접속.

## 빌드

```bash
npm run build      # dist/ 에 정적 파일 생성
npm run preview    # 빌드 결과 미리보기
```

## 기술 스택

- [Phaser 3](https://phaser.io/) — 2D 게임 프레임워크
- [Vite](https://vitejs.dev/) — 개발 서버 / 번들러

## 프로젝트 구조

```
src/
├── main.js                  Phaser Game 설정
├── config/gameConfig.js     게임 상수 (속도/시간/장애물/스테이지)
├── scenes/
│   ├── BootScene.js         도형 텍스처 생성
│   ├── MenuScene.js         시작 화면
│   ├── GameScene.js         메인 게임 루프
│   └── GameOverScene.js     클리어/실패 화면
└── objects/
    ├── Player.js            3레인 이동/점프/슬라이드
    └── Obstacle.js          장애물 스폰
```

게임 밸런스(속도, 장애물 빈도, 점프 높이 등)는 모두 [src/config/gameConfig.js](src/config/gameConfig.js) 한 파일에서 조정 가능.
