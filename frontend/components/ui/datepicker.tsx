"use client";

import * as React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { cn } from "@/lib/utils";

interface DatePickerProps {
  selected?: Date;
  onSelect?: (date: Date | null) => void;
  placeholderText?: string;
  className?: string;
  disabled?: boolean;
}

const CustomDatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ selected, onSelect, placeholderText, className, disabled }, ref) => {
    return (
      <DatePicker
        selected={selected}
        onChange={onSelect}
        placeholderText={placeholderText}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        disabled={disabled}
        dateFormat="yyyy-MM-dd"
      />
    );
  }
);

CustomDatePicker.displayName = "DatePicker";

export { CustomDatePicker as DatePicker };
