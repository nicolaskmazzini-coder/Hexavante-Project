"use server";

import { getSafeCallbackUrl } from "@/lib/auth-routes";
import { signIn } from "@/auth";

export async function signInWithGoogle(callbackUrl: string) {
  await signIn("google", { redirectTo: getSafeCallbackUrl(callbackUrl) });
}

export async function signInWithGithub(callbackUrl: string) {
  await signIn("github", { redirectTo: getSafeCallbackUrl(callbackUrl) });
}
