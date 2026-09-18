"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  async function handleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}`,
      },
    });
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  }

  if (loading) {
    return <div className="h-8 w-20" aria-hidden="true" />;
  }

  if (user) {
    const displayName =
      (user.user_metadata?.nickname as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      "회원";

    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-sm font-medium text-muted sm:inline">{displayName}님</span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-ink/35"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="rounded-full bg-[#FEE500] px-3 py-1.5 text-xs font-bold text-[#191919] shadow-sm transition hover:brightness-95"
    >
      카카오로 로그인
    </button>
  );
}
