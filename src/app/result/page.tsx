"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Shield,
  Brain,
  Apple,
  Coffee,
  Heart,
  Sparkles,
  Moon,
  Sunrise,
  Zap,
  Utensils,
  Waves,
  Egg,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────

interface AIReportData {
  recoveryScore: number;
  recoveryLevel: "critical" | "moderate" | "mild" | "good";
  recoveryLabel: string;
  summary: string;
  suggestions: { icon: string; title: string; desc: string }[];
  dietAdvice: { icon: string; title: string; desc: string }[];
  caffeineAdvice: { deadline: string; desc: string };
  encouragement: { quote: string; tip: string };
  dimensions: { label: string; score: number }[];
}

type ReportData = {
  sleepDuration: number;
  sleepScore: number;
  recoveryLevel: AIReportData["recoveryLevel"];
  recoveryLabel: string;
  summary: string;
  suggestions: { Icon: React.ElementType; title: string; desc: string }[];
  dietAdvice: { Icon: React.ElementType; title: string; desc: string }[];
  caffeineAdvice: { time: string; desc: string };
  encouragement: { quote: string; tip: string };
  dimensions: { label: string; score: number; color: string }[];
};

// ── Icon mapping ────────────────────────────────────────────────────

const iconMap: Record<string, React.ElementType> = {
  Sunrise, Zap, Waves, Brain, Moon, Apple, Utensils, Coffee, Egg,
};

function resolveIcon(name: string): React.ElementType {
  return iconMap[name] || Sparkles;
}

// ── Recovery Ring ───────────────────────────────────────────────────

