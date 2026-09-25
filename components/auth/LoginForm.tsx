"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoading(false);

      setErrorMessage(
        "ኢሜይል ወይም የይለፍ ቃል ትክክል አይደለም።",
      );

      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-semibold text-[#172033]"
        >
          ኢሜይል
        </label>

        <div className="relative">
          <Mail
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ኢሜይልዎን ያስገቡ"
            required
            autoComplete="email"
            disabled={loading}
            className="h-13 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0d3b78] focus:bg-white focus:ring-4 focus:ring-[#0d3b78]/10 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-semibold text-[#172033]"
        >
          የይለፍ ቃል
        </label>

        <div className="relative">
          <LockKeyhole
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="የይለፍ ቃልዎን ያስገቡ"
            required
            autoComplete="current-password"
            disabled={loading}
            className="h-13 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0d3b78] focus:bg-white focus:ring-4 focus:ring-[#0d3b78]/10 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            disabled={loading}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#0d3b78]"
            aria-label={
              showPassword
                ? "የይለፍ ቃል ደብቅ"
                : "የይለፍ ቃል አሳይ"
            }
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
      </div>

      {/* Error */}
      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {errorMessage}
        </div>
      )}

      {/* Login */}
      <button
        type="submit"
        disabled={loading}
        className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#0d3b78] px-5 text-sm font-bold text-white shadow-lg shadow-[#0d3b78]/20 transition hover:bg-[#092d5d] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 size={19} className="animate-spin" />
            <span>በመግባት ላይ...</span>
          </>
        ) : (
          <>
            <LogIn size={19} />
            <span>ግባ</span>
          </>
        )}
      </button>

      {/* Security notice */}
      <div className="mt-7 rounded-xl border border-[#d4af37]/30 bg-[#fffaf0] p-4">
        <div className="flex gap-3">
          <ShieldCheck
            size={19}
            className="mt-0.5 shrink-0 text-[#b08a18]"
          />

          <p className="text-xs leading-5 text-gray-600">
            ይህ ስርዓት ለተፈቀደላቸው የሰንበት ት/ቤት
            አስተዳዳሪዎች ብቻ የተዘጋጀ ነው።
          </p>
        </div>
      </div>
    </form>
  );
}