# FootballDay

공개 배포와 주기적 기사 업데이트를 전제로 만든 축구 뉴스 브리프 사이트입니다.

## 구조

- `index.html`, `styles.css`, `script.js`: 정적 사이트
- `data/articles.json`: 기사 원본 데이터
- `data/articles.js`: 브라우저가 바로 읽는 기사 데이터
- `data/feeds.json`: 수집 대상 피드 목록
- `scripts/update-news.mjs`: 공개 RSS/Atom 피드 수집 스크립트
- `.github/workflows/update-news.yml`: 6시간마다 기사 데이터 갱신
- `.github/workflows/pages.yml`: GitHub Pages 공개 배포

## 로컬 실행

```powershell
node scripts/update-news.mjs
python -m http.server 8787
```

브라우저에서 `http://localhost:8787`을 열면 됩니다.

## GitHub Pages 배포

GitHub 저장소에 push하면 `.github/workflows/pages.yml`이 `dist/`를 빌드하고 GitHub Pages로 배포합니다.

1. GitHub 저장소 Settings > Pages에서 Source를 `GitHub Actions`로 설정합니다.
2. 로컬 저장소에 GitHub 원격을 연결합니다.
3. `master` 또는 `main` 브랜치에 push합니다.

```powershell
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin master
```

## 업데이트 방식

GitHub Actions가 6시간마다 `scripts/update-news.mjs`를 실행해 `data/articles.json`과 `data/articles.js`를 갱신하고 변경사항을 커밋합니다. 이 커밋이 `master` 또는 `main`에 push되면 GitHub Pages 배포 워크플로가 다시 실행됩니다.
