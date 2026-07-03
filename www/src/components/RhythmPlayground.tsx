import { useEffect, useRef, useState } from "react";

export interface RhythmLabels {
  retinol: string;
  acid: string;
  cream: string;
  day: string;
  morning: string;
  evening: string;
  tapHint: string;
}

interface Props {
  labels: RhythmLabels;
}

const DAYS = 14;

const ROWS = [
  {
    key: "retinol",
    brand: "Paula's Choice",
    on: new Set([0, 3, 7, 10]),
    time: "evening" as const,
  },
  {
    key: "acid",
    brand: "The Ordinary",
    on: new Set([1, 4, 7, 10, 13]),
    time: "evening" as const,
  },
  {
    key: "cream",
    brand: "La Roche-Posay",
    on: new Set(Array.from({ length: DAYS }, (_, i) => i)),
    time: "both" as const,
  },
];

export default function RhythmPlayground({ labels }: Props) {
  const [hotCol, setHotCol] = useState<number | null>(null);
  const [openDay, setOpenDay] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDay(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const rowLabel = (key: string) =>
    key === "retinol"
      ? labels.retinol
      : key === "acid"
        ? labels.acid
        : labels.cream;

  const trackPointer = (e: React.PointerEvent) => {
    const grid = gridRef.current;
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const col = Math.min(
      DAYS - 1,
      Math.max(0, Math.floor((x / rect.width) * DAYS)),
    );
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setHotCol(col));
  };

  const toggleDay = (day: number) => {
    const next = openDay === day ? null : day;
    if (document.startViewTransition) {
      document.startViewTransition(() => setOpenDay(next));
    } else {
      setOpenDay(next);
    }
  };

  const itemName = (r: (typeof ROWS)[number]) =>
    `${rowLabel(r.key)} ${r.brand}`;
  const morningItems = (day: number) =>
    ROWS.filter((r) => r.on.has(day) && r.time === "both").map(itemName);
  const eveningItems = (day: number) =>
    ROWS.filter(
      (r) => r.on.has(day) && (r.time === "both" || r.time === "evening"),
    ).map(itemName);

  return (
    <div className="relative mt-18 max-w-2xl">
      {openDay !== null && (
        <div
          className="absolute -top-4 z-10 w-56 -translate-y-full rounded-xl bg-dusk-surface p-4 text-sm shadow-[0_16px_40px_-12px_oklch(0_0_0/0.5)] [view-transition-name:ritual-card] starting:scale-95 starting:opacity-0"
          style={{
            left: `clamp(0px, calc(7.5rem + ${(openDay + 0.5) / DAYS} * (100% - 7.5rem) - 7rem), calc(100% - 14rem))`,
            transition:
              "opacity 250ms cubic-bezier(0.22,1,0.36,1), transform 250ms cubic-bezier(0.22,1,0.36,1)",
          }}
          role="region"
          aria-label={`${labels.day} ${openDay + 1}`}
        >
          <p className="font-semibold text-dusk-ink">
            {labels.day} {openDay + 1}
          </p>
          <dl className="mt-2 grid gap-1 text-dusk-subtle">
            <div className="flex gap-2">
              <dt className="font-medium text-dusk-ink">{labels.morning}:</dt>
              <dd>{morningItems(openDay).join(", ") || "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-dusk-ink">{labels.evening}:</dt>
              <dd>{eveningItems(openDay).join(", ") || "—"}</dd>
            </div>
          </dl>
        </div>
      )}

      <div
        ref={gridRef}
        onPointerMove={trackPointer}
        onPointerLeave={() => setHotCol(null)}
        className="grid gap-6"
      >
        {ROWS.map((row) => (
          <div
            key={row.key}
            className="grid grid-cols-[8.5rem_1fr] items-center gap-4 max-[560px]:grid-cols-1 max-[560px]:gap-2"
          >
            <span className="text-sm leading-tight">
              <span className="font-medium text-dusk-ink">
                {rowLabel(row.key)}
              </span>
              <span className="block text-xs text-dusk-subtle">
                {row.brand}
              </span>
            </span>
            <span className="flex justify-between gap-1">
              {Array.from({ length: DAYS }, (_, day) => {
                const dist = hotCol === null ? 99 : Math.abs(day - hotCol);
                const boost = Math.max(0, 1 - dist / 3);
                const on = row.on.has(day);
                return (
                  <button
                    key={day}
                    type="button"
                    tabIndex={row.key === "cream" ? 0 : -1}
                    aria-label={
                      row.key === "cream"
                        ? `${labels.day} ${day + 1}`
                        : undefined
                    }
                    aria-expanded={
                      row.key === "cream" ? openDay === day : undefined
                    }
                    onClick={() => toggleDay(day)}
                    className={`aspect-square w-[clamp(0.7rem,1.9vw,1.05rem)] cursor-pointer rounded-full transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      on ? "bg-night-accent" : "bg-white/13"
                    }`}
                    style={{
                      transform: `scale(${1 + boost * 0.45})`,
                      transitionDelay: `${dist <= 3 ? dist * 28 : 0}ms`,
                      boxShadow:
                        on && boost > 0
                          ? `0 0 ${10 * boost}px oklch(0.72 0.14 14 / ${0.5 * boost})`
                          : "none",
                    }}
                  />
                );
              })}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-dusk-subtle">{labels.tapHint}</p>
    </div>
  );
}
