import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FileMetadata, formatBytes, getByCode, presign } from "../api";
import { CopyButton } from "../components/CopyButton";
import { FileIcon, KeyIcon, LinkIcon } from "../components/Icons";
import { useI18n } from "../i18n";

export function FileByCodePage() {
  const { t } = useI18n();
  const { code } = useParams();
  const [meta, setMeta] = useState<FileMetadata | null>(null);
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!code) return;
      setIsLoading(true);
      setError("");
      try {
        const data = await getByCode(code);
        if (!cancelled) setMeta(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || t("fileNotFound"));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [code, t]);

  async function onDownload() {
    if (!meta) return;
    setIsDownloading(true);
    setError("");
    try {
      const res = await presign(meta.id, meta.requiresPasscode ? passcode : undefined);
      window.location.href = res.url;
    } catch (e: any) {
      const message = e?.message || "Download failed";
      setError(message === "Invalid passcode" ? "Sai passcode, vui lòng thử lại." : message);
    } finally {
      setIsDownloading(false);
    }
  }

  const expired = error === "Expired";

  return (
    <div className="container">
      <div className="card card-pad">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div className="row" style={{ gap: 10 }}>
            <span className="top-btn-icon" aria-hidden style={{ color: "var(--primary)" }}>
              <FileIcon />
            </span>
            <div>
              <div style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>{t("downloadTitle")}</div>
              <div className="muted2" style={{ fontSize: 13 }}>
                {t("downloadSubtitleCode")}
              </div>
            </div>
          </div>
          <Link className="button" to="/">
            {t("uploadCta")}
          </Link>
        </div>

        <div className="divider" />

        {isLoading ? (
          <div className="muted">{t("loading")}</div>
        ) : error && !meta ? (
          <div className="error">{expired ? t("expired") : error}</div>
        ) : meta ? (
          <>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="muted2" style={{ fontSize: 12 }}>
                  {t("fileName")}
                </div>
                <div style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>{meta.originalName}</div>
              </div>
              <div className="pill">{formatBytes(meta.sizeBytes)}</div>
            </div>

            <div style={{ height: 12 }} />

            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <span className="muted">{t("code")}</span>
              <CopyButton text={meta.code} label={t("copy")} />
            </div>
            <div style={{ height: 8 }} />
            <div className="code">{meta.code}</div>

            <div style={{ height: 12 }} />

            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="row" style={{ gap: 8 }}>
                <span className="top-btn-icon" aria-hidden style={{ color: "var(--primary)" }}>
                  <LinkIcon />
                </span>
                <span className="muted">{t("expiresAt")}</span>
              </div>
              <div className="pill">{new Date(meta.expiresAt).toLocaleString()}</div>
            </div>

            {meta.requiresPasscode ? (
              <>
                <div style={{ height: 12 }} />
                <label className="label" htmlFor="passcode">
                  {t("passcode")}
                </label>
                <div className="row" style={{ alignItems: "center" }}>
                  <input
                    id="passcode"
                    className="input"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder={t("passcode")}
                  />
                  <span className="pill">
                    <KeyIcon />
                    {t("protectedDownload")}
                  </span>
                </div>
                {error && !expired ? <div className="error" style={{ marginTop: 10 }}>{error}</div> : null}
              </>
            ) : null}

            <div style={{ height: 14 }} />

            <button
              className="button button-primary"
              onClick={onDownload}
              disabled={isDownloading || expired || (meta.requiresPasscode && !passcode.trim())}
            >
              {isDownloading ? t("createDownloadLink") : t("download")}
            </button>

            {!meta.requiresPasscode && error && !expired ? (
              <div className="error" style={{ marginTop: 10 }}>{error}</div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
