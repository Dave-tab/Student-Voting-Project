import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { formatElectionDate } from "@/features/elections/utils/electionUtils";

interface DateTimePickerWATProps {
  id?: string;
  label: string;
  value: string; // "YYYY-MM-DDTHH:mm" format or ISO string
  onChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function DateTimePickerWAT({
  id,
  label,
  value,
  onChange,
  minDate,
  required = false,
  disabled = false,
  error,
  helperText,
}: DateTimePickerWATProps) {
  // Normalize value to "YYYY-MM-DDTHH:mm"
  const normalizedValue = value ? value.slice(0, 16) : "";

  const [datePart, timePart] = normalizedValue.includes("T")
    ? normalizedValue.split("T")
    : [normalizedValue, "09:00"];

  // Parse hour (24h) into 12h + AM/PM
  const [hour24, minuteStr] = (timePart || "09:00").split(":");
  const hourNum24 = parseInt(hour24 || "9", 10);
  const isPM = hourNum24 >= 12;
  const hourNum12 = hourNum24 % 12 === 0 ? 12 : hourNum24 % 12;

  // State for calendar month navigation
  const initialYear = datePart ? parseInt(datePart.split("-")[0], 10) : new Date().getFullYear();
  const initialMonth = datePart ? parseInt(datePart.split("-")[1], 10) - 1 : new Date().getMonth();

  const [navYear, setNavYear] = useState<number>(initialYear);
  const [navMonth, setNavMonth] = useState<number>(initialMonth);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  // Generate calendar grid for navYear / navMonth
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(navYear, navMonth, 1);
    const lastDayOfMonth = new Date(navYear, navMonth + 1, 0);

    // Get starting day index (Monday = 0, Sunday = 6)
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay === -1) startDay = 6;

    const daysInMonth = lastDayOfMonth.getDate();

    const days: Array<{ day: number; dateStr: string; isCurrentMonth: boolean }> = [];

    // Prev month padding
    const prevMonthLastDay = new Date(navYear, navMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevMonth = navMonth === 0 ? 12 : navMonth;
      const prevYear = navMonth === 0 ? navYear - 1 : navYear;
      const dateStr = `${prevYear}-${prevMonth.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
      days.push({ day: d, dateStr, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = (navMonth + 1).toString().padStart(2, "0");
      const dayStr = d.toString().padStart(2, "0");
      const dateStr = `${navYear}-${monthStr}-${dayStr}`;
      days.push({ day: d, dateStr, isCurrentMonth: true });
    }

    // Next month padding to fill grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = navMonth === 11 ? 1 : navMonth + 2;
      const nextYear = navMonth === 11 ? navYear + 1 : navYear;
      const dateStr = `${nextYear}-${nextMonth.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
      days.push({ day: d, dateStr, isCurrentMonth: false });
    }

    return days;
  }, [navYear, navMonth]);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
  }, []);

  const handleSelectDate = (selectedDateStr: string) => {
    onChange(`${selectedDateStr}T${timePart || "09:00"}`);
    setShowCalendar(false);
  };

  const handleHourChange = (new12Hour: number) => {
    let final24 = new12Hour % 12;
    if (isPM) final24 += 12;
    const hourStr = final24.toString().padStart(2, "0");
    const newTime = `${hourStr}:${minuteStr || "00"}`;
    onChange(`${datePart || todayStr}T${newTime}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    const newTime = `${hour24 || "09"}:${newMinute}`;
    onChange(`${datePart || todayStr}T${newTime}`);
  };

  const handleTogglePeriod = (pm: boolean) => {
    let final24 = hourNum12 % 12;
    if (pm) final24 += 12;
    const hourStr = final24.toString().padStart(2, "0");
    const newTime = `${hourStr}:${minuteStr || "00"}`;
    onChange(`${datePart || todayStr}T${newTime}`);
  };

  const handlePrevMonth = () => {
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear((y) => y - 1);
    } else {
      setNavMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear((y) => y + 1);
    } else {
      setNavMonth((m) => m + 1);
    }
  };

  // Format readable schedule preview
  const formattedPreview = useMemo(() => {
    if (!datePart) return "";
    try {
      const isoLike = `${datePart}T${timePart || "09:00"}:00`;
      return formatElectionDate(isoLike, { withDayOfWeek: true, separator: " · " });
    } catch {
      return "";
    }
  }, [datePart, timePart]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 shadow-xs space-y-3">
        {/* Date Selector Row */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex-1 flex items-center justify-between h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <div className="flex items-center gap-2 truncate">
                <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium truncate">
                  {datePart
                    ? new Intl.DateTimeFormat("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(`${datePart}T12:00:00`))
                    : "Select Date"}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-semibold">
                {showCalendar ? "Hide Calendar" : "Change Date"}
              </span>
            </button>
          </div>

          {/* Interactive Calendar Grid */}
          {showCalendar && (
            <div className="mt-2 p-3 rounded-lg border border-border bg-background shadow-xs space-y-3 animate-in fade-in">
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="text-xs font-bold text-foreground">
                  {MONTH_NAMES[navMonth]} {navYear}
                </span>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground">
                {DAYS_OF_WEEK.map((d) => (
                  <span key={d} className="py-1">
                    {d}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((item, idx) => {
                  const isSelected = item.dateStr === datePart;
                  const isToday = item.dateStr === todayStr;
                  const isPast = minDate && item.dateStr < minDate.slice(0, 10);

                  return (
                    <button
                      key={`${item.dateStr}-${idx}`}
                      type="button"
                      disabled={Boolean(isPast)}
                      onClick={() => handleSelectDate(item.dateStr)}
                      className={`h-8 rounded-md text-xs font-medium transition-colors flex flex-col items-center justify-center ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : isToday
                          ? "border border-primary text-primary font-bold hover:bg-primary/10"
                          : item.isCurrentMonth
                          ? "text-foreground hover:bg-muted"
                          : "text-muted-foreground/40 hover:bg-muted/40"
                      } ${isPast ? "opacity-30 cursor-not-allowed" : ""}`}
                    >
                      <span>{item.day}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Time Selector Controls */}
        <div className="pt-2 border-t border-border/60">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Time</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Hour Dropdown */}
              <select
                value={hourNum12}
                disabled={disabled}
                onChange={(e) => handleHourChange(parseInt(e.target.value, 10))}
                className="h-8 rounded-md border border-input bg-background px-2 py-0.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label="Hour"
              >
                {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
                  <option key={h} value={h}>
                    {h.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>

              <span className="font-bold text-muted-foreground">:</span>

              {/* Minute Dropdown */}
              <select
                value={minuteStr || "00"}
                disabled={disabled}
                onChange={(e) => handleMinuteChange(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 py-0.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label="Minute"
              >
                {["00", "15", "30", "45"].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              {/* AM / PM Segmented Control */}
              <div className="inline-flex rounded-md border border-input bg-muted/30 p-0.5 text-[11px] font-semibold">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleTogglePeriod(false)}
                  className={`px-2 py-1 rounded-sm transition-colors ${
                    !isPM
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleTogglePeriod(true)}
                  className={`px-2 py-1 rounded-sm transition-colors ${
                    isPM
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Schedule Human-Readable Preview */}
        {formattedPreview && (
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-medium">
            <span className="font-semibold text-foreground truncate">{formattedPreview}</span>
          </div>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1 text-[11px] text-destructive font-medium">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {helperText && !error && (
        <p className="text-[11px] text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
