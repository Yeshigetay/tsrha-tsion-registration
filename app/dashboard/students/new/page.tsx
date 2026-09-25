import MemberRegistrationForm from "@/components/members/MemberRegistrationForm";
import BackToHomeButton from "@/components/layout/BackToHomeButton";

<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold text-[#0d3b78]">
      አዲስ አባል ምዝገባ
    </h1>
  </div>

  <BackToHomeButton />
</div>


export default function NewMemberPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172033]">
          አዲስ አባል መመዝገብ
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          የአባሉን ሙሉ መረጃ ይሙሉ።
        </p>
      </div>

      <MemberRegistrationForm />
    </div>
  );
}