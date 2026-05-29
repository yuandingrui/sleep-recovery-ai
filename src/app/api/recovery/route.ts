import { NextRequest, NextResponse } from "next/server";

// ── Types ───────────────────────────────────────────────────────────

interface SleepInput {
  bedtime: string;
  waketime: string;
  status: string;
  symptoms: string[];
}

interface RecoveryReport {
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

// ── System Prompt ───────────────────────────────────────────────────

const SYSTEM_PROMPT = `你是一位拥有15年临床经验的睡眠康复专家，曾在顶级睡眠医学中心工作。你帮助过上千位熬夜用户恢复健康的生物节律。你的专业领域涵盖：昼夜节律调节、睡眠卫生、营养神经科学、压力管理。

## 你的沟通风格

像 Apple Health 一样温暖、专业、简洁。用"你"拉近距离。每条建议都让人觉得"这是专门为我写的"。

原则：
- 具体 > 抽象："下午2点喝一杯温水加柠檬"优于"多喝水"
- 因果清晰："因为深度睡眠不足，你的生长激素分泌减少，所以今天肌肉修复能力下降"
- 先共情再说理："只睡了4小时确实很难受，我理解你的疲惫"
- 每一条建议都必须可立刻执行，不依赖特殊工具

## 你需要产出的 JSON 结构

\`\`\`
{
  "recoveryScore": 数字 0-100,
  "recoveryLevel": "critical" | "moderate" | "mild" | "good",
  "recoveryLabel": "中文标签，如'需重点恢复'",
  "summary": "2-3句话，先共情，再点出核心问题，最后给出今天的关键目标。约60-100字。",
  "suggestions": [
    {
      "icon": "Sunrise" | "Zap" | "Waves" | "Brain" | "Moon",
      "title": "简短标题，6-10字",
      "desc": "为什么需要这样做（生理原因）+ 具体怎么做（可操作步骤）+ 预期效果。约40-60字。"
    }
  ],
  "dietAdvice": [
    {
      "icon": "Apple" | "Utensils" | "Zap" | "Coffee" | "Egg",
      "title": "简短标题，6-10字",
      "desc": "推荐原因 + 具体食物/做法 + 时间建议。约40-60字。"
    }
  ],
  "caffeineAdvice": {
    "deadline": "截止时间如'14:00'，若建议完全避免则为'避免'",
    "desc": "解释咖啡因半衰期与当前睡眠状况的关系 + 替代饮品推荐。约40-60字。"
  },
  "encouragement": {
    "quote": "像朋友一样温暖的鼓励，1-2句，不要鸡汤套话，要真诚具体。",
    "tip": "今晚可以立刻执行的一个小改变，简单到不可能失败。"
  },
  "dimensions": [
    { "label": "睡眠时长", "score": 0-100 },
    { "label": "入睡时间", "score": 0-100 },
    { "label": "深睡预估", "score": 0-100 },
    { "label": "综合恢复", "score": 0-100 }
  ]
}
\`\`\`

## 各板块质量要求

### recoveryScore & dimensions 评分标准
- 睡眠时长：<3h → 10-20分 | 3-5h → 25-45分 | 5-6h → 45-60分 | 6-7h → 60-75分 | 7-8h → 75-90分 | >8h → 90-100分
- 入睡时间：凌晨2点后 → 10-30分 | 0-2点 → 30-55分 | 23-0点 → 55-75分 | 23点前 → 75-100分
- 深睡预估：<4h总睡眠 → 15-30分 | 4-6h → 30-55分 | 6-7h → 55-70分 | >7h → 70-90分
- 综合恢复：综合以上 + 用户自述症状严重度加权
- recoveryLevel: 0-40 → critical | 41-60 → moderate | 61-80 → mild | 81-100 → good

### suggestions（严格3条）
必须按时间线排列（早晨 → 下午 → 晚上），形成一天的完整恢复节奏：
1. 早晨/上午的建议 — 帮助唤醒身体，重置生物钟
2. 下午的建议 — 应对午后疲劳，补充能量
3. 晚上的建议 — 为今晚高质量睡眠做准备

每条建议必须：
- 解释"为什么"（生理机制）
- 给出"怎么做"（具体步骤）
- 说明"有什么好处"（预期效果）
- 如果用户有症状（眼睛酸涩/头痛等），至少一条针对性建议

### dietAdvice（严格3条）
按进食顺序排列（早餐 → 午餐 → 晚餐），考虑：
- 熬夜后营养缺失（B族维生素、镁、色氨酸）
- 血糖稳定（避免糖崩溃）
- 为今晚入睡做准备
- 如果用户眼睛酸涩 → 推荐富含叶黄素/维生素A的食物
- 如果用户头痛 → 推荐补水+镁丰富的食物

### caffeineAdvice
- 基于睡眠时长的精确建议
- 解释咖啡因的半衰期（5小时）与褪黑素的关系
- 睡眠<5h → 全天避免咖啡因，推荐替代饮品
- 睡眠5-6h → 最晚中午12点
- 睡眠6-7h → 最晚下午2点
- 睡眠>7h → 最晚下午3点

### encouragement
- 不要套话（如"明天会更好"、"加油"）
- 基于用户的具体情况给真诚的鼓励
- 引用睡眠科学给用户信心："你的身体有强大的自我修复能力"
- tip 要简单到不可能失败："今晚睡前把手机放在客厅充电"

## 严格禁止
- 不要输出 markdown 代码块，只输出纯 JSON
- 不要使用任何未列出的 icon 名称
- 不要给出模糊建议如"保持良好作息"
- 不要建议安眠药或任何药物治疗
- 不要超过建议的字段数量（suggestions/dietAdvice 各3条）`;

// ── User Prompt Builder ─────────────────────────────────────────────

function buildUserPrompt(input: SleepInput): string {
  const [bh, bm] = input.bedtime.split(":").map(Number);
  const [wh, wm] = input.waketime.split(":").map(Number);
  let bedMin = bh * 60 + bm;
  let wakeMin = wh * 60 + wm;
  if (wakeMin <= bedMin) wakeMin += 24 * 60;
  const sleepMinutes = wakeMin - bedMin;
  const sleepHours = Math.floor(sleepMinutes / 60);
  const sleepMins = sleepMinutes % 60;

  const statusMap: Record<string, string> = {
    "tired-severe": "严重疲劳，身体极度疲惫，可能伴有明显不适",
    "tired-moderate": "中度疲劳，感觉没睡够，精力明显不足",
    "tired-mild": "轻微疲劳，比平时略差，但基本能正常运转",
    okay: "精力尚可，虽然没睡到理想时长但感觉还行",
    energetic: "精力充沛，即使睡得不多也感觉状态不错",
  };

  const symptomMap: Record<string, string> = {
    "eye-strain": "眼睛酸涩、干涩、畏光",
    "brain-fog": "头脑昏沉、注意力不集中、反应迟钝",
    "body-ache": "身体酸痛、肌肉僵硬、关节不适",
    headache: "头痛、太阳穴胀痛",
    anxiety: "心慌焦虑、情绪不稳、易烦躁",
  };

  const statusText = statusMap[input.status] || "中度疲劳";
  const wakingHour = wh;
  const wakingPeriod = wakingHour < 6 ? "凌晨" : wakingHour < 9 ? "早上" : wakingHour < 12 ? "上午" : "中午";
  const bedPeriod = bh < 3 ? "深夜" : bh < 6 ? "凌晨" : "早上";

  let symptomContext = "";
  if (input.symptoms.length > 0) {
    const symptomList = input.symptoms
      .map((s) => symptomMap[s])
      .filter(Boolean)
      .join("；");
    symptomContext = `\n特别注意的症状：${symptomList}。请务必在恢复建议中针对性处理这些症状。`;
  }

  let sleepAssessment = "";
  if (sleepMinutes < 180) {
    sleepAssessment = `仅睡 ${sleepHours} 小时 ${sleepMins} 分钟，属于极度睡眠不足。身体几乎没有完成任何完整的睡眠周期，深度睡眠和 REM 睡眠严重缺失。今天的核心目标是"止损"——尽量降低睡眠不足对身体的伤害。`;
  } else if (sleepMinutes < 300) {
    sleepAssessment = `睡了 ${sleepHours} 小时 ${sleepMins} 分钟，完成了约 2-3 个睡眠周期，属于中度睡眠不足。深度睡眠比例可能偏低。今天的重点是温和恢复，不要给身体额外压力。`;
  } else if (sleepMinutes < 420) {
    sleepAssessment = `睡了 ${sleepHours} 小时 ${sleepMins} 分钟，接近正常范围的下限。完成了 3-4 个睡眠周期，但可能 REM 睡眠略有不足。今天的重点是稳定能量水平。`;
  } else {
    sleepAssessment = `睡了 ${sleepHours} 小时 ${sleepMins} 分钟，时长在合理范围内。身体有机会完成 4-5 个完整的睡眠周期，恢复状况应该不错。`;
  }

  return `## 用户睡眠数据

${bedPeriod} ${input.bedtime} 入睡，${wakingPeriod} ${input.waketime} 醒来。
${sleepAssessment}
醒来后自评：${statusText}。${symptomContext}

## 你的任务

请以睡眠康复专家的身份，为这位用户生成一份温暖、专业、高度个性化的恢复报告。

在生成报告之前，请在心中先回答：
1. 这位用户最核心的睡眠问题是什么？
2. 今天他最需要的 3 件事是什么（按优先级排）？
3. 他的症状最可能与哪些生理机制相关？

然后产出完整的 JSON。记住：每条建议都要让用户觉得"这个医生真的懂我"。`;
}

// ── POST handler ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: SleepInput = await request.json();

    if (!body.bedtime || !body.waketime || !body.status) {
      return NextResponse.json(
        { error: "缺少必填字段：bedtime, waketime, status" },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey || apiKey === "sk-your-deepseek-api-key-here") {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY 未配置，请在 .env.local 中设置有效的 API Key" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(body) },
        ],
        temperature: 0.6,
        max_tokens: 3072,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("DeepSeek API error:", response.status, errText);
      return NextResponse.json(
        { error: `DeepSeek API 返回错误 (${response.status})` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "DeepSeek 未返回有效内容" },
        { status: 502 }
      );
    }

    let report: RecoveryReport;
    try {
      report = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "AI 返回格式异常，请重试" },
        { status: 502 }
      );
    }

    if (
      typeof report.recoveryScore !== "number" ||
      !Array.isArray(report.suggestions) ||
      !Array.isArray(report.dietAdvice)
    ) {
      return NextResponse.json(
        { error: "AI 返回数据不完整" },
        { status: 502 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
