"use client";

import { useEffect, useState, type ReactElement } from "react";
import useSWR from "swr";
import {
  Badge,
  BarChart,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DateRangePicker,
  PieChart,
  SegmentedControl,
  SegmentedControlItem,
  StatCard,
  StatCardDescription,
  StatCardHeader,
  StatCardLabel,
  StatCardValue,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  cn,
  getChartColorClasses,
  type DateRange,
} from "@schemavaults/ui";
import {
  useAuth,
  type ISchemaVaultsAuthClient,
} from "@schemavaults/auth-react-provider";
import { ChartColumnStacked, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { useMailAppId } from "@/contexts/MailAppIdContext";
import { useDeploymentTimeZone } from "@/contexts/DeploymentTimeZoneContext";
import type { TransportStatus } from "@/app/api/admin/transports/transport-status-schema";
import {
  EMAIL_SEND_STATS_GRANULARITIES,
  type EmailSendStats,
  type EmailSendStatsGranularity,
} from "@/lib/mail-db/email-send-stats";
import {
  browserTimeZone,
  compareCalendarDays,
  type CalendarDay,
} from "@/lib/time-zone";
import getEmailSendStats from "@/lib/client-mail-db-actions/getEmailSendStats";
import {
  StackedColumnChart,
  type StackedColumn,
} from "./stacked-column-chart";
import {
  DEFAULT_TRAFFIC_RANGE_PRESET,
  TRAFFIC_RANGE_PRESETS,
  autoTrafficGranularity,
  calendarDayInZone,
  defaultTrafficGranularity,
  isGranularityAllowed,
  resolveTrafficRange,
  trafficRangeDays,
  type TrafficRange,
  type TrafficRangePresetId,
  type TrafficRangeSelection,
} from "./traffic-range";
import {
  attemptsOf,
  buildTrafficSeries,
  countsBySeriesId,
  type TrafficCounts,
  type TrafficSeries,
} from "./traffic-series";
import {
  GRANULARITY_LABELS,
  formatBucketAxisLabel,
  formatBucketTitle,
  formatCount,
  formatShare,
} from "./traffic-format";

export interface EmailTrafficClientViewProps {
  /** Transport statuses loaded server-side; empty when that failed. */
  transports: readonly TransportStatus[];
  /** Set when the server failed to resolve transport availability. */
  transportsError: string | null;
}

type StatsKey = readonly [
  "email-send-stats",
  number,
  number,
  string,
  EmailSendStatsGranularity,
];

type Metric = "attempts" | "delivered" | "failed";

const METRIC_OF: Record<Metric, (counts: TrafficCounts | undefined) => number> =
  {
    attempts: attemptsOf,
    delivered: (counts) => counts?.delivered ?? 0,
    failed: (counts) => counts?.failed ?? 0,
  };

const SHARE_PIES: readonly { metric: Metric; title: string; empty: string }[] =
  [
    {
      metric: "attempts",
      title: "All send attempts",
      empty: "No send attempts",
    },
    { metric: "delivered", title: "Delivered", empty: "No deliveries" },
    { metric: "failed", title: "Failed", empty: "No failed attempts" },
  ];

/** The date picker works in browser-local Dates; ranges in calendar days. */
function calendarDayOfPickerDate(date: Date): CalendarDay {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
}

function pickerDateOfCalendarDay(day: CalendarDay): Date {
  return new Date(day.year, day.month, day.day);
}

export default function EmailTrafficClientView({
  transports,
  transportsError,
}: EmailTrafficClientViewProps): ReactElement {
  const auth = useAuth();
  const appId = useMailAppId();
  const deploymentTimeZone = useDeploymentTimeZone();

  // The selection and the viewer's zone depend on the browser's clock and
  // zone, so they are set after mount (the server render shows the loading
  // state).
  const [selection, setSelection] = useState<TrafficRangeSelection | null>(
    null,
  );
  const [granularityChoice, setGranularityChoice] =
    useState<EmailSendStatsGranularity>("day");
  const [myTimeZone, setMyTimeZone] = useState<string | null>(null);
  const [preferMyTimeZone, setPreferMyTimeZone] = useState(false);
  const [draftDays, setDraftDays] = useState<DateRange | null>(null);
  useEffect(() => {
    setMyTimeZone(browserTimeZone());
    setSelection({
      kind: "preset",
      preset: DEFAULT_TRAFFIC_RANGE_PRESET,
      now: Date.now(),
    });
  }, []);

  // Group by the deployment's default time zone (set at /admin/settings),
  // unless the viewer switched to their own or none is set.
  const timeZone: string | null =
    myTimeZone === null
      ? null
      : deploymentTimeZone !== null && !preferMyTimeZone
        ? deploymentTimeZone
        : myTimeZone;
  const range: TrafficRange | null =
    selection !== null && timeZone !== null
      ? resolveTrafficRange(selection, timeZone)
      : null;
  // A granularity picked for one range may be too fine for the next.
  const granularity: EmailSendStatsGranularity =
    range === null || isGranularityAllowed(range, granularityChoice)
      ? granularityChoice
      : autoTrafficGranularity(range);

  function getAuthClient(): ISchemaVaultsAuthClient | null {
    if (!auth.ready || !auth.client.current) return null;
    return auth.client.current;
  }

  const key: StatsKey | null =
    auth.ready && range !== null && timeZone !== null
      ? ["email-send-stats", range.from, range.to, timeZone, granularity]
      : null;
  const {
    data: stats,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<EmailSendStats, Error, StatsKey | null>(
    key,
    async ([, from, to, timezone, granularity]: StatsKey) => {
      const authClient = getAuthClient();
      if (!authClient) throw new Error("Auth client is not ready yet.");
      return await getEmailSendStats(
        { from, to, timezone, granularity },
        authClient,
        appId,
      );
    },
    // Keep showing the previous range while the next one loads.
    { keepPreviousData: true, revalidateOnFocus: false },
  );

  function select(next: TrafficRangeSelection) {
    setDraftDays(null);
    setSelection(next);
    if (timeZone !== null) {
      setGranularityChoice(
        defaultTrafficGranularity(next, resolveTrafficRange(next, timeZone)),
      );
    }
  }

  function selectPreset(preset: TrafficRangePresetId) {
    select({ kind: "preset", preset, now: Date.now() });
  }

  function selectDays(days: DateRange | undefined) {
    if (days?.from && days.to) {
      select({
        kind: "custom",
        first: calendarDayOfPickerDate(days.from),
        last: calendarDayOfPickerDate(days.to),
      });
    } else {
      setDraftDays(days ?? null);
    }
  }

  function refresh() {
    // A preset moves with the clock: re-anchor it to now before refetching.
    if (selection !== null && selection.kind === "preset") {
      setSelection({ ...selection, now: Date.now() });
    }
    void mutate();
  }

  const series: TrafficSeries[] = buildTrafficSeries(
    transports,
    stats?.totals ?? [],
  );
  const transportCount = series.filter((s) => s.transport !== null).length;
  const totalsBySeries = countsBySeriesId(stats?.totals ?? []);
  const delivered = (stats?.totals ?? []).reduce(
    (sum, entry) => sum + entry.delivered,
    0,
  );
  const failed = (stats?.totals ?? []).reduce(
    (sum, entry) => sum + entry.failed,
    0,
  );
  const attempts = delivered + failed;

  const columns: StackedColumn[] =
    stats === undefined
      ? []
      : stats.buckets.map((bucket) => {
          const counts = countsBySeriesId(bucket.transports);
          return {
            id: String(bucket.bucket_start),
            axisLabel: formatBucketAxisLabel(
              bucket.bucket_start,
              stats.granularity,
              stats.timezone,
            ),
            title: formatBucketTitle(
              bucket.bucket_start,
              stats.granularity,
              stats.timezone,
            ),
            values: new Map(
              series.map((s) => [s.id, attemptsOf(counts.get(s.id))]),
            ),
          };
        });

  const busiest = stats?.buckets.reduce<{
    start: number;
    attempts: number;
  } | null>((best, bucket) => {
    const total = bucket.transports.reduce(
      (sum, entry) => sum + entry.delivered + entry.failed,
      0,
    );
    return total > 0 && (best === null || total > best.attempts)
      ? { start: bucket.bucket_start, attempts: total }
      : best;
  }, null);

  const loading = isLoading || isValidating;
  const rangeDays =
    range !== null && timeZone !== null
      ? trafficRangeDays(range, timeZone)
      : null;
  const pickerValue: DateRange | undefined =
    draftDays ??
    (rangeDays === null
      ? undefined
      : {
          from: pickerDateOfCalendarDay(rangeDays.first),
          to: pickerDateOfCalendarDay(rangeDays.last),
        });
  const today: CalendarDay | null =
    timeZone !== null ? calendarDayInZone(Date.now(), timeZone) : null;

  return (
    <div
      className={cn(
        "w-full min-h-screen h-full",
        "flex flex-col justify-start items-stretch",
        "bg-background",
      )}
    >
      <Nav
        title={
          <>
            <ChartColumnStacked className="hidden sm:block h-5 w-5 shrink-0" />
            Email Traffic
          </>
        }
        backHref="/admin"
      >
        <Button
          variant="secondary"
          onClick={refresh}
          disabled={key === null || loading}
          className="flex items-center gap-2"
          aria-label="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </Nav>

      <main className="flex flex-col w-full grow">
        <section className="flex flex-col w-full grow gap-4 py-4 px-4 md:px-8 lg:px-16 xl:px-24">
          <p className="text-sm text-muted-foreground">
            Outgoing email traffic per mail transport, counted from the email
            send log: every send attempt from{" "}
            <code className="font-mono">/api/send</code> and from the server
            itself. <strong>Delivered</strong> means the transport accepted the
            message; <strong>failed</strong> attempts are counted against the
            transport they were tried on.
          </p>

          <div
            className="flex flex-row flex-wrap items-center gap-2"
            role="group"
            aria-label="Date range and grouping"
          >
            <SegmentedControl
              aria-label="Date range"
              size="sm"
              variant="outline"
              value={
                selection?.kind === "preset"
                  ? selection.preset
                  : selection === null
                    ? DEFAULT_TRAFFIC_RANGE_PRESET
                    : "custom"
              }
              onValueChange={(value) =>
                selectPreset(value as TrafficRangePresetId)
              }
              disabled={range === null}
            >
              {TRAFFIC_RANGE_PRESETS.map((preset) => (
                <SegmentedControlItem key={preset.id} value={preset.id}>
                  {preset.label}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
            <DateRangePicker
              value={pickerValue}
              onValueChange={selectDays}
              onOpenChange={(open) => {
                if (!open) setDraftDays(null);
              }}
              disabledDates={(date) =>
                today !== null &&
                compareCalendarDays(calendarDayOfPickerDate(date), today) > 0
              }
              placeholder="Custom range"
              formatDate={(date) =>
                date.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              }
              disabled={range === null}
              className={cn(
                "h-9",
                selection?.kind === "custom" && "border-primary",
              )}
            />
            <SegmentedControl
              aria-label="Group by"
              size="sm"
              variant="outline"
              className="md:ml-auto"
              value={granularity}
              onValueChange={(value) =>
                setGranularityChoice(value as EmailSendStatsGranularity)
              }
              disabled={range === null}
            >
              {EMAIL_SEND_STATS_GRANULARITIES.map((option) => (
                <SegmentedControlItem
                  key={option}
                  value={option}
                  disabled={
                    range !== null && !isGranularityAllowed(range, option)
                  }
                >
                  {GRANULARITY_LABELS[option]}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </div>
          {timeZone !== null && myTimeZone !== null ? (
            <TimeZoneNote
              timeZone={timeZone}
              deploymentTimeZone={deploymentTimeZone}
              myTimeZone={myTimeZone}
              onShowIn={(zone) => setPreferMyTimeZone(zone === myTimeZone)}
            />
          ) : null}

          {transportsError !== null ? (
            <p className="text-sm text-red-500">
              Could not resolve the configured transports: {transportsError}
            </p>
          ) : null}
          {error !== undefined ? (
            <p className="text-sm text-red-500">
              Failed to load email traffic: {error.message}
            </p>
          ) : null}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard>
              <StatCardHeader>
                <StatCardLabel>Send attempts</StatCardLabel>
              </StatCardHeader>
              <StatCardValue loading={stats === undefined}>
                {formatCount(attempts)}
              </StatCardValue>
              <StatCardDescription>
                Across {transportCount}{" "}
                {transportCount === 1 ? "transport" : "transports"}
              </StatCardDescription>
            </StatCard>
            <StatCard>
              <StatCardHeader>
                <StatCardLabel>Delivered</StatCardLabel>
              </StatCardHeader>
              <StatCardValue loading={stats === undefined}>
                {formatCount(delivered)}
              </StatCardValue>
              <StatCardDescription>
                {formatShare(delivered, attempts)} of attempts
              </StatCardDescription>
            </StatCard>
            <StatCard>
              <StatCardHeader>
                <StatCardLabel>Failed</StatCardLabel>
              </StatCardHeader>
              <StatCardValue loading={stats === undefined}>
                {formatCount(failed)}
              </StatCardValue>
              <StatCardDescription>
                {formatShare(failed, attempts)} of attempts
              </StatCardDescription>
            </StatCard>
            <StatCard>
              <StatCardHeader>
                <StatCardLabel>
                  Busiest {stats?.granularity ?? granularity}
                </StatCardLabel>
              </StatCardHeader>
              <StatCardValue loading={stats === undefined}>
                {busiest ? formatCount(busiest.attempts) : "—"}
              </StatCardValue>
              <StatCardDescription>
                {busiest && stats
                  ? formatBucketTitle(
                      busiest.start,
                      stats.granularity,
                      stats.timezone,
                    )
                  : "No traffic in this range"}
              </StatCardDescription>
            </StatCard>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Outgoing traffic over time
              </CardTitle>
              <CardDescription>
                Send attempts per{" "}
                {stats?.granularity ?? granularity}, stacked
                by transport. Hover or use the arrow keys for exact counts.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {stats === undefined ? (
                <ChartPlaceholder
                  height={300}
                  message={error ? "No data" : "Loading…"}
                />
              ) : (
                <StackedColumnChart
                  label={`Send attempts per ${stats.granularity}, stacked by transport`}
                  series={series}
                  columns={columns}
                  height={300}
                  loading={loading}
                  formatValue={formatCount}
                />
              )}
              {stats !== undefined && columns.length > 0 ? (
                <details className="group">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    View as table
                  </summary>
                  <div className="mt-2 max-h-96 overflow-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Period</TableHead>
                          {series.map((s) => (
                            <TableHead key={s.id} className="text-right">
                              {s.label}
                            </TableHead>
                          ))}
                          <TableHead className="text-right">Delivered</TableHead>
                          <TableHead className="text-right">Failed</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.buckets.map((bucket, index) => {
                          const column = columns[index];
                          const bucketDelivered = bucket.transports.reduce(
                            (sum, entry) => sum + entry.delivered,
                            0,
                          );
                          const bucketFailed = bucket.transports.reduce(
                            (sum, entry) => sum + entry.failed,
                            0,
                          );
                          return (
                            <TableRow key={bucket.bucket_start}>
                              <TableCell className="whitespace-nowrap">
                                {column?.title}
                              </TableCell>
                              {series.map((s) => (
                                <TableCell
                                  key={s.id}
                                  className="text-right tabular-nums"
                                >
                                  {formatCount(column?.values.get(s.id) ?? 0)}
                                </TableCell>
                              ))}
                              <TableCell className="text-right tabular-nums">
                                {formatCount(bucketDelivered)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {formatCount(bucketFailed)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-medium">
                                {formatCount(bucketDelivered + bucketFailed)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </details>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Share of traffic by transport
              </CardTitle>
              <CardDescription>
                What percent of all attempts, deliveries, and failures in this
                range went through each transport.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {SHARE_PIES.map((pie) => (
                <SharePie
                  key={pie.metric}
                  title={pie.title}
                  emptyMessage={pie.empty}
                  series={series}
                  valueOf={(s) =>
                    METRIC_OF[pie.metric](totalsBySeries.get(s.id))
                  }
                  ready={stats !== undefined}
                  loading={loading}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Totals per transport</CardTitle>
              <CardDescription>
                Every configured transport, plus any other transport with
                logged attempts in this range.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 items-start">
              <div className="min-w-0">
                {stats === undefined ? (
                  <ChartPlaceholder
                    height={240}
                    message={error ? "No data" : "Loading…"}
                  />
                ) : series.length === 0 ? (
                  <ChartPlaceholder
                    height={240}
                    message="No transports are configured."
                  />
                ) : (
                  <BarChart
                    label="Send attempts per transport"
                    width="auto"
                    height={240}
                    size="md"
                    bars={series.map((s) => ({
                      id: s.id,
                      label: s.label,
                      value: attemptsOf(totalsBySeries.get(s.id)),
                      color: s.colorId,
                    }))}
                    showValueLabels
                    showValueAxis
                    formatValue={formatCount}
                    loading={loading}
                  />
                )}
              </div>
              <div className="min-w-0 overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transport</TableHead>
                      <TableHead className="text-right">Attempts</TableHead>
                      <TableHead className="text-right">Delivered</TableHead>
                      <TableHead className="text-right">Failed</TableHead>
                      <TableHead className="text-right">
                        Share of attempts
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {series.map((s) => {
                      const counts = totalsBySeries.get(s.id);
                      return (
                        <TableRow key={s.id}>
                          <TableCell>
                            <TransportLabel series={s} />
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCount(attemptsOf(counts))}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCount(counts?.delivered ?? 0)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCount(counts?.failed ?? 0)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatShare(attemptsOf(counts), attempts)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-medium">Total</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatCount(attempts)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatCount(delivered)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatCount(failed)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {attempts > 0 ? "100%" : "—"}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

/**
 * Says which time zone the page groups by, and offers the other one when the
 * deployment's default differs from the viewer's own.
 */
function TimeZoneNote({
  timeZone,
  deploymentTimeZone,
  myTimeZone,
  onShowIn,
}: {
  timeZone: string;
  deploymentTimeZone: string | null;
  myTimeZone: string;
  onShowIn: (timeZone: string) => void;
}): ReactElement {
  const usingDeployment =
    deploymentTimeZone !== null && timeZone === deploymentTimeZone;
  const other =
    deploymentTimeZone === null || deploymentTimeZone === myTimeZone
      ? null
      : usingDeployment
        ? myTimeZone
        : deploymentTimeZone;
  return (
    <p className="text-xs text-muted-foreground -mt-2">
      {usingDeployment ? (
        <>
          Days and hours are in {timeZone}, this deployment&apos;s time zone.
        </>
      ) : (
        <>Days and hours are in your time zone, {timeZone}.</>
      )}{" "}
      {other !== null ? (
        <button
          type="button"
          onClick={() => onShowIn(other)}
          className="underline underline-offset-2 hover:text-foreground"
        >
          {other === myTimeZone
            ? `Show in my time zone (${other})`
            : `Show in the deployment's time zone (${other})`}
        </button>
      ) : deploymentTimeZone === null ? (
        <>
          Admins can set a time zone for the whole deployment in{" "}
          <Link
            href="/admin/settings"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Settings
          </Link>
          .
        </>
      ) : null}
    </p>
  );
}

function ChartPlaceholder({
  height,
  message,
}: {
  height: number;
  message: string;
}): ReactElement {
  return (
    <div
      className="flex w-full items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground"
      style={{ height }}
    >
      {message}
    </div>
  );
}

function TransportLabel({ series }: { series: TrafficSeries }): ReactElement {
  return (
    <div className="flex flex-col gap-0.5 whitespace-nowrap">
      <div className="flex flex-row items-center gap-2">
        <span
          aria-hidden="true"
          className={cn(
            "inline-block size-2.5 shrink-0 rounded-[2px]",
            getChartColorClasses(series.colorId).bg,
          )}
        />
        <span className="font-medium">{series.label}</span>
        {series.isDefault ? <Badge variant="outline">Default</Badge> : null}
      </div>
      <span className="pl-[18px] text-xs text-muted-foreground">
        {series.transport === null ? (
          "Attempts that resolved no transport"
        ) : (
          <>
            <code className="font-mono">{series.transport}</code>
            {series.configured ? null : " · not configured"}
          </>
        )}
      </span>
    </div>
  );
}

function SharePie({
  title,
  emptyMessage,
  series,
  valueOf,
  ready,
  loading,
}: {
  title: string;
  emptyMessage: string;
  series: readonly TrafficSeries[];
  valueOf: (series: TrafficSeries) => number;
  ready: boolean;
  loading: boolean;
}): ReactElement {
  const total = series.reduce((sum, s) => sum + valueOf(s), 0);
  return (
    <div className="flex flex-col items-center gap-3 min-w-0">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {!ready || total === 0 ? (
        <div className="flex aspect-square w-full max-w-[160px] items-center justify-center rounded-full border border-dashed text-center text-xs text-muted-foreground p-4">
          {ready ? emptyMessage : "Loading…"}
        </div>
      ) : (
        <PieChart
          label={`${title}: share by transport`}
          size="md"
          diameter="auto"
          innerRadius={0.6}
          segmentGap={2}
          segmentOrder={series.map((s) => s.id)}
          segments={series.map((s) => ({
            id: s.id,
            label: s.label,
            value: valueOf(s),
            color: s.colorId,
          }))}
          formatValue={formatCount}
          loading={loading}
          className="w-full max-w-[160px]"
        >
          <div className="flex flex-col items-center leading-tight">
            <span className="text-lg font-semibold">{formatCount(total)}</span>
            <span className="text-[11px] text-muted-foreground">total</span>
          </div>
        </PieChart>
      )}
      {ready && total > 0 ? (
        <ul className="flex w-full max-w-[240px] flex-col gap-1 text-xs">
          {series.map((s) => (
            <li key={s.id} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "inline-block size-2.5 shrink-0 rounded-[2px]",
                  getChartColorClasses(s.colorId).bg,
                )}
              />
              <span className="min-w-0 truncate text-muted-foreground">
                {s.label}
              </span>
              <span className="ml-auto font-medium tabular-nums text-foreground">
                {formatShare(valueOf(s), total)}
              </span>
              <span className="w-12 text-right tabular-nums text-muted-foreground">
                {formatCount(valueOf(s))}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
