import Image from "next/image";
import Link from "next/link";
import BackToHomeButton from "@/components/layout/BackToHomeButton";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import {
  ArrowLeft,
  Edit,
  User,
  MapPin,
  GraduationCap,
  Church,
  Users,
  Heart,
  Phone,
  CalendarDays,
  IdCard,
  UserRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MemberInformationPage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // ============================================================
  // CHECK AUTHENTICATION
  // ============================================================

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // ============================================================
  // GET MEMBER
  // ============================================================

  const { data: member, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !member) {
    notFound();
  }

  // ============================================================
  // SIGNED MEMBER PHOTO
  // ============================================================

  let memberPhotoUrl: string | null = null;

  if (member.member_photo_path) {
    const { data } = await supabase.storage
      .from("member-photos")
      .createSignedUrl(member.member_photo_path, 60 * 60);

    memberPhotoUrl = data?.signedUrl ?? null;
  }

  // ============================================================
  // SIGNED GUARDIAN PHOTO
  // ============================================================

  let guardianPhotoUrl: string | null = null;

  if (member.guardian_photo_path) {
    const { data } = await supabase.storage
      .from("member-photos")
      .createSignedUrl(member.guardian_photo_path, 60 * 60);

    guardianPhotoUrl = data?.signedUrl ?? null;
  }

  // ============================================================
  // HELPERS
  // ============================================================

  const fullName = [
    member.first_name,
    member.father_name,
    member.grandfather_name,
  ]
    .filter(Boolean)
    .join(" ");

  const gender =
    member.gender === "male"
      ? "ወንድ"
      : member.gender === "female"
        ? "ሴት"
        : "-";

  const previousSundaySchool =
    member.previous_sunday_school === "yes"
      ? "አዎ"
      : member.previous_sunday_school === "no"
        ? "አይ"
        : "-";

  const hasConfessor =
    member.has_confessor === "yes"
      ? "አዎ"
      : member.has_confessor === "no"
        ? "አይ"
        : "-";

  const registrationType =
    member.registration_type === "new"
      ? "አዲስ አባል"
      : member.registration_type === "existing"
        ? "ነባር አባል"
        : member.registration_type ?? "-";

  return (
    <main className="min-h-screen bg-[#f8f5ec] text-[#172033]">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="bg-[#0d3b78] text-white shadow-md">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-6">

          <div className="flex items-center gap-3">

            <Link
              href="/dashboard/student"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>

              <h1 className="text-lg font-bold">
                የአባል መረጃ
              </h1>

              <p className="text-xs text-blue-100">
                የአባሉን ሙሉ መረጃ ይመልከቱ
              </p>

            </div>

          </div>


          <div className="flex items-center gap-2">

            <BackToHomeButton />

            <Link
              href={`/dashboard/student/${member.id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2.5 text-sm font-bold text-[#172033] transition hover:bg-[#e2c65c]"
            >
              <Edit size={17} />
              አርትዕ
            </Link>

          </div>

        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

      </header>


      {/* ======================================================
          CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-7 sm:px-6 sm:py-10">

        {/* ====================================================
            MEMBER PROFILE HEADER
        ==================================================== */}

        <div className="overflow-hidden rounded-3xl border border-[#d4af37]/25 bg-white shadow-sm">

          <div className="h-2 bg-gradient-to-r from-[#0d3b78] via-[#d4af37] to-[#0d3b78]" />

          <div className="p-6 sm:p-8">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

              {/* Member Photo */}

              <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#d4af37]/30 bg-[#f8f5ec] shadow-md">

                {memberPhotoUrl ? (
                  <Image
                    src={memberPhotoUrl}
                    alt={fullName}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <UserRound
                    size={52}
                    className="text-[#0d3b78]/40"
                  />
                )}

              </div>


              {/* Name */}

              <div className="flex-1">

                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-xs font-semibold text-[#0d3b78]">

                  <IdCard size={14} />

                  {member.registration_number}

                </div>

                <h2 className="text-2xl font-bold text-[#172033] sm:text-3xl">
                  {fullName}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  {registrationType}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ====================================================
            PERSONAL INFORMATION
        ==================================================== */}

        <InformationSection
          icon={<User size={21} />}
          title="የግል መረጃ"
        >

          <InfoItem
            label="ስም"
            value={member.first_name}
          />

          <InfoItem
            label="የአባት ስም"
            value={member.father_name}
          />

          <InfoItem
            label="የአያት ስም"
            value={member.grandfather_name}
          />

          <InfoItem
            label="ጾታ"
            value={gender}
          />

          <InfoItem
            label="የትውልድ ቀን"
            value={member.birth_date}
            icon={<CalendarDays size={16} />}
          />

          <InfoItem
            label="ዕድሜ"
            value={
              member.age !== null &&
              member.age !== undefined
                ? `${member.age}`
                : "-"
            }
          />

          <InfoItem
            label="የትውልድ ቦታ"
            value={member.birth_place}
            icon={<MapPin size={16} />}
          />

          <InfoItem
            label="ስልክ"
            value={member.phone}
            icon={<Phone size={16} />}
          />

        </InformationSection>


        {/* ====================================================
            ADDRESS
        ==================================================== */}

        <InformationSection
          icon={<MapPin size={21} />}
          title="የመኖሪያ አድራሻ"
        >

          <InfoItem
            label="ክልል / ከተማ"
            value={member.region}
          />

          <InfoItem
            label="ክፍለ ከተማ"
            value={member.sub_city}
          />

          <InfoItem
            label="ወረዳ"
            value={member.woreda}
          />

          <InfoItem
            label="የመኖሪያ አካባቢ / ሰፈር"
            value={member.neighborhood}
          />

        </InformationSection>


        {/* ====================================================
            EDUCATION
        ==================================================== */}

        <InformationSection
          icon={<GraduationCap size={21} />}
          title="የትምህርት መረጃ"
        >

          <InfoItem
            label="የትምህርት ደረጃ"
            value={member.assigned_education_level}
          />

          <InfoItem
            label="የሚማርበት ት/ቤት / ተቋም"
            value={member.education_school}
          />

          <InfoItem
            label="የክፍል ደረጃ"
            value={member.education_class}
          />

          <InfoItem
            label="የሰንበት ት/ት ቤት የትምህርት ክፍል"
            value={member.assigned_class}
          />

        </InformationSection>


        {/* ====================================================
            CHRISTIAN INFORMATION
        ==================================================== */}

        <InformationSection
          icon={<Church size={21} />}
          title="የክርስትና መረጃ"
        >

          <InfoItem
            label="የክርስትና ስም"
            value={member.christian_name}
          />

          <InfoItem
            label="የተጠመቀበት ቤተ ክርስቲያን"
            value={member.baptism_church}
          />

          <InfoItem
            label="የጥምቀት ዓመት"
            value={member.baptism_year?.toString()}
          />

          <InfoItem
            label="ቀደም ሲል በሰንበት ት/ቤት ነበሩ?"
            value={previousSundaySchool}
          />

          <InfoItem
            label="የቀድሞ ሰንበት ት/ቤት"
            value={member.previous_sunday_school_place}
          />

          <InfoItem
            label="አባተ ንስሐ አለ?"
            value={hasConfessor}
          />

          <InfoItem
            label="የአባተ ንስሐ ስም"
            value={member.confessor_name}
          />

          <InfoItem
            label="የአባተ ንስሐ ስልክ"
            value={member.confessor_phone}
            icon={<Phone size={16} />}
          />

          <InfoItem
            label="የአባተ ንስሐ ቤተ ክርስቲያን"
            value={member.confessor_church}
          />

        </InformationSection>


        {/* ====================================================
            GUARDIAN
        ==================================================== */}

        <InformationSection
          icon={<Users size={21} />}
          title="የወላጅ / አሳዳጊ መረጃ"
        >

          <div className="mb-6 flex justify-center sm:col-span-2 sm:justify-start">

            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#d4af37]/25 bg-[#f8f5ec]">

              {guardianPhotoUrl ? (
                <Image
                  src={guardianPhotoUrl}
                  alt={member.guardian_name ?? "አሳዳጊ"}
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <Users
                  size={42}
                  className="text-[#0d3b78]/40"
                />
              )}

            </div>

          </div>

          <InfoItem
            label="የወላጅ / አሳዳጊ ሙሉ ስም"
            value={member.guardian_name}
          />

          <InfoItem
            label="ዝምድና"
            value={member.guardian_relationship}
          />

          <InfoItem
            label="ስልክ"
            value={member.guardian_phone}
            icon={<Phone size={16} />}
          />

          <InfoItem
            label="አድራሻ"
            value={member.guardian_address}
            icon={<MapPin size={16} />}
          />

        </InformationSection>


        {/* ====================================================
            INTERESTS
        ==================================================== */}

        <InformationSection
          icon={<Heart size={21} />}
          title="ፍላጎት እና ችሎታ"
        >

          <div className="md:col-span-2">

            <p className="mb-2 text-xs font-semibold text-gray-500">
              የተመረጡ ክፍሎች
            </p>

            {Array.isArray(member.interests) &&
            member.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">

                {member.interests.map(
                  (interest: string, index: number) => (
                    <span
                      key={`${interest}-${index}`}
                      className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1.5 text-sm font-medium text-[#0d3b78]"
                    >
                      {interest}
                    </span>
                  ),
                )}

              </div>
            ) : (
              <p className="text-sm text-gray-400">
                ምንም አልተመረጠም
              </p>
            )}

          </div>


          <InfoItem
            label="ሌሎች ችሎታዎች / ፍላጎቶች"
            value={member.other_skills}
          />

        </InformationSection>


        {/* ====================================================
            CONFIRMATION & SIGNATURES
        ==================================================== */}

        <InformationSection
          icon={<IdCard size={21} />}
          title="ማረጋገጫ እና ፊርማ"
        >

          <InfoItem
            label="የአባል ማረጋገጫ"
            value={
              member.member_confirmed
                ? "ተረጋግጧል"
                : "አልተረጋገጠም"
            }
          />

          {/* MEMBER SIGNATURE */}

          <SignatureItem
            label="የአባል ፊርማ"
            value={member.member_signature}
          />

          {/* GUARDIAN SIGNATURE */}

          <SignatureItem
            label="የአሳዳጊ ፊርማ"
            value={member.guardian_signature}
          />

          <InfoItem
            label="የመመዝገቢያ ቀን"
            value={member.registration_date}
            icon={<CalendarDays size={16} />}
          />

        </InformationSection>


        {/* ====================================================
            REGISTRAR INFORMATION
        ==================================================== */}

        <InformationSection
          icon={<User size={21} />}
          title="የአስተዳደር መረጃ"
        >

          <InfoItem
            label="የአባል ID"
            value={member.member_id}
          />

          <InfoItem
            label="የተመደበ ክፍል"
            value={member.assigned_class}
          />

          <InfoItem
            label="የተመደበ የትምህርት ደረጃ"
            value={member.assigned_education_level}
          />

          <InfoItem
            label="መዝጋቢ"
            value={member.registrar_name}
          />

          {/* REGISTRAR SIGNATURE */}

          <SignatureItem
            label="የመዝጋቢ ፊርማ"
            value={member.registrar_signature}
          />

          <InfoItem
            label="የክፍል መሪ"
            value={member.class_leader_name}
          />

          {/* CLASS LEADER SIGNATURE */}

          <SignatureItem
            label="የክፍል መሪ ፊርማ"
            value={member.class_leader_signature}
          />

          <InfoItem
            label="ሰብሳቢ"
            value={member.chairman_name}
          />

          {/* CHAIRMAN SIGNATURE */}

          <SignatureItem
            label="የሰብሳቢ ፊርማ"
            value={member.chairman_signature}
          />

        </InformationSection>


        {/* ====================================================
            BOTTOM ACTIONS
        ==================================================== */}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">

          <Link
            href="/dashboard/student"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#172033] shadow-sm transition hover:border-[#0d3b78] hover:text-[#0d3b78]"
          >
            <ArrowLeft size={17} />
            ወደ አባላት ዝርዝር
          </Link>

          <Link
            href={`/dashboard/student/${member.id}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d3b78] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#092d5d]"
          >
            <Edit size={17} />
            የአባሉን መረጃ አርትዕ
          </Link>

        </div>

      </section>

    </main>
  );
}


