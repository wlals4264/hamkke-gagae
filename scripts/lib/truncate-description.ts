/**
 * 소개글이 너무 길면 문장이나 어절 단위로 자릅니다. 그냥 slice(0, N)으로 자르면
 * "장애인의 사회 참여 확대를 " 처럼 문장 중간에서 뚝 끊긴 것처럼 보이는 문제가 있었습니다.
 */
export function truncateDescription(text: string, maxLength = 220): string {
  const clean = text.trim();
  if (clean.length <= maxLength) return clean;

  const slice = clean.slice(0, maxLength);
  const lastSentenceEnd = Math.max(slice.lastIndexOf("."), slice.lastIndexOf("!"), slice.lastIndexOf("?"));
  if (lastSentenceEnd > maxLength * 0.5) {
    return slice.slice(0, lastSentenceEnd + 1);
  }

  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > maxLength * 0.5 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trimEnd()}…`;
}
