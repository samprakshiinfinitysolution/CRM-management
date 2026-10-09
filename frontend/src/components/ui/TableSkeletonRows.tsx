interface TableSkeletonRowsProps {
  rows?: number;
  columns?: number;
}

export function TableSkeletonRows({
  rows = 5,
  columns = 8,
}: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <td key={columnIndex} className="py-3.5 px-4">
              <div
                className={`h-3.5 rounded bg-slate-200 dark:bg-slate-800 ${
                  columnIndex === 0
                    ? "w-36"
                    : columnIndex === columns - 1
                      ? "ml-auto w-16"
                      : "w-20"
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
