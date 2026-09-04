/**
 * DB 스키마 타입. supabase/migrations/0001_init.sql 과 1:1로 대응한다.
 * 스키마를 바꾸면 이 파일도 함께 고친다.
 */

export type TeacherRole = "admin" | "teacher";
export type TeacherStatus = "pending" | "approved" | "rejected";
export type TestimonialStatus = "pending" | "approved" | "rejected";
export type AuthorType = "student" | "parent";

export interface Teacher {
  id: string;
  name: string;
  division: string | null;
  role: TeacherRole;
  status: TeacherStatus;
  created_at: string;
}

export interface TeachingMaterial {
  id: string;
  title: string;
  subject: string;
  grade: string;
  file_path: string;
  file_name: string;
  description: string | null;
  uploader_id: string | null;
  created_at: string;
}

/** 브릿지 뉴스 소식지 (0005_bridge_news.sql) */
export interface BridgeNews {
  id: string;
  title: string;
  issue_label: string | null;
  /** YYYY-MM-DD */
  published_on: string | null;
  description: string | null;
  file_path: string;
  file_name: string;
  /** PDF 첫 페이지 표지. 생성에 실패했으면 null */
  thumb_path: string | null;
  uploader_id: string | null;
  created_at: string;
}

export interface Photo {
  id: string;
  storage_path: string;
  caption: string | null;
  category: string | null;
  uploader_id: string | null;
  created_at: string;
}

export interface Testimonial {
  id: string;
  author_type: AuthorType;
  author_name: string | null;
  content: string;
  photo_path: string | null;
  status: TestimonialStatus;
  reviewed_by: string | null;
  created_at: string;
}

export interface LessonPlan {
  id: string;
  teacher_id: string;
  grade: string;
  subject: string;
  achievement_standard: string;
  goal: string;
  task: string;
  eval_criteria_top: string;
  generated_content: string;
  created_at: string;
}

export interface ApiRateLimit {
  id: string;
  ip_address: string;
  request_date: string;
  count: number;
  updated_at: string;
}

export type ActivityStatus = "not_started" | "in_progress" | "done";

export interface TimelineActivity {
  id: string;
  year: number;
  month: number;
  title: string;
  assignees: string[];
  status: ActivityStatus;
  note: string | null;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NavItemRow {
  id: string;
  group_label: string;
  label: string;
  href: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
