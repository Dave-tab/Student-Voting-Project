import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext(component: string): DropdownContextValue {
  const ctx = useContext(DropdownContext);
  if (!ctx) {
    throw new Error(`${component} must be used within a <Dropdown>`);
  }
  return ctx;
}

export interface DropdownProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

export function Dropdown({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
}: DropdownProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  function setOpen(next: boolean) {
    if (!isControlled) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

export interface DropdownTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function DropdownTrigger({
  className,
  onClick,
  onKeyDown,
  ...props
}: DropdownTriggerProps) {
  const { open, setOpen, triggerRef, contentRef } = useDropdownContext(
    "DropdownTrigger"
  );

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      className={cn(className)}
      onClick={(e) => {
        onClick?.(e);
        setOpen(!open);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setOpen(true);
          requestAnimationFrame(() => {
            const first = contentRef.current?.querySelector<HTMLElement>(
              '[role="menuitem"]:not([aria-disabled="true"])'
            );
            first?.focus();
          });
        }
      }}
      {...props}
    />
  );
}

export interface DropdownContentProps extends HTMLAttributes<HTMLDivElement> {}

export function DropdownContent({
  className,
  children,
  onKeyDown,
  ...props
}: DropdownContentProps) {
  const { open, setOpen, contentRef } = useDropdownContext(
    "DropdownContent"
  );

  if (!open) return null;

  function getItems(): HTMLElement[] {
    return Array.from(
      contentRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([aria-disabled="true"])'
      ) ?? []
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(e);
    const items = getItems();
    if (items.length === 0) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[(currentIndex + 1) % items.length];
      next.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[(currentIndex - 1 + items.length) % items.length];
      prev.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1].focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div
      ref={contentRef}
      role="menu"
      onKeyDown={handleKeyDown}
      className={cn(
        "absolute left-0 top-full z-50 mt-1 min-w-[10rem] rounded-md border border-border bg-background p-1 text-foreground shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DropdownItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  disabled?: boolean;
  onSelect?: () => void;
}

export function DropdownItem({
  className,
  disabled = false,
  onSelect,
  onClick,
  onKeyDown,
  ...props
}: DropdownItemProps) {
  const { setOpen, triggerRef } = useDropdownContext("DropdownItem");

  function activate() {
    if (disabled) return;
    onSelect?.();
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      className={cn(
        "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "focus:bg-input focus-visible:bg-input",
        "hover:bg-input",
        disabled && "pointer-events-none cursor-not-allowed opacity-50",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        activate();
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      }}
      {...props}
    />
  );
}