import {
  createContext,
  useContext,
  useEffect,
  useState,
  type HTMLAttributes,
  type ImgHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

type ImageStatus = "idle" | "loaded" | "error";

interface AvatarContextValue {
  status: ImageStatus;
  setStatus: (status: ImageStatus) => void;
}

const AvatarContext = createContext<AvatarContextValue | null>(null);

function useAvatarContext(componentName: string) {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error(`${componentName} must be used within <Avatar>.`);
  }
  return context;
}

export type AvatarProps = HTMLAttributes<HTMLDivElement>;

function Avatar({ className, children, ...props }: AvatarProps) {
  const [status, setStatus] = useState<ImageStatus>("idle");

  return (
    <AvatarContext.Provider value={{ status, setStatus }}>
      <div
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AvatarContext.Provider>
  );
}

export type AvatarImageProps = ImgHTMLAttributes<HTMLImageElement>;

function AvatarImage({
  src,
  className,
  onLoad,
  onError,
  ...props
}: AvatarImageProps) {
  const { status, setStatus } = useAvatarContext("AvatarImage");

  useEffect(() => {
    if (!src) {
      setStatus("error");
    }
  }, [src, setStatus]);

  if (!src || status === "error") {
    return null;
  }

  return (
    <img
      src={src}
      className={cn("aspect-square h-full w-full object-cover", className)}
      onLoad={(event) => {
        setStatus("loaded");
        onLoad?.(event);
      }}
      onError={(event) => {
        setStatus("error");
        onError?.(event);
      }}
      {...props}
    />
  );
}

export type AvatarFallbackProps = HTMLAttributes<HTMLDivElement>;

function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  const { status } = useAvatarContext("AvatarFallback");

  if (status === "loaded") {
    return null;
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-foreground/10 text-sm font-medium text-foreground/60",
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };