
"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  Eraser,
  UserRound,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import BackToHomeButton from "@/components/layout/BackToHomeButton";

type RegistrationType = "new" | "existing";
type Gender = "male" | "female";
type YesNo = "yes" | "no" | "";

type Interest =
  | "mezmur"
  | "art"
  | "instrument"
  | "charity"
  | "development"
  | "other";

type FormData = {
  // Registration
  registrationType: RegistrationType;
  registrationNumber: string;
  registrationDate: string;

  // Personal
  firstName: string;
  fatherName: string;
  grandfatherName: string;
  gender: Gender | "";
  birthDate: string;
  birthPlace: string;

  // Address
  region: string;
  subCity: string;
  woreda: string;
  neighborhood: string;
  phone: string;

  // Christian life
  christianName: string;
  baptismChurch: string;
  baptismYear: string;
  previousSundaySchool: YesNo;
  previousSundaySchoolPlace: string;
  hasConfessor: YesNo;
  confessorName: string;
  confessorPhone: string;
  confessorChurch: string;

  // Guardian
  guardianName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianAddress: string;

  // Interests
  interests: Interest[];
  otherSkills: string;

  // Confirmation
  memberConfirmed: boolean;
  memberSignature: string;
  guardianSignature: string;

  // Registrar
  memberId: string;
  assignedClass: string;
  assignedEducationLevel: string;
  registrarName: string;
  registrarSignature: string;
  classLeaderName: string;
  classLeaderSignature: string;
  chairmanName: string;
  chairmanSignature: string;
};

const initialForm: FormData = {
  registrationType: "new",
  registrationNumber: "",
  registrationDate: "",

  firstName: "",
  fatherName: "",
  grandfatherName: "",
  gender: "",
  birthDate: "",
  birthPlace: "",

  region: "",
  subCity: "",
  woreda: "",
  neighborhood: "",
  phone: "",

  christianName: "",
  baptismChurch: "",
  baptismYear: "",
  previousSundaySchool: "",
  previousSundaySchoolPlace: "",
  hasConfessor: "",
  confessorName: "",
  confessorPhone: "",
  confessorChurch: "",

  guardianName: "",
  guardianRelationship: "",
  guardianPhone: "",
  guardianAddress: "",

  interests: [],
  otherSkills: "",

  memberConfirmed: false,
  memberSignature: "",
  guardianSignature: "",

  memberId: "",
  assignedClass: "",
  assignedEducationLevel: "",
  registrarName: "",
  registrarSignature: "",
  classLeaderName: "",
  classLeaderSignature: "",
  chairmanName: "",
  chairmanSignature: "",
};

const interests: { value: Interest; label: string }[] = [
  { value: "mezmur", label: "መዝሙር ክፍል" },
  { value: "art", label: "ኪነጥበብ ክፍል" },
  { value: "instrument", label: "ዜማ መሳሪያ ክፍል" },
  { value: "charity", label: "በጎ አድራጎት ክፍል" },
  { value: "development", label: "ልማት ክፍል" },
  { value: "other", label: "ሌላ" },
];

const ethiopianRegions = [
  "አዲስ አበባ",
  "ኦሮሚያ",
];

const oromiaSubCities = ["ሸገር"];

const shegerWoredas = [
  "ቱሉ ዲምቱ",
  "ኮዬ ፈጬ",
];

const ETHIOPIAN_MONTHS = [
  "መስከረም",
  "ጥቅምት",
  "ኅዳር",
  "ታኅሣሥ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዝያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሐሴ",
  "ጳጉሜን",
] as const;

const ETHIOPIAN_WEEKDAYS = [
  "እሑድ",
  "ሰኞ",
  "ማክሰኞ",
  "ረቡዕ",
  "ሐሙስ",
  "ዓርብ",
  "ቅዳሜ",
] as const;

function getTodayDate(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isEthiopianLeapYear(year: number): boolean {
  return (year + 1) % 4 === 0;
}

function parseIsoDate(dateString: string): Date | null {
  if (!dateString) return null;

  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(Date.UTC(year, month - 1, day));
}

function formatIsoDate(date: Date): string {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

// Ethiopian 2011-01-01 = Gregorian 2018-09-11.
// The form displays Ethiopian dates but stores normal ISO/Gregorian dates
// in Supabase so the existing PostgreSQL date columns continue to work.
function ethiopianToGregorian(
  year: number,
  month: number,
  day: number,
): string {
  const anchor = new Date(Date.UTC(2018, 8, 11));
  let offset = 0;

  if (year >= 2011) {
    for (let currentYear = 2011; currentYear < year; currentYear++) {
      offset += 365 + (isEthiopianLeapYear(currentYear) ? 1 : 0);
    }
  } else {
    for (let currentYear = year; currentYear < 2011; currentYear++) {
      offset -= 365 + (isEthiopianLeapYear(currentYear) ? 1 : 0);
    }
  }

  offset += (month - 1) * 30;
  offset += day - 1;

  anchor.setUTCDate(anchor.getUTCDate() + offset);

  return formatIsoDate(anchor);
}

function gregorianToEthiopian(dateString: string): {
  year: number;
  month: number;
  day: number;
} | null {
  const target = parseIsoDate(dateString);

  if (!target) return null;

  let year = target.getUTCFullYear() - 7;

  while (
    target.getTime() <
    (parseIsoDate(ethiopianToGregorian(year, 1, 1))?.getTime() ?? 0)
  ) {
    year--;
  }

  while (
    target.getTime() >=
    (parseIsoDate(ethiopianToGregorian(year + 1, 1, 1))?.getTime() ??
      Number.MAX_SAFE_INTEGER)
  ) {
    year++;
  }

  const yearStart = parseIsoDate(
    ethiopianToGregorian(year, 1, 1),
  );

  if (!yearStart) return null;

  const difference = Math.floor(
    (target.getTime() - yearStart.getTime()) /
      (24 * 60 * 60 * 1000),
  );

  const month = Math.floor(difference / 30) + 1;
  const day = (difference % 30) + 1;

  return { year, month, day };
}

function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;

  const birth = new Date(birthDate);

  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();

  const monthDifference =
    today.getMonth() - birth.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age : null;
}

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");

  if (parts.length > 1) {
    return parts.pop()?.toLowerCase() || "jpg";
  }

  return "jpg";
}

