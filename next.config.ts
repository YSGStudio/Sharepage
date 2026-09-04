import type { NextConfig } from "next";

/**
 * Supabase Storage 공개 URL 호스트를 환경변수에서 뽑는다.
 * 프로젝트 ref 를 하드코딩하지 않아야 개발/운영 프로젝트가 달라도 그대로 동작한다.
 *
 * 공개 URL 형태:
 *   https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
 */
function supabaseImagePattern() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];

  try {
    const { hostname, protocol } = new URL(url);
    return [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        // 공개 버킷 경로만 허용한다. 다른 경로의 이미지는 최적화 대상이 아니다.
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    console.warn(
      "[next.config] NEXT_PUBLIC_SUPABASE_URL 을 URL 로 해석하지 못했습니다. 이미지 최적화가 비활성화됩니다.",
    );
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImagePattern(),
  },
  // 지도안 생성 프롬프트는 src/content/lesson-plan 의 마크다운을 런타임에 읽는다.
  // import 가 아니라 fs 로 읽으므로 추적에 잡히지 않아 직접 포함시킨다.
  outputFileTracingIncludes: {
    "/api/lesson-plan/generate": ["src/content/lesson-plan/**/*"],
  },
};

export default nextConfig;
