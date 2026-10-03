"use client";

import * as React from "react";
import { format, isValid } from "date-fns";
import { CalendarIcon, Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  value?: string | Date;
  onChange?: (val: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  showTime?: boolean;
  timeLabel?: string;
  minDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  className,
  placeholder = "Select date & time",
  disabled = false,
  showTime = true,
  timeLabel = "Time",
  minDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse initial date & time from value prop
  const parsedDate = React.useMemo(() => {
    if (!value) return undefined;
    const d = typeof value === "string" ? new Date(value) : value;
    return isValid(d) ? d : undefined;
  }, [value]);

  const [internalDate, setInternalDate] = React.useState<Date | undefined>(parsedDate);
  const [internalTime, setInternalTime] = React.useState<string>(() => {
    if (parsedDate) {
      const hours = String(parsedDate.getHours()).padStart(2, "0");
      const mins = String(parsedDate.getMinutes()).padStart(2, "0");
      return `${hours}:${mins}`;
    }
    return "10:00";
  });

  const selectedDate = parsedDate !== undefined ? parsedDate : internalDate;
  const timeValue = parsedDate !== undefined
    ? `${String(parsedDate.getHours()).padStart(2, "0")}:${String(parsedDate.getMinutes()).padStart(2, "0")}`
    : internalTime;

  const updateCombinedValue = (newDate?: Date, newTime?: string) => {
    const targetDate = newDate ?? selectedDate;
    const targetTime = newTime ?? timeValue;

    if (!targetDate) return;

    if (!showTime) {
      onChange?.(format(targetDate, "yyyy-MM-dd"));
      return;
    }

    const [hours, mins] = targetTime.split(":").map(Number);
    const combined = new Date(targetDate);
    combined.setHours(isNaN(hours) ? 10 : hours, isNaN(mins) ? 0 : mins, 0, 0);

    const year = combined.getFullYear();
    const month = String(combined.getMonth() + 1).padStart(2, "0");
    const day = String(combined.getDate()).padStart(2, "0");
    const formattedHours = String(combined.getHours()).padStart(2, "0");
    const formattedMins = String(combined.getMinutes()).padStart(2, "0");

    onChange?.(`${year}-${month}-${day}T${formattedHours}:${formattedMins}`);
  };

  const handleDateSelect = (d: Date | undefined) => {
    setInternalDate(d);
    if (d) {
      updateCombinedValue(d, timeValue);
      if (!showTime) {
        setOpen(false);
      }
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setInternalTime(newTime);
    if (selectedDate) {
      updateCombinedValue(selectedDate, newTime);
    }
  };

  const displayText = React.useMemo(() => {
    if (!selectedDate || !isValid(selectedDate)) return null;
    if (showTime) {
      return `${format(selectedDate, "PPP")} at ${timeValue}`;
    }
    return format(selectedDate, "PPP");
  }, [selectedDate, showTime, timeValue]);

  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-between text-left font-normal h-10 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer text-xs",
                !selectedDate && "text-slate-400"
              )}
            >
              <span className="flex items-center gap-2 truncate">
                <CalendarIcon className="w-4 h-4 text-slate-500 shrink-0" />
                <span className={cn(selectedDate ? "text-slate-800 font-medium" : "text-slate-400")}>
                  {displayText || placeholder}
                </span>
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 opacity-60" />
            </Button>
          }
        />
        <PopoverContent
          className="w-auto p-3 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 flex flex-col gap-3"
          align="start"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={minDate ? { before: minDate } : undefined}
            className="rounded-lg"
          />

          {showTime && (
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
              <Label
                htmlFor="time-input"
                className="text-xs font-semibold text-slate-600 flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {timeLabel}
              </Label>
              <Input
                type="time"
                id="time-input"
                value={timeValue}
                onChange={handleTimeChange}
                className="w-32 h-8 text-xs bg-slate-50 border-slate-200 rounded-lg focus:bg-white"
              />
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DatePicker;
