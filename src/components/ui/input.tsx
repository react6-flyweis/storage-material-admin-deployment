import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, onFocus, ...props }: React.ComponentProps<"input">) {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (type === "number") {
      if (e.target.value === "0") {
        e.target.value = "";
        // Dispatch synthetic input/change event so React and form libraries update state
        e.target.dispatchEvent(new Event("input", { bubbles: true }));
        e.target.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    onFocus?.(e);
  };

  return (
    <input
      type={type}
      data-slot="input"
      onFocus={handleFocus}
      className={cn(
        "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 h-9 rounded-md border bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] file:h-7 file:text-sm file:font-medium focus-visible:ring-[3px] aria-invalid:ring-[3px] md:text-sm file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
