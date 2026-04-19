"use client";

import { cn, Separator } from "@schemavaults/ui";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useState, type ReactElement } from "react";

export interface TemplatesBrowserClientProps {
  templateIds: string[];
}

export default function TemplatesBrowserClient({
  templateIds,
}: TemplatesBrowserClientProps): ReactElement {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );

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
          "flex items-center justify-start gap-2 md:gap-4",
          "p-2 md:p-4",
          "shadow-md",
        )}
      >
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back to Admin</span>
        </Link>
        <h2 className="text-xl md:text-2xl text-foreground">
          Mail Templates
        </h2>
      </header>
      <Separator decorative orientation="horizontal" className="w-full" />
      <main className="flex flex-col md:flex-row justify-start items-stretch w-full grow flex-nowrap">
        <aside
          className={cn(
            "flex flex-col gap-2",
            "p-4",
            "md:w-72 md:shrink-0",
            "border-b md:border-b-0 md:border-r",
          )}
        >
          <p className="text-sm text-muted-foreground mb-2">
            {templateIds.length} template{templateIds.length !== 1 ? "s" : ""}
          </p>
          {templateIds.map((id) => (
            <button
              key={id}
              onClick={() => setSelectedTemplateId(id)}
              className={cn(
                "w-full p-3",
                "flex items-center gap-2",
                "border rounded-md",
                "text-left text-sm font-medium",
                "transition-colors",
                selectedTemplateId === id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-accent text-foreground shadow-sm",
              )}
            >
              <Mail className="h-4 w-4 shrink-0" />
              {id}
            </button>
          ))}
        </aside>
        <section className="flex flex-col grow items-stretch p-4 min-h-0">
          {selectedTemplateId ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-foreground">
                  {selectedTemplateId}
                </h3>
              </div>
              <iframe
                key={selectedTemplateId}
                src={`/api/admin/templates/preview?template_id=${encodeURIComponent(selectedTemplateId)}`}
                className="w-full grow border rounded-md bg-white"
                title={`Preview of ${selectedTemplateId}`}
                sandbox="allow-scripts allow-same-origin"
                style={{ minHeight: "500px" }}
              />
            </>
          ) : (
            <div className="flex grow items-center justify-center">
              <p className="text-muted-foreground text-sm">
                Select a template to preview
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
