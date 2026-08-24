import { describe, expect, it } from "vitest";
import { clientIpFrom, kstDateString } from "@/lib/lesson-plan/rate-limit";

describe("kstDateString — KST 자정 기준 (R20)", () => {
  it("UTC 14:00 은 KST 로 다음 날이다", () => {
    // 2026-08-16T14:00Z = 2026-08-16 23:00 KST
    expect(kstDateString(new Date("2026-08-16T14:00:00Z"))).toBe("2026-08-16");
    // 2026-08-16T15:00Z = 2026-08-17 00:00 KST → 날짜가 바뀐다
    expect(kstDateString(new Date("2026-08-16T15:00:00Z"))).toBe("2026-08-17");
  });

  it("KST 자정 직전과 직후의 날짜가 다르다 (카운터가 초기화되는 경계)", () => {
    const beforeMidnight = kstDateString(new Date("2026-08-16T14:59:59Z"));
    const afterMidnight = kstDateString(new Date("2026-08-16T15:00:01Z"));
    expect(beforeMidnight).toBe("2026-08-16");
    expect(afterMidnight).toBe("2026-08-17");
    expect(beforeMidnight).not.toBe(afterMidnight);
  });

  it("YYYY-MM-DD 형식을 반환한다", () => {
    expect(kstDateString(new Date("2026-01-01T00:00:00Z"))).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });
});

describe("clientIpFrom", () => {
  it("x-forwarded-for 의 첫 IP를 쓴다", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.5, 70.41.3.18, 150.172.238.178",
    });
    expect(clientIpFrom(headers)).toBe("203.0.113.5");
  });

  it("x-forwarded-for 가 없으면 x-real-ip 를 쓴다", () => {
    const headers = new Headers({ "x-real-ip": "198.51.100.7" });
    expect(clientIpFrom(headers)).toBe("198.51.100.7");
  });

  it("둘 다 없으면 unknown 으로 묶는다", () => {
    expect(clientIpFrom(new Headers())).toBe("unknown");
  });
});
