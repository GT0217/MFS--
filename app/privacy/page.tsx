import Link from "next/link"

export const metadata = {
  title: "개인정보처리방침 · MFS",
  description: "MFS 연구회의 개인정보처리방침 및 서비스 안내",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-background px-5 py-8 text-foreground">
      <article className="mx-auto max-w-2xl pb-12">
        <Link href="/" className="text-sm font-semibold text-primary">MFS로 돌아가기</Link>
        <h1 className="mt-8 text-3xl font-bold">개인정보처리방침 · 서비스 안내</h1>
        <p className="mt-3 text-sm text-muted-foreground">시행일: 2026년 9월 18일</p>

        <div className="prose prose-sm mt-8 max-w-none leading-7 prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary prose-a:underline">
          <h2>1. 운영 주체와 서비스 성격</h2>
          <p>MFS 연구회가 운영하는 독립적인 금융앱 평가·정보 서비스입니다. 금융회사 공식 앱, 금융회사와의 제휴 또는 보증 서비스가 아닙니다. 점수와 추천은 연구회 평가에 따른 참고 정보이며 금융상품 가입 권유나 투자 자문이 아닙니다.</p>

          <h2>2. 일반 이용자 정보</h2>
          <p>일반 이용자 회원가입 기능은 제공하지 않습니다. 추천 설문은 현재 브라우저의 React useState로 기기 안에서 선택 조건과 앱별 자체 평가 점수를 가중 계산하며, 설문 응답을 서버로 전송하거나 영구 저장하지 않고 외부 AI를 호출하지 않습니다.</p>
          <p>화면 설정에서 선택한 테마와 글자 크기는 브라우저 localStorage의 <code>mfs-theme</code>, <code>mfs-text-size</code> 키에 저장됩니다. 설정 메뉴에서 값을 변경하거나 브라우저 사이트 데이터·캐시를 삭제하면 함께 삭제할 수 있습니다.</p>

          <h2>3. 관리자 기능</h2>
          <p>관리자 기능은 별도 관리자 아이디·비밀번호로 보호됩니다. 로그인 성공 시 서버가 서명하고 만료를 검증하는 HttpOnly·Secure 세션 쿠키를 사용하며, 일반 사용자에게 관리자 인증 정보나 세션 값은 제공하지 않습니다. 관리자 로그인 정보와 세션 서명 키는 배포 환경변수로만 설정합니다.</p>

          <h2>4. 문의와 외부 전송</h2>
          <p>문의는 <a href="mailto:captinkkt8@gmail.com">captinkkt8@gmail.com</a>으로 보내실 수 있습니다. 이메일을 보내면 이메일 서비스 제공자에게 메시지와 발신자 정보가 전달되며, 처리와 보관은 해당 제공자의 정책 및 문의 대응에 필요한 범위에 따릅니다.</p>
          <p>앱은 Vercel에 호스팅되며, 페이지 요청·배포·오류 대응 과정에서 Vercel 등 호스팅 사업자가 접속 IP, 브라우저·기기 정보, 요청 시각 같은 접속 정보를 자체 정책에 따라 처리할 수 있습니다. 관리자 이미지와 본문에 포함된 외부 이미지·링크를 열면 해당 외부 호스팅 사업자에게 요청 정보가 전달될 수 있습니다. 앱이 그 사업자의 보관기간을 정하거나 확인된 기간을 보장하지는 않습니다.</p>
          <ul>
            <li><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">Vercel 개인정보처리방침</a></li>
            <li><a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google 개인정보처리방침</a></li>
          </ul>

          <h2>5. 삭제·문의 처리</h2>
          <p>브라우저에 저장된 설정은 이용자가 직접 사이트 데이터 삭제로 처리할 수 있습니다. 서버에 저장되는 관리자 콘텐츠·관리자 인증 쿠키·호스팅 접속 기록은 각각 서비스 운영, 보안, 장애 대응에 필요한 범위에서 처리되며, 구체적인 보관·삭제 요청은 위 문의 이메일로 접수해 확인 후 가능한 범위에서 처리합니다.</p>
        </div>
      </article>
    </main>
  )
}
