"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  memberId: string;
  memberName: string;
  memberPhotoPath?: string | null;
  guardianPhotoPath?: string | null;
};

export default function DeleteMemberButton({
  memberId,
  memberName,
  memberPhotoPath,
  guardianPhotoPath,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `እርግጠኛ ነዎት የ${memberName} የአባልነት መረጃ ማጥፋት ይፈልጋሉ?\n\nይህ ሂደት መረጃውን በቋሚነት ያጠፋል።`
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      // --------------------------------------------------
      // 1. Delete member record
      // --------------------------------------------------
      const { error: deleteError } = await supabase
        .from("members")
        .delete()
        .eq("id", memberId);

      if (deleteError) {
        throw deleteError;
      }

      // --------------------------------------------------
      // 2. Delete member photo
      // --------------------------------------------------
      const filesToDelete: string[] = [];

      if (memberPhotoPath) {
        filesToDelete.push(memberPhotoPath);
      }

      if (guardianPhotoPath) {
        filesToDelete.push(guardianPhotoPath);
      }

      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("member-photos")
          .remove(filesToDelete);

        if (storageError) {
          console.error(
            "Member record deleted, but photo cleanup failed:",
            storageError
          );
        }
      }

      // --------------------------------------------------
      // 3. Refresh member list
      // --------------------------------------------------
      router.refresh();

    } catch (error) {
      console.error("Delete member error:", error);

      alert(
        error instanceof Error
          ? `አባሉን ማጥፋት አልተቻለም።\n\n${error.message}`
          : "አባሉን ማጥፋት አልተቻለም።"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Trash2 size={16} />

      {deleting ? "በመሰረዝ ላይ..." : "ሰርዝ"}
    </button>
  );
}