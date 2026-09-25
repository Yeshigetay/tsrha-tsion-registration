"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Edit3,
  Loader2,
  Save,
  User,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Interest =
  | "mezmur"
  | "art"
  | "instrument"
  | "charity"
  | "development"
  | "other";

type FormState = {
  registrationType: "new" | "existing";
  registrationNumber: string;
  registrationDate: string;

  firstName: string;
  fatherName: string;
  grandfatherName: string;
  gender: "male" | "female" | "";

  birthDate: string;
  birthPlace: string;

  region: string;
  subCity: string;
  woreda: string;
  neighborhood: string;
  phone: string;

  christianName: string;
  baptismChurch: string;
  baptismYear: string;

  previousSundaySchool: "yes" | "no" | "";
  previousSundaySchoolPlace: string;

  hasConfessor: "yes" | "no" | "";
  confessorName: string;
  confessorPhone: string;
  confessorChurch: string;

  guardianName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianAddress: string;

  interests: Interest[];
  otherSkills: string;

  memberConfirmed: boolean;
  memberSignature: string;
  guardianSignature: string;

  memberId: string;
  assignedClass: string;
  assignedEducationLevel: string;

  registrarName: string;
  registrarSignature: string;

  classLeaderName: string;
  classLeaderSignature: string;

  chairmanName: string;
  chairmanSignature: string;

  memberPhotoPath: string;
  guardianPhotoPath: string;
};

const interestOptions: {
  value: Interest;
  label: string;
}[] = [
  {
    value: "mezmur",
    label: "መዝሙር ክፍል",
  },
  {
    value: "art",
    label: "ኪነጥበብ ክፍል",
  },
  {
    value: "instrument",
    label: "ዜማ መሳሪያ ክፍል",
  },
  {
    value: "charity",
    label: "በጎ አድራጎት ክፍል",
  },
  {
    value: "development",
    label: "ልማት ክፍል",
  },
  {
    value: "other",
    label: "ሌላ",
  },
];

const initialForm: FormState = {
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

  memberPhotoPath: "",
  guardianPhotoPath: "",
};

