import { useEffect, useRef, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { SparkIcon } from "./components/Icons";
import { AccessFileBar } from "./components/AccessFileBar";
import { ThemeToggle } from "./components/ThemeToggle";
import { useI18n } from "./i18n";

export function AppLayout() {
  const { t } = useI18n();
  const [accessOpen, setAccessOpen] = useState(false);
  const accessRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!accessOpen) return;
      const el = accessRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setAccessOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [accessOpen]);

  return (
    <div>
      <div className="container topbar">
        <div className="card topbar-inner">
          <div className="row" style={{ gap: 10 }}>
            <Link className="brand" to="/" aria-label="izSend">
              <span className="brand-mark" aria-hidden>
                <SparkIcon />
              </span>
              izSend
            </Link>
            <span className="muted" style={{ fontSize: 13 }}>
              {t("brandTagline")}
            </span>
          </div>

          <div className="top-actions">
            <Link className="top-btn top-btn-primary" to="/" aria-label={t("uploadCta")}>
              {t("uploadCta")}
            </Link>

            <div className="modal" ref={accessRef}>
              <button
                type="button"
                className="top-btn"
                onClick={() => setAccessOpen((v) => !v)}
                aria-label={t("accessFile")}
                aria-expanded={accessOpen}
              >
                {t("accessFile")}
              </button>
              {accessOpen ? (
                <div className="access-pop">
                  <div className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
                    {t("enterCode")}
                  </div>
                  <AccessFileBar />
                </div>
              ) : null}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
