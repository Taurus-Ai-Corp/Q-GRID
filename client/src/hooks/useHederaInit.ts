import { useEffect } from "react";
import { initializeFromEnv } from "@/lib/env-loader";

export function useHederaInit() {
  useEffect(() => {
    initializeFromEnv();
  }, []);
}
