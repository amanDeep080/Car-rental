export default function CarCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-graphite-line bg-graphite">
      <div className="aspect-[4/3] animate-pulse bg-graphite-raised" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 animate-pulse rounded bg-graphite-raised" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-graphite-raised" />
        <div className="mt-3 flex gap-3">
          <div className="h-3 w-16 animate-pulse rounded bg-graphite-raised" />
          <div className="h-3 w-16 animate-pulse rounded bg-graphite-raised" />
        </div>
        <div className="flex items-center justify-between border-t border-graphite-line pt-4">
          <div className="h-5 w-20 animate-pulse rounded bg-graphite-raised" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-graphite-raised" />
        </div>
      </div>
    </div>
  );
}
