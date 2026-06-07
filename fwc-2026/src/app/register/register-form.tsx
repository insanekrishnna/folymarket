"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { registerAction, type AuthFormState } from "@/lib/actions/auth";

const INITIAL: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, INITIAL);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <FieldGroup
        id="username"
        label="Username"
        type="text"
        placeholder="your_username"
        autoComplete="username"
        required
        errors={state.fieldErrors?.username}
      />

      <FieldGroup
        id="name"
        label="Name (optional)"
        type="text"
        placeholder="Your name"
        autoComplete="name"
        errors={state.fieldErrors?.name}
      />

      <FieldGroup
        id="password"
        label="Password"
        type="password"
        placeholder="Minimum 8 characters"
        autoComplete="new-password"
        required
        errors={state.fieldErrors?.password}
      />

      <FieldGroup
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        required
        errors={state.fieldErrors?.confirmPassword}
      />

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  errors?: string[];
};

function FieldGroup({ id, label, errors, ...inputProps }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} {...inputProps} />
      {errors?.map((e) => (
        <p key={e} className="text-sm text-destructive">
          {e}
        </p>
      ))}
    </div>
  );
}
