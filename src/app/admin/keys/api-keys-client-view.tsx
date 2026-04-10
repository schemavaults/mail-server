"use client";

import { useState, type ReactElement } from "react";
import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Separator,
  useToast,
} from "@schemavaults/ui";
import {
  useAuth,
  type ISchemaVaultsAuthClient,
} from "@schemavaults/auth-react-provider";
import { ArrowLeft, Copy, KeyRound, Trash2 } from "lucide-react";
import Link from "next/link";
import type { ApiKeyRecord } from "@/lib/mail-db/api-keys-table";
import createApiKey, {
  type CreatedApiKey,
} from "@/lib/client-mail-db-actions/createApiKey";
import listApiKeys from "@/lib/client-mail-db-actions/listApiKeys";
import revokeApiKey from "@/lib/client-mail-db-actions/revokeApiKey";

export interface ApiKeysClientViewProps {
  initialApiKeys: readonly ApiKeyRecord[];
}

function formatTimestamp(value: number | null): string {
  if (value === null || value === undefined) return "Never";
  return new Date(value).toLocaleString();
}

export default function ApiKeysClientView({
  initialApiKeys,
}: ApiKeysClientViewProps): ReactElement {
  const { toast } = useToast();
  const auth = useAuth();
  const [apiKeys, setApiKeys] =
    useState<readonly ApiKeyRecord[]>(initialApiKeys);

  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [newKeyName, setNewKeyName] = useState<string>("");
  const [creating, setCreating] = useState<boolean>(false);

  const [revealedKey, setRevealedKey] = useState<CreatedApiKey | null>(null);

  const [revokeTarget, setRevokeTarget] = useState<ApiKeyRecord | null>(null);
  const [revoking, setRevoking] = useState<boolean>(false);

  function getAuthClient(): ISchemaVaultsAuthClient | null {
    if (!auth.ready || !auth.client.current) return null;
    return auth.client.current;
  }

  async function refreshKeys(authClient: ISchemaVaultsAuthClient) {
    try {
      const next = await listApiKeys(authClient);
      setApiKeys(next);
    } catch (e: unknown) {
      console.error("Failed to refresh API keys: ", e);
    }
  }

  async function handleCreate() {
    const name = newKeyName.trim();
    if (name.length < 1) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please give your API key a name before creating it.",
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

    setCreating(true);
    try {
      const created = await createApiKey({ name }, authClient);
      setRevealedKey(created);
      setCreateOpen(false);
      setNewKeyName("");
      await refreshKeys(authClient);
    } catch (e: unknown) {
      console.error("Failed to create API key: ", e);
      toast({
        variant: "destructive",
        title: "Failed to create API key",
        description:
          e instanceof Error ? e.message : "An unknown error has occurred!",
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleConfirmRevoke() {
    if (!revokeTarget) return;
    const authClient = getAuthClient();
    if (!authClient) {
      toast({
        variant: "destructive",
        title: "Auth not ready",
        description: "Auth client is not ready yet — please try again.",
      });
      return;
    }
    setRevoking(true);
    try {
      await revokeApiKey(revokeTarget.api_key_id, authClient);
      toast({
        title: "API key revoked",
        description: `'${revokeTarget.name}' can no longer be used to send email.`,
      });
      setRevokeTarget(null);
      await refreshKeys(authClient);
    } catch (e: unknown) {
      console.error("Failed to revoke API key: ", e);
      toast({
        variant: "destructive",
        title: "Failed to revoke API key",
        description:
          e instanceof Error ? e.message : "An unknown error has occurred!",
      });
    } finally {
      setRevoking(false);
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "The API key has been copied to your clipboard.",
      });
    } catch (e: unknown) {
      console.error("Failed to copy to clipboard: ", e);
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Could not access the clipboard. Copy the value manually.",
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
      <header
        className={cn(
          "h-24",
          "flex items-center justify-between gap-2 md:gap-4",
          "p-2 md:p-4",
          "shadow-md",
        )}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to admin dashboard</span>
          </Link>
          <h2 className="text-xl md:text-2xl text-foreground flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            API Keys
          </h2>
        </div>
        <Button onClick={() => setCreateOpen(true)}>New API Key</Button>
      </header>

      <Separator decorative orientation="horizontal" className="w-full" />

      <main className="flex flex-col w-full grow">
        <section
          className={cn(
            "flex flex-col w-full grow gap-4",
            "py-4 px-4 md:px-8 lg:px-16 xl:px-24",
          )}
        >
          <p className="text-sm text-muted-foreground">
            API keys can be used as bearer tokens against{" "}
            <code className="font-mono">/api/send</code>. The plaintext value is
            shown only once at creation time.
          </p>

          {apiKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active API keys. Click <strong>New API Key</strong> to create
              one.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {apiKeys.map((key) => (
                <li
                  key={key.api_key_id}
                  className={cn(
                    "w-full p-3 md:p-4",
                    "flex flex-col md:flex-row md:items-center gap-2 md:justify-between",
                    "border rounded-md",
                    "bg-card shadow-sm",
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-foreground">
                      {key.name}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {key.key_prefix}…
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {formatTimestamp(key.created_at)} · Last used{" "}
                      {formatTimestamp(key.last_used_at)}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setRevokeTarget(key)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new API key</DialogTitle>
            <DialogDescription>
              Give your key a memorable name so you can identify it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            <Label htmlFor="api-key-name">Name</Label>
            <Input
              id="api-key-name"
              placeholder="e.g. prod cron job"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              maxLength={64}
            />
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setCreateOpen(false);
                setNewKeyName("");
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reveal-once dialog */}
      <Dialog
        open={revealedKey !== null}
        onOpenChange={(open) => {
          if (!open) setRevealedKey(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API key created</DialogTitle>
            <DialogDescription>
              <strong>This is the only time you will see this key.</strong> Copy
              it now and store it somewhere safe — it cannot be retrieved later.
            </DialogDescription>
          </DialogHeader>
          {revealedKey && (
            <div className="space-y-3 mt-2">
              <div>
                <Label>Name</Label>
                <p className="text-sm">{revealedKey.name}</p>
              </div>
              <div>
                <Label htmlFor="revealed-api-key">Key</Label>
                <div className="flex items-stretch gap-2">
                  <Input
                    id="revealed-api-key"
                    readOnly
                    value={revealedKey.plaintext}
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => copyToClipboard(revealedKey.plaintext)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setRevealedKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirmation dialog */}
      <Dialog
        open={revokeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API key?</DialogTitle>
            <DialogDescription>
              Once revoked, this key can no longer be used to send email. This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {revokeTarget && (
            <div className="space-y-1 mt-2">
              <p className="text-sm font-medium">{revokeTarget.name}</p>
              <p className="text-xs font-mono text-muted-foreground">
                {revokeTarget.key_prefix}…
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setRevokeTarget(null)}
              disabled={revoking}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRevoke}
              disabled={revoking}
            >
              {revoking ? "Revoking…" : "Revoke"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
