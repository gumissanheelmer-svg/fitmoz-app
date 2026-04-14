// Centralized plan state — will be replaced with real auth/DB later
import { useState, useCallback } from "react";

export type Plan = "plus" | "pro";
export type PlanStatus = "ativo" | "teste" | "expirado";

// Simple global state for now (no backend yet)
let globalPlan: Plan = "plus";
const listeners = new Set<() => void>();

export const usePlan = () => {
  const [, rerender] = useState(0);

  const plan = globalPlan;

  const setPlan = useCallback((p: Plan) => {
    globalPlan = p;
    listeners.forEach((l) => l());
  }, []);

  // Subscribe to changes
  useState(() => {
    const listener = () => rerender((n) => n + 1);
    listeners.add(listener);
    return () => listeners.delete(listener);
  });

  const isPro = plan === "pro";
  const status: PlanStatus = "ativo";
  const expiresAt = "2026-05-14";

  return { plan, setPlan, isPro, status, expiresAt };
};