export default function MemberRegistrationForm() {
  const [form, setForm] = useState<FormData>(() => ({
    ...initialForm,
    registrationDate: getTodayDate(),
  }));

  const [memberPhoto, setMemberPhoto] =
    useState<File | null>(null);

  const [guardianPhoto, setGuardianPhoto] =
    useState<File | null>(null);

  const [memberPhotoPreview, setMemberPhotoPreview] =
    useState<string | null>(null);

  const [guardianPhotoPreview, setGuardianPhotoPreview] =
    useState<string | null>(null);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [submitted, setSubmitted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const age = useMemo(
    () => calculateAge(form.birthDate),
    [form.birthDate],
  );

  function updateField<K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      const next = { ...current };

      delete next[field as string];

      return next;
    });
  }

  function handleRegionChange(value: string) {
    setForm((current) => ({
      ...current,
      region: value,
      subCity: "",
      woreda: "",
    }));

    setErrors((current) => {
      const next = { ...current };

      delete next.region;
      delete next.subCity;
      delete next.woreda;

      return next;
    });
  }

  function handleSubCityChange(value: string) {
    setForm((current) => ({
      ...current,
      subCity: value,
      woreda: "",
    }));

    setErrors((current) => {
      const next = { ...current };

      delete next.subCity;
      delete next.woreda;

      return next;
    });
  }

  function toggleInterest(interest: Interest) {
    setForm((current) => {
      const exists =
        current.interests.includes(interest);

      return {
        ...current,
        interests: exists
          ? current.interests.filter(
              (item) => item !== interest,
            )
          : [
              ...current.interests,
              interest,
            ],
      };
    });
  }

  function handlePhotoChange(
    event: ChangeEvent<HTMLInputElement>,
    type: "member" | "guardian",
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({
        ...current,
        [type === "member"
          ? "memberPhoto"
          : "guardianPhoto"]:
          "እባክዎ የምስል ፋይል ይምረጡ።",
      }));

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        [type === "member"
          ? "memberPhoto"
          : "guardianPhoto"]:
          "ፎቶው ከ5MB መብለጥ የለበትም።",
      }));

      return;
    }

    const preview =
      URL.createObjectURL(file);

    if (type === "member") {
      if (memberPhotoPreview) {
        URL.revokeObjectURL(
          memberPhotoPreview,
        );
      }

      setMemberPhoto(file);
      setMemberPhotoPreview(preview);

      setErrors((current) => {
        const next = { ...current };

        delete next.memberPhoto;

        return next;
      });
    } else {
      if (guardianPhotoPreview) {
        URL.revokeObjectURL(
          guardianPhotoPreview,
        );
      }

      setGuardianPhoto(file);
      setGuardianPhotoPreview(preview);

      setErrors((current) => {
        const next = { ...current };

        delete next.guardianPhoto;

        return next;
      });
    }
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!form.firstName.trim()) {
      nextErrors.firstName =
        "የአባሉን ስም ያስገቡ።";
    }

    if (!form.fatherName.trim()) {
      nextErrors.fatherName =
        "የአባት ስም ያስገቡ።";
    }

    if (!form.grandfatherName.trim()) {
      nextErrors.grandfatherName =
        "የአያት ስም ያስገቡ።";
    }

    if (!form.gender) {
      nextErrors.gender =
        "ጾታ ይምረጡ።";
    }

    if (!form.birthDate) {
      nextErrors.birthDate =
        "የትውልድ ቀን ያስገቡ።";
    }

    if (!form.birthPlace.trim()) {
      nextErrors.birthPlace =
        "የትውልድ ቦታ ያስገቡ።";
    }

    if (!form.region) {
      nextErrors.region =
        "ክልል/ከተማ ይምረጡ።";
    }

    if (
      form.region === "ኦሮሚያ" &&
      !form.subCity
    ) {
      nextErrors.subCity =
        "ክፍለ ከተማ ይምረጡ።";
    }

    if (
      form.region === "ኦሮሚያ" &&
      !form.woreda
    ) {
      nextErrors.woreda =
        "ወረዳ ይምረጡ።";
    }

    if (!form.neighborhood.trim()) {
      nextErrors.neighborhood =
        "የመኖሪያ አካባቢ/ሰፈር ያስገቡ።";
    }

    if (!form.phone.trim()) {
      nextErrors.phone =
        "ስልክ ቁጥር ያስገቡ።";
    }

    if (!form.christianName.trim()) {
      nextErrors.christianName =
        "የክርስትና ስም ያስገቡ።";
    }

    if (!form.baptismChurch.trim()) {
      nextErrors.baptismChurch =
        "የተጠመቁበትን ቤተ ክርስቲያን ያስገቡ።";
    }

    if (!form.baptismYear.trim()) {
      nextErrors.baptismYear =
        "የጥምቀት ዓመት ያስገቡ።";
    }

    if (!form.previousSundaySchool) {
      nextErrors.previousSundaySchool =
        "እባክዎ ያለፈውን የሰንበት ት/ቤት መረጃ ይምረጡ።";
    }

    if (
      form.previousSundaySchool === "yes" &&
      !form.previousSundaySchoolPlace.trim()
    ) {
      nextErrors.previousSundaySchoolPlace =
        "በፊት የተማሩበትን ሰ/ት/ቤት ያስገቡ።";
    }

    if (!form.hasConfessor) {
      nextErrors.hasConfessor =
        "እባክዎ ይምረጡ።";
    }

    if (form.hasConfessor === "yes") {
      if (!form.confessorName.trim()) {
        nextErrors.confessorName =
          "የንስሐ አባት ስም ያስገቡ።";
      }

      if (!form.confessorPhone.trim()) {
        nextErrors.confessorPhone =
          "የንስሐ አባት ስልክ ያስገቡ።";
      }

      if (!form.confessorChurch.trim()) {
        nextErrors.confessorChurch =
          "የሚያገለግሉበትን ደብር ያስገቡ።";
      }
    }

    if (!form.guardianName.trim()) {
      nextErrors.guardianName =
        "የወላጅ/አሳዳጊ ሙሉ ስም ያስገቡ።";
    }

    if (!form.guardianRelationship.trim()) {
      nextErrors.guardianRelationship =
        "ከአባሉ ጋር ያለውን ግንኙነት ያስገቡ።";
    }

    if (!form.guardianPhone.trim()) {
      nextErrors.guardianPhone =
        "የወላጅ/አሳዳጊ ስልክ ያስገቡ።";
    }

    if (!form.guardianAddress.trim()) {
      nextErrors.guardianAddress =
        "የወላጅ/አሳዳጊ አድራሻ ያስገቡ።";
    }

    if (!memberPhoto) {
      nextErrors.memberPhoto =
        "የአባሉን ፎቶ ያስገቡ።";
    }

    if (!guardianPhoto) {
      nextErrors.guardianPhoto =
        "የወላጅ/አሳዳጊ ፎቶ ያስገቱ።";
    }

    if (!form.memberConfirmed) {
      nextErrors.memberConfirmed =
        "የማረጋገጫ ሳጥኑን ይምረጡ።";
    }

    // ------------------------------------------------------------
    // REQUIRED SIGNATURES
    // ------------------------------------------------------------

    if (!form.memberSignature.trim()) {
      nextErrors.memberSignature =
        "የአባሉ ፊርማ ያስፈልጋል።";
    }

    if (!form.guardianSignature.trim()) {
      nextErrors.guardianSignature =
        "የወላጅ/አሳዳጊ ፊርማ ያስፈልጋል።";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  // ============================================================
  // SAVE MEMBER
  // ============================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSubmitted(false);

    setErrors((current) => {
      const next = { ...current };

      delete next.submit;

      return next;
    });

    // ----------------------------------------------------------
    // VALIDATE
    // ----------------------------------------------------------

    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setLoading(true);

    const supabase = createClient();

    let memberPhotoPath: string | null = null;
    let guardianPhotoPath: string | null = null;

    try {
      // --------------------------------------------------------
      // CREATE MEMBER UUID
      // --------------------------------------------------------

      const memberUuid = crypto.randomUUID();

      // --------------------------------------------------------
      // REGISTRATION NUMBER
      // --------------------------------------------------------

      const registrationNumber =
        form.registrationNumber.trim() ||
        `MEM-${Date.now()
          .toString()
          .slice(-8)}`;

      // --------------------------------------------------------
      // PHOTO PATHS
      // --------------------------------------------------------

      memberPhotoPath =
        `${memberUuid}/member-${Date.now()}.${getFileExtension(
          memberPhoto!.name,
        )}`;

      guardianPhotoPath =
        `${memberUuid}/guardian-${Date.now()}.${getFileExtension(
          guardianPhoto!.name,
        )}`;

      // --------------------------------------------------------
      // UPLOAD MEMBER PHOTO
      // --------------------------------------------------------

      const {
        error: memberPhotoError,
      } = await supabase.storage
        .from("member-photos")
        .upload(
          memberPhotoPath,
          memberPhoto!,
          {
            cacheControl: "3600",
            upsert: false,
          },
        );

      if (memberPhotoError) {
        throw new Error(
          `የአባሉ ፎቶ መጫን አልተሳካም፦ ${memberPhotoError.message}`,
        );
      }

      // --------------------------------------------------------
      // UPLOAD GUARDIAN PHOTO
      // --------------------------------------------------------

      const {
        error: guardianPhotoError,
      } = await supabase.storage
        .from("member-photos")
        .upload(
          guardianPhotoPath,
          guardianPhoto!,
          {
            cacheControl: "3600",
            upsert: false,
          },
        );

      if (guardianPhotoError) {
        await supabase.storage
          .from("member-photos")
          .remove([
            memberPhotoPath,
          ]);

        throw new Error(
          `የወላጅ/አሳዳጊ ፎቶ መጫን አልተሳካም፦ ${guardianPhotoError.message}`,
        );
      }

      // --------------------------------------------------------
      // INSERT MEMBER INTO DATABASE
      // --------------------------------------------------------

      const { error: insertError } =
        await supabase
          .from("members")
          .insert({
            id: memberUuid,

            registration_number:
              registrationNumber,

            registration_type:
              form.registrationType,

            registration_date:
              form.registrationDate ||
              getTodayDate(),

            // Personal
            first_name:
              form.firstName.trim(),

            father_name:
              form.fatherName.trim(),

            grandfather_name:
              form.grandfatherName.trim(),

            gender: form.gender,

            birth_date:
              form.birthDate,

            birth_place:
              form.birthPlace.trim(),

            age: age,

            // Address
            region:
              form.region || null,

            sub_city:
              form.subCity || null,

            woreda:
              form.woreda || null,

            neighborhood:
              form.neighborhood.trim(),

            phone:
              form.phone.trim(),

            // Christian life
            christian_name:
              form.christianName.trim(),

            baptism_church:
              form.baptismChurch.trim(),

            baptism_year:
              form.baptismYear
                ? Number(form.baptismYear)
                : null,

            previous_sunday_school:
              form.previousSundaySchool ||
              null,

            previous_sunday_school_place:
              form.previousSundaySchoolPlace.trim() ||
              null,

            has_confessor:
              form.hasConfessor || null,

            confessor_name:
              form.confessorName.trim() ||
              null,

            confessor_phone:
              form.confessorPhone.trim() ||
              null,

            confessor_church:
              form.confessorChurch.trim() ||
              null,

            // Guardian
            guardian_name:
              form.guardianName.trim(),

            guardian_relationship:
              form.guardianRelationship.trim(),

            guardian_phone:
              form.guardianPhone.trim(),

            guardian_address:
              form.guardianAddress.trim(),

            // Interests
            interests:
              form.interests,

            other_skills:
              form.otherSkills.trim() ||
              null,

            // Confirmation
            member_confirmed:
              form.memberConfirmed,

            member_signature:
              form.memberSignature.trim() ||
              null,

            guardian_signature:
              form.guardianSignature.trim() ||
              null,

            // Registrar
            member_id:
              form.memberId.trim() ||
              null,

            assigned_class:
              form.assignedClass.trim() ||
              null,

            assigned_education_level:
              form.assignedEducationLevel.trim() ||
              null,

            registrar_name:
              form.registrarName.trim() ||
              null,

            registrar_signature:
              form.registrarSignature.trim() ||
              null,

            class_leader_name:
              form.classLeaderName.trim() ||
              null,

            class_leader_signature:
              form.classLeaderSignature.trim() ||
              null,

            chairman_name:
              form.chairmanName.trim() ||
              null,

            chairman_signature:
              form.chairmanSignature.trim() ||
              null,

            // Photos
            member_photo_path:
              memberPhotoPath,

            guardian_photo_path:
              guardianPhotoPath,
          });

      // --------------------------------------------------------
      // DATABASE ERROR
      // --------------------------------------------------------

      if (insertError) {
        await supabase.storage
          .from("member-photos")
          .remove([
            memberPhotoPath,
            guardianPhotoPath,
          ]);

        throw new Error(
          `የአባሉ መረጃ ማስቀመጥ አልተሳካም፦ ${insertError.message}`,
        );
      }

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      setForm((current) => ({
        ...current,
        registrationNumber,
      }));

      setSubmitted(true);

      // Clear photos
      setMemberPhoto(null);
      setGuardianPhoto(null);

      if (memberPhotoPreview) {
        URL.revokeObjectURL(
          memberPhotoPreview,
        );
      }

      if (guardianPhotoPreview) {
        URL.revokeObjectURL(
          guardianPhotoPreview,
        );
      }

      setMemberPhotoPreview(null);
      setGuardianPhotoPreview(null);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Member registration error:",
        error,
      );

      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "የአባሉ መረጃ ማስቀመጥ አልተሳካም።",
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setLoading(false);
    }
  }

  function inputClass(field: string) {
    return `
      w-full rounded-xl border bg-white/90 px-4 py-3 text-sm text-[#172033]
      shadow-sm outline-none transition duration-200 placeholder:text-slate-400
      hover:border-slate-300
      ${
        errors[field]
          ? "border-red-400 bg-red-50/30 ring-4 ring-red-100"
          : "border-slate-200 focus:border-[#0d3b78] focus:bg-white focus:ring-4 focus:ring-[#0d3b78]/10"
      }
    `;
  }

  function errorText(field: string) {
    if (!errors[field]) return null;

    return (
      <p className="mt-1 text-xs font-medium text-red-600">
        {errors[field]}
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-6xl space-y-7 pb-12"
    >
      {/* PREMIUM PAGE HEADER */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d3b78] via-[#104b91] to-[#082d5d] shadow-xl shadow-[#0d3b78]/10">
        <div className="relative px-6 py-7 sm:px-8 sm:py-9">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#d4af37]/10 blur-2xl" />
          <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-white/5 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm">
                <img
                  src="/logo.png"
                  alt="ጽርሐ ጽዮን ሰንበት ት/ቤት"
                  className="h-12 w-12 object-contain"
                />
              </div>

              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-[#d4af37]">
                  ጽርሐ ጽዮን ሰንበት ት/ቤት
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  የአባል ምዝገባ
                </h1>
                <p className="mt-1 text-sm text-blue-100">
                  የአባሉን መረጃ በተሟላ እና በትክክል ይመዝግቡ።
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <BackToHomeButton />
            </div>
          </div>
        </div>
      </div>

      {/* FORM INTRO */}
      <div className="flex items-center gap-3 rounded-2xl border border-[#d4af37]/25 bg-white px-5 py-4 shadow-sm">
        <div className="h-2 w-2 shrink-0 rounded-full bg-[#d4af37] shadow-[0_0_0_5px_rgba(212,175,55,0.12)]" />
        <p className="text-sm font-medium leading-6 text-slate-600">
          እባክዎ ሁሉንም አስፈላጊ መረጃዎች ይሙሉ። በ <span className="font-bold text-red-500">*</span> የተመለከቱ መስኮች ግዴታ ናቸው።
        </p>
      </div>
      {/* ========================================================= */}
      {/* SUCCESS MESSAGE                                           */}
      {/* ========================================================= */}

      {submitted && (
        <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800">
          <CheckCircle2
            className="mt-0.5 shrink-0"
            size={20}
          />

          <div>
            <p className="font-bold">
              የአባል መረጃ በተሳካ ሁኔታ ተመዝግቧል
            </p>

            <p className="mt-1 text-sm">
              የምዝገባ ቁጥር፦{" "}
              <strong>
                {form.registrationNumber}
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DATABASE ERROR                                            */}
      {/* ========================================================= */}

      {errors.submit && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {errors.submit}
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. REGISTRATION INFORMATION                               */}
      {/* ========================================================= */}

      <Section
        number="1"
        title="የምዝገባ መረጃ"
        icon={<UserRound size={20} />}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="የደብሩ ስም">
            <input
              value="ፈጬ ደ/ገ/ቅ/ማርያም ቤ/ን"
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600"
            />
          </Field>

          <Field label="የሰ/ት/ቤቱ ስም">
            <input
              value="ጽርሐ ጽዮን ሰ/ት/ቤት"
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600"
            />
          </Field>

          <Field label="የምዝገባ አይነት">
            <div className="grid grid-cols-2 gap-3">
              <RadioButton
                name="registrationType"
                value="new"
                label="አዲስ አባል"
                checked={
                  form.registrationType ===
                  "new"
                }
                onChange={() =>
                  updateField(
                    "registrationType",
                    "new",
                  )
                }
              />

              <RadioButton
                name="registrationType"
                value="existing"
                label="ነባር አባል"
                checked={
                  form.registrationType ===
                  "existing"
                }
                onChange={() =>
                  updateField(
                    "registrationType",
                    "existing",
                  )
                }
              />
            </div>
          </Field>

          <Field label="የምዝገባ ቁጥር">
            <input
              value={form.registrationNumber}
              onChange={(e) =>
                updateField(
                  "registrationNumber",
                  e.target.value,
                )
              }
              placeholder="ባዶ ከሆነ በሲስተሙ ይመደባል"
              className={inputClass(
                "registrationNumber",
              )}
            />
          </Field>

          <Field label="የምዝገባ ቀን" required>
            <EthiopianDatePicker
              value={form.registrationDate}
              onChange={(value) =>
                updateField(
                  "registrationDate",
                  value,
                )
              }
              error={!!errors.registrationDate}
              maxDate={getTodayDate()}
            />

            {errorText("registrationDate")}
          </Field>
        </div>
      </Section>

      {/* ========================================================= */}
      {/* 2. PERSONAL INFORMATION                                   */}
      {/* ========================================================= */}

      <Section
        number="2"
        title="የአባሉ ግል መረጃ"
        icon={<UserRound size={20} />}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="ስም"
            required
          >
            <input
              value={form.firstName}
              onChange={(e) =>
                updateField(
                  "firstName",
                  e.target.value,
                )
              }
              placeholder="የአባሉ ስም"
              className={inputClass(
                "firstName",
              )}
            />

            {errorText("firstName")}
          </Field>

          <Field
            label="የአባት ስም"
            required
          >
            <input
              value={form.fatherName}
              onChange={(e) =>
                updateField(
                  "fatherName",
                  e.target.value,
                )
              }
              placeholder="የአባት ስም"
              className={inputClass(
                "fatherName",
              )}
            />

            {errorText("fatherName")}
          </Field>

          <Field
            label="የአያት ስም"
            required
          >
            <input
              value={form.grandfatherName}
              onChange={(e) =>
                updateField(
                  "grandfatherName",
                  e.target.value,
                )
              }
              placeholder="የአያት ስም"
              className={inputClass(
                "grandfatherName",
              )}
            />

            {errorText(
              "grandfatherName",
            )}
          </Field>

          <Field
            label="ጾታ"
            required
          >
            <div className="grid grid-cols-2 gap-3">
              <RadioButton
                name="gender"
                value="male"
                label="ወንድ"
                checked={
                  form.gender === "male"
                }
                onChange={() =>
                  updateField(
                    "gender",
                    "male",
                  )
                }
              />

              <RadioButton
                name="gender"
                value="female"
                label="ሴት"
                checked={
                  form.gender === "female"
                }
                onChange={() =>
                  updateField(
                    "gender",
                    "female",
                  )
                }
              />
            </div>

            {errorText("gender")}
          </Field>

          <Field
            label="የትውልድ ቀን"
            required
          >
            <EthiopianDatePicker
              value={form.birthDate}
              onChange={(value) =>
                updateField(
                  "birthDate",
                  value,
                )
              }
              error={!!errors.birthDate}
              maxDate={getTodayDate()}
            />

            {age !== null && (
              <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-[#0d3b78]">
                ዕድሜ፦ {age} ዓመት
              </p>
            )}

            {errorText("birthDate")}
          </Field>

          <Field
            label="የትውልድ ቦታ"
            required
          >
            <input
              value={form.birthPlace}
              onChange={(e) =>
                updateField(
                  "birthPlace",
                  e.target.value,
                )
              }
              placeholder="የተወለዱበት ቦታ"
              className={inputClass(
                "birthPlace",
              )}
            />

            {errorText(
              "birthPlace",
            )}
          </Field>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <PhotoUpload
            title="የአባል ፎቶ"
            preview={memberPhotoPreview}
            error={errors.memberPhoto}
            onChange={(event) =>
              handlePhotoChange(
                event,
                "member",
              )
            }
          />
        </div>
      </Section>

      {/* ========================================================= */}
      {/* 3. ADDRESS                                                */}
      {/* ========================================================= */}

      <Section
        number="3"
        title="የመኖሪያ አድራሻ"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="ክልል/ከተማ"
            required
          >
            <Select
              value={form.region}
              onChange={(e) =>
                handleRegionChange(
                  e.target.value,
                )
              }
              placeholder="ክልል/ከተማ ይምረጡ"
              options={ethiopianRegions}
              error={!!errors.region}
            />

            {errorText("region")}
          </Field>

          <Field
            label="ክፍለ ከተማ"
            required
          >
            <Select
              value={form.subCity}
              onChange={(e) =>
                handleSubCityChange(
                  e.target.value,
                )
              }
              placeholder={
                form.region ===
                "ኦሮሚያ"
                  ? "ሸገር ይምረጡ"
                  : "መጀመሪያ ክልል/ከተማ ይምረጡ"
              }
              options={
                form.region ===
                "ኦሮሚያ"
                  ? oromiaSubCities
                  : []
              }
              disabled={!form.region}
              error={!!errors.subCity}
            />

            {errorText("subCity")}
          </Field>

          <Field
            label="ወረዳ"
            required
          >
            <Select
              value={form.woreda}
              onChange={(e) =>
                updateField(
                  "woreda",
                  e.target.value,
                )
              }
              placeholder={
                form.subCity ===
                "ሸገር"
                  ? "ወረዳ ይምረጡ"
                  : "መጀመሪያ ክፍለ ከተማ ይምረጡ"
              }
              options={
                form.region ===
                  "ኦሮሚያ" &&
                form.subCity ===
                  "ሸገር"
                  ? shegerWoredas
                  : []
              }
              disabled={!form.subCity}
              error={!!errors.woreda}
            />

            {errorText("woreda")}
          </Field>

          <Field
            label="የመኖሪያ አካባቢ/ሰፈር"
            required
          >
            <input
              value={form.neighborhood}
              onChange={(e) =>
                updateField(
                  "neighborhood",
                  e.target.value,
                )
              }
              placeholder="የሚኖሩበት አካባቢ"
              className={inputClass(
                "neighborhood",
              )}
            />

            {errorText(
              "neighborhood",
            )}
          </Field>

          <Field
            label="ስልክ ቁጥር"
            required
          >
            <input
              type="tel"
              value={form.phone}
              onChange={(e) =>
                updateField(
                  "phone",
                  e.target.value,
                )
              }
              placeholder="09XXXXXXXX"
              className={inputClass(
                "phone",
              )}
            />

            {errorText("phone")}
          </Field>
        </div>
      </Section>

      {/* ========================================================= */}
      {/* 4. CHRISTIAN LIFE                                         */}
      {/* ========================================================= */}

      <Section
        number="4"
        title="የክርስቲያናዊ ሕይወት መረጃ"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="የክርስትና ስም"
            required
          >
            <input
              value={form.christianName}
              onChange={(e) =>
                updateField(
                  "christianName",
                  e.target.value,
                )
              }
              placeholder="የክርስትና ስም"
              className={inputClass(
                "christianName",
              )}
            />

            {errorText(
              "christianName",
            )}
          </Field>

          <Field
            label="የተጠመቀበት ቤተ ክርስቲያን"
            required
          >
            <input
              value={form.baptismChurch}
              onChange={(e) =>
                updateField(
                  "baptismChurch",
                  e.target.value,
                )
              }
              placeholder="የተጠመቁበት ቤተ ክርስቲያን"
              className={inputClass(
                "baptismChurch",
              )}
            />

            {errorText(
              "baptismChurch",
            )}
          </Field>

          <Field
            label="የጥምቀት ዓመት"
            required
          >
            <input
              value={form.baptismYear}
              onChange={(e) =>
                updateField(
                  "baptismYear",
                  e.target.value,
                )
              }
              placeholder="ለምሳሌ 2010"
              className={inputClass(
                "baptismYear",
              )}
            />

            {errorText(
              "baptismYear",
            )}
          </Field>

          <Field
            label="በፊት ሰንበት ት/ቤት ተምሮ ነበር?"
            required
          >
            <div className="grid grid-cols-2 gap-3">
              <RadioButton
                name="previousSundaySchool"
                value="yes"
                label="አዎ"
                checked={
                  form.previousSundaySchool ===
                  "yes"
                }
                onChange={() =>
                  updateField(
                    "previousSundaySchool",
                    "yes",
                  )
                }
              />

              <RadioButton
                name="previousSundaySchool"
                value="no"
                label="አይ"
                checked={
                  form.previousSundaySchool ===
                  "no"
                }
                onChange={() =>
                  updateField(
                    "previousSundaySchool",
                    "no",
                  )
                }
              />
            </div>

            {errorText(
              "previousSundaySchool",
            )}
          </Field>

          {form.previousSundaySchool ===
            "yes" && (
            <Field
              label="አዎ ከሆነ የት?"
              required
            >
              <input
                value={
                  form.previousSundaySchoolPlace
                }
                onChange={(e) =>
                  updateField(
                    "previousSundaySchoolPlace",
                    e.target.value,
                  )
                }
                placeholder="የቀድሞ ሰንበት ት/ቤት"
                className={inputClass(
                  "previousSundaySchoolPlace",
                )}
              />

              {errorText(
                "previousSundaySchoolPlace",
              )}
            </Field>
          )}

          <Field
            label="ንስሐ አባት አሎት?"
            required
          >
            <div className="grid grid-cols-2 gap-3">
              <RadioButton
                name="hasConfessor"
                value="yes"
                label="አዎ"
                checked={
                  form.hasConfessor ===
                  "yes"
                }
                onChange={() =>
                  updateField(
                    "hasConfessor",
                    "yes",
                  )
                }
              />

              <RadioButton
                name="hasConfessor"
                value="no"
                label="አይ"
                checked={
                  form.hasConfessor ===
                  "no"
                }
                onChange={() =>
                  updateField(
                    "hasConfessor",
                    "no",
                  )
                }
              />
            </div>

            {errorText(
              "hasConfessor",
            )}
          </Field>

          {form.hasConfessor ===
            "yes" && (
            <>
              <Field
                label="የንስሐ አባት ስም"
                required
              >
                <input
                  value={form.confessorName}
                  onChange={(e) =>
                    updateField(
                      "confessorName",
                      e.target.value,
                    )
                  }
                  placeholder="ስም"
                  className={inputClass(
                    "confessorName",
                  )}
                />

                {errorText(
                  "confessorName",
                )}
              </Field>

              <Field
                label="የንስሐ አባት ስልክ"
                required
              >
                <input
                  type="tel"
                  value={
                    form.confessorPhone
                  }
                  onChange={(e) =>
                    updateField(
                      "confessorPhone",
                      e.target.value,
                    )
                  }
                  placeholder="ስልክ ቁጥር"
                  className={inputClass(
                    "confessorPhone",
                  )}
                />

                {errorText(
                  "confessorPhone",
                )}
              </Field>

              <Field
                label="የሚያገለግሉበት ደብር"
                required
              >
                <input
                  value={
                    form.confessorChurch
                  }
                  onChange={(e) =>
                    updateField(
                      "confessorChurch",
                      e.target.value,
                    )
                  }
                  placeholder="የደብሩ ስም"
                  className={inputClass(
                    "confessorChurch",
                  )}
                />

                {errorText(
                  "confessorChurch",
                )}
              </Field>
            </>
          )}
        </div>
      </Section>

      {/* ========================================================= */}
      {/* 5. GUARDIAN                                               */}
      {/* ========================================================= */}

      <Section
        number="5"
        title="የወላጅ/አሳዳጊ መረጃ"
        icon={<Users size={20} />}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="የወላጅ/አሳዳጊ ሙሉ ስም"
            required
          >
            <input
              value={form.guardianName}
              onChange={(e) =>
                updateField(
                  "guardianName",
                  e.target.value,
                )
              }
              placeholder="ሙሉ ስም"
              className={inputClass(
                "guardianName",
              )}
            />

            {errorText(
              "guardianName",
            )}
          </Field>

          <Field
            label="ከአባሉ ጋር ያለው ግንኙነት"
            required
          >
            <input
              value={
                form.guardianRelationship
              }
              onChange={(e) =>
                updateField(
                  "guardianRelationship",
                  e.target.value,
                )
              }
              placeholder="ለምሳሌ አባት፣ እናት፣ አሳዳጊ"
              className={inputClass(
                "guardianRelationship",
              )}
            />

            {errorText(
              "guardianRelationship",
            )}
          </Field>

          <Field
            label="ስልክ ቁጥር"
            required
          >
            <input
              type="tel"
              value={
                form.guardianPhone
              }
              onChange={(e) =>
                updateField(
                  "guardianPhone",
                  e.target.value,
                )
              }
              placeholder="09XXXXXXXX"
              className={inputClass(
                "guardianPhone",
              )}
            />

            {errorText(
              "guardianPhone",
            )}
          </Field>

          <Field
            label="አድራሻ"
            required
          >
            <textarea
              value={
                form.guardianAddress
              }
              onChange={(e) =>
                updateField(
                  "guardianAddress",
                  e.target.value,
                )
              }
              placeholder="የወላጅ/አሳዳጊ አድራሻ"
              rows={3}
              className={inputClass(
                "guardianAddress",
              )}
            />

            {errorText(
              "guardianAddress",
            )}
          </Field>
        </div>

        <div className="mt-6">
          <PhotoUpload
            title="የወላጅ/አሳዳጊ ፎቶ"
            preview={
              guardianPhotoPreview
            }
            error={
              errors.guardianPhoto
            }
            onChange={(event) =>
              handlePhotoChange(
                event,
                "guardian",
              )
            }
          />
        </div>
      </Section>

      {/* ========================================================= */}
      {/* 6. INTERESTS                                              */}
      {/* ========================================================= */}

      <Section
        number="6"
        title="የፍላጎትና ተሳትፎ መረጃ"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {interests.map(
            (interest) => (
              <label
                key={
                  interest.value
                }
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                  form.interests.includes(
                    interest.value,
                  )
                    ? "border-[#d4af37] bg-amber-50"
                    : "border-slate-200 bg-white hover:border-[#0d3b78]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.interests.includes(
                    interest.value,
                  )}
                  onChange={() =>
                    toggleInterest(
                      interest.value,
                    )
                  }
                  className="h-4 w-4 accent-[#0d3b78]"
                />

                <span className="text-sm font-semibold text-[#172033]">
                  {interest.label}
                </span>
              </label>
            ),
          )}
        </div>

        <div className="mt-5">
          <Field label="ሌሎች ችሎታዎች/ፍላጎቶች">
            <textarea
              value={form.otherSkills}
              onChange={(e) =>
                updateField(
                  "otherSkills",
                  e.target.value,
                )
              }
              rows={4}
              placeholder="ሌሎች ችሎታዎች ወይም ፍላጎቶች..."
              className={inputClass(
                "otherSkills",
              )}
            />
          </Field>
        </div>
      </Section>

      {/* ========================================================= */}
      {/* 7. CONFIRMATION                                           */}
      {/* ========================================================= */}

      <Section
        number="7"
        title="የምዝገባ ማረጋገጫ"
      >
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={
                form.memberConfirmed
              }
              onChange={(e) =>
                updateField(
                  "memberConfirmed",
                  e.target.checked,
                )
              }
              className="mt-1 h-5 w-5 accent-[#0d3b78]"
            />

            <span className="text-sm font-medium leading-7 text-[#172033]">
              እኔ ከላይ የተሰጡት መረጃዎች
              ትክክለኛ መሆናቸውን
              አረጋግጣለሁ።
            </span>
          </label>

          {errorText(
            "memberConfirmed",
          )}
        </div>

        {/* ======================================================= */}
        {/* DIGITAL SIGNATURES                                      */}
        {/* ======================================================= */}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <SignaturePad
            label="የአባሉ ፊርማ"
            required
            value={form.memberSignature}
            error={errors.memberSignature}
            onChange={(signature) =>
              updateField(
                "memberSignature",
                signature,
              )
            }
          />

          <SignaturePad
            label="የወላጅ/አሳዳጊ ፊርማ"
            required
            value={form.guardianSignature}
            error={errors.guardianSignature}
            onChange={(signature) =>
              updateField(
                "guardianSignature",
                signature,
              )
            }
          />
        </div>
      </Section>

      {/* ========================================================= */}
      {/* 8. REGISTRAR ONLY                                         */}
      {/* ========================================================= */}

      <Section
        number="8"
        title="ለሬጅስትራል ክፍል ብቻ"
      >
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-[#0d3b78]">
          ይህ ክፍል በሬጅስትራር/አስተዳዳሪ
          ብቻ የሚሞላ ነው።
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="የአባል መለያ ቁጥር">
            <input
              value={form.memberId}
              onChange={(e) =>
                updateField(
                  "memberId",
                  e.target.value,
                )
              }
              placeholder="የአባል መለያ"
              className={inputClass(
                "memberId",
              )}
            />
          </Field>

          <Field label="የተመደበበት ክፍል">
            <input
              value={
                form.assignedClass
              }
              onChange={(e) =>
                updateField(
                  "assignedClass",
                  e.target.value,
                )
              }
              placeholder="ክፍል"
              className={inputClass(
                "assignedClass",
              )}
            />
          </Field>

          <Field label="የተመደበበት የትምህርት ደረጃ">
            <input
              value={
                form.assignedEducationLevel
              }
              onChange={(e) =>
                updateField(
                  "assignedEducationLevel",
                  e.target.value,
                )
              }
              placeholder="የትምህርት ደረጃ"
              className={inputClass(
                "assignedEducationLevel",
              )}
            />
          </Field>

          <Field label="የመዝጋቢው ስም">
            <input
              value={
                form.registrarName
              }
              onChange={(e) =>
                updateField(
                  "registrarName",
                  e.target.value,
                )
              }
              placeholder="ስም"
              className={inputClass(
                "registrarName",
              )}
            />
          </Field>

          <SignaturePad
            label="የመዝጋቢው ፊርማ"
            value={form.registrarSignature}
            onChange={(signature) =>
              updateField(
                "registrarSignature",
                signature,
              )
            }
          />

          <Field label="የክፍሉ ኃላፊ ስም">
            <input
              value={
                form.classLeaderName
              }
              onChange={(e) =>
                updateField(
                  "classLeaderName",
                  e.target.value,
                )
              }
              placeholder="ስም"
              className={inputClass(
                "classLeaderName",
              )}
            />
          </Field>

          <SignaturePad
            label="የክፍሉ ኃላፊ ፊርማ"
            value={
              form.classLeaderSignature
            }
            onChange={(signature) =>
              updateField(
                "classLeaderSignature",
                signature,
              )
            }
          />

          <Field label="የሰ/ት/ቤቱ ሰብሳቢ ስም">
            <input
              value={
                form.chairmanName
              }
              onChange={(e) =>
                updateField(
                  "chairmanName",
                  e.target.value,
                )
              }
              placeholder="ስም"
              className={inputClass(
                "chairmanName",
              )}
            />
          </Field>

          <SignaturePad
            label="የሰ/ት/ቤቱ ሰብሳቢ ፊርማ"
            value={form.chairmanSignature}
            onChange={(signature) =>
              updateField(
                "chairmanSignature",
                signature,
              )
            }
          />
        </div>
      </Section>

      {/* ========================================================= */}
      {/* SUBMIT                                                     */}
      {/* ========================================================= */}

      <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-xl shadow-slate-900/10 backdrop-blur-md sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            if (memberPhotoPreview) {
              URL.revokeObjectURL(
                memberPhotoPreview,
              );
            }

            if (guardianPhotoPreview) {
              URL.revokeObjectURL(
                guardianPhotoPreview,
              );
            }

            setForm({
              ...initialForm,
              registrationDate:
                getTodayDate(),
            });

            setMemberPhoto(null);
            setGuardianPhoto(null);

            setMemberPhotoPreview(
              null,
            );

            setGuardianPhotoPreview(
              null,
            );

            setErrors({});
            setSubmitted(false);
          }}
          className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          አጽዳ
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-[#0d3b78] to-[#1555a0] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#0d3b78]/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#0d3b78]/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "በማስቀመጥ ላይ..."
            : "የአባል መረጃ አስቀምጥ"}
        </button>
      </div>
    </form>
  );
}

/* =============================================================== */
/* ETHIOPIAN DATE PICKER                                           */
/* =============================================================== */

function EthiopianDatePicker({
  value,
  onChange,
  error = false,
  maxDate,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  maxDate?: string;
}) {
  const today = gregorianToEthiopian(getTodayDate()) ?? {
    year: 2018,
    month: 1,
    day: 1,
  };

  const selected = value
    ? gregorianToEthiopian(value)
    : null;

  const [viewYear, setViewYear] = useState(
    selected?.year ?? today.year,
  );
  const [viewMonth, setViewMonth] = useState(
    selected?.month ?? today.month,
  );

  useEffect(() => {
    const next = value
      ? gregorianToEthiopian(value)
      : null;

    if (next) {
      setViewYear(next.year);
      setViewMonth(next.month);
    }
  }, [value]);

  const maxEthiopian = maxDate
    ? gregorianToEthiopian(maxDate)
    : null;

  const daysInMonth =
    viewMonth === 13
      ? isEthiopianLeapYear(viewYear)
        ? 6
        : 5
      : 30;

  const firstDayGregorian = parseIsoDate(
    ethiopianToGregorian(viewYear, viewMonth, 1),
  );

  const firstWeekday =
    firstDayGregorian?.getUTCDay() ?? 0;

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => index + 1,
    ),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const currentYearOptions = Array.from(
    { length: Math.max(1, today.year - 1899) },
    (_, index) => today.year + 1 - index,
  ).sort((a, b) => a - b);

  function isDisabled(day: number) {
    if (!maxEthiopian) return false;

    if (viewYear > maxEthiopian.year) return true;
    if (viewYear < maxEthiopian.year) return false;
    if (viewMonth > maxEthiopian.month) return true;
    if (viewMonth < maxEthiopian.month) return false;

    return day > maxEthiopian.day;
  }

  function selectDay(day: number) {
    if (isDisabled(day)) return;

    onChange(
      ethiopianToGregorian(
        viewYear,
        viewMonth,
        day,
      ),
    );
  }

  function previousMonth() {
    if (viewMonth === 1) {
      setViewMonth(13);
      setViewYear((year) => year - 1);
    } else {
      setViewMonth((month) => month - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 13) {
      setViewMonth(1);
      setViewYear((year) => year + 1);
    } else {
      setViewMonth((month) => month + 1);
    }
  }

  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm ${
        error
          ? "border-red-400 ring-2 ring-red-100"
          : "border-slate-200"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={previousMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-lg font-bold text-[#0d3b78] transition hover:bg-blue-50"
          aria-label="ቀዳሚ ወር"
        >
          ‹
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <select
            value={viewMonth}
            onChange={(event) =>
              setViewMonth(Number(event.target.value))
            }
            className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-bold text-[#172033] outline-none focus:border-[#0d3b78]"
          >
            {ETHIOPIAN_MONTHS.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={viewYear}
            onChange={(event) =>
              setViewYear(Number(event.target.value))
            }
            className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-bold text-[#172033] outline-none focus:border-[#0d3b78]"
          >
            {currentYearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-lg font-bold text-[#0d3b78] transition hover:bg-blue-50"
          aria-label="ቀጣይ ወር"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {ETHIOPIAN_WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="py-2 text-center text-[10px] font-bold text-slate-500 sm:text-xs"
          >
            {weekday}
          </div>
        ))}

        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-10" />;
          }

          const selectedDay =
            selected?.year === viewYear &&
            selected.month === viewMonth &&
            selected.day === day;

          const disabled = isDisabled(day);

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => selectDay(day)}
              className={`h-10 rounded-lg text-sm font-semibold transition ${
                selectedDay
                  ? "bg-[#0d3b78] text-white"
                  : disabled
                    ? "cursor-not-allowed text-slate-300"
                    : "text-[#172033] hover:bg-blue-50 hover:text-[#0d3b78]"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg bg-[#f8f5ec] px-3 py-2 text-center text-xs font-semibold text-[#0d3b78]">
        {value
          ? `${selected?.day ?? ""} ${selected ? ETHIOPIAN_MONTHS[selected.month - 1] : ""} ${selected?.year ?? ""}`
          : "የኢትዮጵያ ቀን ይምረጡ"}
      </div>
    </div>
  );
}

/* =============================================================== */
/* DIGITAL SIGNATURE PAD                                           */
/* =============================================================== */

function SignaturePad({
  label,
  value,
  onChange,
  error,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (signature: string) => void;
  error?: string;
  required?: boolean;
}) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const drawingRef = useRef(false);

  const hasDrawnRef = useRef(false);

  function setupCanvas() {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect =
      canvas.getBoundingClientRect();

    const ratio =
      Math.max(
        window.devicePixelRatio || 1,
        1,
      );

    canvas.width =
      Math.floor(rect.width * ratio);

    canvas.height =
      Math.floor(rect.height * ratio);

    const context =
      canvas.getContext("2d");

    if (!context) return;

    context.scale(ratio, ratio);

    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 2.5;
    context.strokeStyle = "#172033";

    if (value) {
      const image = new Image();

      image.onload = () => {
        context.drawImage(
          image,
          0,
          0,
          rect.width,
          rect.height,
        );

        hasDrawnRef.current = true;
      };

      image.src = value;
    }
  }

  useEffect(() => {
    setupCanvas();

    const handleResize = () => {
      const currentValue = value;

      setupCanvas();

      if (
        currentValue &&
        canvasRef.current
      ) {
        hasDrawnRef.current = true;
      }
    };

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize,
      );
    };
    // We intentionally initialize the canvas
    // when the component is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getCoordinates(
    event:
      | React.PointerEvent<HTMLCanvasElement>,
  ) {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return null;
    }

    const rect =
      canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function handlePointerDown(
    event: React.PointerEvent<HTMLCanvasElement>,
  ) {
    event.preventDefault();

    const canvas =
      canvasRef.current;

    const context =
      canvas?.getContext("2d");

    const coordinates =
      getCoordinates(event);

    if (!canvas || !context || !coordinates) {
      return;
    }

    canvas.setPointerCapture(
      event.pointerId,
    );

    drawingRef.current = true;
    hasDrawnRef.current = true;

    context.beginPath();

    context.moveTo(
      coordinates.x,
      coordinates.y,
    );
  }

  function handlePointerMove(
    event: React.PointerEvent<HTMLCanvasElement>,
  ) {
    if (!drawingRef.current) return;

    event.preventDefault();

    const canvas =
      canvasRef.current;

    const context =
      canvas?.getContext("2d");

    const coordinates =
      getCoordinates(event);

    if (!canvas || !context || !coordinates) {
      return;
    }

    context.lineTo(
      coordinates.x,
      coordinates.y,
    );

    context.stroke();
  }

  function finishDrawing() {
    if (!drawingRef.current) {
      return;
    }

    drawingRef.current = false;

    const canvas =
      canvasRef.current;

    if (!canvas || !hasDrawnRef.current) {
      return;
    }

    const signature =
      canvas.toDataURL(
        "image/png",
      );

    onChange(signature);
  }

  function clearSignature() {
    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const context =
      canvas.getContext("2d");

    if (!context) return;

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height,
    );

    hasDrawnRef.current = false;

    onChange("");
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="block text-sm font-bold text-[#172033]">
          {label}

          {required && (
            <span
              className="ml-1 text-red-500"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>

        {value && (
          <button
            type="button"
            onClick={clearSignature}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
          >
            <Eraser size={14} />
            አጽዳ
          </button>
        )}
      </div>

      <div
        className={`overflow-hidden rounded-2xl border-2 bg-white transition ${
          error
            ? "border-red-400 ring-2 ring-red-100"
            : "border-slate-200 focus-within:border-[#0d3b78]"
        }`}
      >
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="block h-[180px] w-full touch-none bg-white"
            onPointerDown={
              handlePointerDown
            }
            onPointerMove={
              handlePointerMove
            }
            onPointerUp={
              finishDrawing
            }
            onPointerCancel={
              finishDrawing
            }
            onPointerLeave={
              finishDrawing
            }
          />

          {!value && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-400">
                  እዚህ ላይ ፊርማዎን ያስገቡ
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  በጣት፣ በስታይለስ ወይም በማውዝ ይፈርሙ
                </p>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute bottom-3 left-5 right-5 border-b border-dashed border-slate-300" />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/* =============================================================== */
/* REUSABLE COMPONENTS                                             */
/* =============================================================== */

function Section({
  number,
  title,
  icon,
  children,
}: {
  number: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)] transition-shadow duration-300 hover:shadow-[0_14px_45px_rgba(15,23,42,0.09)]">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-[#f8f5ec] via-white to-white px-5 py-5 md:px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d3b78] text-sm font-black text-white shadow-md shadow-[#0d3b78]/20">
          {number}
        </div>

        {icon && (
          <div className="rounded-lg bg-[#0d3b78]/5 p-1.5 text-[#0d3b78]">
            {icon}
          </div>
        )}

        <h2 className="text-base font-black tracking-tight text-[#172033] md:text-lg">
          {title}
        </h2>
      </div>

      <div className="p-5 md:p-7">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-bold tracking-wide text-[#172033]">
        {label}

        {required && (
          <span
            className="ml-1 text-red-500"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  error = false,
}: {
  value: string;
  onChange: (
    event: ChangeEvent<HTMLSelectElement>,
  ) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  error?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none rounded-xl border bg-white/90 px-4 py-3 pr-10 text-sm text-[#172033] shadow-sm outline-none transition duration-200 hover:border-slate-300 ${
          error
            ? "border-red-400 bg-red-50/30 ring-4 ring-red-100"
            : "border-slate-200 focus:border-[#0d3b78] focus:bg-white focus:ring-4 focus:ring-[#0d3b78]/10"
        } ${
          disabled
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : ""
        }`}
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={17}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function RadioButton({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
        checked
          ? "border-[#0d3b78] bg-[#0d3b78]/5 shadow-sm ring-2 ring-[#0d3b78]/10"
          : "border-slate-200 bg-white hover:border-[#0d3b78]/50 hover:bg-slate-50"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[#0d3b78]"
      />

      <span className="text-sm font-semibold text-[#172033]">
        {label}
      </span>
    </label>
  );
}

function PhotoUpload({
  title,
  preview,
  error,
  onChange,
}: {
  title: string;
  preview: string | null;
  error?: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-bold tracking-wide text-[#172033]">
        {title}

        <span className="ml-1 text-red-500">
          *
        </span>
      </label>

      <label
        className={`group relative flex min-h-[250px] cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed bg-gradient-to-br from-slate-50 to-white transition duration-200 ${
          error
            ? "border-red-400 bg-red-50/20"
            : "border-slate-300 hover:border-[#0d3b78] hover:bg-blue-50/20"
        }`}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt={title}
              className="h-full max-h-[300px] w-full object-contain p-3"
            />

            <div className="absolute inset-x-0 bottom-0 bg-black/60 px-4 py-3 text-center text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
              ፎቶ ለመቀየር ይጫኑ
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center px-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-[#0d3b78]">
              <Camera size={25} />
            </div>

            <p className="text-sm font-bold text-[#172033]">
              ፎቶ ይጨምሩ
            </p>

            <p className="mt-1 text-xs text-slate-500">
              JPG, PNG ወይም WEBP • እስከ 5MB
            </p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          className="sr-only"
        />
      </label>

      {error && (
        <p className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
