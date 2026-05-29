# sleep-recovery-ai

AI 熬夜恢复助手 — 基于 DeepSeek + Next.js 构建的睡眠恢复建议应用，Apple Health 风格 UI。

---

### 功能

输入睡眠数据（入睡时间、起床时间、睡眠质量等），AI 综合评估你的睡眠恢复情况，给出：

- **恢复指数** — 0-100 的综合评分
- **睡眠分析** — 睡眠时长、深睡占比、入睡效率
- **个性化建议** — AI 基于你的数据生成的针对性改善方案

---

### 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 + React 19 |
| 语言 | TypeScript |
| AI | DeepSeek API |
| UI | Tailwind CSS 4 + Radix UI |
| 图标 | Lucide React |
| 部署 | Vercel |

---

### 项目结构

```
src/
├── app/
│   ├── api/recovery/    # DeepSeek API 调用
│   ├── input/           # 睡眠数据输入页
│   ├── result/          # AI 分析结果页
│   └── page.tsx         # 首页
├── components/ui/       # UI 组件库（Card, Badge, Button 等）
├── components/          # 业务组件（SleepRing, StatPill）
└── lib/                 # 工具函数
```

---

### 本地运行

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的 DeepSeek API Key

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

---

### 截图

> 替换为实际截图链接

---

### License

MIT
