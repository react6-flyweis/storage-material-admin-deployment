import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour.css";
import { toast } from "sonner";
import type { NavigateFunction } from "react-router";
import { queryClient } from "@/lib/query-client";
import { navigationGroups, type NavigationGroup } from "@/components/sidebar";
import { getLeadsProvider } from "@/modules/leads/leads.api";
import {
  getAdminCustomersProvider,
  getCustomerProjectsProvider,
} from "@/modules/customers/customers.api";
import { tourSpeech, type SpeechState } from "./tour-speech.service";
import { useTourStore } from "./tour.store";
import type {
  TourDefinition,
  TourStepBranchConfig,
  TourStepConfig,
  TourId,
} from "./tour.types";
import { adminPlatformTour } from "./tours/admin-platform.tour";
import { leadsDeepDiveTour } from "./tours/leads-deep-dive.tour";
import { customersDeepDiveTour } from "./tours/customers-deep-dive.tour";
import {
  constructionDeepDiveTour,
  financeDeepDiveTour,
  invoicesDeepDiveTour,
  paymentsDeepDiveTour,
  plantDeepDiveTour,
} from "./tours/section-deep-dives.tour";
import { approvalsDeepDiveTour } from "./tours/approvals-deep-dive.tour";

export const TOURS_REGISTRY: Record<TourId, TourDefinition> = {
  "admin-platform": adminPlatformTour,
  "leads-deep-dive": leadsDeepDiveTour,
  "customers-deep-dive": customersDeepDiveTour,
  "plant-deep-dive": plantDeepDiveTour,
  "payments-deep-dive": paymentsDeepDiveTour,
  "invoices-deep-dive": invoicesDeepDiveTour,
  "construction-deep-dive": constructionDeepDiveTour,
  "finance-deep-dive": financeDeepDiveTour,
  "approvals-deep-dive": approvalsDeepDiveTour,
};

const DESKTOP_TOUR_WIDTH = 1024;
const OPTIONAL_STEP_TIMEOUT_MS = 1500;
const STEP_TIMEOUT_MS = 4000;
/** Data-backed pages (lead/customer workspaces) can take longer to load. */
const DATA_STEP_TIMEOUT_MS = 8000;
/** The fallback container is normally already on screen; don't wait long. */
const FALLBACK_TIMEOUT_MS = 2000;

/**
 * Static segments that sit where a `:param` would in a route, e.g.
 * `/leads/add` vs `/leads/:leadId`. They never count as a param value.
 */
const RESERVED_SEGMENTS = new Set([
  "add",
  "escalated",
  "ai-marketing",
  "purchase-orders",
  "quotation-list",
  "quotation-details",
  "follow-up",
  "meetings",
  "contracts",
  "terminated-projects",
]);

function isTourTargetVisible(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return false;
  if (!element.isConnected) return false;
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  return true;
}

