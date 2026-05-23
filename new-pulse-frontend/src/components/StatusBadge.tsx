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
    className: "border-[#b42318] bg-[#fff1f0] text-[#9f1f14]",
    icon: Circle
  },
  read: {
    label: "읽음",
    className: "border-[#c7cdd6] bg-[#f3f4f6] text-[#4b5563]",
    icon: CheckCircle2
  },
  success: {
    label: "성공",
    className: "border-[#3f8f6b] bg-[#ecfdf3] text-[#1f6b4a]",
    icon: CheckCircle2
  },
  fail: {
    label: "실패",
    className: "border-[#d92d20] bg-[#fff1f0] text-[#9f1f14]",
    icon: XCircle
  }
};

export function StatusBadge({ variant }: StatusBadgeProps) {
  const meta = STATUS_META[variant];
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded border px-2 text-xs font-semibold ${meta.className}`}
    >
      <Icon aria-hidden="true" size={13} />
      {meta.label}
    </span>
  );
}
