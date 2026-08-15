const DISPLAY_NAME_KEY = "displayName";

export const DISPLAY_NAME_MAX_LENGTH = 20;

/**
 * Remembers the last name a player used, so returning partners don't retype it
 * every session. Purely a convenience — the server revalidates on every join.
 */
export function getStoredDisplayName(): string {
  try {
    return localStorage.getItem(DISPLAY_NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function storeDisplayName(name: string): void {
  try {
    localStorage.setItem(DISPLAY_NAME_KEY, name);
  } catch {
    // Private mode — the name just won't persist.
  }
}
