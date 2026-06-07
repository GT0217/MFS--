/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // 핸드폰 사진(고해상도)도 업로드 가능하도록 제한 상향
      bodySizeLimit: "12mb",
    },
  },
}

export default nextConfig