/* ============================================================
   INFORMATION SECTION
============================================================ */

function InformationSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-7 overflow-hidden rounded-3xl border border-[#d4af37]/20 bg-white shadow-sm">

      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d3b78]/10 text-[#0d3b78]">
          {icon}
        </div>

        <h3 className="font-bold text-[#172033]">
          {title}
        </h3>

      </div>

      <div className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
        {children}
      </div>

    </section>
  );
}


/* ============================================================
   INFORMATION ITEM
============================================================ */

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | number | null;
  icon?: ReactNode;
}) {
  return (
    <div>

      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">

        {icon}

        {label}

      </div>

      <p className="mt-1.5 break-words text-sm font-medium text-[#172033]">
        {value !== null &&
        value !== undefined &&
        value !== ""
          ? String(value)
          : "-"}
      </p>

    </div>
  );
}


/* ============================================================
   SIGNATURE ITEM
============================================================ */

function SignatureItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  const isSignatureImage =
    typeof value === "string" &&
    value.startsWith("data:image/");

  return (
    <div className="min-w-0">

      {/* LABEL */}

      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
        <Edit size={14} />
        {label}
      </div>


      {/* SIGNATURE DISPLAY */}

      <div className="mt-2 flex min-h-[100px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-[#fafafa] p-4 sm:justify-start">

        {isSignatureImage ? (
          <img
            src={value}
            alt={label}
            className="max-h-24 max-w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 text-center">

            <Edit
              size={25}
              className="text-gray-300"
            />

            <p className="text-sm font-medium text-gray-400">
              ፊርማ የለም
            </p>

          </div>
        )}

      </div>

    </div>
  );
}
