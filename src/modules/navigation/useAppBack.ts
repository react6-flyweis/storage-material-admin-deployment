import { useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { getHierarchicalFallback } from "./navigation.hierarchy";

export interface UseAppBackOptions {
  defaultFallback?: string;
}

export function useAppBack(options?: UseAppBackOptions | string) {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultFallback = typeof options === "string" ? options : options?.defaultFallback;

  const fallbackRoute = useMemo(() => {
    return defaultFallback || getHierarchicalFallback(location.pathname);
  }, [defaultFallback, location.pathname]);

  const goBack = useCallback(
    (overrideFallback?: string) => {
      // 1. Check if an explicit origin route was passed in router state
      const stateFrom = (location.state as { from?: string } | null)?.from;
      if (stateFrom && typeof stateFrom === "string" && stateFrom.trim() !== "") {
        navigate(stateFrom);
        return;
      }

      // 2. Check if the browser has prior history in this tab session
      // In React Router v6/v7, window.history.state.idx tracks the position (0 = first page in tab)
      const historyIdx = window.history.state?.idx;
      const hasHistory =
        typeof historyIdx === "number" ? historyIdx > 0 : window.history.length > 1;

      if (hasHistory) {
        navigate(-1);
      } else {
        // 3. Fallback for direct links, bookmarks, or refreshed tabs
        const targetFallback = overrideFallback || fallbackRoute;
        navigate(targetFallback, { replace: true });
      }
    },
    [location.state, fallbackRoute, navigate],
  );

  return {
    goBack,
    fallbackRoute,
  };
}
