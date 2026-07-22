"use client";

import { useState, useTransition, type ReactElement } from "react";
import { Button, cn, Input, Label, Separator, useToast } from "@schemavaults/ui";
import {
  useAuth,
  type ISchemaVaultsAuthClient,
} from "@schemavaults/auth-react-provider";
import { Palette, Trash2, UploadCloud } from "lucide-react";
import { Nav } from "@/components/Nav";
import {
  BRANDING_ASSET_KINDS,
  MAX_BRANDING_ASSET_BYTES,
  type BrandingAssetKind,
  type BrandingAssetMetadata,
} from "@/lib/mail-db/branding-assets-table";
import uploadBrandingAsset from "@/lib/client-mail-db-actions/uploadBrandingAsset";
import removeBrandingAsset from "@/lib/client-mail-db-actions/removeBrandingAsset";
import { useMailAppId } from "@/contexts/MailAppIdContext";

export interface BrandingClientViewProps {
  initialAssets: readonly BrandingAssetMetadata[];
}

const ASSET_KIND_DETAILS: Record<
  BrandingAssetKind,
  { title: string; description: string; previewClassName: string }
> = {
  logo: {
    title: "Logo",
    description:
      "Shown in the public page footer next to the wordmark. A square image of at least 96×96px is recommended.",
    previewClassName: "h-16 w-16",
  },
  favicon: {
    title: "Favicon",
    description:
      "Shown in browser tabs and bookmarks. A square PNG or ICO of 32×32px or larger is recommended.",
    previewClassName: "h-8 w-8",
  },
};

interface BrandingAssetCardProps {
  asset_kind: BrandingAssetKind;
  /** Present when a custom asset has been uploaded for this kind. */
  metadata: BrandingAssetMetadata | null;
  /** Must never reject — the parent surfaces failures via toast. */
  onUpload: (
    asset_kind: BrandingAssetKind,
    file: File,
  ) => Promise<BrandingAssetMetadata | null>;
  /** Must never reject — the parent surfaces failures via toast. */
  onRemove: (asset_kind: BrandingAssetKind) => Promise<boolean>;
}

/**
 * Each card owns its own transition + file input so the logo and favicon can
 * be managed independently.
 */
