import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";

function normalizeCode(input: string) {
  return input.replace(/\s+/g, "").toUpperCase();
}

export function AccessFileBar() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const normalized = useMemo(() => normalizeCode(code), [code]);
  const canGo = normalized.length >= 4;

  function go() {
    if (!canGo) return;
    navigate(`/c/${normalized}`);
  }

  return (
    <div className="row" aria-label={t("accessFile")} style={{ alignItems: "center" }}>
      <input
        className="input"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={t("enterCode")}
        inputMode="text"
        onKeyDown={(e) => {
          if (e.key === "Enter") go();
        }}
        aria-label={t("enterCode")}
      />
      <button type="button" className="button button-primary" onClick={go} disabled={!canGo}>
        {t("go")}
      </button>
    </div>
  );
}
