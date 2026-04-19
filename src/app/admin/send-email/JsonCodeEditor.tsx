"use client";

import { useMemo, type ReactElement } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import { cn } from "@schemavaults/ui";

export interface JsonCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  id?: string;
  minHeight?: string;
  className?: string;
}

export default function JsonCodeEditor({
  value,
  onChange,
  onBlur,
  id,
  minHeight = "9rem",
  className,
}: JsonCodeEditorProps): ReactElement {
  const extensions = useMemo(
    () => [
      json(),
      linter(jsonParseLinter()),
      lintGutter(),
      EditorView.lineWrapping,
    ],
    [],
  );

  return (
    <div
      id={id}
      className={cn(
        "w-full rounded-md border border-input bg-background",
        "font-mono text-sm overflow-hidden",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        className,
      )}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        extensions={extensions}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
        }}
        minHeight={minHeight}
      />
    </div>
  );
}
