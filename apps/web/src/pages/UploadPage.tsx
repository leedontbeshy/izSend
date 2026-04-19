import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { formatBytes, getPublicConfig, uploadFile, type PublicConfig, type UploadResult } from "../api";
import { CopyButton } from "../components/CopyButton";
import {
  CheckIcon,
  FileIcon,
  KeyIcon,
  LinkIcon,
  QrIcon,
  SparkIcon,
  UploadIcon
} from "../components/Icons";
import { useI18n } from "../i18n";

export function UploadPage() {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [passcode, setPasscode] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>("");
  // Issue #9: typed upload result (no more `any`)
  const [result, setResult] = useState<UploadResult | null>(null);
  // Issue #7: load limits from API
  const [config, setConfig] = useState<PublicConfig | null>(null);

  useEffect(() => {
    getPublicConfig()
      .then(setConfig)
      .catch(() => {
        // Non-fatal: fall back to hard-coded display defaults if the endpoint
        // is unreachable (e.g. during development without the API running).
      });
  }, []);

  const maxFileMB = config
    ? Math.round(config.maxFileSizeBytes / (1024 * 1024))
    : 50;
  const ttlDays = config?.fileTtlDays ?? 7;

  const shareSlugUrl = useMemo(() => {
    if (!result?.share?.slugPath) return "";
    return `${window.location.origin}${result.share.slugPath}`;
  }, [result]);

  function resetUploadState() {
    setFile(null);
    setPasscode("");
    setError("");
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function onUpload() {
    if (!file) return;
    setError("");
    setIsUploading(true);
    setResult(null);

    try {
      const res = await uploadFile({
        file,
        passcode: passcode.trim() ? passcode.trim() : undefined
      });
      setResult(res);
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="container">
      <div className="page">
        <div>
          <h1 className="hero-title">{t("heroTitle")}</h1>
          <p className="hero-sub">{t("heroSubtitle", { maxFileMB, ttlDays })}</p>

          <div className="feature-list">
            <div className="feature">
              <div className="feature-icon">
                <SparkIcon />
              </div>
              <div>
                <h3>{t("featureInstantTitle")}</h3>
                <p>{t("featureInstantBody")}</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">
                <KeyIcon />
              </div>
              <div>
                <h3>{t("featurePasscodeTitle")}</h3>
                <p>{t("featurePasscodeBody")}</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon" style={{ color: "var(--warning)" }}>
                <CheckIcon />
              </div>
              <div>
                <h3>{t("featureTtlTitle", { ttlDays })}</h3>
                <p>{t("featureTtlBody")}</p>
              </div>
            </div>
          </div>

          {/* Issue #1: "E2E ENCRYPTION" replaced with "TLS" (accurate) */}
          <div className="stats">
            <div className="stat">
              <strong>{maxFileMB}MB</strong>
              <span>FILE SIZE</span>
            </div>
            <div className="stat">
              <strong>{ttlDays} days</strong>
              <span>STORAGE TIME</span>
            </div>
            <div className="stat">
              <strong>TLS</strong>
              <span>SECURE TRANSFER</span>
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <div className="section-head">
            <div>
              <div className="section-title">{t("tabUpload")}</div>
              <div className="section-subtitle">{t("heroSubtitle", { maxFileMB, ttlDays })}</div>
            </div>
            {(file || result) ? (
              <button type="button" className="button" onClick={resetUploadState}>
                {t("uploadAnother")}
              </button>
            ) : null}
          </div>

          <div style={{ height: 14 }} />

          {/* Issue #13: aria-live region for async upload feedback */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {isUploading ? t("uploading") : result ? t("ready") : error || ""}
          </div>

          <div className="upload-shell">
            {result ? (
              <div className="result-shell">
                <div className="result-summary">
                  <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <div className="row" style={{ alignItems: "center" }}>
                      <span className="top-btn-icon" aria-hidden>
                        <FileIcon />
                      </span>
                      <div>
                        <div style={{ fontWeight: 800 }}>{result.originalName}</div>
                        <div className="muted2" style={{ fontSize: 13 }}>
                          {formatBytes(result.sizeBytes)}
                        </div>
                      </div>
                    </div>
                    <div className="pill">{t("ready")}</div>
                  </div>
                </div>

                <div className="share-grid share-grid-compact">
                  <div className="share-item">
                    <div className="share-head">
                      <div className="row" style={{ gap: 8 }}>
                        <span className="top-btn-icon" aria-hidden style={{ color: "var(--primary)" }}>
                          <LinkIcon />
                        </span>
                        <strong style={{ fontSize: 14 }}>{t("slugLink")}</strong>
                      </div>
                      <CopyButton text={shareSlugUrl} label={t("copyLink")} />
                    </div>
                    <div style={{ height: 8 }} />
                    <div className="code">{shareSlugUrl}</div>
                  </div>

                  <div className="share-item">
                    <div className="share-head">
                      <div className="row" style={{ gap: 8 }}>
                        <span className="top-btn-icon" aria-hidden style={{ color: "var(--primary)" }}>
                          <KeyIcon />
                        </span>
                        <strong style={{ fontSize: 14 }}>{t("code")}</strong>
                      </div>
                      <CopyButton text={String(result.code || "")} label={t("copyCode")} />
                    </div>
                    <div style={{ height: 8 }} />
                    <div className="code">{result.code}</div>
                  </div>
                </div>

                <div className="share-item share-item-qr">
                  <div className="share-head">
                    <div className="row" style={{ gap: 8 }}>
                      <span className="top-btn-icon" aria-hidden style={{ color: "var(--primary)" }}>
                        <QrIcon />
                      </span>
                      <strong style={{ fontSize: 14 }}>{t("qr")}</strong>
                    </div>
                  </div>
                  <div style={{ height: 10 }} />
                  <div className="qr-panel">
                    <div className="card qr-box" style={{ boxShadow: "none" }}>
                      <QRCodeCanvas value={shareSlugUrl} size={156} includeMargin />
                    </div>
                    <div className="qr-meta">
                      <div className="muted2">{t("expiresAt")}</div>
                      <div className="code">{new Date(result.expiresAt).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`dropzone ${isDragging ? "dragging" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const nextFile = e.dataTransfer.files?.[0];
                    if (nextFile) setFile(nextFile);
                  }}
                  aria-label={t("pickFileTitle")}
                >
                  <div className="row" style={{ justifyContent: "center", gap: 10 }}>
                    <span className="top-btn-icon" aria-hidden style={{ color: "var(--primary)" }}>
                      <UploadIcon />
                    </span>
                    <strong>{t("pickFileTitle")}</strong>
                  </div>
                  <div className="muted2">{t("pickFileHint")}</div>

                  <div style={{ marginTop: 6 }}>
                    <button type="button" className="button button-primary">
                      {t("browseFiles")}
                    </button>
                  </div>

                  <div style={{ display: "none" }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>

                {file ? (
                  <>
                    <div style={{ height: 14 }} />
                    <div className="selected-file">
                      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                        <div className="row" style={{ alignItems: "center" }}>
                          <span className="top-btn-icon" aria-hidden>
                            <FileIcon />
                          </span>
                          <div style={{ fontWeight: 700 }}>{file.name}</div>
                        </div>
                        <div className="muted2">{formatBytes(file.size)}</div>
                      </div>
                    </div>
                  </>
                ) : null}

                <div style={{ height: 14 }} />

                <label className="label" htmlFor="passcode">
                  {t("passcodeOptional")}
                </label>
                <input
                  id="passcode"
                  className="input"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder={t("passcodeHint")}
                />

                <div style={{ height: 12 }} />

                <button className="button button-primary upload-action" onClick={onUpload} disabled={!file || isUploading}>
                  <UploadIcon />
                  {isUploading ? t("uploading") : t("upload")}
                </button>
              </>
            )}
          </div>

          {error ? <div className="error" role="alert" style={{ marginTop: 12 }}>{error}</div> : null}
        </div>
      </div>
    </div>
  );
}
