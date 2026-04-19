export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export type FileMetadata = {
  id: string;
  slug: string;
  code: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  expiresAt: string;
  requiresPasscode: boolean;
};

export type UploadResult = FileMetadata & {
  share: {
    slugPath: string;
  };
};

// Issue #7: public config endpoint response type
export type PublicConfig = {
  maxFileSizeBytes: number;
  fileTtlDays: number;
};

async function readJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export async function getPublicConfig(): Promise<PublicConfig> {
  const res = await fetch(`${API_BASE_URL}/api/config`);
  return readJson(res) as Promise<PublicConfig>;
}

export async function uploadFile(params: { file: File; passcode?: string }): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", params.file);
  if (params.passcode) form.append("passcode", params.passcode);

  const res = await fetch(`${API_BASE_URL}/api/files`, {
    method: "POST",
    body: form
  });

  return readJson(res) as Promise<UploadResult>;
}

export async function getBySlug(slug: string) {
  const res = await fetch(`${API_BASE_URL}/api/files/slug/${encodeURIComponent(slug)}`);
  return readJson(res) as Promise<FileMetadata>;
}

export async function getByCode(code: string) {
  const res = await fetch(`${API_BASE_URL}/api/files/code/${encodeURIComponent(code)}`);
  return readJson(res) as Promise<FileMetadata>;
}

export async function presign(id: string, passcode?: string) {
  const res = await fetch(`${API_BASE_URL}/api/files/${encodeURIComponent(id)}/presign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ passcode: passcode || undefined })
  });

  return readJson(res) as Promise<{ url: string }>;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx++;
  }
  return `${value.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}
