/**
 * 테스트 실행 전 환경변수 기본값.
 * 실제 Supabase/OpenAI 호출은 각 테스트에서 mock 한다.
 */
process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "test-service-role-key";
process.env.OPENAI_API_KEY ||= "test-openai-key";
