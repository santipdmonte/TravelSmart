export const ITINERARY_CHANGES_CONFIRMED = "itinerary:changesConfirmed";
export const ITINERARY_PROPOSAL_RECEIVED = "itinerary:proposalReceived";

type ChangesConfirmedDetail = {
  itineraryId: string;
};

type ProposalReceivedDetail<T = unknown> = {
  itineraryId: string;
  data: T;
};

export function emitItineraryChangesConfirmed(itineraryId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ChangesConfirmedDetail>(ITINERARY_CHANGES_CONFIRMED, {
      detail: { itineraryId },
    })
  );
}

export function onItineraryChangesConfirmed(
  handler: (detail: ChangesConfirmedDetail) => void
) {
  const listener = (e: Event) => {
    const ce = e as CustomEvent<ChangesConfirmedDetail>;
    handler(ce.detail);
  };
  window.addEventListener(ITINERARY_CHANGES_CONFIRMED, listener);
  return () =>
    window.removeEventListener(ITINERARY_CHANGES_CONFIRMED, listener);
}

export function emitItineraryProposalReceived<T = unknown>(
  itineraryId: string,
  data: T
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ProposalReceivedDetail<T>>(ITINERARY_PROPOSAL_RECEIVED, {
      detail: { itineraryId, data },
    })
  );
}

export function onItineraryProposalReceived<T = unknown>(
  handler: (detail: ProposalReceivedDetail<T>) => void
) {
  const listener = (e: Event) => {
    const ce = e as CustomEvent<ProposalReceivedDetail<T>>;
    handler(ce.detail);
  };
  window.addEventListener(ITINERARY_PROPOSAL_RECEIVED, listener);
  return () =>
    window.removeEventListener(ITINERARY_PROPOSAL_RECEIVED, listener);
}
