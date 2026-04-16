import { useTheme } from "../theme";
import { MoonIcon, SunIcon } from "./Icons";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button type="button" className="top-btn" onClick={toggle} aria-label="Toggle theme">
      <span className="top-btn-icon" aria-hidden>
        {theme === "dark" ? <MoonIcon /> : <SunIcon />}
      </span>
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}
