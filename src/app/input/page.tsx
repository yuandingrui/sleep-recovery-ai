"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";
import {
  Moon,
  Sunrise,
  ChevronLeft,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";

// ── Status Options ──────────────────────────────────────────────────
const statusOptions = [
  { id: "tired-severe", emoji: "😫", label: "严重疲劳" },
  { id: "tired-moderate", emoji: "😔", label: "中度疲劳" },
  { id: "tired-mild", emoji: "😐", label: "轻微疲劳" },
  { id: "okay", emoji: "😊", label: "精力尚可" },
  { id: "energetic", emoji: "⚡", label: "精力充沛" },
];

const symptomOptions = [
  { id: "eye-strain", label: "眼睛酸涩" },
  { id: "brain-fog", label: "头脑昏沉" },
  { id: "body-ache", label: "身体酸痛" },
  { id: "headache", label: "头痛" },
  { id: "anxiety", label: "心慌焦虑" },
];

// ── Time Picker ─────────────────────────────────────────────────────
function TimeSelector({
  label,
  icon: Icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  value: { hour: number; minute: number };
  onChange: (v: { hour: number; minute: number }) => void;
}) {
  const adjustTime = (
    field: "hour" | "minute",
    delta: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const newValue = { ...value };
    if (field === "hour") {
      newValue.hour = (value.hour + delta + 24) % 24;
    } else {
      newValue.minute = (value.minute + delta * 15 + 60) % 60;
    }
    onChange(newValue);
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="glass rounded-2xl p-5">
      <Label className="mb-4 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </Label>

      <div className="flex items-center justify-center gap-2">
        {/* Hour */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={(e) => adjustTime("hour", 1, e)}
            className="flex h-8 w-12 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground active:scale-95"
          >
            <ChevronUp className="h-4 w-4" />
          </button>

          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/[0.04]">
            <span className="text-3xl font-bold tabular-nums tracking-tight">
              {pad(value.hour)}
            </span>
          </div>

          <button
            onClick={(e) => adjustTime("hour", -1, e)}
            className="flex h-8 w-12 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground active:scale-95"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <span className="mb-2 text-3xl font-light text-muted-foreground/40">
          :
        </span>

        {/* Minute */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={(e) => adjustTime("minute", 1, e)}
            className="flex h-8 w-12 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground active:scale-95"
          >
            <ChevronUp className="h-4 w-4" />
          </button>

          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/[0.04]">
            <span className="text-3xl font-bold tabular-nums tracking-tight">
              {pad(value.minute)}
            </span>
          </div>

          <button
            onClick={(e) => adjustTime("minute", -1, e)}
            className="flex h-8 w-12 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground active:scale-95"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preset times */}
      <div className="mt-4 flex justify-center gap-2">
        {label === "睡觉时间"
          ? ["22:00", "23:00", "00:00", "01:00", "02:00"].map((t) => {
              const [h, m] = t.split(":").map(Number);
              return (
                <button
                  key={t}
                  onClick={(e) => {
                    e.preventDefault();
                    onChange({ hour: h, minute: m });
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all active:scale-95 ${
                    value.hour === h
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  {t}
                </button>
              );
            })
          : ["06:00", "07:00", "08:00", "09:00", "10:00"].map((t) => {
              const [h, m] = t.split(":").map(Number);
              return (
                <button
                  key={t}
                  onClick={(e) => {
                    e.preventDefault();
                    onChange({ hour: h, minute: m });
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all active:scale-95 ${
                    value.hour === h
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  {t}
                </button>
              );
            })}
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────
export default function InputPage() {
  const router = useRouter();
  const [bedtime, setBedtime] = useState({ hour: 1, minute: 30 });
  const [waketime, setWaketime] = useState({ hour: 8, minute: 0 });
  const [status, setStatus] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);

  const padNum = (n: number) => String(n).padStart(2, "0");

  const toggleSymptom = (id: string) => {
    setSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const bedMinutes = bedtime.hour * 60 + bedtime.minute;
  const wakeMinutes = waketime.hour * 60 + waketime.minute;
  const adjustedWake =
    wakeMinutes <= bedMinutes ? wakeMinutes + 24 * 60 : wakeMinutes;
  const sleepMinutes = adjustedWake - bedMinutes;
  const sleepDuration = `${Math.floor(sleepMinutes / 60)}h ${sleepMinutes % 60}m`;
  const barWidth = Math.min(100, (sleepMinutes / (10 * 60)) * 100);

  const validation = useMemo(() => {
    if (sleepMinutes < 180) {
      return {
        level: "severe" as const,
        icon: AlertTriangle,
        message: `仅 ${Math.floor(sleepMinutes / 60)}h${sleepMinutes % 60}m，属于严重睡眠不足，请优先补觉。`,
        barColor: "from-red-500 to-rose-500",
        iconBg: "bg-red-500/10 text-red-400",
      };
    }
    if (sleepMinutes < 300) {
      return {
        level: "warning" as const,
        icon: Info,
        message: `睡眠 ${Math.floor(sleepMinutes / 60)}h${sleepMinutes % 60}m，低于推荐的 7 小时，今天需要温和恢复。`,
        barColor: "from-amber-500 to-orange-500",
        iconBg: "bg-amber-500/10 text-amber-400",
      };
    }
    if (sleepMinutes > 600) {
      return {
        level: "warning" as const,
        icon: Info,
        message: `睡眠超过 10 小时，可能是身体在补偿性恢复或存在其他问题。`,
        barColor: "from-amber-500 to-orange-500",
        iconBg: "bg-amber-500/10 text-amber-400",
      };
    }
    return {
      level: "good" as const,
      icon: CheckCircle2,
      message: `睡眠 ${Math.floor(sleepMinutes / 60)}h${sleepMinutes % 60}m，时长在健康范围内。`,
      barColor: "from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-500/10 text-emerald-400",
    };
  }, [sleepMinutes]);

  const canSubmit = status !== null;
  const ValidationIcon = validation.icon;



  return (
    <>
      {/* Header */}
      <header className="animate-fade-in mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full -ml-2"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">睡眠记录</h1>
            <p className="text-xs text-muted-foreground">
              记录昨晚的睡眠数据
            </p>
          </div>
        </div>
      </header>

      {/* Time Inputs */}
      <div className="flex flex-col gap-4 animate-slide-up">
        <TimeSelector
          label="睡觉时间"
          icon={Moon}
          value={bedtime}
          onChange={setBedtime}
        />
        <TimeSelector
          label="起床时间"
          icon={Sunrise}
          value={waketime}
          onChange={setWaketime}
        />

        {/* Sleep Duration Summary */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`rounded-lg p-2 ${validation.iconBg}`}>
                <ValidationIcon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                预计睡眠时长
              </span>
            </div>
            <span className="text-xl font-bold tabular-nums">
              {sleepDuration}
            </span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${validation.barColor} transition-all duration-500 ease-out`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground/60">
            <span>0h</span>
            <span>5h</span>
            <span>10h+</span>
          </div>
          <p className={`mt-2 text-xs leading-relaxed ${
            validation.level === "severe" ? "text-red-300/80" : "text-muted-foreground"
          }`}>
            {validation.message}
          </p>
        </div>
      </div>

      {/* Current Status */}
      <section className="mt-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <Label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">
          当前状态
        </Label>

        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => {
            const isActive = status === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setStatus(isActive ? null : opt.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 ${
                  isActive
                    ? "bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-500/30"
                    : "glass text-muted-foreground hover:bg-white/[0.07]"
                }`}
              >
                <span className="text-base">{opt.emoji}</span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Symptoms */}
      <section
        className="mt-5 animate-slide-up"
        style={{ animationDelay: "0.15s" }}
      >
        <Label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">
          身体症状 (可多选)
        </Label>

        <div className="flex flex-wrap gap-2">
          {symptomOptions.map((opt) => {
            const isActive = symptoms.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggleSymptom(opt.id)}
                className={`rounded-full px-3.5 py-2 text-xs font-medium transition-all duration-200 active:scale-95 ${
                  isActive
                    ? "bg-violet-500/20 text-violet-200 ring-1 ring-violet-500/30"
                    : "glass text-muted-foreground hover:bg-white/[0.07]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Generate Button */}
      <section
        className="mt-8 animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        <Button
          className="w-full h-14 text-[15px] gap-2 rounded-2xl shadow-lg shadow-indigo-500/20"
          disabled={!canSubmit}
          onClick={() => {
            if (validation.level === "severe") {
              toast.info("睡眠严重不足，将为你生成紧急恢复方案");
            } else if (validation.level === "warning") {
              toast.info("正在为你生成恢复建议...");
            }
            const params = new URLSearchParams({
              bedtime: `${padNum(bedtime.hour)}:${padNum(bedtime.minute)}`,
              waketime: `${padNum(waketime.hour)}:${padNum(waketime.minute)}`,
              status: status || "",
              symptoms: symptoms.join(","),
            });
            router.push(`/result?${params.toString()}`);
          }}
        >
          <Sparkles className="h-4 w-4" />
          生成恢复计划
        </Button>

        {!canSubmit && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground animate-fade-in">
            <Info className="h-3 w-3" />
            请先选择当前状态
          </p>
        )}
      </section>

      {/* Spacer */}
      <div className="mt-6" />
    </>
  );
}
