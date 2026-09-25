import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { createClient } from "@/lib/supabase/server";

import {
  Users,
  UserPlus,
  ArrowRight,
  UserRoundPlus,
  UserRound,
  UserRoundSearch,
  Search,
  BookOpen,
  Church,
  ChevronRight,
} from "lucide-react";

import LogoutButton from "@/components/auth/LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // ============================================================
  // ADMIN PROFILE
  // ============================================================

  const avatarUrl =
    user.user_metadata?.avatar_url ??
    user.user_metadata?.picture ??
    null;

  const adminName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "አስተዳዳሪ";

  const adminInitial =
    adminName.trim().charAt(0).toUpperCase() || "A";

  // ============================================================
  // GET MEMBER STATISTICS
  // ============================================================

  const [
    { count: totalMembers },
    { count: maleMembers },
    { count: femaleMembers },
  ] = await Promise.all([
    supabase
      .from("members")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("gender", "male"),

    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("gender", "female"),
  ]);

  // ============================================================
  // TODAY'S REGISTRATIONS
  // ============================================================

  const today = new Date();

  const todayString =
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const { count: todayMembers } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("registration_date", todayString);

  return (
    <main className="min-h-screen bg-[#f8f5ec] text-[#172033]">

      {/* =====================================================
          PREMIUM HEADER
      ===================================================== */}

      <header className="relative overflow-hidden bg-gradient-to-br from-[#082f63] via-[#0d3b78] to-[#174d91]">

        {/* Decorative circles */}

        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border border-[#d4af37]/20" />

        <div className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full border border-[#d4af37]/15" />

        <div className="pointer-events-none absolute -left-24 bottom-[-120px] h-64 w-64 rounded-full border border-white/5" />

        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 sm:py-5">

          {/* =================================================
              SCHOOL BRAND
          ================================================= */}

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-[#d4af37]/50 bg-white shadow-lg">

              <Image
                src="/logo.png"
                alt="ጽርሐ ጽዮን ሰንበት ት/ቤት"
                width={42}
                height={42}
                className="object-contain"
                priority
              />

            </div>

            <div>

              <h1 className="text-base font-bold tracking-wide text-white sm:text-lg">
                ጽርሐ ጽዮን
              </h1>

              <p className="text-xs font-medium text-[#f5d77a]">
                ሰንበት ት/ቤት
              </p>

            </div>

          </div>


          {/* =================================================
              ADMIN PROFILE + LOGOUT
          ================================================= */}

          <div className="flex items-center gap-3">

            <div className="hidden items-center gap-3 sm:flex">

              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#d4af37]/60 bg-white shadow-md">

                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={adminName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-[#0d3b78]">
                    {adminInitial}
                  </span>
                )}

              </div>

              <div className="max-w-[170px]">

                <p className="truncate text-sm font-bold text-white">
                  {adminName}
                </p>

                <p className="truncate text-[11px] text-blue-100/70">
                  አስተዳዳሪ
                </p>

              </div>

            </div>

            <LogoutButton />

          </div>

        </div>

        {/* Gold divider */}

        <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

      </header>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-7 sm:px-6 sm:py-10">

        {/* =================================================
            WELCOME HERO
        ================================================= */}

        <div className="relative overflow-hidden rounded-[2rem] border border-[#d4af37]/30 bg-white shadow-sm">

          {/* Background decoration */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#0d3b78]/[0.025]" />

          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full border border-[#d4af37]/20" />

          <div className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full border border-[#0d3b78]/5" />

          <div className="relative p-6 sm:p-8 lg:p-10">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              {/* =================================================
                  WELCOME CONTENT
              ================================================= */}

              <div className="max-w-2xl">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3.5 py-2 text-xs font-bold text-[#0d3b78]">

                  <Church size={14} />

                  ጽርሐ ጽዮን ሰንበት ት/ቤት

                </div>


                <h2 className="text-2xl font-bold leading-tight tracking-tight text-[#172033] sm:text-3xl lg:text-4xl">

                  እንኳን ወደ አስተዳደር ዳሽቦርዱ

                  <br className="hidden sm:block" />

                  <span className="bg-gradient-to-r from-[#0d3b78] to-[#174d91] bg-clip-text text-transparent">
                    በሰላም መጡ።
                  </span>

                </h2>


                <p className="mt-4 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">

                  የሰንበት ት/ቤቱን አባላት ምዝገባ፣
                  ትምህርት እና አስተዳደር በአንድ ቦታ
                  በቀላሉ ያስተዳድሩ።

                </p>

              </div>


              {/* =================================================
                  LARGE LOGO
              ================================================= */}

              <div className="hidden lg:flex lg:h-36 lg:w-36 lg:shrink-0 lg:items-center lg:justify-center lg:rounded-full lg:border lg:border-[#d4af37]/40 lg:bg-[#f8f5ec] lg:shadow-inner">

                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-[#d4af37]/30 bg-white shadow-md">

                  <Image
                    src="/logo.png"
                    alt="ጽርሐ ጽዮን ሰንበት ት/ቤት"
                    width={96}
                    height={96}
                    className="object-contain"
                  />

                </div>

              </div>

            </div>

          </div>


          {/* Gold accent */}

          <div className="h-1 bg-gradient-to-r from-[#0d3b78] via-[#d4af37] to-[#0d3b78]" />

        </div>


        {/* =====================================================
            MEMBER SEARCH
        ===================================================== */}

        <div className="mt-7 overflow-hidden rounded-[1.75rem] border border-[#d4af37]/25 bg-white shadow-sm">

          <div className="p-5 sm:p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0d3b78] to-[#174d91] text-white shadow-md">

                  <UserRoundSearch size={21} />

                </div>

                <div>

                  <h3 className="font-bold text-[#172033]">
                    አባል ፈልግ
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    በስም፣ በምዝገባ ቁጥር ወይም በስልክ ይፈልጉ
                  </p>

                </div>

              </div>


              <form
                action="/dashboard/student"
                method="GET"
                className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-2xl"
              >

                <div className="relative flex-1">

                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="search"
                    placeholder="የአባሉን ስም፣ ምዝገባ ቁጥር ወይም ስልክ..."
                    className="w-full rounded-xl border border-slate-200 bg-[#fafafa] py-3 pl-11 pr-4 text-sm text-[#172033] outline-none transition duration-200 hover:border-slate-300 focus:border-[#0d3b78] focus:bg-white focus:ring-4 focus:ring-[#0d3b78]/10"
                  />

                </div>


                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d3b78] to-[#174d91] px-6 py-3 text-sm font-bold text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
                >

                  <Search size={17} />

                  ፈልግ

                </button>

              </form>

            </div>

          </div>

        </div>


        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <DashboardCard
            title="ጠቅላላ አባላት"
            value={String(totalMembers ?? 0)}
            icon={<Users size={23} />}
            description="በስርዓቱ ውስጥ"
          />

          <DashboardCard
            title="ወንድ አባላት"
            value={String(maleMembers ?? 0)}
            icon={<UserRound size={23} />}
            description="ወንድ አባላት"
          />

          <DashboardCard
            title="ሴት አባላት"
            value={String(femaleMembers ?? 0)}
            icon={<UserRound size={23} />}
            description="ሴት አባላት"
          />

          <DashboardCard
            title="ዛሬ የተመዘገቡ"
            value={String(todayMembers ?? 0)}
            icon={<UserPlus size={23} />}
            description="የዛሬ ምዝገባ"
          />

        </div>


        {/* =====================================================
            ADMINISTRATION ACTIONS
        ===================================================== */}

        <div className="mt-10">

          <div className="mb-5">

            <div className="flex items-center gap-3">

              <div className="h-8 w-1 rounded-full bg-[#d4af37]" />

              <div>

                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
                  ADMINISTRATION
                </p>

                <h3 className="mt-1 text-xl font-bold text-[#172033]">
                  የአስተዳዳሪ እርምጃዎች
                </h3>

              </div>

            </div>

          </div>


          <div className="grid gap-5 md:grid-cols-2">

            {/* =================================================
                ADD MEMBER
            ================================================= */}

            <Link
              href="/dashboard/students/new"
              className="group"
            >

              <div className="relative h-full overflow-hidden rounded-[1.75rem] border border-[#d4af37]/25 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/60 hover:shadow-xl sm:p-7">

                <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#0d3b78]/[0.035] transition duration-500 group-hover:scale-125" />

                <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-[#d4af37]/[0.035] transition duration-500 group-hover:scale-125" />


                <div className="relative flex items-start justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0d3b78] to-[#174d91] text-white shadow-md transition duration-300 group-hover:scale-105 group-hover:shadow-lg">

                    <UserRoundPlus size={27} />

                  </div>


                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8f5ec] text-gray-400 transition duration-300 group-hover:bg-[#d4af37]/15 group-hover:text-[#0d3b78]">

                    <ArrowRight
                      size={18}
                      className="transition group-hover:translate-x-0.5"
                    />

                  </div>

                </div>


                <div className="relative">

                  <h4 className="mt-6 text-lg font-bold text-[#172033]">
                    አዲስ አባል መመዝገብ
                  </h4>

                  <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                    አዲስ አባልን በምዝገባ ስርዓቱ ውስጥ
                    በሙሉ መረጃ ይመዝግቡ።
                  </p>

                  <div className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#0d3b78]">

                    ምዝገባ ጀምር

                    <ChevronRight
                      size={16}
                      className="transition group-hover:translate-x-0.5"
                    />

                  </div>

                </div>

              </div>

            </Link>


            {/* =================================================
                MEMBER LIST
            ================================================= */}

            <Link
              href="/dashboard/student"
              className="group"
            >

              <div className="relative h-full overflow-hidden rounded-[1.75rem] border border-[#d4af37]/25 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/60 hover:shadow-xl sm:p-7">

                <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#d4af37]/[0.07] transition duration-500 group-hover:scale-125" />

                <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-[#0d3b78]/[0.025] transition duration-500 group-hover:scale-125" />


                <div className="relative flex items-start justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4af37]/30 bg-[#f8f5ec] text-[#0d3b78] shadow-sm transition duration-300 group-hover:scale-105 group-hover:bg-[#d4af37]/10 group-hover:shadow-md">

                    <Users size={27} />

                  </div>


                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8f5ec] text-gray-400 transition duration-300 group-hover:bg-[#d4af37]/15 group-hover:text-[#0d3b78]">

                    <ArrowRight
                      size={18}
                      className="transition group-hover:translate-x-0.5"
                    />

                  </div>

                </div>


                <div className="relative">

                  <h4 className="mt-6 text-lg font-bold text-[#172033]">
                    የአባላት ዝርዝር
                  </h4>

                  <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                    የተመዘገቡ አባላትን ይመልከቱ፣
                    ይፈልጉ እና መረጃቸውን ያስተዳድሩ።
                  </p>

                  <div className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#0d3b78]">

                    ዝርዝር ክፈት

                    <ChevronRight
                      size={16}
                      className="transition group-hover:translate-x-0.5"
                    />

                  </div>

                </div>

              </div>

            </Link>

          </div>

        </div>


        {/* =====================================================
            EDUCATION / COURSES
        ===================================================== */}

        <div className="mt-10">

          <div className="mb-5">

            <div className="flex items-center gap-3">

              <div className="h-8 w-1 rounded-full bg-[#d4af37]" />

              <div>

                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
                  EDUCATION
                </p>

                <h3 className="mt-1 text-xl font-bold text-[#172033]">
                  ትምህርት እና ኮርሶች
                </h3>

              </div>

            </div>

          </div>


          <div className="relative overflow-hidden rounded-[2rem] border border-[#d4af37]/30 bg-gradient-to-br from-[#082f63] via-[#0d3b78] to-[#174d91] shadow-lg">

            {/* Decorative elements */}

            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-[#d4af37]/20" />

            <div className="pointer-events-none absolute -right-5 -top-5 h-32 w-32 rounded-full border border-white/5" />

            <div className="pointer-events-none absolute -bottom-24 -left-12 h-52 w-52 rounded-full border border-white/5" />


            <div className="relative p-7 sm:p-8">

              <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-start gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#d4af37]/15 text-[#f5d77a] shadow-inner">

                    <BookOpen size={28} />

                  </div>


                  <div>

                    <h4 className="text-lg font-bold text-white">
                      የአባላት ትምህርት አስተዳደር
                    </h4>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100/80">
                      የአባላትን የትምህርት ደረጃ፣
                      ኮርሶች እና የትምህርት መዝገቦች
                      ለማስተዳደር የሚያገለግል ክፍል።
                    </p>

                  </div>

                </div>


                <div className="flex flex-wrap gap-3">

                  <Link
                    href="/dashboard/academic-years"
                    className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e3c75e] px-5 py-3 text-sm font-bold text-[#172033] shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >

                    <BookOpen size={17} />

                    ኮርሶች

                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-0.5"
                    />

                  </Link>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="mt-10 pb-6 pt-4 text-center">

          <div className="mb-4 flex items-center justify-center gap-3">

            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#d4af37]/50" />

            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d4af37]/30 bg-white text-sm text-[#d4af37] shadow-sm">
              ✝
            </div>

            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#d4af37]/50" />

          </div>


          <p className="text-xs font-semibold text-[#0d3b78]">
            ጽርሐ ጽዮን ሰንበት ት/ቤት
          </p>

          <p className="mt-1 text-[11px] text-gray-400">
            ለእግዚአብሔር ክብር
          </p>

        </footer>

      </section>

    </main>
  );
}


/* ============================================================
   DASHBOARD STATISTICS CARD
============================================================ */

function DashboardCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[1.5rem] border border-[#d4af37]/20 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/45 hover:shadow-lg">

      {/* Left gold accent */}

      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#d4af37]/50 to-[#d4af37]/20 transition duration-300 group-hover:from-[#d4af37] group-hover:to-[#d4af37]/50" />


      {/* Subtle background decoration */}

      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#0d3b78]/[0.025] transition duration-300 group-hover:scale-125" />


      <div className="relative flex items-center justify-between gap-4">

        <div>

          <p className="text-xs font-semibold text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-[#0d3b78]">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-gray-400">
            {description}
          </p>

        </div>


        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0d3b78]/10 text-[#0d3b78] transition duration-300 group-hover:bg-[#d4af37]/15 group-hover:text-[#0d3b78]">

          {icon}

        </div>

      </div>

    </div>
  );
}