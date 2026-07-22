"use client";

import { useState, useTransition, type ReactElement } from "react";
import {
  Button,
  cn,
  Input,
  Label,
  Separator,
  useToast,
} from "@schemavaults/ui";
import {
  useAuth,
  type ISchemaVaultsAuthClient,
} from "@schemavaults/auth-react-provider";
import { Globe, Trash2 } from "lucide-react";
import { Nav } from "@/components/Nav";
import type { CorsAllowedOrigin } from "@/lib/mail-db/cors-allowed-origins-table";
import listCorsOrigins from "@/lib/client-mail-db-actions/listCorsOrigins";
import addCorsOrigin from "@/lib/client-mail-db-actions/addCorsOrigin";
import removeCorsOrigin from "@/lib/client-mail-db-actions/removeCorsOrigin";
import { useMailAppId } from "@/contexts/MailAppIdContext";

export interface CorsOriginsClientViewProps {
  initialOrigins: readonly CorsAllowedOrigin[];
}

function formatTimestamp(value: number): string {
  return new Date(value).toLocaleString();
}

interface CorsOriginRowProps {
  origin: CorsAllowedOrigin;
  /** Must never reject — the parent surfaces failures via toast. */
  onRemove: (target: CorsAllowedOrigin) => Promise<void>;
}

/**
 * Each row owns an async transition so pending state is tracked per row and
 * multiple origins can be removed concurrently.
 */
function CorsOriginRow({
  origin,
  onRemove,
}: CorsOriginRowProps): ReactElement {
  const [isRemoving, startRemoveTransition] = useTransition();

  return (
    <li
      className={cn(
        "flex flex-row flex-wrap gap-2",
        "items-center justify-between",
        "rounded-md border p-3",
      )}
    >
      <div className="flex flex-col gap-1">
        <span className="font-mono text-sm">{origin.origin}</span>
        {origin.description ? (
          <span className="text-sm text-muted-foreground">
            {origin.description}
          </span>
        ) : null}
        <span className="text-xs text-muted-foreground">
          Added {formatTimestamp(origin.created_at)}
        </span>
      </div>
      <Button
        variant="destructive"
        onClick={() =>
          startRemoveTransition(async () => {
            await onRemove(origin);
          })
        }
        disabled={isRemoving}
        aria-label={`Remove allowed origin ${origin.origin}`}
      >
        <Trash2 className="h-4 w-4" />
        {isRemoving ? "Removing…" : "Remove"}
      </Button>
    </li>
  );
}

export default function CorsOriginsClientView({
  initialOrigins,
}: CorsOriginsClientViewProps): ReactElement {
  const { toast } = useToast();
  const auth = useAuth();
  const appId = useMailAppId();
  const [origins, setOrigins] =
    useState<readonly CorsAllowedOrigin[]>(initialOrigins);

  const [newOrigin, setNewOrigin] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [isAddingOrigin, startAddOriginTransition] = useTransition();

  function getAuthClient(): ISchemaVaultsAuthClient | null {
    if (!auth.ready || !auth.client.current) return null;
    return auth.client.current;
  }

  async function refreshOrigins(authClient: ISchemaVaultsAuthClient) {
    try {
      const next = await listCorsOrigins(authClient, appId);
      setOrigins(next);
    } catch (e: unknown) {
      console.error("Failed to refresh allowed CORS origins: ", e);
    }
  }

  function handleAdd() {
    const origin = newOrigin.trim();
    if (origin.length < 1) {
      toast({
        variant: "destructive",
        title: "Origin required",
        description:
          "Enter an origin such as https://example.com before adding it.",
      });
      return;
    }
    const authClient = getAuthClient();
    if (!authClient) {
      toast({
        variant: "destructive",
        title: "Auth not ready",
        description: "Auth client is not ready yet — please try again.",
      });
      return;
    }

    // Async transition: isAddingOrigin stays true until this action settles,
    // so no manual pending-state bookkeeping is needed. Errors are caught to
    // surface a toast instead of the nearest error boundary.
    startAddOriginTransition(async () => {
      try {
        const description = newDescription.trim();
        await addCorsOrigin(
          description.length > 0 ? { origin, description } : { origin },
          authClient,
          appId,
        );
        setNewOrigin("");
        setNewDescription("");
        toast({
          title: "Origin allowed",
          description: `Cross-origin requests from ${origin} are now allowed.`,
        });
        await refreshOrigins(authClient);
      } catch (e: unknown) {
        console.error("Failed to add allowed CORS origin: ", e);
        toast({
          variant: "destructive",
          title: "Failed to add origin",
          description:
            e instanceof Error
              ? e.message
              : "An unknown error occurred while adding the origin.",
        });
      }
    });
  }

  // Awaited by each row's remove transition; catches everything so the
  // returned promise never rejects into the row's transition.
  async function handleRemove(target: CorsAllowedOrigin): Promise<void> {
    const authClient = getAuthClient();
    if (!authClient) {
      toast({
        variant: "destructive",
        title: "Auth not ready",
        description: "Auth client is not ready yet — please try again.",
      });
      return;
    }

    try {
      await removeCorsOrigin(target.cors_origin_id, authClient, appId);
      toast({
        title: "Origin removed",
        description: `Cross-origin requests from ${target.origin} are no longer allowed.`,
      });
      await refreshOrigins(authClient);
    } catch (e: unknown) {
      console.error("Failed to remove allowed CORS origin: ", e);
      toast({
        variant: "destructive",
        title: "Failed to remove origin",
        description:
          e instanceof Error
            ? e.message
            : "An unknown error occurred while removing the origin.",
      });
    }
  }

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
            <Globe className="h-5 w-5" />
            Allowed CORS Origins
          </>
        }
        backHref="/admin"
      />

      <main className="flex flex-col w-full grow">
        <section
          className={cn(
            "flex flex-col w-full grow gap-4",
            "py-4 px-4 md:px-8 lg:px-16 xl:px-24",
          )}
        >
          <p className="text-sm text-muted-foreground">
            External websites listed here may make cross-origin requests
            against public API routes such as{" "}
            <code className="font-mono">/api/mailing-lists/join</code>. Enter
            origins exactly as browsers send them in the{" "}
            <code className="font-mono">Origin</code> header —{" "}
            <code className="font-mono">scheme://host[:port]</code> with no
            path or trailing slash.
          </p>

          <div
            className={cn(
              "flex flex-col md:flex-row gap-2",
              "items-stretch md:items-end",
            )}
          >
            <div className="flex flex-col gap-1 grow">
              <Label htmlFor="new-cors-origin">Origin</Label>
              <Input
                id="new-cors-origin"
                placeholder="https://example.com"
                value={newOrigin}
                onChange={(e) => setNewOrigin(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1 grow">
              <Label htmlFor="new-cors-origin-description">
                Description (optional)
              </Label>
              <Input
                id="new-cors-origin-description"
                placeholder="e.g. Marketing site join form"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <Button onClick={handleAdd} disabled={isAddingOrigin}>
              {isAddingOrigin ? "Adding…" : "Allow origin"}
            </Button>
          </div>

          <Separator />

          {origins.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No origins are currently allowed to make cross-origin requests.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {origins.map((origin) => (
                <CorsOriginRow
                  key={origin.cors_origin_id}
                  origin={origin}
                  onRemove={handleRemove}
                />
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
