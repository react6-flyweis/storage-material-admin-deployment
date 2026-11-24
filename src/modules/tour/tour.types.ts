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
  /** Id of the current tour's step to resume at afterwards. Defaults to the next step. */
  resumeStepId?: string;
}

/** A control the tour highlights, then waits for the user (or Next) to click. */
export interface TourClickConfig {
  element: string;
  title: string;
  description: string;
  speechText?: string;
}

/**
 * The in-page control a user clicks to reach this step's page (a row's View
 * button, a quick-action button...). The tour highlights it before moving on.
 */
export interface TourStepViaConfig extends TourClickConfig {
  /** Page the control lives on. May contain route params like `:leadId`. */
  fromRoute: string;
  /**
   * The control can't be clicked to open the page directly (e.g. it opens a
   * menu). Only point at it; Next opens the page.
   */
  showOnly?: boolean;
}

/** A dialog that has to be opened before a step can be shown. Never submitted. */
export interface TourPanelConfig {
  /** Present in the DOM only while the panel is open. */
  element: string;
  open: TourClickConfig;
  /** Control that closes it. Defaults to the shared Dialog's close button. */
  close?: string;
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
  /** The page only opens through its `via` control, not from its URL alone. */
  needsClick?: boolean;
  /** Dialog this step lives in. Opened for the step, closed after it. */
  panel?: TourPanelConfig;
  /** Blocks clicks on the highlighted element. Defaults to true inside a panel. */
  locked?: boolean;
  /** Target may legitimately be absent (depends on data); skip quickly if so. */
  optional?: boolean;
  fallback?: TourStepFallbackConfig;
}

/** Introduces a whole page before the tour goes through its sections. */
export interface TourPageIntro {
  title: string;
  description: string;
  /** A step on this element already shows the whole page, so it needs no intro. */
  coveredBy?: string;
}

export interface TourDefinition {
  id: TourId;
  name: string;
  description: string;
  estimatedMinutes: number;
  steps: TourStepConfig[];
}
