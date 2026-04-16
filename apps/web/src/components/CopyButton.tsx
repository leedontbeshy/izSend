import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon, SpinnerIcon } from "./Icons";

type Props = {
  text: string;
  label?: string;
};

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const el = document.createElement("textarea");
  el.value = text;
  el.setAttribute("readonly", "true");
  el.style.position = "fixed";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

export function CopyButton({ text, label = "Copy" }: Props) {
  const [state, setState] = useState<"idle" | "copying" | "copied">("idle");
  const disabled = !text || state === "copying";

  useEffect(() => {
    if (state !== "copied") return;
    const t = window.setTimeout(() => setState("idle"), 1200);
    return () => window.clearTimeout(t);
  }, [state]);

  async function onCopy() {
    if (!text) return;
    setState("copying");
    try {
      await copyToClipboard(text);
      setState("copied");
    } catch {
      setState("idle");
    }
  }

  return (
    <button
      type="button"
      className="button"
      onClick={onCopy}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {state === "copying" ? (
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          <SpinnerIcon style={{ animation: "spin 0.8s linear infinite" }} />
        </span>
      ) : state === "copied" ? (
        <CheckIcon />
      ) : (
        <CopyIcon />
      )}
      {state === "copied" ? "Copied" : label}
    </button>
  );
}

