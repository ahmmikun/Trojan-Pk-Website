import { Skeleton } from "@/components/admin-ui/display";

/** Shown instantly while a content list loads. */
export default function ListLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Skeleton className="size-11 rounded-xl" />
          <div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-2 h-3 w-64" />
          </div>
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/70 px-4 py-3">
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="hidden h-9 w-72 rounded-lg sm:block" />
        </div>
        <ul className="divide-y divide-zinc-100">
          {Array.from({ length: 7 }, (_, i) => (
            <li key={i} className="flex items-center gap-3.5 px-5 py-3.5">
              <Skeleton className="size-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="mt-2 h-3 w-1/4" />
              </div>
              <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
