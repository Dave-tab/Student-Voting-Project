import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export type TableProps = TableHTMLAttributes<HTMLTableElement>;

function Table({ className, ...props }: TableProps) {
  return <table className={cn("w-full text-sm", className)} {...props} />;
}

export type TableCaptionProps = HTMLAttributes<HTMLTableCaptionElement>;

function TableCaption({ className, ...props }: TableCaptionProps) {
  return (
    <caption
      className={cn("mt-4 text-sm text-foreground/60", className)}
      {...props}
    />
  );
}

export type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement>;

function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead className={cn(className)} {...props} />;
}

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;

function TableBody({ className, ...props }: TableBodyProps) {
  return (
    <tbody
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

export type TableFooterProps = HTMLAttributes<HTMLTableSectionElement>;

function TableFooter({ className, ...props }: TableFooterProps) {
  return (
    <tfoot
      className={cn(
        "border-t border-border bg-foreground/5 font-medium",
        className
      )}
      {...props}
    />
  );
}

export type TableRowProps = HTMLAttributes<HTMLTableRowElement>;

function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        "border-b border-border transition-colors hover:bg-foreground/5",
        className
      )}
      {...props}
    />
  );
}

export type TableHeadProps = ThHTMLAttributes<HTMLTableCellElement>;

function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      className={cn(
        "h-10 px-4 text-left align-middle font-medium text-foreground/60",
        className
      )}
      {...props}
    />
  );
}

export type TableCellProps = TdHTMLAttributes<HTMLTableCellElement>;

function TableCell({ className, ...props }: TableCellProps) {
  return <td className={cn("p-4 align-middle", className)} {...props} />;
}

export {
  Table,
  TableCaption,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
};