function BrandingAssetCard({
  asset_kind,
  metadata,
  onUpload,
  onRemove,
}: BrandingAssetCardProps): ReactElement {
  const details = ASSET_KIND_DETAILS[asset_kind];
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Bumped to remount the file input (clearing its selection) after a
  // successful upload or removal.
  const [fileInputKey, setFileInputKey] = useState<number>(0);
  const [isBusy, startTransition] = useTransition();
  // Bumped after every successful change to bust the browser's cache of the
  // (otherwise cacheable) asset URL.
  const [previewVersion, setPreviewVersion] = useState<number>(
    metadata?.updated_at ?? 0,
  );

  const previewSrc = `/api/branding/${asset_kind}?v=${previewVersion}`;

  function handleUpload() {
    if (!selectedFile) {
      return;
    }
    const file = selectedFile;
    startTransition(async () => {
      const uploaded = await onUpload(asset_kind, file);
      if (uploaded) {
        setSelectedFile(null);
        setFileInputKey((prev) => prev + 1);
        setPreviewVersion(uploaded.updated_at);
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const removed = await onRemove(asset_kind);
      if (removed) {
        setSelectedFile(null);
        setFileInputKey((prev) => prev + 1);
        setPreviewVersion(Date.now());
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-md border p-4">
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">{details.title}</h3>
          <p className="text-sm text-muted-foreground">{details.description}</p>
          <span className="text-xs text-muted-foreground">
            {metadata
              ? `Custom ${details.title.toLowerCase()} uploaded ${new Date(metadata.updated_at).toLocaleString()}`
              : `Using the bundled default ${details.title.toLowerCase()}.`}
          </span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- dynamic
            admin-uploaded asset served by our own API route; next/image
            optimization adds nothing here */}
        <img
          key={previewSrc}
          src={previewSrc}
          alt={`Current ${details.title.toLowerCase()}`}
          className={cn(details.previewClassName, "shrink-0 object-contain")}
        />
      </div>

      <div
        className={cn(
          "flex flex-col md:flex-row gap-2",
          "items-stretch md:items-end",
        )}
      >
        <div className="flex flex-col gap-1 grow">
          <Label htmlFor={`branding-${asset_kind}-file`}>
            New {details.title.toLowerCase()} image
          </Label>
          <Input
            key={fileInputKey}
            id={`branding-${asset_kind}-file`}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,.ico"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <Button onClick={handleUpload} disabled={isBusy || !selectedFile}>
          <UploadCloud className="h-4 w-4" />
          {isBusy ? "Working…" : "Upload"}
        </Button>
        <Button
          variant="destructive"
          onClick={handleRemove}
          disabled={isBusy || !metadata}
          aria-label={`Remove custom ${details.title.toLowerCase()}`}
        >
          <Trash2 className="h-4 w-4" />
          Remove
        </Button>
      </div>
    </div>
  );
}

export default function BrandingClientView({
  initialAssets,
}: BrandingClientViewProps): ReactElement {
  const { toast } = useToast();
  const auth = useAuth();
  const appId = useMailAppId();
  const [assets, setAssets] = useState<
    Partial<Record<BrandingAssetKind, BrandingAssetMetadata>>
  >(() =>
    Object.fromEntries(
      initialAssets.map((asset) => [asset.asset_kind, asset]),
    ),
  );

  function getAuthClient(): ISchemaVaultsAuthClient | null {
    if (!auth.ready || !auth.client.current) return null;
    return auth.client.current;
  }

  function toastAuthNotReady() {
    toast({
      variant: "destructive",
      title: "Auth not ready",
      description: "Auth client is not ready yet — please try again.",
    });
  }

  // Awaited by each card's transition; catches everything so the returned
  // promise never rejects into the card's transition.
  async function handleUpload(
    asset_kind: BrandingAssetKind,
    file: File,
  ): Promise<BrandingAssetMetadata | null> {
    const authClient = getAuthClient();
    if (!authClient) {
      toastAuthNotReady();
      return null;
    }
    if (file.size > MAX_BRANDING_ASSET_BYTES) {
      toast({
        variant: "destructive",
        title: "Image too large",
        description: `Choose an image of ${Math.floor(MAX_BRANDING_ASSET_BYTES / 1024)}KB or less.`,
      });
      return null;
    }

    try {
      const uploaded = await uploadBrandingAsset(
        { asset_kind, file },
        authClient,
        appId,
      );
      setAssets((prev) => ({ ...prev, [asset_kind]: uploaded }));
      toast({
        title: "Asset uploaded",
        description: `Your custom ${asset_kind} is now live.`,
      });
      return uploaded;
    } catch (e: unknown) {
      console.error(`Failed to upload custom ${asset_kind}: `, e);
      toast({
        variant: "destructive",
        title: `Failed to upload ${asset_kind}`,
        description:
          e instanceof Error
            ? e.message
            : "An unknown error occurred while uploading the image.",
      });
      return null;
    }
  }

  // Awaited by each card's transition; catches everything so the returned
  // promise never rejects into the card's transition.
  async function handleRemove(asset_kind: BrandingAssetKind): Promise<boolean> {
    const authClient = getAuthClient();
    if (!authClient) {
      toastAuthNotReady();
      return false;
    }

    try {
      await removeBrandingAsset(asset_kind, authClient, appId);
      setAssets((prev) => {
        const next = { ...prev };
        delete next[asset_kind];
        return next;
      });
      toast({
        title: "Asset removed",
        description: `The default ${asset_kind} will be used from now on.`,
      });
      return true;
    } catch (e: unknown) {
      console.error(`Failed to remove custom ${asset_kind}: `, e);
      toast({
        variant: "destructive",
        title: `Failed to remove ${asset_kind}`,
        description:
          e instanceof Error
            ? e.message
            : "An unknown error occurred while removing the image.",
      });
      return false;
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
            <Palette className="h-5 w-5" />
            Branding
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
            Upload a custom logo and favicon to white-label this mail server.
            Uploaded images take effect immediately across the public pages;
            removing an upload reverts to the bundled default. Brand name,
            colors, and URLs are configured via <code>BRAND_*</code>{" "}
            environment variables.
          </p>

          <Separator />

          <div className="flex flex-col gap-4">
            {BRANDING_ASSET_KINDS.map((asset_kind) => (
              <BrandingAssetCard
                key={asset_kind}
                asset_kind={asset_kind}
                metadata={assets[asset_kind] ?? null}
                onUpload={handleUpload}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
