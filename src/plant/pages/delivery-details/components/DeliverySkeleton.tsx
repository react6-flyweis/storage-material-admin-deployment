import { Skeleton } from "@/components/ui/skeleton";

export const DeliveryDetailsSkeleton = () => {
  return (
    <div className="flex-1 space-y-6 p-6 font-inter">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      {/* Main Layout Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Delivery Overview Card */}
          <div className="bg-white rounded-[14px] p-6 border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
              ))}
              <div className="md:col-span-2 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-full" />
              </div>
            </div>
          </div>

          {/* Delivery Information Card */}
          <div className="bg-white rounded-[14px] p-6 border border-slate-100 shadow-sm space-y-6">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div className="md:col-span-2 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-5 w-1/2" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            </div>
          </div>

          {/* Contacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-[14px] p-6 border border-slate-100 shadow-sm space-y-4">
                <Skeleton className="h-5 w-24" />
                <div className="space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Site Coordination */}
          <div className="bg-white rounded-[14px] p-6 border border-slate-100 shadow-sm space-y-6">
            <Skeleton className="h-6 w-44" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-5 w-5/6" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Receiving POC Card */}
          <div className="bg-white rounded-[14px] p-6 border border-slate-100 shadow-sm space-y-5">
            <Skeleton className="h-5 w-48" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-[14px] p-6 border border-slate-100 shadow-sm space-y-4">
            <Skeleton className="h-5 w-28" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* Status History Card */}
          <div className="bg-white rounded-[14px] p-6 border border-slate-100 shadow-sm space-y-5">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-6 relative pl-4">
              <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-slate-200" />
              {[...Array(2)].map((_, i) => (
                <div key={i} className="relative flex items-start gap-4">
                  <div className="absolute left-[-15px] mt-1.5 w-2.5 h-2.5 rounded-full bg-blue-400 ring-4 ring-white" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