export default function EditMemberPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [form, setForm] = useState<FormState>(initialForm);

  const [memberPhoto, setMemberPhoto] =
    useState<File | null>(null);

  const [guardianPhoto, setGuardianPhoto] =
    useState<File | null>(null);

  const [memberPhotoPreview, setMemberPhotoPreview] =
    useState<string | null>(null);

  const [guardianPhotoPreview, setGuardianPhotoPreview] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = useMemo(() => createClient(), []);

  // ============================================================
  // LOAD MEMBER
  // ============================================================

  useEffect(() => {
    async function loadMember() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/");
          return;
        }

        const { data: member, error: memberError } =
          await supabase
            .from("members")
            .select("*")
            .eq("id", id)
            .single();

        if (memberError || !member) {
          throw new Error(
            "የአባሉ መረጃ ማግኘት አልተቻለም።",
          );
        }

        setForm({
          registrationType:
            member.registration_type === "existing"
              ? "existing"
              : "new",

          registrationNumber:
            member.registration_number ?? "",

          registrationDate:
            member.registration_date ?? "",

          firstName:
            member.first_name ?? "",

          fatherName:
            member.father_name ?? "",

          grandfatherName:
            member.grandfather_name ?? "",

          gender:
            member.gender === "female"
              ? "female"
              : member.gender === "male"
                ? "male"
                : "",

          birthDate:
            member.birth_date ?? "",

          birthPlace:
            member.birth_place ?? "",

          region:
            member.region ?? "",

          subCity:
            member.sub_city ?? "",

          woreda:
            member.woreda ?? "",

          neighborhood:
            member.neighborhood ?? "",

          phone:
            member.phone ?? "",

          christianName:
            member.christian_name ?? "",

          baptismChurch:
            member.baptism_church ?? "",

          baptismYear:
            member.baptism_year
              ? String(member.baptism_year)
              : "",

          previousSundaySchool:
            member.previous_sunday_school ?? "",

          previousSundaySchoolPlace:
            member.previous_sunday_school_place ?? "",

          hasConfessor:
            member.has_confessor ?? "",

          confessorName:
            member.confessor_name ?? "",

          confessorPhone:
            member.confessor_phone ?? "",

          confessorChurch:
            member.confessor_church ?? "",

          guardianName:
            member.guardian_name ?? "",

          guardianRelationship:
            member.guardian_relationship ?? "",

          guardianPhone:
            member.guardian_phone ?? "",

          guardianAddress:
            member.guardian_address ?? "",

          interests:
            Array.isArray(member.interests)
              ? member.interests
              : [],

          otherSkills:
            member.other_skills ?? "",

          memberConfirmed:
            Boolean(member.member_confirmed),

          memberSignature:
            member.member_signature ?? "",

          guardianSignature:
            member.guardian_signature ?? "",

          memberId:
            member.member_id ?? "",

          assignedClass:
            member.assigned_class ?? "",

          assignedEducationLevel:
            member.assigned_education_level ?? "",

          registrarName:
            member.registrar_name ?? "",

          registrarSignature:
            member.registrar_signature ?? "",

          classLeaderName:
            member.class_leader_name ?? "",

          classLeaderSignature:
            member.class_leader_signature ?? "",

          chairmanName:
            member.chairman_name ?? "",

          chairmanSignature:
            member.chairman_signature ?? "",

          memberPhotoPath:
            member.member_photo_path ?? "",

          guardianPhotoPath:
            member.guardian_photo_path ?? "",
        });

        // ------------------------------------------------------
        // MEMBER PHOTO
        // ------------------------------------------------------

        if (member.member_photo_path) {
          const { data } =
            await supabase.storage
              .from("member-photos")
              .createSignedUrl(
                member.member_photo_path,
                60 * 60,
              );

          if (data?.signedUrl) {
            setMemberPhotoPreview(data.signedUrl);
          }
        }

        // ------------------------------------------------------
        // GUARDIAN PHOTO
        // ------------------------------------------------------

        if (member.guardian_photo_path) {
          const { data } =
            await supabase.storage
              .from("member-photos")
              .createSignedUrl(
                member.guardian_photo_path,
                60 * 60,
              );

          if (data?.signedUrl) {
            setGuardianPhotoPreview(data.signedUrl);
          }
        }
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "የአባሉ መረጃ መጫን አልተቻለም።",
        );
      } finally {
        setLoading(false);
      }
    }

    loadMember();
  }, [id, router, supabase]);

  // ============================================================
  // AGE
  // ============================================================

  const age = useMemo(() => {
    if (!form.birthDate) return "";

    const birth = new Date(form.birthDate);
    const today = new Date();

    let calculatedAge =
      today.getFullYear() - birth.getFullYear();

    const monthDifference =
      today.getMonth() - birth.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birth.getDate())
    ) {
      calculatedAge--;
    }

    return String(
      calculatedAge >= 0 ? calculatedAge : 0,
    );
  }, [form.birthDate]);

  // ============================================================
  // UPDATE FIELD
  // ============================================================

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }

  // ============================================================
  // INTEREST
  // ============================================================

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
          : [...current.interests, interest],
      };
    });
  }

  // ============================================================
  // PHOTO CHANGE
  // ============================================================

  function handlePhotoChange(
    event: ChangeEvent<HTMLInputElement>,
    type: "member" | "guardian",
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "እባክዎ የምስል ፋይል ብቻ ይምረጡ።",
      );
      return;
    }

    const preview = URL.createObjectURL(file);

    if (type === "member") {
      setMemberPhoto(file);
      setMemberPhotoPreview(preview);
    } else {
      setGuardianPhoto(file);
      setGuardianPhotoPreview(preview);
    }

    setError("");
    setSuccess("");
  }

  // ============================================================
  // UPLOAD PHOTO
  // ============================================================

  async function uploadPhoto(
    file: File,
    memberId: string,
    type: "member" | "guardian",
  ) {
    const extension =
      file.name.split(".").pop()?.toLowerCase() ||
      "jpg";

    const path =
      `${memberId}/${type}-${Date.now()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("member-photos")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

    if (uploadError) {
      throw new Error(
        `${
          type === "member"
            ? "የአባሉ"
            : "የአሳዳጊ"
        } ፎቶ መጫን አልተሳካም፦ ${
          uploadError.message
        }`,
      );
    }

    return path;
  }

  // ============================================================
  // SAVE
  // ============================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ----------------------------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------------------------

    if (
      !form.firstName.trim() ||
      !form.fatherName.trim() ||
      !form.grandfatherName.trim()
    ) {
      setError(
        "የአባሉ ሙሉ ስም ያስፈልጋል።",
      );
      return;
    }

    if (!form.gender) {
      setError("ጾታ ይምረጡ።");
      return;
    }

    if (!form.birthDate) {
      setError("የትውልድ ቀን ያስገቡ።");
      return;
    }

    if (!form.birthPlace.trim()) {
      setError("የትውልድ ቦታ ያስገቡ።");
      return;
    }

    if (!form.guardianName.trim()) {
      setError(
        "የወላጅ/አሳዳጊ ስም ያስገቡ።",
      );
      return;
    }

    setSaving(true);

    let newMemberPhotoPath: string | null = null;
    let newGuardianPhotoPath: string | null = null;

    try {
      // --------------------------------------------------------
      // NEW MEMBER PHOTO
      // --------------------------------------------------------

      if (memberPhoto) {
        newMemberPhotoPath = await uploadPhoto(
          memberPhoto,
          id,
          "member",
        );
      }

      // --------------------------------------------------------
      // NEW GUARDIAN PHOTO
      // --------------------------------------------------------

      if (guardianPhoto) {
        newGuardianPhotoPath =
          await uploadPhoto(
            guardianPhoto,
            id,
            "guardian",
          );
      }

      // --------------------------------------------------------
      // UPDATE DATABASE
      // --------------------------------------------------------

      const updateData = {
        registration_type:
          form.registrationType,

        registration_number:
          form.registrationNumber.trim(),

        registration_date:
          form.registrationDate,

        first_name:
          form.firstName.trim(),

        father_name:
          form.fatherName.trim(),

        grandfather_name:
          form.grandfatherName.trim(),

        gender:
          form.gender,

        birth_date:
          form.birthDate,

        birth_place:
          form.birthPlace.trim(),

        age:
          age ? Number(age) : null,

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

        christian_name:
          form.christianName.trim(),

        baptism_church:
          form.baptismChurch.trim(),

        baptism_year:
          form.baptismYear
            ? Number(form.baptismYear)
            : null,

        previous_sunday_school:
          form.previousSundaySchool || null,

        previous_sunday_school_place:
          form.previousSundaySchoolPlace.trim() ||
          null,

        has_confessor:
          form.hasConfessor || null,

        confessor_name:
          form.confessorName.trim() || null,

        confessor_phone:
          form.confessorPhone.trim() || null,

        confessor_church:
          form.confessorChurch.trim() || null,

        guardian_name:
          form.guardianName.trim(),

        guardian_relationship:
          form.guardianRelationship.trim(),

        guardian_phone:
          form.guardianPhone.trim(),

        guardian_address:
          form.guardianAddress.trim(),

        interests:
          form.interests,

        other_skills:
          form.otherSkills.trim() || null,

        member_confirmed:
          form.memberConfirmed,

        member_signature:
          form.memberSignature.trim() || null,

        guardian_signature:
          form.guardianSignature.trim() || null,

        member_id:
          form.memberId.trim() || null,

        assigned_class:
          form.assignedClass.trim() || null,

        assigned_education_level:
          form.assignedEducationLevel.trim() ||
          null,

        registrar_name:
          form.registrarName.trim() || null,

        registrar_signature:
          form.registrarSignature.trim() ||
          null,

        class_leader_name:
          form.classLeaderName.trim() || null,

        class_leader_signature:
          form.classLeaderSignature.trim() ||
          null,

        chairman_name:
          form.chairmanName.trim() || null,

        chairman_signature:
          form.chairmanSignature.trim() ||
          null,

        updated_at:
          new Date().toISOString(),

        ...(newMemberPhotoPath
          ? {
              member_photo_path:
                newMemberPhotoPath,
            }
          : {}),

        ...(newGuardianPhotoPath
          ? {
              guardian_photo_path:
                newGuardianPhotoPath,
            }
          : {}),
      };

      const { error: updateError } =
        await supabase
          .from("members")
          .update(updateData)
          .eq("id", id);

      if (updateError) {
        const filesToRemove = [
          newMemberPhotoPath,
          newGuardianPhotoPath,
        ].filter(Boolean) as string[];

        if (filesToRemove.length > 0) {
          await supabase.storage
            .from("member-photos")
            .remove(filesToRemove);
        }

        throw new Error(
          `የአባሉ መረጃ ማዘመን አልተሳካም፦ ${updateError.message}`,
        );
      }

      setSuccess(
        "የአባሉ መረጃ በተሳካ ሁኔታ ተዘምኗል።",
      );

      // --------------------------------------------------------
      // DELETE OLD PHOTO AFTER SUCCESSFUL UPDATE
      // --------------------------------------------------------

      if (
        newMemberPhotoPath &&
        form.memberPhotoPath
      ) {
        await supabase.storage
          .from("member-photos")
          .remove([
            form.memberPhotoPath,
          ]);
      }

      if (
        newGuardianPhotoPath &&
        form.guardianPhotoPath
      ) {
        await supabase.storage
          .from("member-photos")
          .remove([
            form.guardianPhotoPath,
          ]);
      }

      // --------------------------------------------------------
      // UPDATE LOCAL PATHS
      // --------------------------------------------------------

      setForm((current) => ({
        ...current,

        memberPhotoPath:
          newMemberPhotoPath ??
          current.memberPhotoPath,

        guardianPhotoPath:
          newGuardianPhotoPath ??
          current.guardianPhotoPath,
      }));

      setMemberPhoto(null);
      setGuardianPhoto(null);

      // --------------------------------------------------------
      // GO BACK TO MEMBER PROFILE
      // --------------------------------------------------------

      setTimeout(() => {
        router.push(
          `/dashboard/student/${id}`,
        );

        router.refresh();
      }, 900);
    } catch (err) {
      console.error(
        "Member update error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "የአባሉ መረጃ ማዘመን አልተሳካም።",
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5ec]">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={34}
            className="animate-spin text-[#0d3b78]"
          />

          <p className="text-sm font-medium text-gray-500">
            የአባሉ መረጃ በመጫን ላይ...
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-[#f8f5ec] text-[#172033]">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="bg-[#0d3b78] text-white shadow-md">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-6">

          <div className="flex items-center gap-3">

            <Link
              href={`/dashboard/student/${id}`}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="text-lg font-bold">
                የአባል መረጃ ማስተካከያ
              </h1>

              <p className="text-xs text-blue-100">
                የአባሉን መረጃ ያዘምኑ
              </p>
            </div>

          </div>

        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

      </header>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-5xl px-5 py-7 sm:px-6 sm:py-10">

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">

            <CheckCircle2
              size={20}
              className="shrink-0"
            />

            {success}

          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-7"
        >

          {/* ==================================================
              PERSONAL
          ================================================== */}

          <Section
            icon={<User size={21} />}
            title="የግል መረጃ"
          >

            <Input
              label="ስም"
              value={form.firstName}
              onChange={(value) =>
                updateField(
                  "firstName",
                  value,
                )
              }
              required
            />

            <Input
              label="የአባት ስም"
              value={form.fatherName}
              onChange={(value) =>
                updateField(
                  "fatherName",
                  value,
                )
              }
              required
            />

            <Input
              label="የአያት ስም"
              value={form.grandfatherName}
              onChange={(value) =>
                updateField(
                  "grandfatherName",
                  value,
                )
              }
              required
            />

            <Select
              label="ጾታ"
              value={form.gender}
              onChange={(value) =>
                updateField(
                  "gender",
                  value as
                    | "male"
                    | "female"
                    | "",
                )
              }
              options={[
                {
                  value: "male",
                  label: "ወንድ",
                },
                {
                  value: "female",
                  label: "ሴት",
                },
              ]}
              required
            />

            <Input
              label="የትውልድ ቀን"
              type="date"
              value={form.birthDate}
              onChange={(value) =>
                updateField(
                  "birthDate",
                  value,
                )
              }
              required
            />

            <Input
              label="ዕድሜ"
              value={age}
              readOnly
            />

            <Input
              label="የትውልድ ቦታ"
              value={form.birthPlace}
              onChange={(value) =>
                updateField(
                  "birthPlace",
                  value,
                )
              }
              required
            />

            <Input
              label="ስልክ"
              value={form.phone}
              onChange={(value) =>
                updateField(
                  "phone",
                  value,
                )
              }
            />

          </Section>

          {/* ==================================================
              ADDRESS
          ================================================== */}

          <Section
            icon={<User size={21} />}
            title="የመኖሪያ አድራሻ"
          >

            <Input
              label="ክልል / ከተማ"
              value={form.region}
              onChange={(value) =>
                updateField(
                  "region",
                  value,
                )
              }
            />

            <Input
              label="ክፍለ ከተማ"
              value={form.subCity}
              onChange={(value) =>
                updateField(
                  "subCity",
                  value,
                )
              }
            />

            <Input
              label="ወረዳ"
              value={form.woreda}
              onChange={(value) =>
                updateField(
                  "woreda",
                  value,
                )
              }
            />

            <Input
              label="የመኖሪያ አካባቢ / ሰፈር"
              value={form.neighborhood}
              onChange={(value) =>
                updateField(
                  "neighborhood",
                  value,
                )
              }
            />

          </Section>

          {/* ==================================================
              CHRISTIAN
          ================================================== */}

          <Section
            icon={<User size={21} />}
            title="የክርስትና መረጃ"
          >

            <Input
              label="የክርስትና ስም"
              value={form.christianName}
              onChange={(value) =>
                updateField(
                  "christianName",
                  value,
                )
              }
            />

            <Input
              label="የተጠመቀበት ቤተ ክርስቲያን"
              value={form.baptismChurch}
              onChange={(value) =>
                updateField(
                  "baptismChurch",
                  value,
                )
              }
            />

            <Input
              label="የጥምቀት ዓመት"
              type="number"
              value={form.baptismYear}
              onChange={(value) =>
                updateField(
                  "baptismYear",
                  value,
                )
              }
            />

            <Select
              label="ቀደም ሲል በሰንበት ት/ቤት ነበሩ?"
              value={
                form.previousSundaySchool
              }
              onChange={(value) =>
                updateField(
                  "previousSundaySchool",
                  value as
                    | "yes"
                    | "no"
                    | "",
                )
              }
              options={[
                {
                  value: "yes",
                  label: "አዎ",
                },
                {
                  value: "no",
                  label: "አይ",
                },
              ]}
            />

            <Input
              label="የቀድሞ ሰንበት ት/ቤት"
              value={
                form.previousSundaySchoolPlace
              }
              onChange={(value) =>
                updateField(
                  "previousSundaySchoolPlace",
                  value,
                )
              }
            />

            <Select
              label="አባተ ንስሐ አለ?"
              value={form.hasConfessor}
              onChange={(value) =>
                updateField(
                  "hasConfessor",
                  value as
                    | "yes"
                    | "no"
                    | "",
                )
              }
              options={[
                {
                  value: "yes",
                  label: "አዎ",
                },
                {
                  value: "no",
                  label: "አይ",
                },
              ]}
            />

            <Input
              label="የአባተ ንስሐ ስም"
              value={form.confessorName}
              onChange={(value) =>
                updateField(
                  "confessorName",
                  value,
                )
              }
            />

            <Input
              label="የአባተ ንስሐ ስልክ"
              value={form.confessorPhone}
              onChange={(value) =>
                updateField(
                  "confessorPhone",
                  value,
                )
              }
            />

            <Input
              label="የአባተ ንስሐ ቤተ ክርስቲያን"
              value={form.confessorChurch}
              onChange={(value) =>
                updateField(
                  "confessorChurch",
                  value,
                )
              }
            />

          </Section>

          {/* ==================================================
              GUARDIAN
          ================================================== */}

          <Section
            icon={<Users size={21} />}
            title="የወላጅ / አሳዳጊ መረጃ"
          >

            <Input
              label="የወላጅ / አሳዳጊ ሙሉ ስም"
              value={form.guardianName}
              onChange={(value) =>
                updateField(
                  "guardianName",
                  value,
                )
              }
              required
            />

            <Input
              label="ዝምድና"
              value={
                form.guardianRelationship
              }
              onChange={(value) =>
                updateField(
                  "guardianRelationship",
                  value,
                )
              }
            />

            <Input
              label="ስልክ"
              value={form.guardianPhone}
              onChange={(value) =>
                updateField(
                  "guardianPhone",
                  value,
                )
              }
            />

            <Input
              label="አድራሻ"
              value={form.guardianAddress}
              onChange={(value) =>
                updateField(
                  "guardianAddress",
                  value,
                )
              }
            />

          </Section>

          {/* ==================================================
              INTERESTS
          ================================================== */}

          <Section
            icon={<User size={21} />}
            title="ፍላጎት እና ችሎታ"
          >

            <div className="sm:col-span-2">

              <p className="mb-3 text-sm font-semibold text-[#172033]">
                የፍላጎት ክፍሎች
              </p>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                {interestOptions.map(
                  (interest) => {
                    const selected =
                      form.interests.includes(
                        interest.value,
                      );

                    return (
                      <button
                        key={interest.value}
                        type="button"
                        onClick={() =>
                          toggleInterest(
                            interest.value,
                          )
                        }
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                          selected
                            ? "border-[#0d3b78] bg-[#0d3b78] text-white"
                            : "border-slate-200 bg-white text-[#172033] hover:border-[#0d3b78]"
                        }`}
                      >
                        {interest.label}
                      </button>
                    );
                  },
                )}

              </div>

            </div>

            <div className="sm:col-span-2">

              <label className="mb-2 block text-sm font-semibold">
                ሌሎች ችሎታዎች / ፍላጎቶች
              </label>

              <textarea
                value={form.otherSkills}
                onChange={(event) =>
                  updateField(
                    "otherSkills",
                    event.target.value,
                  )
                }
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0d3b78] focus:ring-2 focus:ring-[#0d3b78]/10"
              />

            </div>

          </Section>

          {/* ==================================================
              PHOTOS
          ================================================== */}

          <Section
            icon={<Camera size={21} />}
            title="ፎቶዎች"
          >

            <PhotoInput
              label="የአባል ፎቶ"
              preview={memberPhotoPreview}
              onChange={(event) =>
                handlePhotoChange(
                  event,
                  "member",
                )
              }
            />

            <PhotoInput
              label="የወላጅ / አሳዳጊ ፎቶ"
              preview={guardianPhotoPreview}
              onChange={(event) =>
                handlePhotoChange(
                  event,
                  "guardian",
                )
              }
            />

          </Section>

          {/* ==================================================
              CONFIRMATION
          ================================================== */}

          <Section
            icon={<CheckCircle2 size={21} />}
            title="ማረጋገጫ እና ፊርማ"
          >

            <label className="flex items-start gap-3 sm:col-span-2">

              <input
                type="checkbox"
                checked={form.memberConfirmed}
                onChange={(event) =>
                  updateField(
                    "memberConfirmed",
                    event.target.checked,
                  )
                }
                className="mt-1 h-4 w-4 accent-[#0d3b78]"
              />

              <span className="text-sm leading-6">
                እኔ ከላይ የተሰጡት መረጃዎች
                ትክክለኛ መሆናቸውን አረጋግጣለሁ።
              </span>

            </label>

            {/* MEMBER SIGNATURE */}

            <SignatureInput
              label="የአባል ፊርማ"
              value={form.memberSignature}
              onChange={(value) =>
                updateField(
                  "memberSignature",
                  value,
                )
              }
            />

            {/* GUARDIAN SIGNATURE */}

            <SignatureInput
              label="የወላጅ / አሳዳጊ ፊርማ"
              value={form.guardianSignature}
              onChange={(value) =>
                updateField(
                  "guardianSignature",
                  value,
                )
              }
            />

          </Section>

          {/* ==================================================
              REGISTRAR
          ================================================== */}

          <Section
            icon={<User size={21} />}
            title="የአስተዳደር መረጃ"
          >

            <Input
              label="የአባል ID"
              value={form.memberId}
              onChange={(value) =>
                updateField(
                  "memberId",
                  value,
                )
              }
            />

            <Input
              label="የተመደበ ክፍል"
              value={form.assignedClass}
              onChange={(value) =>
                updateField(
                  "assignedClass",
                  value,
                )
              }
            />

            <Input
              label="የተመደበ የትምህርት ደረጃ"
              value={
                form.assignedEducationLevel
              }
              onChange={(value) =>
                updateField(
                  "assignedEducationLevel",
                  value,
                )
              }
            />

            <Input
              label="መዝጋቢ"
              value={form.registrarName}
              onChange={(value) =>
                updateField(
                  "registrarName",
                  value,
                )
              }
            />

            {/* REGISTRAR SIGNATURE */}

            <SignatureInput
              label="የመዝጋቢ ፊርማ"
              value={
                form.registrarSignature
              }
              onChange={(value) =>
                updateField(
                  "registrarSignature",
                  value,
                )
              }
            />

            <Input
              label="የክፍል መሪ"
              value={form.classLeaderName}
              onChange={(value) =>
                updateField(
                  "classLeaderName",
                  value,
                )
              }
            />

            {/* CLASS LEADER SIGNATURE */}

            <SignatureInput
              label="የክፍል መሪ ፊርማ"
              value={
                form.classLeaderSignature
              }
              onChange={(value) =>
                updateField(
                  "classLeaderSignature",
                  value,
                )
              }
            />

            <Input
              label="ሰብሳቢ"
              value={form.chairmanName}
              onChange={(value) =>
                updateField(
                  "chairmanName",
                  value,
                )
              }
            />

            {/* CHAIRMAN SIGNATURE */}

            <SignatureInput
              label="የሰብሳቢ ፊርማ"
              value={
                form.chairmanSignature
              }
              onChange={(value) =>
                updateField(
                  "chairmanSignature",
                  value,
                )
              }
            />

          </Section>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-[#d4af37]/20 bg-[#f8f5ec]/95 p-3 shadow-xl backdrop-blur sm:flex-row sm:justify-end">

            <Link
              href={`/dashboard/student/${id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-[#172033] transition hover:border-[#0d3b78]"
            >
              ሰርዝ
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d3b78] px-7 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#092d5d] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  በማስቀመጥ ላይ...
                </>
              ) : (
                <>
                  <Save size={18} />
                  ለውጡን አስቀምጥ
                </>
              )}

            </button>

          </div>

        </form>

      </section>

    </main>
  );
}

/* ============================================================
   SECTION
============================================================ */

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-[#d4af37]/20 bg-white shadow-sm">

      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d3b78]/10 text-[#0d3b78]">
          {icon}
        </div>

        <h2 className="font-bold text-[#172033]">
          {title}
        </h2>

      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        {children}
      </div>

    </section>
  );
}

/* ============================================================
   INPUT
============================================================ */

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-[#172033]">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange?.(event.target.value)
        }
        readOnly={readOnly}
        required={required}
        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
          readOnly
            ? "border-slate-200 bg-slate-50 text-gray-500"
            : "border-slate-200 bg-white text-[#172033] focus:border-[#0d3b78] focus:ring-2 focus:ring-[#0d3b78]/10"
        }`}
      />

    </div>
  );
}

