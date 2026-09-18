# 작업 방식 (Claude / Cursor / Codex 공통)

이 저장소에서 어떤 AI 툴로 작업하든, 세션마다 브랜치를 따서 작업합니다.

## 브랜치 규칙

- `main`에 직접 커밋하지 않습니다.
- 새 기능/작업을 시작할 때 `feature/기능명` 브랜치를 만듭니다.
  - 예: `feature/report-address-lock`, `feature/review-system`
- 작업이 끝나면 `main`에 머지한 뒤 배포합니다.
- 브랜치명은 영어 kebab-case로, 무엇을 하는지 알 수 있게 짧게 씁니다.

## 흐름

```
git checkout main && git pull
git checkout -b feature/기능명
# 작업 + 커밋 + 로컬 테스트
git checkout main
git merge feature/기능명
git push
# (필요시) git branch -d feature/기능명
```

Vercel은 `main` 브랜치 push에 자동 배포되므로, 머지 후 push까지 해야 실제 배포가 나갑니다.
