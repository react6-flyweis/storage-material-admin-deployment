export type TourId =
  | "admin-platform"
  | "leads-deep-dive"
  | "customers-deep-dive"
  | "plant-deep-dive"
  | "payments-deep-dive"
  | "invoices-deep-dive"
  | "construction-deep-dive"
  | "finance-deep-dive"
  | "approvals-deep-dive";

/**
 * Shown instead of skipping the step when its target element is not rendered
 * (e.g. an Approve button that only appears for pending records). `element`
 * may be a selector list; whichever is on the current page is highlighted.
 */
export interface TourStepFallbackConfig {
  element: string;
  description: string;
  speechText?: string;
}

/** Offers a jump into a more detailed tour from this step. */
export interface TourStepBranchConfig {
  tourId: TourId;
  label: string;
  description?: string;
  /** Step of the current tour to resume at afterwards. Defaults to the next step. */
  resumeStepIndex?: number;
}

/**
 * The in-page control a user clicks to reach this step's page (a row's View
 * button, a quick-action button...). The tour highlights it before moving on.
 */
export interface TourStepViaConfig {
  /** Page the control lives on. May contain route params like `:leadId`. */
  fromRoute: string;
  element: string;
  title: string;
  description: string;
  speechText?: string;
}

export interface TourStepConfig {
  id: string;
  /**
   * Page the step lives on. May contain `:leadId` / `:customerId`, resolved at
   * runtime. Empty means "stay on the current page" (e.g. sidebar-only steps).
   */
  route: string;
  element: string;
  title: string;
  description: string;
  speechText?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  branch?: TourStepBranchConfig;
  via?: TourStepViaConfig;
  /** Target may legitimately be absent (depends on data); skip quickly if so. */
  optional?: boolean;
  fallback?: TourStepFallbackConfig;
}

export interface TourDefinition {
  id: TourId;
  name: string;
  description: string;
  estimatedMinutes: number;
  steps: TourStepConfig[];
}
