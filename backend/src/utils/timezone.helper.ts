export function getBusinessDayRange(
  date: Date = new Date(),
  timeZone: string = "Asia/Kolkata",
): { startOfToday: Date; endOfToday: Date; startOfMonth: Date } {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const [year, month, day] = formatter.format(date).split("-").map(Number);

  const startLocal = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const endLocal = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  const startMonthLocal = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));

  const offsetMs = getTimezoneOffsetMs(timeZone, startLocal);

  return {
    startOfToday: new Date(startLocal.getTime() - offsetMs),
    endOfToday: new Date(endLocal.getTime() - offsetMs),
    startOfMonth: new Date(startMonthLocal.getTime() - offsetMs),
  };
}

function getTimezoneOffsetMs(timeZone: string, date: Date): number {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone }));
  return tzDate.getTime() - utcDate.getTime();
}
