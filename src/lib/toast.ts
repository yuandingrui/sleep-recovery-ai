import { toast as sonner } from "sonner";

export const toast = {
  success: (msg: string) =>
    sonner.success(msg, {
      style: { borderColor: "rgba(52, 211, 153, 0.2)" },
    }),
  error: (msg: string) =>
    sonner.error(msg, {
      style: { borderColor: "rgba(248, 113, 113, 0.2)" },
    }),
  info: (msg: string) =>
    sonner(msg, {
      style: { borderColor: "rgba(129, 140, 248, 0.2)" },
    }),
  ai: (msg: string) =>
    sonner(msg, {
      icon: "✨",
      style: { borderColor: "rgba(129, 140, 248, 0.3)" },
    }),
};
