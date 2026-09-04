import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type PageProps = HTMLAttributes<HTMLDivElement>;

function Page({ className, ...props }: PageProps) {
  return <div className={cn("flex flex-col gap-6", className)} {...props} />;
}

export type PageHeaderProps = HTMLAttributes<HTMLDivElement>;

function PageHeader({ className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props} />
  );
}

export type PageTitleProps = HTMLAttributes<HTMLHeadingElement>;

function PageTitle({ className, ...props }: PageTitleProps) {
  return (
    <h1
      className={cn(
        "text-2xl font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

export type PageDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

function PageDescription({ className, ...props }: PageDescriptionProps) {
  return (
    <p className={cn("text-sm text-foreground/60", className)} {...props} />
  );
}

export type PageContentProps = HTMLAttributes<HTMLDivElement>;

function PageContent({ className, ...props }: PageContentProps) {
  return <div className={cn(className)} {...props} />;
}

export { Page, PageHeader, PageTitle, PageDescription, PageContent };