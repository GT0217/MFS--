/**
 * 관리자가 작성한 본문 HTML(<a> 태그 포함)을 렌더링하기 전에
 * 모든 링크가 새 탭에서 안전하게(target="_blank" rel="noopener noreferrer") 열리도록 보정한다.
 * 이미 target 속성이 있는 링크는 건드리지 않는다.
 */
export function withSafeLinkTargets(html: string): string {
  return html.replace(
    /<a\s+(?![^>]*\btarget=)([^>]*)>/gi,
    '<a target="_blank" rel="noopener noreferrer" $1>',
  )
}
