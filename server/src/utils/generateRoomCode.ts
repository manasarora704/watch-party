import { customAlphabet } from "nanoid";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const nano = customAlphabet(alphabet, 6);

/** अस्पष्ट अक्षरों (0/O, 1/I) से बचने वाला 6-वर्ण कोड */
export function generateRoomCode(): string {
  return nano();
}

export function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase();
}
