"use server";

import { signIn } from "@/auth";

function getSafeCallbackUrl(callbackUrl: string) {
  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) return "/";
  return callbackUrl;
}

export async function signInWithGoogle(callbackUrl: string) {
  await signIn("google", { redirectTo: getSafeCallbackUrl(callbackUrl) });
}

export async function signInWithGithub(callbackUrl: string) {
  await signIn("github", { redirectTo: getSafeCallbackUrl(callbackUrl) });
}
