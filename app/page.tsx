import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f5ec] px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#0d3b78]/5 blur-3xl" />

        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#d4af37]/10 blur-3xl" />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-[#d4af37]/40 bg-white shadow-[0_25px_70px_rgba(13,59,120,0.15)]">
          
          {/* Header */}
          <div className="relative overflow-hidden bg-[#0d3b78] px-6 pb-8 pt-10 text-center">
            <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full border border-[#d4af37]/30" />

            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full border border-[#d4af37]/30" />

            <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border-4 border-[#d4af37] bg-white shadow-xl">
              <Image
                src="/logo.png"
                alt="ጽርሐ ጽዮን ሰንበት ት/ቤት"
                fill
                priority
                className="object-cover"
                sizes="128px"
              />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-white">
              ጽርሐ ጽዮን
            </h1>

            <p className="mt-1 text-base font-medium text-[#f5d77a]">
              ሰንበት ት/ቤት
            </p>

            <div className="mx-auto mt-5 h-px w-24 bg-[#d4af37]" />

            <p className="mt-4 text-sm text-white/80">
              የተማሪ ምዝገባ ስርዓት
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-8 sm:px-8">
            <div className="mb-7 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0d3b78]/10 text-[#0d3b78]">
                <ShieldCheck size={25} />
              </div>

              <h2 className="mt-4 text-xl font-bold text-[#172033]">
                የአስተዳዳሪ መግቢያ
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                ለመቀጠል የአስተዳዳሪ መረጃዎን ያስገቡ።
              </p>
            </div>

            <LoginForm />
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-5 text-center">
            <p className="text-xs text-gray-400">
              © ጽርሐ ጽዮን ሰንበት ት/ቤት
            </p>

            <p className="mt-1 text-xs text-gray-400">
              የተማሪ ምዝገባ ስርዓት
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}