function stripPath(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function splitRoute(route: string): { path: string; query: string } {
  const [path, query = ""] = route.split("?");
  return { path: stripPath(path), query };
}

function currentLocation(): string {
  return window.location.pathname + window.location.search;
}

const isDashboardPath = (path: string) => path === "/" || path === "/dashboard";

/**
 * Matches a location against a route pattern. `:param` segments match any
 * non-reserved value; a query in the pattern must match exactly.
 */
function routeMatches(currentPath: string, pattern: string): boolean {
  if (!pattern) return true;
  const current = splitRoute(currentPath);
  const target = splitRoute(pattern);
  if (target.query && current.query !== target.query) return false;
  if (isDashboardPath(target.path)) return isDashboardPath(current.path);

  const currentParts = current.path.split("/");
  const targetParts = target.path.split("/");
  if (currentParts.length !== targetParts.length) return false;
  return targetParts.every((part, i) =>
    part.startsWith(":")
      ? !RESERVED_SEGMENTS.has(currentParts[i])
      : part === currentParts[i],
  );
}

/** Reads a route param's value from the current URL, using a route pattern. */
function readParamFromLocation(param: string, pattern: string): string | null {
  const patternParts = splitRoute(pattern).path.split("/");
  const currentParts = stripPath(window.location.pathname).split("/");
  const i = patternParts.indexOf(`:${param}`);
  if (i === -1 || currentParts.length <= i) return null;
  // Every static segment before the param must line up.
  for (let j = 0; j < i; j++) {
    if (!patternParts[j].startsWith(":") && patternParts[j] !== currentParts[j]) {
      return null;
    }
  }
  const value = currentParts[i];
  return value && !RESERVED_SEGMENTS.has(value) ? value : null;
}

async function fetchFirstLeadId(): Promise<string | null> {
  try {
    const fresh = await queryClient.fetchQuery({
      queryKey: ["leads", "list", 1, 1, "tour"],
      queryFn: () => getLeadsProvider(1, 1),
      staleTime: 60 * 1000,
    });
    return fresh.data?.leads?.[0]?._id ?? null;
  } catch (error) {
    console.warn("[Tour] Unable to resolve a lead ID.", error);
    return null;
  }
}

async function fetchFirstCustomerId(): Promise<string | null> {
  try {
    const fresh = await queryClient.fetchQuery({
      queryKey: ["customers", "admin-list", 1, 1, "tour"],
      queryFn: () => getAdminCustomersProvider(1, 1),
      staleTime: 60 * 1000,
    });
    return fresh.data?.customers?.[0]?._id ?? null;
  } catch (error) {
    console.warn("[Tour] Unable to resolve a customer ID.", error);
    return null;
  }
}

const CUSTOMER_PROJECT_ROUTE = "/customers/:customerId/project-details/:projectId";

async function fetchFirstCustomerProjectId(customerId: string): Promise<string | null> {
  try {
    const fresh = await queryClient.fetchQuery({
      queryKey: ["customers", "admin-projects", customerId, 1, 1, "tour"],
      queryFn: () => getCustomerProjectsProvider(customerId, 1, 1),
      staleTime: 60 * 1000,
    });
    return fresh.data?.projects?.[0]?._id ?? null;
  } catch (error) {
    console.warn("[Tour] Unable to resolve a customer project ID.", error);
    return null;
  }
}

type NavItem = NavigationGroup["items"][number];
type NavSubItem = NonNullable<NavItem["subItems"]>[number];

interface NavTarget {
  group: NavigationGroup;
  item?: NavItem;
  sub?: NavSubItem;
}

interface NavHint {
  element: string;
  title: string;
  description: string;
  speechText: string;
  /** Skip this hint when this selector is already visible (e.g. section already expanded). */
  skipIfVisible?: string;
}

/** Finds which sidebar group (and item / sub-item, if any) a route lives under. */
function findNavTarget(route: string): NavTarget | null {
  const { path, query } = splitRoute(route);
  const full = query ? `${path}?${query}` : path;

  for (const group of navigationGroups) {
    if (isDashboardPath(path) ? group.link === "/dashboard" : full === group.link) {
      return { group };
    }
  }

  for (const group of navigationGroups) {
    for (const item of group.items) {
      if (item.collapsible && item.subItems) {
        const sub = item.subItems.find((subItem) => subItem.path === full);
        if (sub) return { group, item, sub };
      } else if (item.path === full) {
        return { group, item };
      }
    }
  }

  // Detail pages (e.g. /leads/123) live under their group without a menu entry.
  for (const group of navigationGroups) {
    if (group.link !== "/dashboard" && path.startsWith(`${group.link}/`)) {
      return { group };
    }
  }

  return null;
}

const CLICK_OR_NEXT = "Click it yourself, or press Next and we'll do it for you.";

/**
 * Builds the "click here" steps a user would take in the sidebar to get from
 * the current page to `targetRoute`. Empty when the route isn't in the sidebar.
 */
function buildNavHints(currentPath: string, targetRoute: string): NavHint[] {
  const target = findNavTarget(targetRoute);
  if (!target) return [];
  const current = findNavTarget(currentPath);
  const { group } = target;
  const hints: NavHint[] = [];
  const sameGroup = current?.group.id === group.id;

  if (!sameGroup) {
    hints.push({
      element: `[data-group-id="${group.id}"]`,
      title: `Go to ${group.label}`,
      description: group.items.length
        ? `Click the <b>${group.label}</b> icon in the sidebar to open its menu. ${CLICK_OR_NEXT}`
        : `Click the <b>${group.label}</b> icon in the sidebar to open it. ${CLICK_OR_NEXT}`,
      speechText: `Click ${group.label} in the sidebar.`,
    });
  } else if (!target.item && splitRoute(targetRoute).path === group.link) {
    // Already inside the group, heading back to its landing page.
    hints.push({
      element: "[data-tour-nav-group-link]",
      title: `Back to ${group.label}`,
      description: `Click <b>${group.label}</b> at the top of the menu to return to its main page. ${CLICK_OR_NEXT}`,
      speechText: `Click ${group.label} at the top of the menu.`,
    });
  }

  if (target.item && target.sub) {
    const subSelector = `[data-tour-nav-sub="${target.sub.path}"]`;
    hints.push({
      element: `[data-tour-nav-section="${target.item.path}"]`,
      title: `Expand ${target.item.label}`,
      description: `Click <b>${target.item.label}</b> to show its pages. ${CLICK_OR_NEXT}`,
      speechText: `Click ${target.item.label} to expand it.`,
      skipIfVisible: subSelector,
    });
    hints.push({
      element: subSelector,
      title: `Open ${target.sub.label}`,
      description: `Inside <b>${target.item.label}</b>, click <b>${target.sub.label}</b> to open that page. ${CLICK_OR_NEXT}`,
      speechText: `Now click ${target.sub.label}.`,
    });
  } else if (target.item) {
    hints.push({
      element: `[data-tour-nav-item="${target.item.path}"]`,
      title: `Open ${target.item.label}`,
      description: `Inside <b>${group.label}</b>, click <b>${target.item.label}</b> to open that page. ${CLICK_OR_NEXT}`,
      speechText: `Now click ${target.item.label}.`,
    });
  }

  return hints;
}

type HintResult = "clicked" | "missing" | "cancelled" | "skipped";

interface PopoverConfig {
  element: string | null;
  title: string;
  description: string;
  speechText: string;
  side?: TourStepConfig["side"];
  align?: TourStepConfig["align"];
  index: number;
  nextBtnText: string;
  branch?: TourStepBranchConfig;
  onNext: () => void;
  onPrev: () => void;
}

interface ResumeTourContext {
  tourId: TourId;
  stepIndex: number;
}

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export class TourCoordinator {
  private driverObj: Driver | null = null;
  private navigate: NavigateFunction | null = null;
  private currentTour: TourDefinition | null = null;
  private stepToken = 0;
  private unsubscribe: (() => void) | null = null;
  private currentSpeechUnsub: (() => void) | null = null;
  private cancelPendingHint: (() => void) | null = null;
  /** What the visible popover narrates; replayed when audio is unmuted. */
  private currentSpeechText = "";
  /** Set while a branched tour runs; where to return when it ends. */
  private resumeContext: ResumeTourContext | null = null;
  /** Lead / customer the tour is showing, so every step stays on the same one. */
  private tourLeadId: string | null = null;
  private tourCustomerId: string | null = null;
  private tourProjectId: string | null = null;
  /** Params we already failed to resolve (no data yet); don't refetch or re-toast. */
  private unresolvedParams = new Set<string>();

  private cleanupSpeechSubscription() {
    if (this.currentSpeechUnsub) {
      this.currentSpeechUnsub();
      this.currentSpeechUnsub = null;
    }
  }

  private clearPendingHint() {
    if (this.cancelPendingHint) {
      const cancel = this.cancelPendingHint;
      this.cancelPendingHint = null;
      cancel();
    }
  }

  public init(navigate: NavigateFunction) {
    this.navigate = navigate;
    if (this.unsubscribe) return;

    this.unsubscribe = useTourStore.subscribe((state, previous) => {
      if (state.isAudioMuted === previous.isAudioMuted) return;
      if (state.isAudioMuted) {
        tourSpeech.stop("muted");
        return;
      }

      if (!this.currentTour || !this.currentSpeechText) return;
      tourSpeech.speak(this.currentSpeechText, false);
    });
  }

  private async waitForElement(
    selector: string,
    timeoutMs = STEP_TIMEOUT_MS,
  ): Promise<Element | null> {
    const existing = document.querySelector(selector);
    if (existing && isTourTargetVisible(existing)) return existing;

    return new Promise((resolve) => {
      let timeoutId = 0;
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element && isTourTargetVisible(element)) {
          window.clearTimeout(timeoutId);
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      timeoutId = window.setTimeout(() => {
        observer.disconnect();
        const element = document.querySelector(selector);
        resolve(element && isTourTargetVisible(element) ? element : null);
      }, timeoutMs);
    });
  }

  public async startTour(
    tour: TourDefinition,
    startIndex = 0,
    resumeContext?: ResumeTourContext | null,
  ) {
    this.stopTour(false);
    if (resumeContext !== undefined) {
      this.resumeContext = resumeContext;
    }
    tourSpeech.prime();
    this.currentTour = tour;
    useTourStore.getState().setActiveTour(tour.id);

    if (window.innerWidth < DESKTOP_TOUR_WIDTH) {
      toast.info(
        "This tour is designed for desktop. Hidden navigation steps are skipped on smaller screens.",
      );
    }

    this.driverObj = driver({
      animate: true,
      allowClose: true,
      overlayClickBehavior: "none",
      overlayColor: "rgba(15, 23, 42, 0.7)",
      stagePadding: 8,
      stageRadius: 8,
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Finish Tour ✓",
      showProgress: true,
      progressText: "{{current}} of {{total}}",
      onDestroyed: (_element, _step, opts) => {
        if (opts.reason === "replaced") return;
        this.cleanupSpeechSubscription();
        tourSpeech.stop();
        this.currentTour = null;
        this.driverObj = null;
        if (useTourStore.getState().activeTourId) {
          useTourStore.getState().setActiveTour(null);
        }
      },
    });

    await this.goToStep(startIndex);
  }

  /** Fills `:leadId` / `:customerId` in a route. Null if one can't be found. */
  private async resolveRoute(pattern: string): Promise<string | null> {
    let route = pattern;

    if (route.includes(":leadId")) {
      if (this.unresolvedParams.has("leadId")) return null;
      const leadId =
        readParamFromLocation("leadId", "/leads/:leadId") ??
        this.tourLeadId ??
        (await fetchFirstLeadId());
      if (!leadId) {
        this.unresolvedParams.add("leadId");
        toast.info("No leads yet, so the lead workspace steps are skipped.");
        return null;
      }
      this.tourLeadId = leadId;
      route = route.replace(":leadId", leadId);
    }

    if (route.includes(":customerId")) {
      if (this.unresolvedParams.has("customerId")) return null;
      const customerId =
        readParamFromLocation("customerId", "/customers/:customerId") ??
        this.tourCustomerId ??
        (await fetchFirstCustomerId());
      if (!customerId) {
        this.unresolvedParams.add("customerId");
        toast.info("No customers yet, so the customer workspace steps are skipped.");
        return null;
      }
      this.tourCustomerId = customerId;
      route = route.replace(":customerId", customerId);
    }

    if (route.includes(":projectId")) {
      if (this.unresolvedParams.has("projectId") || !this.tourCustomerId) return null;
      const projectId =
        readParamFromLocation("projectId", CUSTOMER_PROJECT_ROUTE) ??
        this.tourProjectId ??
        (await fetchFirstCustomerProjectId(this.tourCustomerId));
      if (!projectId) {
        this.unresolvedParams.add("projectId");
        toast.info("This customer has no projects yet, so the project steps are skipped.");
        return null;
      }
      this.tourProjectId = projectId;
      route = route.replace(":projectId", projectId);
    }

    // Any other param (e.g. `:poId`) is only known once the user has opened
    // that record, so read it from the current URL.
    for (const [, param] of pattern.matchAll(/:(\w+)/g)) {
      if (!route.includes(`:${param}`)) continue;
      const value = readParamFromLocation(param, pattern);
      if (!value) return null;
      route = route.replace(`:${param}`, value);
    }

    return route;
  }

  private skipStep(index: number, direction: "forward" | "backward") {
    if (!this.currentTour) return;
    const nextIndex = direction === "forward" ? index + 1 : index - 1;
    if (nextIndex >= 0 && nextIndex < this.currentTour.steps.length) {
      void this.goToStep(nextIndex, direction);
    } else {
      this.completeTour();
    }
  }

  /** Shows the sidebar clicks that lead to `targetRoute`. False if the tour moved on. */
  private async walkSidebarTo(targetRoute: string, index: number, token: number): Promise<boolean> {
    const hints = buildNavHints(currentLocation(), targetRoute);
    for (let i = 0; i < hints.length; i++) {
      if (i > 0) {
        // The menu re-renders after each click; let it settle so the
        // highlight lands on the final position.
        await delay(350);
        if (token !== this.stepToken) return false;
      }
      const result = await this.showClickHint(hints[i], index, token);
      if (result === "cancelled") return false;
    }
    return true;
  }

  public async goToStep(
    index: number,
    direction: "forward" | "backward" = "forward",
  ) {
    if (!this.currentTour || !this.driverObj) return;
    const token = ++this.stepToken;
    this.clearPendingHint();
    const step = this.currentTour.steps[index];
    if (!step) {
      this.completeTour();
      return;
    }

    useTourStore.getState().setCurrentStepIndex(index);

    const isActive = () => token === this.stepToken && !!this.currentTour && !!this.driverObj;
    const showClicks = direction === "forward" && window.innerWidth >= DESKTOP_TOUR_WIDTH;

    if (step.route && !routeMatches(currentLocation(), step.route)) {
      // Going forward on desktop, walk the user through the clicks instead of
      // jumping to the page, so they learn where it lives.
      if (showClicks && step.via) {
        const { via } = step;
        if (!routeMatches(currentLocation(), via.fromRoute)) {
          if (!(await this.walkSidebarTo(via.fromRoute, index, token))) return;
          const fromRoute = await this.resolveRoute(via.fromRoute);
          if (!isActive()) return;
          if (fromRoute && this.navigate && !routeMatches(currentLocation(), via.fromRoute)) {
            this.navigate(fromRoute);
          }
        }

        const result = await this.showClickHint(
          {
            element: via.element,
            title: via.title,
            description: via.description,
            speechText: via.speechText || via.title,
          },
          index,
          token,
        );
        if (result === "cancelled") return;
        // The control isn't there (e.g. no leads yet), so this page has
        // nothing to show yet. Skip it.
        if (result === "missing") {
          if (await this.presentFallback(step, index, token)) return;
          if (!isActive()) return;
          this.skipStep(index, direction);
          return;
        }
      } else if (showClicks) {
        if (!(await this.walkSidebarTo(step.route, index, token))) return;
      }

      const targetRoute = await this.resolveRoute(step.route);
      if (!isActive()) return;

      if (!targetRoute) {
        console.info(`[Tour] Route not available for step: ${step.id}. Skipping.`);
        this.skipStep(index, direction);
        return;
      }

      if (this.navigate && !routeMatches(currentLocation(), step.route)) {
        this.navigate(targetRoute);
      }
    }

    const needsData = /:(leadId|customerId|projectId)/.test(step.route);
    const timeout = step.optional
      ? OPTIONAL_STEP_TIMEOUT_MS
      : needsData
        ? DATA_STEP_TIMEOUT_MS
        : STEP_TIMEOUT_MS;
    const element = await this.waitForElement(step.element, timeout);
    if (!isActive()) return;

    if (!element) {
      if (await this.presentFallback(step, index, token)) return;
      if (!isActive()) return;
      console.warn(`[Tour] Element not found: ${step.element}. Skipping.`);
      this.skipStep(index, direction);
      return;
    }

    this.presentStep(step, index, step.element);
  }

  /**
   * Shows the step's fallback (an always-rendered container plus an
   * explanation) when its own target isn't on the page. False if there is
   * no fallback or it isn't on the page either.
   */
  private async presentFallback(step: TourStepConfig, index: number, token: number): Promise<boolean> {
    if (!step.fallback) return false;
    const fallbackEl = await this.waitForElement(step.fallback.element, FALLBACK_TIMEOUT_MS);
    if (token !== this.stepToken || !this.currentTour || !this.driverObj) return true;
    if (!fallbackEl) return false;

    // Highlight the exact node found, even when `element` is a selector list.
    const marker = "data-tour-fallback-target";
    document.querySelectorAll(`[${marker}]`).forEach((el) => el.removeAttribute(marker));
    fallbackEl.setAttribute(marker, "");

    this.presentStep(
      {
        ...step,
        description: step.fallback.description,
        speechText: step.fallback.speechText ?? step.fallback.description,
      },
      index,
      `[${marker}]`,
    );
    return true;
  }

  /**
   * Highlights a control and waits until it is clicked, either by the user or
   * by the Next button.
   */
  private async showClickHint(hint: NavHint, index: number, token: number): Promise<HintResult> {
    if (hint.skipIfVisible) {
      const already = document.querySelector(hint.skipIfVisible);
      if (already && isTourTargetVisible(already)) return "skipped";
    }

    const element = await this.waitForElement(hint.element, STEP_TIMEOUT_MS);
    if (token !== this.stepToken || !this.currentTour || !this.driverObj) return "cancelled";
    if (!element || !(element instanceof HTMLElement)) return "missing";

    const isSidebar = Boolean(element.closest('[data-tour="sidebar-nav"]'));

    return new Promise<HintResult>((resolve) => {
      const onClick = () => {
        element.removeEventListener("click", onClick);
        this.cancelPendingHint = null;
        // Let the app's own click handler run (and navigate) before moving on.
        window.setTimeout(
          () => resolve(token === this.stepToken ? "clicked" : "cancelled"),
          0,
        );
      };
      element.addEventListener("click", onClick);
      this.cancelPendingHint = () => {
        element.removeEventListener("click", onClick);
        resolve("cancelled");
      };

      this.showPopover({
        element: hint.element,
        title: hint.title,
        description: hint.description,
        speechText: hint.speechText,
        side: isSidebar ? "right" : "bottom",
        align: "start",
        index,
        nextBtnText: "Next →",
        onNext: () => element.click(),
        onPrev: () => void this.goToStep(Math.max(0, index - 1), "backward"),
      });
    });
  }

  private presentStep(
    step: TourStepConfig,
    index: number,
    element: string | null,
  ) {
    if (!this.currentTour) return;
    const isLast = index === this.currentTour.steps.length - 1;
    const returnsToParent = isLast && this.resumeContext !== null;
    const parentName = this.resumeContext
      ? TOURS_REGISTRY[this.resumeContext.tourId].name
      : "";

    this.showPopover({
      element,
      title: step.title,
      description: returnsToParent
        ? `${step.description}<br><br>You've finished the <b>${this.currentTour.name}</b>. Press Continue to return to the ${parentName}.`
        : step.description,
      speechText: returnsToParent
        ? `${step.speechText || step.description} You've finished the ${this.currentTour.name}. Press continue to return to the main walkthrough.`
        : step.speechText || step.description,
      side: step.side,
      align: step.align,
      index,
      nextBtnText: returnsToParent
        ? "Continue Walkthrough →"
        : isLast
          ? "Finish Tour ✓"
          : "Next →",
      branch: step.branch,
      onNext: () => void this.goToStep(index + 1, "forward"),
      onPrev: () => void this.goToStep(Math.max(0, index - 1), "backward"),
    });
  }

  private startBranch(branch: TourStepBranchConfig, index: number) {
    if (!this.currentTour) return;
    const targetTour = TOURS_REGISTRY[branch.tourId];
    if (!targetTour) return;
    const resume: ResumeTourContext = {
      tourId: this.currentTour.id,
      stepIndex: branch.resumeStepIndex ?? index + 1,
    };
    this.cleanupSpeechSubscription();
    tourSpeech.stop();
    toast.info(`Launching ${targetTour.name}...`);
    void this.startTour(targetTour, 0, resume);
  }

  private renderBranch(wrapper: HTMLElement, footer: HTMLElement | undefined, branch: TourStepBranchConfig | undefined, index: number) {
    wrapper.querySelector(".tour-branch-container")?.remove();
    if (!branch) return;

    const box = document.createElement("div");
    box.className = "tour-branch-container";

    const prompt = document.createElement("div");
    prompt.className = "tour-branch-prompt";
    prompt.textContent =
      branch.description || "Want a closer look? Take the detailed guide, then come back here.";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tour-branch-btn";
    btn.textContent = `${branch.label} →`;
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.startBranch(branch, index);
    };

    box.append(prompt, btn);
    if (footer && footer.parentNode === wrapper) {
      wrapper.insertBefore(box, footer);
    } else {
      wrapper.appendChild(box);
    }
  }

  private showPopover(config: PopoverConfig) {
    if (!this.currentTour || !this.driverObj) return;
    const { element, index } = config;

    if (element) {
      const domEl = document.querySelector(element);
      if (domEl) {
        domEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    const total = this.currentTour.steps.length;
    const isFirst = index === 0;
    const speech = config.speechText;
    this.currentSpeechText = speech;

    this.driverObj.highlight({
      ...(element ? { element } : {}),
      popover: {
        title: config.title,
        description: config.description,
        side: config.side || "bottom",
        align: config.align || "start",
        showButtons: ["next", "previous", "close"],
        disableButtons: isFirst ? ["previous"] : [],
        showProgress: true,
        progressText: `${index + 1} of ${total}`,
        nextBtnText: config.nextBtnText,
        prevBtnText: "← Back",
        onPopoverRender: (popoverDOM) => {
          this.cleanupSpeechSubscription();

          this.renderBranch(popoverDOM.wrapper, popoverDOM.footer, config.branch, index);

          let badge = popoverDOM.wrapper.querySelector<HTMLButtonElement>(
            ".tour-speaker-status-badge",
          );
          if (!badge) {
            badge = document.createElement("button");
            badge.type = "button";
            badge.className = "tour-speaker-status-badge";
            badge.setAttribute("aria-label", "Tour speech status");
            if (popoverDOM.title && popoverDOM.title.parentNode) {
              popoverDOM.wrapper.insertBefore(badge, popoverDOM.title);
            } else {
              popoverDOM.wrapper.prepend(badge);
            }
          }

          const updateBadge = (state: SpeechState) => {
            if (!badge) return;
            badge.className = `tour-speaker-status-badge ${state}`;
            if (state === "speaking") {
              badge.innerHTML = `<span class="tour-pulse-dot"></span><span>🔊 Voice: Speaking...</span>`;
              badge.title = "Audio guide is playing (Click to mute)";
            } else if (state === "finished") {
              badge.innerHTML = `<span>✓ Voice: Finished</span>`;
              badge.title = "Audio guide completed (Click to replay)";
            } else if (state === "muted") {
              badge.innerHTML = `<span>🔇 Voice: Muted</span>`;
              badge.title = "Audio is muted (Click to unmute and play)";
            } else {
              badge.innerHTML = `<span>🔈 Voice: Ready</span>`;
              badge.title = "Click to play audio guidance";
            }
          };

          badge.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            tourSpeech.prime();
            const currentState = tourSpeech.getState();
            const currentlyMuted = useTourStore.getState().isAudioMuted;

            if (currentState === "finished" && !currentlyMuted) {
              tourSpeech.speak(speech, false);
              return;
            }

            useTourStore.getState().toggleAudioMute();
          };

          this.currentSpeechUnsub = tourSpeech.onStateChange((state) => {
            updateBadge(state);
          });
        },
        onNextClick: () => {
          this.cleanupSpeechSubscription();
          tourSpeech.stop();
          config.onNext();
        },
        onPrevClick: () => {
          this.cleanupSpeechSubscription();
          tourSpeech.stop();
          config.onPrev();
        },
        onCloseClick: () => {
          this.cleanupSpeechSubscription();
          this.stopTour();
        },
      },
    });

    const isMuted = useTourStore.getState().isAudioMuted;
    tourSpeech.speak(speech, isMuted);
  }

  public completeTour() {
    const finishedTour = this.currentTour;
    if (finishedTour) {
      useTourStore.getState().markTourCompleted(finishedTour.id);
    }

    if (this.resumeContext) {
      const { tourId, stepIndex } = this.resumeContext;
      this.resumeContext = null;
      const parentTour = TOURS_REGISTRY[tourId];
      toast.success(
        `${finishedTour?.name || "Guide"} complete! Resuming ${parentTour.name}...`,
        {
          action: {
            label: "Exit Tour",
            onClick: () => this.stopTour(true),
          },
        },
      );
      void this.startTour(parentTour, stepIndex, null);
      return;
    }

    this.stopTour();
  }

  public stopTour(clearResume = true) {
    this.cleanupSpeechSubscription();
    tourSpeech.stop();
    this.stepToken += 1;
    this.clearPendingHint();
    if (clearResume) {
      this.resumeContext = null;
      this.tourLeadId = null;
      this.tourCustomerId = null;
      this.tourProjectId = null;
      this.unresolvedParams.clear();
    }
    if (this.driverObj) {
      const activeDriver = this.driverObj;
      this.driverObj = null;
      this.currentTour = null;
      activeDriver.destroy();
      return;
    }
    this.currentTour = null;
  }
}

export const tourCoordinator = new TourCoordinator();
