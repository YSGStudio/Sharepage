"use client";

import { useActionState } from "react";
import {
  Field,
  FormMessage,
  Select,
  SubmitButton,
  TextInput,
} from "@/components/form";
import { signupAction, type AuthFormState } from "../actions";

const DIVISIONS = [
  "연구·기획 분과",
  "교육과정개발 분과",
  "연구운영팀",
  "지원관리 및 평가 분과",
  "홍보·연수 분과",
];

export function SignupForm() {
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    signupAction,
    {},
  );

  if (state.success) {
    return <FormMessage tone="success">{state.success}</FormMessage>;
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}

      <Field label="이름" htmlFor="name" required>
        <TextInput id="name" name="name" required placeholder="홍길동" />
      </Field>

      <Field label="담당 분과" htmlFor="division" hint="나중에 운영자가 조정할 수 있습니다.">
        <Select id="division" name="division" defaultValue="">
          <option value="">선택 안 함</option>
          {DIVISIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="이메일" htmlFor="email" required>
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="teacher@example.com"
        />
      </Field>

      <Field label="비밀번호" htmlFor="password" hint="8자 이상" required>
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>

      <Field label="비밀번호 확인" htmlFor="passwordConfirm" required>
        <TextInput
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>

      <SubmitButton pendingLabel="신청 중…" className="w-full">
        가입 신청
      </SubmitButton>
    </form>
  );
}
