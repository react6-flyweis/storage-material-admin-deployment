import { useEffect } from "react";
import { useLocation } from "react-router";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useLogPageVisitMutation } from "@/modules/activity/activity.hooks";

export function PageActivityTracker() {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { mutateAsync: logPageVisit } = useLogPageVisitMutation();

  useEffect(() => {
    if (accessToken) {
      logPageVisit({
        panel: "admin",
        page: location.pathname,
      }).catch((err) => {
        // Silent or warning log in dev/production to prevent spamming console
        console.warn("Failed to log page activity:", err);
      });
    }
  }, [location.pathname, accessToken, logPageVisit]);

  return null;
}
