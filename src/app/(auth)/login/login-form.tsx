"use client";

import { useActionState } from "react";
import {
  Field,
  FormMessage,
  SubmitButton,
  TextInput,
} from "@/components/form";
import { loginAction, type AuthFormState } from "../actions";

export function LoginForm() {
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}

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

      <Field label="비밀번호" htmlFor="password" required>
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      <SubmitButton pendingLabel="로그인 중…" className="w-full">
        로그인
      </SubmitButton>
    </form>
  );
}
