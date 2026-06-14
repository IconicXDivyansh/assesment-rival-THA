"use client";

import { loginAction, type AuthState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ShieldAlertIcon } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

export default function LoginCard() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    loginAction,
    {}
  );

  return (
    <Card className="w-full max-w-xs">
      <CardHeader className="border-b">
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>Enter email and password to login</CardDescription>
      </CardHeader>
      <CardPanel>
        <form action={formAction} className="flex w-full flex-col gap-4">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input
              name="email"
              placeholder="Enter your email"
              type="email"
              required
            />
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input
              name="password"
              placeholder="Enter your password"
              type="password"
              required
            />
          </Field>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button className="w-full" type="submit" loading={isPending}>
            Login
          </Button>
        </form>
      </CardPanel>
      <CardFooter className="flex flex-col gap-3 border-t">
        <p className="text-muted-foreground text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-foreground underline">
            Sign up
          </Link>
        </p>
        <div className="flex gap-1 text-muted-foreground text-xs">
          <ShieldAlertIcon className="size-3 h-lh shrink-0" aria-hidden="true" />
          <p>The information you enter is encrypted and stored securely.</p>
        </div>
      </CardFooter>
    </Card>
  );
}
