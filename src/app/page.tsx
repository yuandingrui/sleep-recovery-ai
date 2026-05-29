"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Moon, Sunrise, Zap, Brain, ChevronRight, Sparkles } from "lucide-react";

// ── Sleep Ring (Apple Watch style) ──────────────────────────────────
function SleepRing({ score }: { score: number }) {
  const radius = 84;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = score / 100;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow behind the ring */}
      <div className="absolute h-44 w-44 rounded-full bg-indigo-500/10 blur-2xl animate-pulse-glow" />

      <svg
        width={radius * 2 + strokeWidth * 2}
        height={radius * 2 + strokeWidth * 2}
        className="relative -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke="url(#sleepGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="sleepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-bold tracking-tight">{score}</span>
        <span className="mt-0.5 text-xs font-medium text-muted-foreground">
          恢复指数
        </span>
      </div>
    </div>
  );
}

// ── Stat Pill ───────────────────────────────────────────────────────
function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: "indigo" | "violet" | "emerald";
}) {
  const bgMap = {
    indigo: "bg-indigo-500/10 text-indigo-300",
    violet: "bg-violet-500/10 text-violet-300",
    emerald: "bg-emerald-500/10 text-emerald-300",
  };

  return (
    <div className="glass-subtle flex flex-1 flex-col items-center gap-2 rounded-2xl py-4">
      <div className={`rounded-xl p-2 ${bgMap[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-lg font-semibold">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

// ── Recovery Suggestion Card ────────────────────────────────────────
function SuggestionCard({
  icon: Icon,
  title,
  description,
  time,
  active,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left transition-all duration-300 ${
        active ? "scale-100 opacity-100" : "scale-95 opacity-60"
      }`}
    >
      <Card
        className={`group transition-all duration-300 hover:bg-white/[0.07] ${
          active ? "border-indigo-500/20 shadow-lg shadow-indigo-500/5" : ""
        }`}
      >
        <CardContent className="!pt-0">
          <div className="flex items-start gap-4">
            <div
              className={`rounded-xl p-2.5 ${
                active
                  ? "bg-indigo-500/15 text-indigo-300"
                  : "bg-white/5 text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[15px] font-semibold truncate">{title}</h3>
                <Badge
                  variant={active ? "accent" : "secondary"}
                  className="shrink-0 text-[10px] px-2 py-0"
                >
                  {time}
                </Badge>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
            <ChevronRight
              className={`mt-1 h-4 w-4 shrink-0 transition-all ${
                active ? "text-indigo-400" : "text-muted-foreground"
              } group-hover:translate-x-0.5`}
            />
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

// ── Main Page ───────────────────────────────────────────────────────
const suggestions = [
  {
    id: 1,
    icon: Sunrise,
    title: "晨间光照疗法",
    description: "起床后 30 分钟内接触自然光 15 分钟，帮助重置生物钟。",
    time: "8:00 AM",
  },
  {
    id: 2,
    icon: Brain,
    title: "20 分钟能量小睡",
    description: "下午 1-3 点间进行短时午睡，不要超过 30 分钟。",
    time: "1:30 PM",
  },
  {
    id: 3,
    icon: Zap,
    title: "晚间放松练习",
    description: "睡前 1 小时进行深呼吸练习，降低皮质醇水平。",
    time: "10:00 PM",
  },
];

export default function Home() {
  const router = useRouter();
  const [activeCard, setActiveCard] = useState(1);

  return (
    <>
      {/* Header */}
      <header className="animate-fade-in mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              5月24日 · 周日
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              早安，Yuan
              <span className="ml-1.5 inline-block animate-breathe">🌙</span>
            </h1>
          </div>
          <Button variant="outline" size="icon" className="rounded-full">
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          昨晚睡眠 <span className="font-medium text-foreground">6h 23m</span>
          ，深度睡眠比例偏低，今天需要温和恢复。
        </p>
      </header>

      {/* Sleep Score Ring */}
      <section className="animate-slide-up flex justify-center">
        <SleepRing score={72} />
      </section>

      {/* Quick Stats */}
      <section
        className="mt-8 grid grid-cols-3 gap-3 animate-slide-up"
        style={{ animationDelay: "0.1s" }}
      >
        <StatPill
          icon={Moon}
          label="入睡时间"
          value="02:15"
          color="indigo"
        />
        <StatPill
          icon={Zap}
          label="深睡时长"
          value="1h 12m"
          color="violet"
        />
        <StatPill
          icon={Brain}
          label="睡眠质量"
          value="中等"
          color="emerald"
        />
      </section>

      {/* AI Recovery Plan */}
      <section
        className="mt-8 animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">今日恢复计划</h2>
          <Badge variant="accent" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI 生成
          </Badge>
        </div>

        <div className="flex flex-col gap-3">
          {suggestions.map((s) => (
            <SuggestionCard
              key={s.id}
              icon={s.icon}
              title={s.title}
              description={s.description}
              time={s.time}
              active={activeCard === s.id}
              onClick={() => setActiveCard(s.id)}
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="mt-8 animate-slide-up"
        style={{ animationDelay: "0.3s" }}
      >
        <Button
          className="w-full h-12 text-[15px] gap-2"
          onClick={() => router.push("/input")}
        >
          <Sparkles className="h-4 w-4" />
          查看完整恢复方案
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          基于你最近 7 天的睡眠数据分析
        </p>
      </section>

      {/* Bottom spacer for safe area */}
      <div className="mt-6" />
    </>
  );
}
