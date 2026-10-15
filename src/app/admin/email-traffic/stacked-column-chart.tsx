"use client";

import {
  useId,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import {
  ChartLegend,
  ChartLiveRegion,
  ChartTooltip,
  ChartTooltipRow,
  ResponsiveChart,
  cn,
  getChartColorClasses,
  type ChartColorId,
} from "@schemavaults/ui";

// A stacked column chart: one column per time bucket, stacked by series in
// series order (first series on the baseline). @schemavaults/ui's BarChart
// draws a single series, so this composes the same chart primitives
// (legend, tooltip, live region, responsive container) and mark specs:
// columns at most 24px wide with a rounded free end, a 2px surface gap
// between stacked segments, hairline gridlines, and a per-column hover /
// arrow-key readout listing every series.

export interface StackedColumnSeries {
  id: string;
  label: string;
  colorId: ChartColorId;
}

export interface StackedColumn {
  id: string;
  /** Short label along the x-axis (thinned out on narrow charts). */
  axisLabel: string;
  /** Full label for the readout. */
  title: string;
  /** Value per series id; a missing id counts as 0. */
  values: ReadonlyMap<string, number>;
}

export interface StackedColumnChartProps {
  /** Accessible name of the chart. */
  label: string;
  series: readonly StackedColumnSeries[];
  columns: readonly StackedColumn[];
  /** Plot height in pixels, x-axis labels included. Defaults to 260. */
  height?: number;
  /** Holds the current render at reduced opacity while new data loads. */
  loading?: boolean;
  formatValue?: (value: number) => string;
}

const FONT_PX = 11;
const MAX_COLUMN_WIDTH = 24;
const CORNER_RADIUS = 4;
const SEGMENT_GAP = 2;
const PAD_TOP = 8;
const PAD_RIGHT = 4;
const PAD_BOTTOM = 22;

const defaultFormat = new Intl.NumberFormat("en-US");

/** The 1/2/5 × 10^k step at or above `raw` (at least 1: counts are whole). */
function niceStep(raw: number): number {
  if (!(raw > 1)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const factor =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return factor * magnitude;
}

/** Ticks from 0 to the first nice step at or above `max`. */
function niceTicks(max: number, target = 4): number[] {
  const step = niceStep(max / target);
  const top = Math.max(step, Math.ceil(max / step) * step);
  const ticks: number[] = [];
  for (let tick = 0; tick <= top; tick += step) ticks.push(tick);
  return ticks;
}

/** A column segment with its top corners rounded (square on the baseline). */
function topRoundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): string {
  const r = Math.max(0, Math.min(radius, width / 2, height));
  if (r === 0) return `M${x},${y}h${width}v${height}h${-width}Z`;
  return (
    `M${x},${y + height}V${y + r}Q${x},${y} ${x + r},${y}` +
    `H${x + width - r}Q${x + width},${y} ${x + width},${y + r}` +
    `V${y + height}Z`
  );
}

function estimateTextWidth(text: string): number {
  return text.length * FONT_PX * 0.6;
}

export function StackedColumnChart({
  label,
  series,
  columns,
  height = 260,
  loading = false,
  formatValue = (value) => defaultFormat.format(value),
}: StackedColumnChartProps): ReactElement {
  const hintId = useId();
  const [activeState, setActive] = useState<number | null>(null);
  const [announce, setAnnounce] = useState(false);
  // A stale index (the data shrank under the pointer) reads as nothing active.
  const active =
    activeState !== null && activeState < columns.length ? activeState : null;

  const totals = columns.map((column) =>
    series.reduce(
      (sum, s) => sum + Math.max(0, column.values.get(s.id) ?? 0),
      0,
    ),
  );
  const ticks = niceTicks(Math.max(0, ...totals));
  const top = ticks[ticks.length - 1] ?? 1;

  function describe(index: number): string {
    const column = columns[index];
    if (column === undefined) return "";
    const parts = series.map(
      (s) => `${s.label} ${formatValue(column.values.get(s.id) ?? 0)}`,
    );
    return `${column.title}: ${formatValue(totals[index] ?? 0)} total (${parts.join(", ")})`;
  }

  function onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    const count = columns.length;
    if (count === 0) return;
    let next: number | null = active;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = active === null ? 0 : Math.min(count - 1, active + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = active === null ? count - 1 : Math.max(0, active - 1);
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = count - 1;
    } else if (event.key === "Escape") {
      next = null;
    } else {
      return;
    }
    event.preventDefault();
    setActive(next);
    setAnnounce(next !== null);
  }

  function renderPlot(width: number): ReactElement {
    const tickLabelWidth = Math.max(
      ...ticks.map((tick) => estimateTextWidth(formatValue(tick))),
    );
    const padLeft = Math.ceil(tickLabelWidth) + 10;
    const plotW = Math.max(0, width - padLeft - PAD_RIGHT);
    const plotH = Math.max(0, height - PAD_TOP - PAD_BOTTOM);
    const baseline = PAD_TOP + plotH;
    const count = columns.length;
    const slot = count > 0 ? plotW / count : 0;
    const columnWidth = Math.min(
      MAX_COLUMN_WIDTH,
      Math.max(slot * 0.7, Math.min(slot, 1)),
    );
    const yOf = (value: number) => baseline - (value / top) * plotH;

    // Show every k-th x-axis label so they never run together; the readout
    // and the table still name every column.
    const labelWidth = Math.max(
      0,
      ...columns.map((column) => estimateTextWidth(column.axisLabel)),
    );
    const labelStep =
      slot > 0 ? Math.max(1, Math.ceil((labelWidth + 12) / slot)) : 1;

    const activeColumnX =
      active === null ? null : padLeft + active * slot + slot / 2;

    return (
      <>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={label}
          aria-describedby={count > 0 ? hintId : undefined}
          tabIndex={count > 0 ? 0 : undefined}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
          onPointerLeave={() => setActive(null)}
          className="block overflow-visible rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <g aria-hidden="true" className="pointer-events-none select-none">
            {ticks.map((tick) => {
              const y = yOf(tick);
              return (
                <g key={`tick-${tick}`}>
                  {tick > 0 ? (
                    <line
                      x1={padLeft}
                      x2={padLeft + plotW}
                      y1={y}
                      y2={y}
                      strokeWidth={1}
                      className="stroke-border"
                    />
                  ) : null}
                  <text
                    x={padLeft - 6}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="central"
                    className="fill-muted-foreground tabular-nums"
                  >
                    {formatValue(tick)}
                  </text>
                </g>
              );
            })}
            <line
              x1={padLeft}
              x2={padLeft + plotW}
              y1={baseline}
              y2={baseline}
              strokeWidth={1}
              className="stroke-muted-foreground/40"
            />
          </g>

          <g className="pointer-events-none">
            {columns.map((column, index) => {
              const x = padLeft + index * slot + (slot - columnWidth) / 2;
              const segments: { id: string; y: number; h: number }[] = [];
              let cumulative = 0;
              for (const s of series) {
                const value = Math.max(0, column.values.get(s.id) ?? 0);
                if (value === 0) continue;
                const y1 = yOf(cumulative);
                cumulative += value;
                const y0 = yOf(cumulative);
                segments.push({ id: s.id, y: y0, h: y1 - y0 });
              }
              const dimmed = active !== null && active !== index;
              return (
                <g
                  key={column.id}
                  className={cn(
                    "transition-opacity",
                    dimmed && "opacity-40",
                  )}
                >
                  {segments.map((segment, segmentIndex) => {
                    const s = series.find((entry) => entry.id === segment.id);
                    const isTop = segmentIndex === segments.length - 1;
                    // Leave a surface-coloured gap above every segment
                    // that has another stacked on it (if it can spare it).
                    const gap =
                      !isTop && segment.h > SEGMENT_GAP * 2 ? SEGMENT_GAP : 0;
                    return (
                      <path
                        key={segment.id}
                        d={topRoundedRectPath(
                          x,
                          segment.y + gap,
                          columnWidth,
                          segment.h - gap,
                          isTop ? CORNER_RADIUS : 0,
                        )}
                        className={
                          s ? getChartColorClasses(s.colorId).fill : undefined
                        }
                      />
                    );
                  })}
                </g>
              );
            })}
          </g>

          <g aria-hidden="true" className="pointer-events-none select-none">
            {columns.map((column, index) => {
              if (index % labelStep !== 0) return null;
              const textWidth = estimateTextWidth(column.axisLabel);
              const center = padLeft + index * slot + slot / 2;
              // Keep the first and last labels from hanging off the plot.
              const x = Math.min(
                Math.max(center, padLeft + textWidth / 2),
                padLeft + plotW - textWidth / 2,
              );
              return (
                <text
                  key={`label-${column.id}`}
                  x={x}
                  y={baseline + 15}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                >
                  {column.axisLabel}
                </text>
              );
            })}
          </g>

          <g>
            {columns.map((column, index) => (
              <rect
                key={`hit-${column.id}`}
                aria-hidden="true"
                x={padLeft + index * slot}
                y={PAD_TOP}
                width={Math.max(0, slot)}
                height={plotH}
                fill="transparent"
                onPointerEnter={() => {
                  setActive(index);
                  setAnnounce(false);
                }}
              />
            ))}
          </g>
        </svg>

        {active !== null && activeColumnX !== null ? (
          <ChartTooltip
            x={activeColumnX}
            y={yOf(totals[active] ?? 0)}
            containerWidth={width}
          >
            <div className="mb-1 font-medium">{columns[active]?.title}</div>
            {series.map((s) => (
              <ChartTooltipRow
                key={s.id}
                value={formatValue(columns[active]?.values.get(s.id) ?? 0)}
                label={s.label}
                colorClassName={getChartColorClasses(s.colorId).bg}
              />
            ))}
            {series.length > 1 ? (
              <ChartTooltipRow
                className="mt-1 border-t pt-1"
                value={formatValue(totals[active] ?? 0)}
                label="Total"
              />
            ) : null}
          </ChartTooltip>
        ) : null}
      </>
    );
  }

  return (
    <div
      aria-busy={loading || undefined}
      className={cn(
        "flex w-full flex-col gap-3 text-[11px] transition-opacity",
        loading && "opacity-60",
      )}
    >
      <ChartLegend
        items={series.map((s) => ({
          id: s.id,
          label: s.label,
          paint: { colorId: s.colorId },
          swatch: "square" as const,
        }))}
      />
      <ResponsiveChart height={height}>{renderPlot}</ResponsiveChart>
      <span id={hintId} hidden>
        Use the arrow keys to read each column.
      </span>
      <ChartLiveRegion
        message={announce && active !== null ? describe(active) : ""}
      />
    </div>
  );
}

export default StackedColumnChart;
