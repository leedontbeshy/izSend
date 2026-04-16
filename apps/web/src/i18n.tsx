import React, { createContext, useContext } from "react";

type DictKey =
  | "brandTagline"
  | "uploadCta"
  | "accessFile"
  | "enterCode"
  | "go"
  | "heroTitle"
  | "heroSubtitle"
  | "pickFileTitle"
  | "pickFileHint"
  | "passcodeOptional"
  | "passcodeHint"
  | "ready"
  | "uploading"
  | "upload"
  | "slugLink"
  | "copyLink"
  | "code"
  | "copyCode"
  | "qr"
  | "expiresAt"
  | "downloadTitle"
  | "downloadSubtitleSlug"
  | "downloadSubtitleCode"
  | "uploadAnother"
  | "loading"
  | "expired"
  | "fileNotFound"
  | "fileName"
  | "copy"
  | "passcode"
  | "protectedDownload"
  | "createDownloadLink"
  | "download"
  | "featureInstantTitle"
  | "featureInstantBody"
  | "featurePasscodeTitle"
  | "featurePasscodeBody"
  | "featureTtlTitle"
  | "featureTtlBody"
  | "tabUpload"
  | "browseFiles";

const dict: Record<DictKey, string> = {
  brandTagline: "Share files fast, auto-expire in 7 days",
  uploadCta: "Upload",
  accessFile: "Access file",
  enterCode: "Enter code...",
  go: "Go",
  heroTitle: "Send a file in seconds",
  heroSubtitle: "Up to 50MB. Auto-expire after 7 days. Optional passcode protects files",
  pickFileTitle: "Pick a file to upload",
  pickFileHint: "Drag and drop or click to choose a file.",
  passcodeOptional: "Passcode (optional)",
  passcodeHint: "Example: 1234",
  ready: "Ready",
  uploading: "Uploading...",
  upload: "Upload",
  slugLink: "Link",
  copyLink: "Copy link",
  code: "Code",
  copyCode: "Copy code",
  qr: "QR",
  expiresAt: "Expires at",
  downloadTitle: "Download",
  downloadSubtitleSlug: "If a passcode is required, enter it to create a download link.",
  downloadSubtitleCode: "Open this page with a short code. Enter the passcode if required.",
  uploadAnother: "Upload new file",
  loading: "Loading...",
  expired: "File expired",
  fileNotFound: "File not found",
  fileName: "File name",
  copy: "Copy",
  passcode: "Passcode",
  protectedDownload: "Protected download",
  createDownloadLink: "Creating download link...",
  download: "Download",
  featureInstantTitle: "Instant sharing",
  featureInstantBody: "Share with a link, a code, or a QR in seconds.",
  featurePasscodeTitle: "Optional passcode",
  featurePasscodeBody: "Only people with the passcode can create a download link.",
  featureTtlTitle: "7-day storage",
  featureTtlBody: "Files expire automatically and are removed from storage.",
  tabUpload: "Upload file",
  browseFiles: "Browse files"
};

type I18nCtx = {
  t: (key: DictKey) => string;
};

const I18nContext = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return <I18nContext.Provider value={{ t: (key) => dict[key] }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
