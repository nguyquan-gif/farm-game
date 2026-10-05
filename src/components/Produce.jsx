import { useId } from "react";
export default function Produce({
  kind = "greens",
  size = 44,
  className = "",
}) {
  const id = useId().replaceAll(":", "");
  return (
    <svg
      className={`produce ${className}`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x2=".8" y2="1">
          <stop
            stopColor={
              kind === "tomato" || kind === "tomatoes"
                ? "#ff9b67"
                : kind === "egg" || kind === "eggs"
                  ? "#fff9dc"
                  : "#b9db6b"
            }
          />
          <stop
            offset="1"
            stopColor={
              kind === "tomato" || kind === "tomatoes"
                ? "#bd3629"
                : kind === "egg" || kind === "eggs"
                  ? "#d5aa6f"
                  : "#377c40"
            }
          />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="55" rx="23" ry="5" fill="#3f452c" opacity=".18" />
      {kind === "tomato" || kind === "tomatoes" ? (
        <>
          <path
            d="M31 18C10 9 3 37 17 50c8 9 30 6 36-4 12-20-7-36-22-28Z"
            fill={`url(#${id})`}
            stroke="#a84a2a"
            strokeWidth="1.5"
          />
          <path
            d="m31 22-14-3 10-4-2-8 9 9 10-5-4 10 9 4-15-1-6 8Z"
            fill="#477c35"
          />
          <path
            d="M32 18q-1-10 5-13"
            stroke="#427039"
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M15 31q-3 9 4 14"
            stroke="#ffbf8c"
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".6"
          />
        </>
      ) : kind === "egg" || kind === "eggs" ? (
        <>
          <path
            d="M50 40c0-14-11-33-19-33S13 27 13 40c0 24 37 24 37 0Z"
            fill={`url(#${id})`}
            stroke="#ccac76"
          />
          <path
            d="M23 27q-6 9-5 15"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".7"
          />
        </>
      ) : kind === "sunflower" || kind === "flowers" ? (
        <>
          <path d="M31 54V28" stroke="#5b8639" strokeWidth="5" />
          <path
            d="M31 49C9 52 8 34 30 43M33 40c22 2 18-13 1-7"
            fill="#659746"
          />
          {Array.from({ length: 9 }, (_, i) => (
            <ellipse
              key={i}
              cx="32"
              cy="13"
              rx="6"
              ry="11"
              transform={`rotate(${i * 40} 32 25)`}
              fill={i % 2 ? "#ffd35b" : "#efa72b"}
            />
          ))}
          <circle cx="32" cy="25" r="11" fill="#735236" />
          <circle cx="30" cy="23" r="6" fill="#98703d" />
          <path
            d="m27 22 2 1m5 3 2 1m-7 3 2 1"
            stroke="#d1a053"
            strokeWidth="2"
          />
        </>
      ) : kind === "seeds" ? (
        <>
          <path
            d="m13 20 6-9h27l6 9-5 36H17Z"
            fill="#c69c62"
            stroke="#936937"
            strokeWidth="2"
          />
          <path d="M14 20h37" stroke="#f2d7a0" strokeWidth="4" />
          <circle cx="32" cy="36" r="14" fill="#f4e3b6" />
          <path
            d="M32 46V33m0 4c-15 0-14-17 0-5 10-15 19-2 1 4"
            stroke="#597e40"
            fill="#7e9e4a"
            strokeWidth="2"
          />
        </>
      ) : (
        <>
          <path
            d="M31 51C4 49-1 18 16 22 9 4 30 2 32 23 42-1 61 14 48 28 68 26 55 51 35 51"
            fill={`url(#${id})`}
            stroke="#477739"
            strokeWidth="1.5"
          />
          <path
            d="M32 53V21m0 22L17 31m16 6 15-9m-16 2-8-10"
            stroke="#d4e393"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M26 53h13l-2 5h-9Z" fill="#e0d5a1" />
        </>
      )}
    </svg>
  );
}
