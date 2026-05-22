import { CheckCircle2, Circle, XCircle } from "lucide-react";

type StatusBadgeVariant = "read" | "unread" | "success" | "fail";

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
}

const STATUS_META: Record<
  StatusBadgeVariant,
  {
    label: string;
    className: string;
    icon: typeof Circle;
  }
> = {
  unread: {
    label: "미읽음",
    className: "border-[#c98124] bg-[#fff3d6] text-[#7a4b00]",
    icon: Circle
  },
  read: {
    label: "읽음",
    className: "border-[#b9c0bb] bg-[#eef1ed] text-[#51615a]",
    icon: CheckCircle2
  },
  success: {
    label: "성공",
    className: "border-[#75a99f] bg-[#e3f3ef] text-[#22675d]",
    icon: CheckCircle2
  },
  fail: {
    label: "실패",
    className: "border-[#d9938b] bg-[#f9e7e3] text-[#8d352d]",
    icon: XCircle
  }
};

export function StatusBadge({ variant }: StatusBadgeProps) {
  const meta = STATUS_META[variant];
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold ${meta.className}`}
    >
      <Icon aria-hidden="true" size={14} />
      {meta.label}
    </span>
  );
}
