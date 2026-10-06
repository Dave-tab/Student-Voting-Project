import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  hasTitle: boolean;
  setHasTitle: (v: boolean) => void;
  hasDescription: boolean;
  setHasDescription: (v: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext(component: string): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error(`${component} must be used within a <Dialog>`);
  }
  return ctx;
}

let idCounter = 0;
function useUniqueId(prefix: string) {
  const [id] = useState(() => `${prefix}-${++idCounter}`);
  return id;
}

export interface DialogProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

export function Dialog({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const titleId = useUniqueId("dialog-title");
  const descriptionId = useUniqueId("dialog-description");
  const triggerRef = useRef<HTMLElement | null>(null);

  const setOpen = useCallback((next: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  }, [isControlled, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  return (
    <DialogContext.Provider
      value={{
        open,
        setOpen,
        titleId,
        descriptionId,
        hasTitle,
        setHasTitle,
        hasDescription,
        setHasDescription,
        triggerRef,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export interface DialogTriggerProps extends HTMLAttributes<HTMLButtonElement> {}

export function DialogTrigger({ className, onClick, ...props }: DialogTriggerProps) {
  const { setOpen, triggerRef } = useDialogContext("DialogTrigger");

  return (
    <button
      ref={(node) => {
        triggerRef.current = node;
      }}
      type="button"
      className={cn(className)}
      onClick={(e) => {
        onClick?.(e);
        setOpen(true);
      }}
      {...props}
    />
  );
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {}

export function DialogContent({ className, children, ...props }: DialogContentProps) {
  const {
    open,
    setOpen,
    titleId,
    descriptionId,
    hasTitle,
    hasDescription,
    triggerRef,
  } = useDialogContext("DialogContent");

  const contentRef = useRef<HTMLDivElement>(null);
  const setOpenRef = useRef(setOpen);
  useEffect(() => {
    setOpenRef.current = setOpen;
  });

  useEffect(() => {
    if (!open) return;

    const node = contentRef.current;
    const focusable = node?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const first = focusable?.[0] ?? node;
    first?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenRef.current(false);
        return;
      }
      if (e.key !== "Tab" || !node) return;

      const items = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    const triggerElement = triggerRef.current;
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      triggerElement?.focus();
    };
  }, [open, triggerRef]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-foreground/50"
        aria-hidden="true"
        onClick={() => setOpenRef.current(false)}
      />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-describedby={hasDescription ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-50 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-lg border border-border bg-background p-6 text-foreground shadow-lg",
          "focus-visible:outline-none",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div
      className={cn("mb-4 flex flex-col space-y-1.5", className)}
      {...props}
    />
  );
}

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  const { titleId, setHasTitle } = useDialogContext("DialogTitle");

  useEffect(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, [setHasTitle]);

  return (
    <h2
      id={titleId}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export interface DialogDescriptionProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "p";
}

export function DialogDescription({
  className,
  as: Component = "div",
  ...props
}: DialogDescriptionProps) {
  const { descriptionId, setHasDescription } = useDialogContext("DialogDescription");

  useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);

  return (
    <Component
      id={descriptionId}
      className={cn("text-sm text-foreground/70", className)}
      {...props}
    />
  );
}

export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

export interface DialogCloseProps extends HTMLAttributes<HTMLButtonElement> {}

export function DialogClose({ className, onClick, ...props }: DialogCloseProps) {
  const { setOpen } = useDialogContext("DialogClose");
  return (
    <button
      type="button"
      className={cn(className)}
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      {...props}
    />
  );
}