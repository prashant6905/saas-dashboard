"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Search,
  X,
  CornerDownLeft,
  ArrowUpDown,
  Command as CommandIcon,
} from "lucide-react";
import { useCommandPalette } from "./command-palette-context";
import {
  getAvailableCommands,
  groupCommands,
} from "@/lib/commands/registry";
import { searchCommands } from "@/lib/commands/fuzzy-search";
import { useAuthorization } from "@/lib/auth/use-authorization";
import type { CommandItem, CommandContext } from "@/types/commands";

export function CommandPalette() {
  const { isOpen, close, setIsOpen } = useCommandPalette();
  const { can } = useAuthorization();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // 1. Filter commands against active user permissions (e.g. Viewer cannot see Settings or Export)
  const availableCommands = React.useMemo(() => {
    return getAvailableCommands(can);
  }, [can]);

  // 2. Filter commands against search query
  const filteredCommands = React.useMemo(() => {
    return searchCommands(availableCommands, query);
  }, [availableCommands, query]);

  // 3. Group filtered commands
  const grouped = React.useMemo(() => {
    return groupCommands(filteredCommands);
  }, [filteredCommands]);

  // Synchronize state when dialog opens without cascading effect renders
  const [prevIsOpen, setPrevIsOpen] = React.useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }

  // Focus input on open
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Scroll active item into view
  React.useEffect(() => {
    if (!listRef.current) return;
    const activeItem = listRef.current.querySelector<HTMLElement>(
      `[data-command-index="${selectedIndex}"]`
    );
    if (activeItem) {
      activeItem.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // Execution handler
  const executeCommand = React.useCallback(
    async (cmd: CommandItem) => {
      close();
      const context: CommandContext = {
        navigate: (href: string) => {
          router.push(href);
        },
        theme,
        setTheme,
        pathname,
      };

      try {
        await cmd.perform(context);
      } catch (err) {
        console.error("Command execution error:", err);
      }
    },
    [close, router, theme, setTheme, pathname]
  );

  // Keyboard navigation within dialog
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        setSelectedIndex((prev) =>
          prev === 0 ? filteredCommands.length - 1 : prev - 1
        );
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        executeCommand(selected);
      }
    }
  };

  // Pre-calculate flattened index map for visual grouping
  let globalItemIndex = 0;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200 dark:bg-black/75 dark:backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-describedby="command-palette-desc"
          className="fixed left-1/2 top-[18%] z-50 w-full max-w-xl -translate-x-1/2 rounded-3xl border border-border/70 bg-card p-0 shadow-soft-lg backdrop-blur-2xl transition-all duration-200 animate-in fade-in-0 zoom-in-95 overflow-hidden"
        >
          <div className="sr-only">
            <DialogPrimitive.Title>Global Command Palette</DialogPrimitive.Title>
            <DialogPrimitive.Description id="command-palette-desc">
              Search and execute global application commands and navigation shortcuts.
            </DialogPrimitive.Description>
          </div>

          {/* Search Header */}
          <div className="flex items-center border-b border-border/50 px-4 py-3 bg-muted/10">
            <Search className="mr-3 h-4 w-4 shrink-0 text-nav-icon" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={isOpen}
              aria-controls="command-listbox"
              aria-autocomplete="list"
              aria-activedescendant={
                filteredCommands[selectedIndex]
                  ? `command-option-${filteredCommands[selectedIndex].id}`
                  : undefined
              }
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search platform..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedIndex(0);
                  inputRef.current?.focus();
                }}
                className="rounded p-1 text-nav-icon hover:text-foreground"
                aria-label="Clear query"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border/80 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-[10px]">ESC</span>
              </kbd>
            )}
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            id="command-listbox"
            role="listbox"
            aria-label="Commands"
            className="max-h-[330px] overflow-y-auto p-2"
          >
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <CommandIcon className="mx-auto mb-2 h-6 w-6 text-nav-icon/60" />
                <p>No matching commands found for &ldquo;{query}&rdquo;.</p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">
                  Try searching for &ldquo;dashboard&rdquo;, &ldquo;export&rdquo;, or &ldquo;theme&rdquo;.
                </p>
              </div>
            ) : (
              (["Navigation", "Actions"] as const).map((groupName) => {
                const items = grouped[groupName];
                if (!items || items.length === 0) return null;

                return (
                  <div key={groupName} className="mb-2 last:mb-0">
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-nav-section-title">
                      {groupName}
                    </div>
                    <div className="space-y-0.5">
                      {items.map((cmd) => {
                        const currentIndex = globalItemIndex++;
                        const isSelected = currentIndex === selectedIndex;
                        const Icon = cmd.icon;

                        return (
                          <div
                            key={cmd.id}
                            role="option"
                            id={`command-option-${cmd.id}`}
                            aria-selected={isSelected}
                            data-command-index={currentIndex}
                            onClick={() => executeCommand(cmd)}
                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                            className={`flex cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-colors ${
                              isSelected
                                ? "bg-nav-active-bg text-nav-text-active font-medium border border-nav-active-border"
                                : "text-foreground hover:bg-muted/40 border border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                                  isSelected
                                    ? "bg-primary/20 text-primary dark:text-indigo-300"
                                    : "bg-muted text-nav-icon"
                                }`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <span className="truncate">{cmd.title}</span>
                                {cmd.description && (
                                  <span className="truncate text-[10px] text-muted-foreground">
                                    {cmd.description}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 pl-2">
                              {cmd.shortcut && (
                                <div className="flex items-center gap-0.5">
                                  {cmd.shortcut.map((key, i) => (
                                    <kbd
                                      key={i}
                                      className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-border/80 bg-card px-1 font-mono text-[9px] font-semibold text-muted-foreground shadow-2xs"
                                    >
                                      {key}
                                    </kbd>
                                  ))}
                                </div>
                              )}
                              {isSelected && (
                                <CornerDownLeft className="h-3 w-3 text-primary ml-1" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Guide */}
          <div className="flex items-center justify-between border-t border-border/50 bg-muted/15 px-4 py-2 text-[10px] text-muted-foreground font-mono">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <ArrowUpDown className="h-2.5 w-2.5" /> Navigate
              </span>
              <span className="inline-flex items-center gap-1">
                <CornerDownLeft className="h-2.5 w-2.5" /> Execute
              </span>
              <span className="inline-flex items-center gap-1">
                ESC Close
              </span>
            </div>
            <span>
              {filteredCommands.length} command{filteredCommands.length === 1 ? "" : "s"} available
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
