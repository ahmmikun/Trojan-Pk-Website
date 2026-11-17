import { Skeleton } from "@/components/admin-ui/display";

/** Shown instantly while an editor loads. */
export default function EditorLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-5">
          {[3, 1, 4].map((n, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[var(--shadow-card)]">
              <div className="border-b border-zinc-200 bg-zinc-50/70 px-5 py-3.5">
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex flex-col gap-5 p-5">
                {Array.from({ length: n }, (_, j) => (
                  <div key={j}>
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="mt-2 h-9 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}
