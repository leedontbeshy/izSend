import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { title?: string };

function IconBase(props: Props) {
  const { title, ...rest } = props;
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {props.children}
    </svg>
  );
}

export function SparkIcon(props: Props) {
  return (
    <IconBase {...props}>
      <path
        d="M12 2l1.2 4.1L17.3 7.3l-4.1 1.2L12 12.6l-1.2-4.1L6.7 7.3l4.1-1.2L12 2z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M19 13l.9 3.1L23 17l-3.1.9L19 21l-.9-3.1L15 17l3.1-.9L19 13z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </IconBase>
  );
}

export function UploadIcon(props: Props) {
  return (
    <IconBase {...props}>
      <path
        d="M12 15V4m0 0l-3.5 3.5M12 4l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

export function LinkIcon(props: Props) {
  return (
    <IconBase {...props}>
      <path
        d="M10 13a4 4 0 010-6l1-1a4 4 0 016 6l-1 1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 11a4 4 0 010 6l-1 1a4 4 0 01-6-6l1-1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

export function KeyIcon(props: Props) {
  return (
    <IconBase {...props}>
      <path
        d="M10.5 12.5a4.5 4.5 0 118-2.9l2 2v2h-2l-1 1h-2l-1 1h-1.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 16.5l3-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

export function QrIcon(props: Props) {
  return (
    <IconBase {...props}>
      <path
        d="M3.5 3.5h6v6h-6v-6zM14.5 3.5h6v6h-6v-6zM3.5 14.5h6v6h-6v-6z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M14.5 14.5h2.5v2.5h-2.5v-2.5zM17 17h3.5M17 20.5h3.5M20.5 17v3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

export function FileIcon(props: Props) {
  return (
    <IconBase {...props}>
      <path
        d="M7 3.5h6l4 4V20a1.8 1.8 0 01-1.8 1.8H7A1.8 1.8 0 015.2 20V5.3A1.8 1.8 0 017 3.5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M13 3.5V8h4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function CopyIcon(props: Props) {
  return (
    <IconBase {...props}>
      <path
        d="M9 9h10v10H9V9z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

export function CheckIcon(props: Props) {
  return (
    <IconBase {...props}>
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function SpinnerIcon(props: Props) {
  return (
    <IconBase {...props}>
      <path
        d="M12 3.5a8.5 8.5 0 018.5 8.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

export function SunIcon(props: Props) {
  return (
    <IconBase {...props}>
      <path
        d="M12 16.5a4.5 4.5 0 110-9 4.5 4.5 0 010 9z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

export function MoonIcon(props: Props) {
  return (
    <IconBase {...props}>
      <path
        d="M20 13.2A6.8 6.8 0 1110.8 4a5.7 5.7 0 009.2 9.2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
