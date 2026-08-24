"use client";

import { useState, useTransition, type ReactElement } from "react";
import {
  Button,
  Checkbox,
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
import {
  AtSign,
  Copy,
  KeyRound,
  Pencil,
  Server,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { ApiKeyRecord } from "@/lib/mail-db/api-keys-table";
import { Nav } from "@/components/Nav";
import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import createApiKey, {
  type CreatedApiKey,
} from "@/lib/client-mail-db-actions/createApiKey";
import listApiKeys from "@/lib/client-mail-db-actions/listApiKeys";
import renameApiKey from "@/lib/client-mail-db-actions/renameApiKey";
import revokeApiKey from "@/lib/client-mail-db-actions/revokeApiKey";
import setApiKeyAllowAnyAudience from "@/lib/client-mail-db-actions/setApiKeyAllowAnyAudience";
import addApiKeyAllowlistEntry from "@/lib/client-mail-db-actions/addApiKeyAllowlistEntry";
import removeApiKeyAllowlistEntry from "@/lib/client-mail-db-actions/removeApiKeyAllowlistEntry";
import getApiKeyAllowlist from "@/lib/client-mail-db-actions/getApiKeyAllowlist";
import {
  addApiKeyScopeEntry,
  getApiKeyScopeEntries,
  removeApiKeyScopeEntry,
} from "@/lib/client-mail-db-actions/apiKeyScopes";
import { apiKeyNameSchema } from "@/lib/api-keys/api-key-name";
import { allowedSenderEntrySchema } from "@/lib/api-keys/sender-scope";
import { useMailAppId } from "@/contexts/MailAppIdContext";
import { z } from "zod";

/**
 * One API key's scope lists. On the sender and transport dimensions an empty
 * list means unrestricted. The audience lists work the other way around: they
 * are the ONLY audience a key can reach unless its `allow_any_audience` flag
 * (on the key record itself) is set, so an empty audience means the key
 * cannot send to anyone.
 */
export interface ApiKeyScopesState {
  mailingLists: string[];
  recipients: string[];
  senders: string[];
  transports: string[];
}

/** One transport this deployment knows about, for the transports dialog. */
export interface TransportOption {
  id: string;
  configured: boolean;
  is_default: boolean;
}

export interface ApiKeysClientViewProps {
  initialApiKeys: readonly ApiKeyRecord[];
  allMailingLists: readonly MailingListDefinition[];
  initialScopesByKeyId: Record<string, ApiKeyScopesState>;
  transportOptions: TransportOption[];
}

const EMPTY_SCOPES: ApiKeyScopesState = {
  mailingLists: [],
  recipients: [],
  senders: [],
  transports: [],
};

const recipientEmailSchema = z.string().trim().toLowerCase().email();

function formatTimestamp(value: number | null): string {
  if (value === null || value === undefined) return "Never";
  return new Date(value).toLocaleString();
}

function describeAudiences(
  key: ApiKeyRecord,
  scopes: ApiKeyScopesState,
): string {
  if (key.allow_any_audience) return "Audience: any recipient";
  const count = scopes.mailingLists.length + scopes.recipients.length;
  if (count === 0) return "Audience: none configured — cannot send";
  if (count === 1) return "Audience: restricted to 1 entry";
  return `Audience: restricted to ${count} entries`;
}

/** True when a key has no way to reach anyone yet. */
function hasNoAudience(key: ApiKeyRecord, scopes: ApiKeyScopesState): boolean {
  return (
    !key.allow_any_audience &&
    scopes.mailingLists.length === 0 &&
    scopes.recipients.length === 0
  );
}

function describeSenders(scopes: ApiKeyScopesState): string {
  const count = scopes.senders.length;
  if (count === 0) return "Senders: unrestricted (any from address)";
  if (count === 1) return "Senders: restricted to 1 entry";
  return `Senders: restricted to ${count} entries`;
}

function describeTransports(scopes: ApiKeyScopesState): string {
  const count = scopes.transports.length;
  if (count === 0) return "Transports: any configured transport";
  return `Transports: ${scopes.transports.join(", ")} only`;
}

export default function ApiKeysClientView({
  initialApiKeys,
  allMailingLists,
  initialScopesByKeyId,
  transportOptions,
}: ApiKeysClientViewProps): ReactElement {
  const { toast } = useToast();
  const auth = useAuth();
  const appId = useMailAppId();
  const [apiKeys, setApiKeys] =
    useState<readonly ApiKeyRecord[]>(initialApiKeys);
  const [scopesByKeyId, setScopesByKeyId] = useState<
    Record<string, ApiKeyScopesState>
  >(initialScopesByKeyId);

  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [newKeyName, setNewKeyName] = useState<string>("");
  const [creating, startCreateTransition] = useTransition();

  const [revealedKey, setRevealedKey] = useState<CreatedApiKey | null>(null);

  const [renameTarget, setRenameTarget] = useState<ApiKeyRecord | null>(null);
  const [renameName, setRenameName] = useState<string>("");
  const [renaming, startRenameTransition] = useTransition();

  const [revokeTarget, setRevokeTarget] = useState<ApiKeyRecord | null>(null);
  const [revoking, startRevokeTransition] = useTransition();

  const [audiencesTarget, setAudiencesTarget] = useState<ApiKeyRecord | null>(
    null,
  );
  const [togglingAudience, startAudienceTransition] = useTransition();
  const [togglingAnyAudience, startAnyAudienceTransition] = useTransition();
  const [newRecipient, setNewRecipient] = useState<string>("");
  const [mutatingRecipient, startRecipientTransition] = useTransition();

  const [sendersTarget, setSendersTarget] = useState<ApiKeyRecord | null>(null);
  const [newSender, setNewSender] = useState<string>("");
  const [mutatingSender, startSenderTransition] = useTransition();

  const [transportsTarget, setTransportsTarget] =
    useState<ApiKeyRecord | null>(null);
  const [togglingTransport, startTransportTransition] = useTransition();

  // The audiences dialog renders the key's live record (the audience switch
  // lives on the row itself) rather than the snapshot captured when it was
  // opened, so a toggle or a background refresh is reflected immediately.
  const audiencesKey: ApiKeyRecord | null =
    audiencesTarget === null
      ? null
      : (apiKeys.find(
          (entry) => entry.api_key_id === audiencesTarget.api_key_id,
        ) ?? audiencesTarget);

  function getAuthClient(): ISchemaVaultsAuthClient | null {
    if (!auth.ready || !auth.client.current) return null;
    return auth.client.current;
  }

  function requireAuthClient(): ISchemaVaultsAuthClient | null {
    const authClient = getAuthClient();
    if (!authClient) {
      toast({
        variant: "destructive",
        title: "Auth not ready",
        description: "Auth client is not ready yet — please try again.",
      });
    }
    return authClient;
  }

  function getScopes(api_key_id: string): ApiKeyScopesState {
    return scopesByKeyId[api_key_id] ?? EMPTY_SCOPES;
  }

  function patchScopes(
    api_key_id: string,
    patch: (current: ApiKeyScopesState) => Partial<ApiKeyScopesState>,
  ) {
    setScopesByKeyId((prev) => {
      const current = prev[api_key_id] ?? EMPTY_SCOPES;
      return {
        ...prev,
        [api_key_id]: { ...current, ...patch(current) },
      };
    });
  }

  async function refreshKeys(authClient: ISchemaVaultsAuthClient) {
    try {
      const next = await listApiKeys(authClient, appId);
      setApiKeys(next);
    } catch (e: unknown) {
      console.error("Failed to refresh API keys: ", e);
    }
  }

  function handleCreate(): void {
    const name = newKeyName.trim();
    if (name.length < 1) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please give your API key a name before creating it.",
      });
      return;
    }
    const authClient = requireAuthClient();
    if (!authClient) return;

    startCreateTransition(async () => {
      try {
        const created = await createApiKey({ name }, authClient, appId);
        setRevealedKey(created);
        setCreateOpen(false);
        setNewKeyName("");
        // New keys start with empty scopes: unrestricted on the sender and
        // transport dimensions, but with no audience at all until an admin
        // configures one.
        setScopesByKeyId((prev) => ({
          ...prev,
          [created.api_key_id]: EMPTY_SCOPES,
        }));
        await refreshKeys(authClient);
      } catch (e: unknown) {
        console.error("Failed to create API key: ", e);
        toast({
          variant: "destructive",
          title: "Failed to create API key",
          description:
            e instanceof Error ? e.message : "An unknown error has occurred!",
        });
      }
    });
  }

  function handleOpenRename(key: ApiKeyRecord): void {
    setRenameTarget(key);
    setRenameName(key.name);
  }

  function handleConfirmRename(): void {
    if (!renameTarget) return;
    const parsed = apiKeyNameSchema.safeParse(renameName);
    if (!parsed.success) {
      toast({
        variant: "destructive",
        title: "Invalid name",
        description:
          parsed.error.issues[0]?.message ??
          "Please give your API key a name between 1 and 64 characters.",
      });
      return;
    }
    const name = parsed.data;
    if (name === renameTarget.name) {
      setRenameTarget(null);
      return;
    }
    const authClient = requireAuthClient();
    if (!authClient) return;
    const target = renameTarget;
    startRenameTransition(async () => {
      try {
        const updated = await renameApiKey(
          target.api_key_id,
          name,
          authClient,
          appId,
        );
        // The key's ID and secret are unchanged — only the label — so patch
        // the row in place rather than re-keying any local state.
        setApiKeys((prev) =>
          prev.map((entry) =>
            entry.api_key_id === updated.api_key_id ? updated : entry,
          ),
        );
        toast({
          title: "API key renamed",
          description: `'${target.name}' is now called '${updated.name}'.`,
        });
        setRenameTarget(null);
        setRenameName("");
      } catch (e: unknown) {
        console.error("Failed to rename API key: ", e);
        toast({
          variant: "destructive",
          title: "Failed to rename API key",
          description:
            e instanceof Error ? e.message : "An unknown error has occurred!",
        });
      }
    });
  }

  function handleConfirmRevoke(): void {
    if (!revokeTarget) return;
    const authClient = requireAuthClient();
    if (!authClient) return;
    startRevokeTransition(async () => {
      try {
        await revokeApiKey(revokeTarget.api_key_id, authClient, appId);
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
      }
    });
  }

  async function handleOpenAudiences(key: ApiKeyRecord) {
    setAudiencesTarget(key);
    setNewRecipient("");
    // Refresh this key's audience scopes from the server in case they have
    // drifted.
    const authClient = getAuthClient();
    if (!authClient) return;
    try {
      const [mailingLists, recipients] = await Promise.all([
        getApiKeyAllowlist(key.api_key_id, authClient, appId),
        getApiKeyScopeEntries(key.api_key_id, "recipients", authClient, appId),
        // Also re-read the key rows, which carry the allow-any-recipient
        // switch shown at the top of this dialog.
        refreshKeys(authClient),
      ]);
      patchScopes(key.api_key_id, () => ({ mailingLists, recipients }));
    } catch (e: unknown) {
      console.error("Failed to refresh audience allowlist: ", e);
    }
  }

  function handleToggleAllowAnyAudience(
    key: ApiKeyRecord,
    nextChecked: boolean,
  ): void {
    const authClient = requireAuthClient();
    if (!authClient) return;
    startAnyAudienceTransition(async () => {
      try {
        const updated = await setApiKeyAllowAnyAudience(
          key.api_key_id,
          nextChecked,
          authClient,
          appId,
        );
        setApiKeys((prev) =>
          prev.map((entry) =>
            entry.api_key_id === updated.api_key_id ? updated : entry,
          ),
        );
        // Keep the open dialog's snapshot in sync with the saved record.
        setAudiencesTarget((current) =>
          current && current.api_key_id === updated.api_key_id
            ? updated
            : current,
        );
      } catch (e: unknown) {
        console.error("Failed to update API key audience access: ", e);
        toast({
          variant: "destructive",
          title: "Failed to update audience access",
          description:
            e instanceof Error ? e.message : "An unknown error has occurred!",
        });
      }
    });
  }

  function handleToggleAudience(
    key: ApiKeyRecord,
    mailingListId: string,
    nextChecked: boolean,
  ): void {
    const authClient = requireAuthClient();
    if (!authClient) return;
    startAudienceTransition(async () => {
      try {
        if (nextChecked) {
          await addApiKeyAllowlistEntry(
            key.api_key_id,
            mailingListId,
            authClient,
            appId,
          );
          patchScopes(key.api_key_id, (current) => ({
            mailingLists: current.mailingLists.includes(mailingListId)
              ? current.mailingLists
              : [...current.mailingLists, mailingListId],
          }));
        } else {
          await removeApiKeyAllowlistEntry(
            key.api_key_id,
            mailingListId,
            authClient,
            appId,
          );
          patchScopes(key.api_key_id, (current) => ({
            mailingLists: current.mailingLists.filter(
              (id) => id !== mailingListId,
            ),
          }));
        }
      } catch (e: unknown) {
        console.error("Failed to update API key allowlist: ", e);
        toast({
          variant: "destructive",
          title: "Failed to update audience",
          description:
            e instanceof Error ? e.message : "An unknown error has occurred!",
        });
      }
    });
  }

  function handleAddRecipient(key: ApiKeyRecord): void {
    const parsed = recipientEmailSchema.safeParse(newRecipient);
    if (!parsed.success) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Enter a valid recipient email address.",
      });
      return;
    }
    const email = parsed.data;
    const authClient = requireAuthClient();
    if (!authClient) return;
    startRecipientTransition(async () => {
      try {
        await addApiKeyScopeEntry(
          key.api_key_id,
          "recipients",
          email,
          authClient,
          appId,
        );
        patchScopes(key.api_key_id, (current) => ({
          recipients: current.recipients.includes(email)
            ? current.recipients
            : [...current.recipients, email],
        }));
        setNewRecipient("");
      } catch (e: unknown) {
        console.error("Failed to add allowed recipient: ", e);
        toast({
          variant: "destructive",
          title: "Failed to add recipient",
          description:
            e instanceof Error ? e.message : "An unknown error has occurred!",
        });
      }
    });
  }

  function handleRemoveRecipient(key: ApiKeyRecord, email: string): void {
    const authClient = requireAuthClient();
    if (!authClient) return;
    startRecipientTransition(async () => {
      try {
        await removeApiKeyScopeEntry(
          key.api_key_id,
          "recipients",
          email,
          authClient,
          appId,
        );
        patchScopes(key.api_key_id, (current) => ({
          recipients: current.recipients.filter((entry) => entry !== email),
        }));
      } catch (e: unknown) {
        console.error("Failed to remove allowed recipient: ", e);
        toast({
          variant: "destructive",
          title: "Failed to remove recipient",
          description:
            e instanceof Error ? e.message : "An unknown error has occurred!",
        });
      }
    });
  }

  async function handleOpenSenders(key: ApiKeyRecord) {
    setSendersTarget(key);
    setNewSender("");
    const authClient = getAuthClient();
    if (!authClient) return;
    try {
      const senders = await getApiKeyScopeEntries(
        key.api_key_id,
        "senders",
        authClient,
        appId,
      );
      patchScopes(key.api_key_id, () => ({ senders }));
    } catch (e: unknown) {
      console.error("Failed to refresh allowed senders: ", e);
    }
  }

  function handleAddSender(key: ApiKeyRecord): void {
    const parsed = allowedSenderEntrySchema.safeParse(newSender);
    if (!parsed.success) {
      toast({
        variant: "destructive",
        title: "Invalid sender entry",
        description:
          "Enter an email address (claude@example.com) or a domain wildcard (*@example.com).",
      });
      return;
    }
    const sender = parsed.data;
    const authClient = requireAuthClient();
    if (!authClient) return;
    startSenderTransition(async () => {
      try {
        await addApiKeyScopeEntry(
          key.api_key_id,
          "senders",
          sender,
          authClient,
          appId,
        );
        patchScopes(key.api_key_id, (current) => ({
          senders: current.senders.includes(sender)
            ? current.senders
            : [...current.senders, sender],
        }));
        setNewSender("");
      } catch (e: unknown) {
        console.error("Failed to add allowed sender: ", e);
        toast({
          variant: "destructive",
          title: "Failed to add sender",
          description:
            e instanceof Error ? e.message : "An unknown error has occurred!",
        });
      }
    });
  }

  function handleRemoveSender(key: ApiKeyRecord, sender: string): void {
    const authClient = requireAuthClient();
    if (!authClient) return;
    startSenderTransition(async () => {
      try {
        await removeApiKeyScopeEntry(
          key.api_key_id,
          "senders",
          sender,
          authClient,
          appId,
        );
        patchScopes(key.api_key_id, (current) => ({
          senders: current.senders.filter((entry) => entry !== sender),
        }));
      } catch (e: unknown) {
        console.error("Failed to remove allowed sender: ", e);
        toast({
          variant: "destructive",
          title: "Failed to remove sender",
          description:
            e instanceof Error ? e.message : "An unknown error has occurred!",
        });
      }
    });
  }

  async function handleOpenTransports(key: ApiKeyRecord) {
    setTransportsTarget(key);
    const authClient = getAuthClient();
    if (!authClient) return;
    try {
      const transports = await getApiKeyScopeEntries(
        key.api_key_id,
        "transports",
        authClient,
        appId,
      );
      patchScopes(key.api_key_id, () => ({ transports }));
    } catch (e: unknown) {
      console.error("Failed to refresh allowed transports: ", e);
    }
  }

  function handleToggleTransport(
    key: ApiKeyRecord,
    transportId: string,
    nextChecked: boolean,
  ): void {
    const authClient = requireAuthClient();
    if (!authClient) return;
    startTransportTransition(async () => {
      try {
        if (nextChecked) {
          await addApiKeyScopeEntry(
            key.api_key_id,
            "transports",
            transportId,
            authClient,
            appId,
          );
          patchScopes(key.api_key_id, (current) => ({
            transports: current.transports.includes(transportId)
              ? current.transports
              : [...current.transports, transportId],
          }));
        } else {
          await removeApiKeyScopeEntry(
            key.api_key_id,
            "transports",
            transportId,
            authClient,
            appId,
          );
          patchScopes(key.api_key_id, (current) => ({
            transports: current.transports.filter((id) => id !== transportId),
          }));
        }
      } catch (e: unknown) {
        console.error("Failed to update allowed transports: ", e);
        toast({
          variant: "destructive",
          title: "Failed to update transports",
          description:
            e instanceof Error ? e.message : "An unknown error has occurred!",
        });
      }
    });
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
      <Nav
        title={
          <>
            <KeyRound className="h-5 w-5" />
            API Keys
          </>
        }
        backHref="/admin"
      >
        <Button onClick={() => setCreateOpen(true)}>New API Key</Button>
      </Nav>

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
            shown only once at creation time. Each key is scoped on three
            independent dimensions — <strong>audiences</strong> (mailing lists
            and individual recipients), <strong>senders</strong> (allowed from
            addresses), and <strong>transports</strong>. Senders and transports
            are unrestricted with no entries configured. Audiences are not: a
            key reaches only its allowlisted audience entries — nobody at all
            until one is configured — unless it is explicitly granted access to
            any recipient.
          </p>

          {apiKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active API keys. Click <strong>New API Key</strong> to create
              one.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {apiKeys.map((key) => {
                const scopes = getScopes(key.api_key_id);
                const restricted =
                  scopes.mailingLists.length > 0 ||
                  scopes.recipients.length > 0 ||
                  scopes.senders.length > 0 ||
                  scopes.transports.length > 0 ||
                  !key.allow_any_audience;
                const noAudience = hasNoAudience(key, scopes);
                return (
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
                      <p
                        className={cn(
                          "text-xs",
                          restricted
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {describeAudiences(key, scopes)} ·{" "}
                        {describeSenders(scopes)} · {describeTransports(scopes)}
                      </p>
                      {noAudience && (
                        <p className="text-xs text-destructive">
                          This key cannot send to anyone yet. Use{" "}
                          <strong>Audiences</strong> to allowlist a mailing
                          list or recipient, or to allow any recipient.
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenRename(key)}
                        className="flex items-center gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Rename
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenAudiences(key)}
                        className="flex items-center gap-2"
                      >
                        <Users className="h-4 w-4" />
                        Audiences
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenSenders(key)}
                        className="flex items-center gap-2"
                      >
                        <AtSign className="h-4 w-4" />
                        Senders
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenTransports(key)}
                        className="flex items-center gap-2"
                      >
                        <Server className="h-4 w-4" />
                        Transports
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setRevokeTarget(key)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Revoke
                      </Button>
                    </div>
                  </li>
                );
              })}
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
          <p className="text-xs text-muted-foreground">
            This key cannot send to anyone yet — new keys start with no
            audience. Open <strong>Audiences</strong> to allowlist the mailing
            lists and recipients it may reach, or to allow it to send to any
            recipient.
          </p>
          <DialogFooter>
            <Button onClick={() => setRevealedKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRenameTarget(null);
            setRenameName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename API key</DialogTitle>
            <DialogDescription>
              Only the key&apos;s label changes — its ID, secret and scopes
              stay the same, so anything already using this key keeps working.
            </DialogDescription>
          </DialogHeader>
          {renameTarget && (
            <div className="space-y-3 mt-2">
              <p className="text-xs font-mono text-muted-foreground">
                {renameTarget.key_prefix}…
              </p>
              <div className="space-y-2">
                <Label htmlFor="rename-api-key-name">Name</Label>
                <Input
                  id="rename-api-key-name"
                  placeholder="e.g. prod cron job"
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  maxLength={64}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !renaming) handleConfirmRename();
                  }}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setRenameTarget(null);
                setRenameName("");
              }}
              disabled={renaming}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmRename} disabled={renaming}>
              {renaming ? "Saving…" : "Save"}
            </Button>
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

      {/* Manage audiences dialog */}
      <Dialog
        open={audiencesKey !== null}
        onOpenChange={(open) => {
          if (!open) setAudiencesTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage audiences</DialogTitle>
            <DialogDescription>
              Select the mailing lists and individual recipients this API key
              is permitted to send to. Mailing lists and individual recipients
              form one combined allowlist, and a key with an empty allowlist
              may not send to anyone — sending to arbitrary addresses requires
              explicitly allowing any recipient below. Allowlisted keys may
              only cc/bcc allowlisted individual recipients.
            </DialogDescription>
          </DialogHeader>
          {audiencesKey && (
            <div className="space-y-3 mt-2">
              <div>
                <p className="text-sm font-medium">{audiencesKey.name}</p>
                <p className="text-xs font-mono text-muted-foreground">
                  {audiencesKey.key_prefix}…
                </p>
              </div>
              <Separator decorative orientation="horizontal" className="w-full" />
              <div className="flex items-start gap-3 p-2 rounded-md border">
                <Checkbox
                  id="audience-allow-any"
                  checked={audiencesKey.allow_any_audience}
                  disabled={togglingAnyAudience}
                  onCheckedChange={(value) =>
                    handleToggleAllowAnyAudience(audiencesKey, value === true)
                  }
                />
                <Label
                  htmlFor="audience-allow-any"
                  className="flex flex-col gap-0.5 cursor-pointer"
                >
                  <span className="text-sm font-medium">
                    Allow sending to any recipient
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Lets this key send to any address or mailing list. The
                    allowlists below are ignored while this is on.
                  </span>
                </Label>
              </div>
              {hasNoAudience(
                audiencesKey,
                getScopes(audiencesKey.api_key_id),
              ) && (
                <p className="text-xs text-destructive">
                  This key currently has no audience, so every send it attempts
                  is rejected.
                </p>
              )}
              <Separator decorative orientation="horizontal" className="w-full" />
              <p className="text-sm font-medium">Mailing lists</p>
              {allMailingLists.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No mailing lists exist yet. Create one before scoping keys.
                </p>
              ) : (
                <ul className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {allMailingLists.map((list) => {
                    const scopes = getScopes(audiencesKey.api_key_id);
                    const checked = scopes.mailingLists.includes(
                      list.mailing_list_id,
                    );
                    return (
                      <li
                        key={list.mailing_list_id}
                        className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50"
                      >
                        <Checkbox
                          id={`audience-${list.mailing_list_id}`}
                          checked={checked}
                          disabled={togglingAudience}
                          onCheckedChange={(value) =>
                            handleToggleAudience(
                              audiencesKey,
                              list.mailing_list_id,
                              value === true,
                            )
                          }
                        />
                        <Label
                          htmlFor={`audience-${list.mailing_list_id}`}
                          className="flex flex-col gap-0.5 cursor-pointer"
                        >
                          <span className="text-sm font-medium">
                            {list.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {list.description}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {list.mailing_list_id}
                          </span>
                        </Label>
                      </li>
                    );
                  })}
                </ul>
              )}
              <Separator decorative orientation="horizontal" className="w-full" />
              <p className="text-sm font-medium">Individual recipients</p>
              <div className="flex items-stretch gap-2">
                <Input
                  placeholder="recipient@example.com"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddRecipient(audiencesKey);
                    }
                  }}
                  disabled={mutatingRecipient}
                />
                <Button
                  variant="secondary"
                  onClick={() => handleAddRecipient(audiencesKey)}
                  disabled={mutatingRecipient}
                >
                  Add
                </Button>
              </div>
              {getScopes(audiencesKey.api_key_id).recipients.length ===
              0 ? (
                <p className="text-xs text-muted-foreground">
                  No individual recipients allowlisted for this key.
                </p>
              ) : (
                <ul className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                  {getScopes(audiencesKey.api_key_id).recipients.map(
                    (email) => (
                      <li
                        key={email}
                        className="flex items-center justify-between gap-2 p-1.5 rounded-md hover:bg-muted/50"
                      >
                        <span className="text-sm font-mono">{email}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveRecipient(audiencesKey, email)
                          }
                          disabled={mutatingRecipient}
                          aria-label={`Remove ${email}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setAudiencesTarget(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage senders dialog */}
      <Dialog
        open={sendersTarget !== null}
        onOpenChange={(open) => {
          if (!open) setSendersTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage allowed senders</DialogTitle>
            <DialogDescription>
              Restrict which from addresses this API key may send as. Entries
              are exact email addresses (claude@example.com) or domain
              wildcards (*@example.com). Restricted keys must also use an
              allowed address as reply-to. Leave empty to allow any sender.
            </DialogDescription>
          </DialogHeader>
          {sendersTarget && (
            <div className="space-y-3 mt-2">
              <div>
                <p className="text-sm font-medium">{sendersTarget.name}</p>
                <p className="text-xs font-mono text-muted-foreground">
                  {sendersTarget.key_prefix}…
                </p>
              </div>
              <Separator decorative orientation="horizontal" className="w-full" />
              <div className="flex items-stretch gap-2">
                <Input
                  placeholder="claude@example.com or *@example.com"
                  value={newSender}
                  onChange={(e) => setNewSender(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSender(sendersTarget);
                    }
                  }}
                  disabled={mutatingSender}
                />
                <Button
                  variant="secondary"
                  onClick={() => handleAddSender(sendersTarget)}
                  disabled={mutatingSender}
                >
                  Add
                </Button>
              </div>
              {getScopes(sendersTarget.api_key_id).senders.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No sender restrictions — this key may send from any address.
                </p>
              ) : (
                <ul className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                  {getScopes(sendersTarget.api_key_id).senders.map(
                    (sender) => (
                      <li
                        key={sender}
                        className="flex items-center justify-between gap-2 p-1.5 rounded-md hover:bg-muted/50"
                      >
                        <span className="text-sm font-mono">{sender}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveSender(sendersTarget, sender)
                          }
                          disabled={mutatingSender}
                          aria-label={`Remove ${sender}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSendersTarget(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage transports dialog */}
      <Dialog
        open={transportsTarget !== null}
        onOpenChange={(open) => {
          if (!open) setTransportsTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage allowed transports</DialogTitle>
            <DialogDescription>
              Restrict which mail transports this API key may deliver through.
              Leave all unchecked to allow any configured transport. Requests
              that omit the transport property use the deployment default —
              which must be allowed for a restricted key.
            </DialogDescription>
          </DialogHeader>
          {transportsTarget && (
            <div className="space-y-3 mt-2">
              <div>
                <p className="text-sm font-medium">{transportsTarget.name}</p>
                <p className="text-xs font-mono text-muted-foreground">
                  {transportsTarget.key_prefix}…
                </p>
              </div>
              <Separator decorative orientation="horizontal" className="w-full" />
              <ul className="flex flex-col gap-2">
                {transportOptions.map((transport) => {
                  const scopes = getScopes(transportsTarget.api_key_id);
                  const checked = scopes.transports.includes(transport.id);
                  return (
                    <li
                      key={transport.id}
                      className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50"
                    >
                      <Checkbox
                        id={`transport-${transport.id}`}
                        checked={checked}
                        disabled={togglingTransport}
                        onCheckedChange={(value) =>
                          handleToggleTransport(
                            transportsTarget,
                            transport.id,
                            value === true,
                          )
                        }
                      />
                      <Label
                        htmlFor={`transport-${transport.id}`}
                        className="flex flex-col gap-0.5 cursor-pointer"
                      >
                        <span className="text-sm font-medium font-mono">
                          {transport.id}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {transport.configured
                            ? "Configured on this deployment"
                            : "Not configured on this deployment"}
                          {transport.is_default ? " · default transport" : ""}
                        </span>
                      </Label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setTransportsTarget(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