/* ============================================================
   SELECT
============================================================ */

function Select({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
  required?: boolean;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-[#172033]">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#172033] outline-none focus:border-[#0d3b78] focus:ring-2 focus:ring-[#0d3b78]/10"
      >

        <option value="">
          ይምረጡ
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}

      </select>

    </div>
  );
}

/* ============================================================
   SIGNATURE INPUT
============================================================ */

function SignatureInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const isSignatureImage =
    typeof value === "string" &&
    value.startsWith("data:image/");

  return (
    <div>

      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#172033]">
        <Edit3
          size={15}
          className="text-[#0d3b78]"
        />

        {label}
      </label>

      <div className="rounded-2xl border border-slate-200 bg-[#fafafa] p-4">

        {/* SAVED SIGNATURE PREVIEW */}

        {isSignatureImage ? (
          <div className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3">

            <div className="mb-2 text-xs font-semibold text-gray-500">
              የተመዘገበ ፊርማ
            </div>

            <div className="flex min-h-[100px] items-center justify-center rounded-xl bg-white p-3">
              <img
                src={value}
                alt={label}
                className="max-h-24 max-w-full object-contain"
              />
            </div>

          </div>
        ) : (
          <div className="mb-3 flex min-h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white">

            <div className="text-center">

              <Edit3
                size={28}
                className="mx-auto mb-2 text-gray-300"
              />

              <p className="text-sm font-medium text-gray-400">
                ፊርማ የለም
              </p>

            </div>

          </div>
        )}

        {/* HIDDEN VALUE INPUT */}

        <input
          type="hidden"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
        />

        {/* INFO */}

        {isSignatureImage && (
          <p className="text-xs leading-5 text-gray-500">
            ይህ ፊርማ በመጀመሪያ ሲመዘገብ የተቀመጠ ነው።
          </p>
        )}

      </div>

    </div>
  );
}

/* ============================================================
   PHOTO INPUT
============================================================ */

function PhotoInput({
  label,
  preview,
  onChange,
}: {
  label: string;
  preview: string | null;
  onChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
}) {
  return (
    <div>

      <p className="mb-2 text-sm font-semibold text-[#172033]">
        {label}
      </p>

      <label className="group flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-[#fafafa] p-5 transition hover:border-[#0d3b78]/40">

        <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-[#d4af37]/20 bg-white">

          {preview ? (
            <Image
              src={preview}
              alt={label}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <Camera
              size={35}
              className="text-gray-300"
            />
          )}

        </div>

        <span className="mt-3 text-xs font-semibold text-[#0d3b78]">
          ፎቶ ለመቀየር ይጫኑ
        </span>

        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />

      </label>

    </div>
  );
}
