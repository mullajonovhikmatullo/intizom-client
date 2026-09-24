const CREATE_ITEM_EVENT = "intizom:create-item";

export function requestCreateItem() {
  window.dispatchEvent(new Event(CREATE_ITEM_EVENT));
}

export function subscribeCreateItem(handler: () => void) {
  window.addEventListener(CREATE_ITEM_EVENT, handler);
  return () => window.removeEventListener(CREATE_ITEM_EVENT, handler);
}
