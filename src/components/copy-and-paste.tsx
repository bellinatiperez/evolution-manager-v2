import { Copy } from "lucide-react";

import { cn } from "@/lib/utils";

import { copyToClipboard } from "@/utils/copy-to-clipboard";

import { Button } from "./ui/button";

export function CopyAndPaste({ value, className }: { value: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 truncate px-2 py-1", className)}>
      <pre className="block truncate text-xs">{value}</pre>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          copyToClipboard(value);
        }}>
        <Copy size="15" />
      </Button>
    </div>
  );
}
