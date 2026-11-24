import type { TourClickConfig, TourPanelConfig } from "../tour.types";

/** CSS selector for a `data-tour` anchor. */
export const anchor = (tourId: string) => `[data-tour="${tourId}"]`;

/** A "click here" hint; `what` completes the sentence before the Next reminder. */
export const click = (tourId: string, title: string, what: string): TourClickConfig => ({
  element: anchor(tourId),
  title,
  description: `${what} Click it yourself, or press Next and we'll do it for you.`,
  speechText: `${title}.`,
});

/** A dialog opened by a button. `closeId` is only needed outside the shared Dialog. */
export const dialog = (
  tourId: string,
  open: TourClickConfig,
  closeId?: string,
): TourPanelConfig => ({
  element: anchor(tourId),
  open,
  close: closeId && anchor(closeId),
});
