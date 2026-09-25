"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Eye,
  Filter,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  UserRound,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import BackToHomeButton from "@/components/layout/BackToHomeButton";

type Member = {
  id: string;
  registration_number: string;
  registration_type: "new" | "existing";
  registration_date: string;

  first_name: string;
  father_name: string;
  grandfather_name: string;

  gender: "male" | "female";
  phone: string | null;

  member_photo_path: string | null;
};

export default function StudentPage() {
  const supabase = createClient();

  const [members, setMembers] = useState<Member[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [registrationFilter, setRegistrationFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD MEMBERS
  // ============================================================

  async function loadMembers(showRefresh = false) {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase
        .from("members")
        .select(`
          id,
          registration_number,
          registration_type,
          registration_date,
          first_name,
          father_name,
          grandfather_name,
          gender,
          phone,
          member_photo_path
        `)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const loadedMembers = (data ?? []) as Member[];

      setMembers(loadedMembers);

      // ========================================================
      // CREATE SIGNED URLS FOR PRIVATE MEMBER PHOTOS
      // ========================================================

      const urlMap: Record<string, string> = {};

      await Promise.all(
        loadedMembers.map(async (member) => {
          if (!member.member_photo_path) return;

          const { data: signedUrlData, error: signedUrlError } =
            await supabase.storage
              .from("member-photos")
              .createSignedUrl(member.member_photo_path, 60 * 60);

          if (!signedUrlError && signedUrlData?.signedUrl) {
            urlMap[member.id] = signedUrlData.signedUrl;
          }
        }),
      );

      setPhotoUrls(urlMap);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "አባላትን ማምጣት አልተቻለም።",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  // ============================================================
  // FILTER MEMBERS
  // ============================================================

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const searchText = search.trim().toLowerCase();

      const fullName = [
        member.first_name,
        member.father_name,
        member.grandfather_name,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchText === "" ||
        fullName.includes(searchText) ||
        member.registration_number
          .toLowerCase()
          .includes(searchText) ||
        (member.phone ?? "").toLowerCase().includes(searchText);

      const matchesGender =
        genderFilter === "all" || member.gender === genderFilter;

      const matchesRegistration =
        registrationFilter === "all" ||
        member.registration_type === registrationFilter;

      return (
        matchesSearch &&
        matchesGender &&
        matchesRegistration
      );
    });
  }, [
    members,
    search,
    genderFilter,
    registrationFilter,
  ]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalMembers = members.length;

  const maleMembers = members.filter(
    (member) => member.gender === "male",
  ).length;

  const femaleMembers = members.filter(
    (member) => member.gender === "female",
  ).length;

  const newMembers = members.filter(
    (member) => member.registration_type === "new",
  ).length;

  // ============================================================
  // DELETE MEMBER
  // ============================================================

  async function deleteMember(member: Member) {
    const confirmed = window.confirm(
      `የ ${member.first_name} ${member.father_name} መረጃ መሰረዝ ይፈልጋሉ?\n\nይህ ሂደት የአባሉን መረጃ በቋሚነት ያጠፋል።`,
    );

    if (!confirmed) return;

    try {
      setError("");

      const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", member.id);

      if (error) {
        throw error;
      }

      // Remove member from local state
      setMembers((current) =>
        current.filter((item) => item.id !== member.id),
      );

      // Remove photo URL from local state
      setPhotoUrls((current) => {
        const updated = { ...current };
        delete updated[member.id];
        return updated;
      });

      // Remove stored photos if they exist
      const filesToDelete: string[] = [];

      if (member.member_photo_path) {
        filesToDelete.push(member.member_photo_path);
      }

      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("member-photos")
          .remove(filesToDelete);

        if (storageError) {
          console.error(
            "Member deleted, but photo cleanup failed:",
            storageError,
          );
        }
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "አባሉን መሰረዝ አልተቻለም።",
      );
    }
  }

  // ============================================================
  // FORMAT DATE
  // ============================================================

  function formatDate(date: string) {
    if (!date) return "-";

    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));
  }

  // ============================================================
  // RESET FILTERS
  // ============================================================

  function resetFilters() {
    setSearch("");
    setGenderFilter("all");
    setRegistrationFilter("all");
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen space-y-6 pb-10">
      {/* ========================================================
          PREMIUM HEADER
      ======================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d3b78] via-[#10498d] to-[#082d5c] px-6 py-7 text-white shadow-xl md:px-8">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#d4af37]/10" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <Users size={15} />
              የአባላት አስተዳደር
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              የአባላት ዝርዝር
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
              የጽርሐ ጽዮን ሰንበት ት/ቤት አባላትን
              ይመልከቱ፣ ይፈልጉ እና ያስተዳድሩ።
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <BackToHomeButton />

            <Link
              href="/dashboard/students/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2.5 text-sm font-bold text-[#172033] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#e0bd4d]"
            >
              <Plus size={18} />
              አዲስ አባል
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          STATISTICS
      ======================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* TOTAL */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                ጠቅላላ አባላት
              </p>

              <p className="mt-2 text-3xl font-bold text-[#0d3b78]">
                {totalMembers}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0d3b78]/10 text-[#0d3b78]">
              <Users size={22} />
            </div>
          </div>

          <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-full rounded-full bg-[#0d3b78]" />
          </div>
        </div>

        {/* MALE */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                ወንድ አባላት
              </p>

              <p className="mt-2 text-3xl font-bold text-[#0d3b78]">
                {maleMembers}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0d3b78]">
              <UserRound size={22} />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            ከጠቅላላ አባላት
          </p>
        </div>

        {/* FEMALE */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                ሴት አባላት
              </p>

              <p className="mt-2 text-3xl font-bold text-[#0d3b78]">
                {femaleMembers}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-[#9b4d74]">
              <UserRoundCheck size={22} />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            ከጠቅላላ አባላት
          </p>
        </div>

        {/* NEW MEMBERS */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                አዲስ አባላት
              </p>

              <p className="mt-2 text-3xl font-bold text-[#0d3b78]">
                {newMembers}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#a17b05]">
              <UserRoundX size={22} />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            አዲስ ምዝገባ
          </p>
        </div>
      </section>

      {/* ========================================================
          ERROR
      ======================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100">
              !
            </div>

            <div>
              <p className="font-semibold">
                ስህተት ተፈጥሯል
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SEARCH + FILTER CARD
      ======================================================== */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Card Header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d3b78]/10 text-[#0d3b78]">
                  <Filter size={18} />
                </div>

                <h2 className="font-bold text-[#172033]">
                  አባላትን ይፈልጉ
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                በስም፣ በምዝገባ ቁጥር ወይም በስልክ ይፈልጉ።
              </p>
            </div>

            {(search ||
              genderFilter !== "all" ||
              registrationFilter !== "all") && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-semibold text-[#0d3b78] transition hover:text-[#082d5c]"
              >
                ማጣሪያዎችን አጥፋ
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 lg:grid-cols-4">
            {/* SEARCH */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#172033]">
                አባል ፈልግ
              </label>

              <div className="relative">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ስም፣ የምዝገባ ቁጥር ወይም ስልክ..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-[#172033] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0d3b78] focus:bg-white focus:ring-4 focus:ring-[#0d3b78]/10"
                />
              </div>
            </div>

            {/* GENDER */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#172033]">
                ጾታ
              </label>

              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-[#172033] outline-none transition hover:border-slate-300 focus:border-[#0d3b78] focus:bg-white focus:ring-4 focus:ring-[#0d3b78]/10"
              >
                <option value="all">ሁሉም</option>
                <option value="male">ወንድ</option>
                <option value="female">ሴት</option>
              </select>
            </div>

            {/* REGISTRATION TYPE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#172033]">
                የምዝገባ አይነት
              </label>

              <select
                value={registrationFilter}
                onChange={(e) =>
                  setRegistrationFilter(e.target.value)
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-[#172033] outline-none transition hover:border-slate-300 focus:border-[#0d3b78] focus:bg-white focus:ring-4 focus:ring-[#0d3b78]/10"
              >
                <option value="all">ሁሉም</option>
                <option value="new">አዲስ</option>
                <option value="existing">ነባር</option>
              </select>
            </div>
          </div>

          {/* FILTER RESULT BAR */}
          <div className="mt-5 flex flex-col gap-3 rounded-xl bg-[#f8f5ec] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              የተገኙ አባላት፦{" "}
              <span className="font-bold text-[#0d3b78]">
                {filteredMembers.length}
              </span>
            </p>

            <button
              type="button"
              onClick={() => loadMembers(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#0d3b78]/20 bg-white px-3 py-2 text-sm font-semibold text-[#0d3b78] shadow-sm transition hover:bg-[#0d3b78]/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />

              {refreshing
                ? "በመጫን ላይ..."
                : "መረጃ አድስ"}
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          MEMBERS TABLE
      ======================================================== */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Table Header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50 px-6 py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#172033]">
                የተመዘገቡ አባላት
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                የአባላት መረጃ እና የአስተዳደር ተግባራት።
              </p>
            </div>

            <div className="rounded-full bg-[#0d3b78]/5 px-4 py-2 text-xs font-semibold text-[#0d3b78]">
              {filteredMembers.length} አባላት
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center px-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0d3b78]/10">
              <RefreshCw
                size={25}
                className="animate-spin text-[#0d3b78]"
              />
            </div>

            <p className="mt-4 font-semibold text-[#172033]">
              የአባላት መረጃ በመጫን ላይ...
            </p>

            <p className="mt-1 text-sm text-slate-500">
              እባክዎ ትንሽ ይጠብቁ።
            </p>
          </div>
        ) : filteredMembers.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#0d3b78]/10 text-[#0d3b78]">
              <Users size={34} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#172033]">
              አባል አልተገኘም
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              የፍለጋ መስፈርቱን ይቀይሩ ወይም አዲስ
              አባል ለመመዝገብ ከታች ያለውን አዝራር
              ይጠቀሙ።
            </p>

            <Link
              href="/dashboard/students/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0d3b78] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#0d3b78]/20 transition hover:-translate-y-0.5 hover:bg-[#0a2f61]"
            >
              <Plus size={18} />
              አዲስ አባል ይመዝግቡ
            </Link>
          </div>
        ) : (
          /* TABLE */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                    አባል
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500">
                    የምዝገባ ቁጥር
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500">
                    ጾታ
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500">
                    ስልክ
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500">
                    የምዝገባ ቀን
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                    ተግባር
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => {
                  const photoUrl = photoUrls[member.id];

                  return (
                    <tr
                      key={member.id}
                      className="group transition hover:bg-[#f8f5ec]/45"
                    >
                      {/* MEMBER */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            {photoUrl ? (
                              <img
                                src={photoUrl}
                                alt={`${member.first_name} ${member.father_name}`}
                                className="h-12 w-12 rounded-2xl border-2 border-white object-cover shadow-md ring-1 ring-slate-200"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0d3b78] to-[#1761ad] text-sm font-bold text-white shadow-md">
                                {member.first_name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}

                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                                member.registration_type === "new"
                                  ? "bg-[#d4af37]"
                                  : "bg-emerald-500"
                              }`}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-bold text-[#172033]">
                              {member.first_name}{" "}
                              {member.father_name}{" "}
                              {member.grandfather_name}
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  member.registration_type === "new"
                                    ? "bg-[#d4af37]/15 text-[#8a6900]"
                                    : "bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                {member.registration_type === "new"
                                  ? "አዲስ"
                                  : "ነባር"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* REGISTRATION NUMBER */}
                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#0d3b78]">
                          {member.registration_number}
                        </span>
                      </td>

                      {/* GENDER */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                            member.gender === "male"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-pink-50 text-pink-700"
                          }`}
                        >
                          {member.gender === "male"
                            ? "ወንድ"
                            : "ሴት"}
                        </span>
                      </td>

                      {/* PHONE */}
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {member.phone || (
                          <span className="text-slate-400">
                            -
                          </span>
                        )}
                      </td>

                      {/* DATE */}
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {formatDate(member.registration_date)}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/student/${member.id}`}
                            title="አባሉን ይመልከቱ"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#0d3b78]/30 hover:bg-[#0d3b78]/5 hover:text-[#0d3b78]"
                          >
                            <Eye size={16} />
                          </Link>

                          <Link
                            href={`/dashboard/student/${member.id}/edit`}
                            title="አባሉን ያስተካክሉ"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0d3b78] text-white shadow-sm transition hover:bg-[#0a2f61]"
                          >
                            <Pencil size={16} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => deleteMember(member)}
                            title="አባሉን ይሰርዙ"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ========================================================
          FOOTER SUMMARY
      ======================================================== */}

      {!loading && filteredMembers.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#d4af37]/20 bg-gradient-to-r from-[#f8f5ec] to-white px-5 py-4 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-sm font-semibold text-[#172033]">
              የአባላት ምዝገባ ስርዓት
            </p>

            <p className="mt-1 text-xs text-slate-500">
              ጽርሐ ጽዮን ሰንበት ት/ቤት
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            ስርዓቱ እየሰራ ነው
          </div>
        </div>
      )}
    </div>
  );
}
