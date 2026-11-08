type StorageArea = "localStorage" | "sessionStorage";

export function readStorage(area: StorageArea, key: string): string | null {
  try {
    return window[area].getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(
  area: StorageArea,
  key: string,
  value: string,
): boolean {
  try {
    window[area].setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