function RecoveryRing({ score, level }: { score: number; level: ReportData["recoveryLevel"] }) {
  const radius = 72;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  const levelConfig = {
    critical: { color: "#f87171", bg: "bg-red-500/10", badge: "需重点恢复" },
    moderate: { color: "#fbbf24", bg: "bg-amber-500/10", badge: "需要关注" },
    mild: { color: "#818cf8", bg: "bg-indigo-500/10", badge: "轻度调整" },
    good: { color: "#34d399", bg: "bg-emerald-500/10", badge: "状态良好" },
  };

  const config = levelConfig[level];

  return (
    <div className="relative flex items-center justify-center">
      <div className={`absolute h-36 w-36 rounded-full ${config.bg} blur-2xl`} />
      <svg
        width={(radius + strokeWidth) * 2}
        height={(radius + strokeWidth) * 2}
        className="relative -rotate-90"
      >
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke={config.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 8px ${config.color}40)` }}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold tracking-tight">{score}</span>
        <span className="text-[10px] text-muted-foreground">恢复指数</span>
        <Badge
          variant={
            level === "critical"
              ? "destructive"
              : level === "moderate"
              ? "warning"
              : level === "mild"
              ? "accent"
              : "success"
          }
          className="mt-1.5 text-[10px]"
        >
          {config.badge}
        </Badge>
      </div>
    </div>
  );
}

// ── Animated Section ────────────────────────────────────────────────

function Section({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      className="animate-slide-up"
      style={{ animationDelay: `${delay}s`, animationFillMode: "both" }}
    >
      {children}
    </section>
  );
}

// ── Fallback data generator ─────────────────────────────────────────

function getFallbackData(
  bedtime: string,
  waketime: string,
  status: string,
  sleepMinutes: number
): ReportData {
  const scoreMap: Record<string, { score: number; level: ReportData["recoveryLevel"]; label: string }> = {
    "tired-severe": { score: 38, level: "critical", label: "严重疲劳" },
    "tired-moderate": { score: 55, level: "moderate", label: "中度疲劳" },
    "tired-mild": { score: 68, level: "mild", label: "轻微疲劳" },
    okay: { score: 78, level: "mild", label: "精力尚可" },
    energetic: { score: 88, level: "good", label: "精力充沛" },
  };
  const { score, level, label } = scoreMap[status] || scoreMap["tired-moderate"];
  const [bh] = bedtime.split(":").map(Number);

  return {
    sleepDuration: sleepMinutes,
    sleepScore: score,
    recoveryLevel: level,
    recoveryLabel: label,
    summary: `昨晚睡眠 ${Math.floor(sleepMinutes / 60)}h${sleepMinutes % 60}m，${label}状态，需要针对性恢复。`,
    suggestions: [
      { Icon: Sunrise, title: "晨间光照", desc: "起床后接触自然光15分钟，帮助重置生物钟。" },
      { Icon: Zap, title: "午间小睡", desc: "下午1-3点进行20分钟能量午睡。" },
      { Icon: Waves, title: "深呼吸练习", desc: "尝试4-7-8呼吸法，重复5次降低焦虑。" },
    ],
    dietAdvice: [
      { Icon: Apple, title: "色氨酸食物", desc: "香蕉、牛奶、坚果有助于合成褪黑素。" },
      { Icon: Utensils, title: "避免高糖高脂", desc: "熬夜后血糖调节能力下降，避免甜食。" },
      { Icon: Zap, title: "补充镁和B族维生素", desc: "深绿色蔬菜、全谷物有助神经修复。" },
    ],
    caffeineAdvice: {
      time: sleepMinutes < 360 ? "避免" : "14:00",
      desc: sleepMinutes < 360
        ? "睡眠严重不足，建议完全避免咖啡因。"
        : "最后一杯咖啡不晚于下午2点。",
    },
    encouragement: {
      quote: "每一次熬夜都是在提醒我们更爱自己。今天温柔以待，明天会更好。",
      tip: "今晚目标：23:00前放下手机，调暗灯光。",
    },
    dimensions: [
      { label: "睡眠时长", score: Math.min(100, (sleepMinutes / 480) * 100), color: "from-indigo-500 to-violet-500" },
      { label: "入睡时间", score: bh < 1 ? 30 : bh < 2 ? 50 : 80, color: "from-violet-500 to-purple-500" },
      { label: "深睡预估", score: sleepMinutes > 360 ? 70 : 45, color: "from-purple-500 to-pink-500" },
      { label: "综合恢复", score, color: "from-emerald-500 to-teal-500" },
    ],
  };
}

// ── Main Content ────────────────────────────────────────────────────

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bedtime = searchParams.get("bedtime") || "01:30";
  const waketime = searchParams.get("waketime") || "08:00";
  const status = searchParams.get("status") || "tired-moderate";
  const symptoms = searchParams.get("symptoms") || "";

  const sleepMinutes = useMemo(() => {
    const [bh, bm] = bedtime.split(":").map(Number);
    const [wh, wm] = waketime.split(":").map(Number);
    let bedMin = bh * 60 + bm;
    let wakeMin = wh * 60 + wm;
    if (wakeMin <= bedMin) wakeMin += 24 * 60;
    return wakeMin - bedMin;
  }, [bedtime, waketime]);

  const fallbackData = useMemo(
    () => getFallbackData(bedtime, waketime, status, sleepMinutes),
    [bedtime, waketime, status, sleepMinutes]
  );

  const [aiData, setAiData] = useState<AIReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchReport() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/recovery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bedtime,
            waketime,
            status,
            symptoms: symptoms ? symptoms.split(",").filter(Boolean) : [],
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "请求失败");
        }

        const json: AIReportData = await res.json();
        if (!cancelled) setAiData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "未知错误");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchReport();
    return () => { cancelled = true; };
  }, [bedtime, waketime, status, symptoms]);

  // Merge AI data with fallback
  const data: ReportData = useMemo(() => {
    if (!aiData) return fallbackData;

    const dimColors = [
      "from-indigo-500 to-violet-500",
      "from-violet-500 to-purple-500",
      "from-purple-500 to-pink-500",
      "from-emerald-500 to-teal-500",
    ];

    return {
      sleepDuration: sleepMinutes,
      sleepScore: aiData.recoveryScore,
      recoveryLevel: aiData.recoveryLevel,
      recoveryLabel: aiData.recoveryLabel,
      summary: aiData.summary,
      suggestions: aiData.suggestions.map((s) => ({
        Icon: resolveIcon(s.icon),
        title: s.title,
        desc: s.desc,
      })),
      dietAdvice: aiData.dietAdvice.map((d) => ({
        Icon: resolveIcon(d.icon),
        title: d.title,
        desc: d.desc,
      })),
      caffeineAdvice: {
        time: aiData.caffeineAdvice.deadline,
        desc: aiData.caffeineAdvice.desc,
      },
      encouragement: aiData.encouragement,
      dimensions: aiData.dimensions.map((d, i) => ({
        label: d.label,
        score: d.score,
        color: dimColors[i] || dimColors[dimColors.length - 1],
      })),
    };
  }, [aiData, fallbackData, sleepMinutes]);

  // ── AI Thinking Steps ──────────────────────────────────────────────

  const thinkingSteps = [
    { icon: Moon, label: "分析睡眠数据...", delay: 0 },
    { icon: Brain, label: "评估疲劳等级...", delay: 800 },
    { icon: Zap, label: "匹配恢复策略...", delay: 1600 },
    { icon: Sparkles, label: "生成个性化方案...", delay: 2400 },
  ];

  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [thinkingComplete, setThinkingComplete] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timers: NodeJS.Timeout[] = [];

    thinkingSteps.forEach((step, i) => {
      const t = setTimeout(() => {
        setVisibleSteps((prev) => [...prev, i]);
        if (i === thinkingSteps.length - 1) {
          setTimeout(() => setThinkingComplete(true), 600);
        }
      }, step.delay);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // ── Loading State ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center">
        {/* Pulsing ring */}
        <div className="relative mb-10">
          <div className="absolute inset-0 h-28 w-28 rounded-full bg-indigo-500/10 animate-ping [animation-duration:3s]" />
          <div className="absolute inset-0 h-28 w-28 rounded-full bg-violet-500/10 animate-ping [animation-duration:3s] [animation-delay:0.5s]" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full glass-strong">
            <Sparkles className="h-10 w-10 animate-pulse text-indigo-400" />
          </div>
        </div>

        {/* Thinking steps */}
        <div className="flex w-full max-w-[260px] flex-col gap-3">
          {thinkingSteps.map((step, i) => {
            const visible = visibleSteps.includes(i);
            const isLast = i === thinkingSteps.length - 1;
            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  visible
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0"
                } ${isLast && !thinkingComplete ? "animate-pulse" : ""}`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                    thinkingComplete
                      ? "bg-emerald-500/15 text-emerald-400"
                      : visible
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "bg-white/5 text-muted-foreground"
                  }`}
                >
                  {thinkingComplete && isLast ? (
                    <Sparkles className="h-3.5 w-3.5" />
                  ) : (
                    <step.icon className="h-3.5 w-3.5" />
                  )}
                </div>
                <span
                  className={`text-sm transition-colors duration-300 ${
                    visible ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
                {visible && !thinkingComplete && isLast && (
                  <span className="ml-auto">
                    <span className="inline-flex gap-0.5">
                      <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-400 [animation-delay:0ms]" />
                      <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-400 [animation-delay:100ms]" />
                      <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-400 [animation-delay:200ms]" />
                    </span>
                  </span>
                )}
                {visible && thinkingComplete && isLast && (
                  <span className="ml-auto text-[10px] font-medium text-emerald-400">
                    完成
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Error Banner ───────────────────────────────────────────────────

  const ErrorBanner = error && (
    <div className="mb-4 animate-fade-in rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
      <p className="text-xs text-amber-300/80">
        AI 服务暂不可用：{error}。以下为本地生成的恢复建议。
      </p>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <>
      <header className="animate-fade-in mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="-ml-2 rounded-full" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI 恢复报告</h1>
            <p className="text-xs text-muted-foreground">基于你的睡眠数据生成</p>
          </div>
          <Badge variant="accent" className="ml-auto gap-1">
            <Sparkles className="h-3 w-3" />
            {aiData ? "DeepSeek" : "本地"}
          </Badge>
        </div>
      </header>

      {ErrorBanner}

      {/* Recovery Score */}
      <Section>
        <Card className="overflow-hidden border-indigo-500/10 glass-strong">
          <CardContent className="!pt-5 flex flex-col items-center pb-6">
            <RecoveryRing score={data.sleepScore} level={data.recoveryLevel} />

            <p className="mt-3 max-w-xs text-center text-[13px] leading-relaxed text-muted-foreground">
              {data.summary}
            </p>

            <div className="mt-4 flex w-full items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Moon className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-xs text-muted-foreground">入睡</span>
                <span className="text-xs font-semibold tabular-nums">{bedtime}</span>
              </div>
              <span className="text-muted-foreground/30">·</span>
              <div className="flex items-center gap-1.5">
                <Sunrise className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs text-muted-foreground">起床</span>
                <span className="text-xs font-semibold tabular-nums">{waketime}</span>
              </div>
              <span className="text-muted-foreground/30">·</span>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-xs text-muted-foreground">时长</span>
                <span className="text-xs font-semibold tabular-nums">
                  {Math.floor(sleepMinutes / 60)}h{sleepMinutes % 60}m
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Recovery Dimensions */}
      <Section delay={0.1}>
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              恢复维度分析
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {data.dimensions.map((dim) => (
              <div key={dim.label} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-xs text-muted-foreground">{dim.label}</span>
                <Progress value={dim.score} className="flex-1 h-1.5" indicatorClassName={`bg-gradient-to-r ${dim.color}`} />
                <span className="w-8 text-right text-xs font-medium tabular-nums text-muted-foreground">
                  {Math.round(dim.score)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </Section>

      {/* Suggestions */}
      <Section delay={0.2}>
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-indigo-400" />
              <CardTitle className="text-[15px]">今日恢复建议</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {data.suggestions.map((item, i) => (
              <div key={item.title}>
                {i > 0 && <Separator className="mb-4" />}
                <div className="flex gap-3">
                  <div className="mt-0.5 rounded-lg bg-indigo-500/10 p-1.5 text-indigo-400">
                    <item.Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </Section>

      {/* Diet */}
      <Section delay={0.3}>
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Apple className="h-4 w-4 text-emerald-400" />
              <CardTitle className="text-[15px]">饮食建议</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {data.dietAdvice.map((item) => (
              <div key={item.title} className="flex gap-3">
                <div className="mt-0.5 rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
                  <item.Icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </Section>

      {/* Caffeine */}
      <Section delay={0.35}>
        <Card className="mt-4 overflow-hidden border-amber-500/10">
          <CardContent className="!pt-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-500/15 p-3 text-amber-400">
                <Coffee className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold">咖啡因建议</h3>
                  <Badge variant="warning" className="text-[10px]">
                    {data.caffeineAdvice.time === "避免"
                      ? "今日避免"
                      : `截止 ${data.caffeineAdvice.time}`}
                  </Badge>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {data.caffeineAdvice.desc}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Encouragement */}
      <Section delay={0.45}>
        <Card className="mt-4 overflow-hidden border-pink-500/5 bg-gradient-to-br from-pink-500/[0.03] to-violet-500/[0.03]">
          <CardContent className="!pt-5 pb-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-pink-500/10 p-2.5 text-pink-400">
                <Heart className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold">情绪鼓励</h3>
                <p className="mt-2 text-[14px] leading-relaxed italic text-foreground/80">
                  &ldquo;{data.encouragement.quote}&rdquo;
                </p>
                <Separator className="my-3" />
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    {data.encouragement.tip}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Actions */}
      <Section delay={0.55}>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1 h-12 text-sm rounded-2xl" onClick={() => router.push("/input")}>
            重新记录
          </Button>
          <Button className="flex-1 h-12 text-sm rounded-2xl gap-2 shadow-lg shadow-indigo-500/20" onClick={() => router.push("/")}>
            <Shield className="h-4 w-4" />
            返回首页
          </Button>
        </div>
      </Section>

      <div className="mt-6" />
    </>
  );
}

// ── Page with Suspense ──────────────────────────────────────────────

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <p className="text-sm text-muted-foreground">加载中...</p>
          </div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
