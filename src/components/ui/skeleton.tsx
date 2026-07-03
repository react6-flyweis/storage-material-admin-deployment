import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

// Card Skeleton
function CardSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("bg-white rounded-lg p-4 border border-gray-200", className)} {...props}>
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-6 bg-gray-300 rounded w-1/2" />
      </div>
    </div>
  );
}

// Stat Card Skeleton
function StatCardSkeleton({ className, color = "bg-blue-500", ...props }: SkeletonProps & { color?: string }) {
  return (
    <div className={cn("bg-white rounded-lg p-4 border border-gray-200", className)} {...props}>
      <div className="animate-pulse flex flex-col items-start gap-3">
        <div className={cn("size-16 rounded-full", color, "opacity-20")} />
        <div className="flex-1 w-full space-y-2 mt-1">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-7 w-12 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
}

// Table Skeleton
function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="animate-pulse">
      {/* Table Header */}
      <div className="bg-gray-50 border-b">
        <div className="flex">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="flex-1 px-6 py-4">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b last:border-0">
          <div className="flex">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Profile Card Skeleton
function ProfileCardSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("bg-white rounded-lg p-6 border border-gray-200", className)} {...props}>
      <div className="animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Avatar */}
          <div className="size-20 bg-gray-200 rounded-full" />
          
          {/* Info */}
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-300 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="flex flex-wrap gap-4">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-28" />
            </div>
          </div>
          
          {/* Status */}
          <div className="h-6 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

// Form Skeleton
function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-10 bg-gray-100 border border-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

// Chart Skeleton
function ChartSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("bg-white rounded-lg p-6 border border-gray-200", className)} {...props}>
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-32" />
        <div className="h-64 bg-gray-100 rounded" />
        <div className="flex justify-center space-x-4">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

// List Item Skeleton
function ListItemSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("flex items-center space-x-3 p-3", className)} {...props}>
      <div className="animate-pulse flex items-center space-x-3 w-full">
        <div className="size-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
    </div>
  );
}

// Page Skeleton - Full page loading state
function PageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-64" />
            <div className="h-4 bg-gray-200 rounded w-96" />
          </div>
          <div className="flex space-x-2">
            <div className="h-10 bg-gray-200 rounded w-32" />
            <div className="h-10 bg-gray-200 rounded w-40" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <CardSkeleton className="h-96" />
        <CardSkeleton className="h-64" />
      </div>
    </div>
  );
}

export {
  Skeleton,
  CardSkeleton,
  StatCardSkeleton,
  TableSkeleton,
  ProfileCardSkeleton,
  FormSkeleton,
  ChartSkeleton,
  ListItemSkeleton,
  PageSkeleton,
};