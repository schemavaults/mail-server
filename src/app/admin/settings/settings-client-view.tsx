"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactElement,
} from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Combobox,
  cn,
  useToast,
  type ComboboxOption,
} from "@schemavaults/ui";
import {
  useAuth,
  type ISchemaVaultsAuthClient,
} from "@schemavaults/auth-react-provider";
import { Settings } from "lucide-react";
import { Nav } from "@/components/Nav";
import { useMailAppId } from "@/contexts/MailAppIdContext";
import type { DeploymentSettings } from "@/lib/mail-db/deployment-settings-table";
import updateDeploymentSettings from "@/lib/client-mail-db-actions/updateDeploymentSettings";
import {
  browserTimeZone,
  formatDateTime,
  listIanaTimeZones,
} from "@/lib/time-zone";

export interface SettingsClientViewProps {
  /** Null when the server failed to load them. */
  initialSettings: DeploymentSettings | null;
  loadError: string | null;
}

/** Combobox value for "no deployment default" (each viewer's own zone). */
const BROWSER_TIME_ZONE_OPTION = "__browser__";

/** A zone's current UTC offset, e.g. "GMT-04:00". */
function currentOffset(timeZone: string, now: number): string {
  try {
    return (
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "longOffset",
      })
        .formatToParts(now)
        .find((part) => part.type === "timeZoneName")?.value ?? ""
    );
  } catch {
    return "";
  }
}

export default function SettingsClientView({
  initialSettings,
  loadError,
}: SettingsClientViewProps): ReactElement {
  const { toast } = useToast();
  const auth = useAuth();
  const appId = useMailAppId();
  const router = useRouter();
  const [settings, setSettings] = useState<DeploymentSettings | null>(
    initialSettings,
  );
  const [selected, setSelected] = useState<string>(
    initialSettings?.default_time_zone ?? BROWSER_TIME_ZONE_OPTION,
  );
  const [isSaving, startSaveTransition] = useTransition();

  // The zone list, its offsets, and the browser's zone depend on the
  // browser, so they are computed after mount.
  const [now, setNow] = useState<number | null>(null);
  const [myTimeZone, setMyTimeZone] = useState<string | null>(null);
  useEffect(() => {
    setNow(Date.now());
    setMyTimeZone(browserTimeZone());
  }, []);

  const options: ComboboxOption[] = useMemo(() => {
    const browserOption: ComboboxOption = {
      value: BROWSER_TIME_ZONE_OPTION,
      label: "Not set",
      description: "Each viewer's own browser time zone",
      keywords: ["browser", "none", "local"],
    };
    if (now === null) {
      const current = initialSettings?.default_time_zone;
      return current
        ? [browserOption, { value: current, label: current }]
        : [browserOption];
    }
    return [
      browserOption,
      ...listIanaTimeZones().map((zone) => ({
        value: zone,
        label: zone.replaceAll("_", " "),
        description: currentOffset(zone, now),
        keywords: [zone],
      })),
    ];
  }, [now, initialSettings?.default_time_zone]);

  const savedTimeZone = settings?.default_time_zone ?? null;
  const selectedTimeZone =
    selected === BROWSER_TIME_ZONE_OPTION ? null : selected;
  const dirty = settings !== null && selectedTimeZone !== savedTimeZone;

  function getAuthClient(): ISchemaVaultsAuthClient | null {
    if (!auth.ready || !auth.client.current) return null;
    return auth.client.current;
  }

  function save() {
    const authClient = getAuthClient();
    if (!authClient) {
      toast({
        variant: "destructive",
        title: "Auth not ready",
        description: "Auth client is not ready yet — please try again.",
      });
      return;
    }
    startSaveTransition(async () => {
      try {
        const updated = await updateDeploymentSettings(
          { default_time_zone: selectedTimeZone },
          authClient,
          appId,
        );
        setSettings(updated);
        toast({
          title: "Time zone saved",
          description:
            updated.default_time_zone === null
              ? "Admin pages now show times in each viewer's browser time zone."
              : `Admin pages now show times in ${updated.default_time_zone}.`,
        });
        // Re-render the admin layout, which hands the zone to every page.
        router.refresh();
      } catch (e: unknown) {
        console.error("Failed to save the deployment settings: ", e);
        toast({
          variant: "destructive",
          title: "Failed to save the time zone",
          description:
            e instanceof Error
              ? e.message
              : "An unknown error occurred while saving the settings.",
        });
      }
    });
  }

  const effectiveTimeZone = selectedTimeZone ?? myTimeZone;

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
            <Settings className="hidden sm:block h-5 w-5 shrink-0" />
            Settings
          </>
        }
        backHref="/admin"
      />

      <main className="flex flex-col w-full grow">
        <section className="flex flex-col w-full grow gap-4 py-4 px-4 md:px-8 lg:px-16 xl:px-24">
          <p className="text-sm text-muted-foreground">
            Deployment-wide settings, shared by every admin of this mail
            server.
          </p>

          {loadError !== null ? (
            <p className="text-sm text-red-500">{loadError}</p>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Time zone</CardTitle>
              <CardDescription>
                The time zone the admin pages show times in — the email send
                log, API keys, CORS origins, branding uploads and subscribers
                — and that the Email Traffic page groups days, weeks and
                months by. When it is not set, each admin sees times in their
                own browser&apos;s time zone.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Combobox
                  aria-label="Default time zone"
                  options={options}
                  value={selected}
                  onValueChange={(value) =>
                    setSelected(value === "" ? BROWSER_TIME_ZONE_OPTION : value)
                  }
                  placeholder="Not set"
                  searchPlaceholder="Search time zones…"
                  emptyMessage="No matching time zone."
                  disabled={settings === null || isSaving}
                  className="w-full sm:w-80"
                />
                {myTimeZone !== null && selectedTimeZone !== myTimeZone ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelected(myTimeZone)}
                    disabled={settings === null || isSaving}
                  >
                    Use my time zone ({myTimeZone})
                  </Button>
                ) : null}
              </div>

              {now !== null && effectiveTimeZone !== null ? (
                <p className="text-sm text-muted-foreground">
                  {selectedTimeZone === null
                    ? "Your browser's time"
                    : "Time in this zone"}{" "}
                  right now:{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {formatDateTime(now, effectiveTimeZone)}
                  </span>
                </p>
              ) : null}

              <div className="flex flex-row flex-wrap items-center gap-3">
                <Button onClick={save} disabled={!dirty || isSaving}>
                  {isSaving ? "Saving…" : "Save"}
                </Button>
                {/* Formatted after mount: the server cannot know the
                    browser's time zone. */}
                {now !== null && settings?.updated_at != null ? (
                  <span className="text-xs text-muted-foreground">
                    Last changed{" "}
                    {formatDateTime(
                      settings.updated_at,
                      savedTimeZone ?? undefined,
                    )}
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
