"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCurrentUser } from "@/services/authService";

export function useAdminGuard() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login?redirect=/admin");
      return;
    }
    const user = getCurrentUser();
    if (!user?.roles.includes("ADMIN")) {
      router.replace("/dashboard");
      return;
    }
    setChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return checked;
}
