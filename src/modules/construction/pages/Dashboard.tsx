import { useState } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";
import { useConstructionOverviewQuery } from "../construction.hooks";
import DeliveryOverviewChart from "../components/charts/DeliveryOverviewChart";
import MaterialRequestOverviewChart from "../components/charts/MaterialRequestOverviewChart";

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [selectedBuilding, setSelectedBuilding] = useState("All Buildings");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [dateRange] = useState("24 Mar 2025 - 31 Mar 2025");

  const {
    data: overviewResponse,
    isLoading,
    isRefetching,
    refetch,
  } = useConstructionOverviewQuery({
    projectId: selectedProject,
    building: selectedBuilding,
    status: selectedStatus,
  });

  const overview = overviewResponse?.data;

  // Formatting completion rate
  const formatCompletionRate = (val?: number) => {
    if (val === undefined || val === null) return "0%";
    if (val <= 1 && val > 0) return `${Math.round(val * 100)}%`;
    return `${val}%`;
  };

  // Top KPI Stat Cards mapping purely from API stats
  const kpiStats = [
    {
      title: "Total Projects",
      value: overview?.stats?.totalProjects ?? 0,
      change: `${overview?.stats?.totalProjects ?? 0} Projects`,
      isPositive: true,
      iconBg: "bg-[#FF6B35]",
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H9" />
        </svg>
      ),
    },
    {
      title: "On Track",
      value: overview?.stats?.onTrack ?? 0,
      change: overview?.stats?.totalProjects
        ? `${((overview.stats.onTrack / overview.stats.totalProjects) * 100).toFixed(1)}%`
        : "0%",
      isPositive: true,
      iconBg: "bg-[#333333]",
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Delayed",
      value: overview?.stats?.delayed ?? 0,
      change: overview?.stats?.totalProjects
        ? `${((overview.stats.delayed / overview.stats.totalProjects) * 100).toFixed(1)}%`
        : "0%",
      isPositive: false,
      iconBg: "bg-[#2563EB]",
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Completed",
      value: overview?.stats?.completed ?? 0,
      change: overview?.stats?.totalProjects
        ? `${((overview.stats.completed / overview.stats.totalProjects) * 100).toFixed(1)}%`
        : "0%",
      isPositive: false,
      iconBg: "bg-[#EC4899]",
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: "Completion Rate",
      value: formatCompletionRate(overview?.stats?.completionRate),
      change: "Average Completion",
      isPositive: true,
      iconBg: "bg-[#FF6B35]",
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Upcoming Deadlines",
      value: overview?.stats?.upcomingDeadlinesCount ?? 0,
      change: `${overview?.stats?.upcomingDeadlinesCount ?? 0} Pending`,
      isPositive: true,
      iconBg: "bg-[#EF4444]",
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  // Delivery Overview Donut Data
  const todaysDeliveries = overview?.deliveryOverview?.todaysDeliveries ?? 0;
  const deliveredCount = overview?.deliveryOverview?.delivered ?? 0;
  const inTransitCount = overview?.deliveryOverview?.inTransit ?? 0;
  const delayedDeliveryCount = overview?.deliveryOverview?.delayed ?? 0;
  const outForDeliveryCount = Math.max(
    0,
    todaysDeliveries - (deliveredCount + inTransitCount + delayedDeliveryCount)
  );

  const totalDeliverySum = todaysDeliveries > 0 ? todaysDeliveries : (deliveredCount + inTransitCount + delayedDeliveryCount || 1);

  const deliveryData = [
    {
      name: "Delivered",
      count: deliveredCount,
      value: Math.round((deliveredCount / totalDeliverySum) * 100),
      color: "#0F4C5C",
    },
    {
      name: "In Transit",
      count: inTransitCount,
      value: Math.round((inTransitCount / totalDeliverySum) * 100),
      color: "#F4A261",
    },
    {
      name: "Out for Delivery",
      count: outForDeliveryCount,
      value: Math.round((outForDeliveryCount / totalDeliverySum) * 100),
      color: "#E76F51",
    },
    {
      name: "Delayed",
      count: delayedDeliveryCount,
      value: Math.round((delayedDeliveryCount / totalDeliverySum) * 100),
      color: "#A855F7",
    },
  ];

  // Material Request Overview Donut Data
  const materialTotal = overview?.materialRequestOverview?.total || 1;
  const approvedMR = overview?.materialRequestOverview?.approved ?? 0;
  const pendingMR = overview?.materialRequestOverview?.pending ?? 0;
  const rejectedMR = overview?.materialRequestOverview?.rejected ?? 0;
  const urgentCount =
    overview?.materialRequestOverview?.recent?.filter((r) => r.priority === "high")?.length ?? 0;

  const materialData = [
    {
      name: "Approved",
      value: Math.round((approvedMR / materialTotal) * 100),
      color: "#0F4C5C",
    },
    {
      name: "Pending Approval",
      value: Math.round((pendingMR / materialTotal) * 100),
      color: "#F4A261",
    },
    {
      name: "Rejected",
      value: Math.round((rejectedMR / materialTotal) * 100),
      color: "#E76F51",
    },
    {
      name: "Urgent Requests",
      value: urgentCount,
      color: "#A855F7",
      isCount: true,
    },
  ];

  // Live Site Activity Data
  const siteActivity = [
    { label: "Active Site", value: overview?.liveSiteActivity?.activeSites ?? 0 },
    {
      label: "Workers on site",
      value: overview?.liveSiteActivity?.workersOnSite ?? "N/A",
    },
    {
      label: "Equipment in use",
      value: overview?.liveSiteActivity?.equipmentInUse ?? "N/A",
    },
    {
      label: "Ongoing Tasks",
      value: overview?.liveSiteActivity?.ongoingTasks ?? overview?.taskStats?.in_progress ?? 0,
    },
  ];

  // Upcoming Project Deadlines Data (strictly from API)
  const upcomingDeadlines = (overview?.upcomingDeadlines ?? []).slice(0, 5).map((item) => ({
    title: item.projectName || item.title || item.jobId || "Project",
    subtitle: item.buildingLabel || item.jobId || "Site",
    date: item.date || item.dueDate || (item.requiredBy ? new Date(item.requiredBy).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""),
    daysLeft: item.daysLeft != null ? `${item.daysLeft} Days Left` : "",
  }));

  // Live Site Construction Section (strictly from API)
  const liveSites = overview?.liveSiteConstruction ?? [];

  // Bottom Stats
  const bottomStatCards = [
    {
      title: "Total Sites",
      value: overview?.bottomStats?.totalSites ?? 0,
      iconBg: "bg-[#F97316]",
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
    },
    {
      title: "Total Workers",
      value: overview?.bottomStats?.totalWorkers ?? "N/A",
      iconBg: "bg-[#0F4C5C]",
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: "Opening Tasks",
      value: overview?.taskStats ? (overview.taskStats.todo + overview.taskStats.in_progress) : 0,
      iconBg: "bg-[#A855F7]",
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      ),
    },
    {
      title: "Material in Transit",
      value: overview?.bottomStats?.materialInTransit ?? 0,
      iconBg: "bg-[#F97316]",
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
    },
    {
      title: "Equipments",
      value: overview?.bottomStats?.equipments ?? "N/A",
      iconBg: "bg-[#EF4444]",
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Total Material Delivered",
      value: overview?.bottomStats?.totalMaterialDelivered ?? 0,
      iconBg: "bg-[#0F4C5C]",
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
  ];

  // Recent Material Requests list mapping (strictly from API)
  const recentRequests = (overview?.materialRequestOverview?.recent ?? []).slice(0, 5).map((req) => {
    const title = req.requestedItems?.[0]?.name || req.requestId || "Material Request";
    const subtitle = req.leadId?.projectName || req.buildingLabel || "Site Request";
    const rawDate = req.requestDate || req.createdAt;
    const timeStr = rawDate
      ? new Date(rawDate).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      : "";

    const statusLower = (req.status || "pending").toLowerCase();
    let statusLabel = "Pending";
    let statusBg = "bg-[#EAB308] text-white";

    if (statusLower === "fulfilled" || statusLower === "approved") {
      statusLabel = "Approved";
      statusBg = "bg-[#10B981] text-white";
    } else if (statusLower === "rejected") {
      statusLabel = "Rejected";
      statusBg = "bg-[#EF4444] text-white";
    }

    return {
      title,
      subtitle,
      time: timeStr,
      status: statusLabel,
      statusBg,
      iconBg: "bg-[#E0F2FE]",
    };
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">Construction Overview</h1>
          <p className="text-sm sm:text-base text-[#64748B] mt-1">Construction Department Performance</p>
        </div>
        {isRefetching && (
          <div className="flex items-center gap-2 text-xs text-[#2563EB] font-medium bg-blue-50 px-3 py-1.5 rounded-lg self-start sm:self-auto">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Updating overview data...</span>
          </div>
        )}
      </div>

      {/* Top 6 Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {kpiStats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E293B]">{stat.value}</p>
              <p className="text-xs text-[#64748B] font-medium">{stat.title}</p>
            </div>
            {/* Change value hidden/commented out */}
            {/* <div className="flex items-center gap-1 text-xs">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${stat.isPositive ? "bg-[#10B981]" : "bg-[#EF4444]"
                  }`}
              >
                {stat.isPositive ? "↑" : "↓"}
              </span>
              <span className="text-[#64748B] text-[11px]">{stat.change}</span>
            </div> */}
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Select Project Dropdown */}
          <div className="relative">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="appearance-none bg-white border border-[#E2E8F0] rounded-lg pl-3 pr-8 py-2 text-xs text-[#1E293B] font-semibold shadow-sm hover:bg-gray-50 cursor-pointer focus:outline-none"
            >
              <option value="All Projects">Select Project : All Projects</option>
              <option value="warehouse - Austin">warehouse - Austin</option>
              <option value="office - Bangalore">office - Bangalore</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Buildings Dropdown */}
          <div className="relative">
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="appearance-none bg-white border border-[#E2E8F0] rounded-lg pl-3 pr-8 py-2 text-xs text-[#1E293B] font-semibold shadow-sm hover:bg-gray-50 cursor-pointer focus:outline-none"
            >
              <option value="All Buildings">Buildings : All Buildings</option>
              <option value="Building A">Building A</option>
              <option value="Building B">Building B</option>
              <option value="Building C">Building C</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none bg-white border border-[#E2E8F0] rounded-lg pl-3 pr-8 py-2 text-xs text-[#1E293B] font-semibold shadow-sm hover:bg-gray-50 cursor-pointer focus:outline-none"
            >
              <option value="All Status">Status : All Status</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Picker */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#475569] flex items-center gap-2 shadow-sm font-medium">
            <span>{dateRange}</span>
            <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Restart / Refresh Button */}
        <button
          onClick={() => void refetch()}
          className="bg-white border border-[#E2E8F0] rounded-lg px-4 py-2 text-xs text-[#475569] flex items-center gap-2 shadow-sm font-medium hover:bg-gray-50"
        >
          <span>Restart</span>
          <RefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${isRefetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Delivery Overview Card */}
        <DeliveryOverviewChart
          deliveryData={deliveryData}
          todaysDeliveries={todaysDeliveries}
        />

        {/* Material Request Overview Card */}
        <MaterialRequestOverviewChart
          materialData={materialData}
          pendingMR={pendingMR}
        />

        {/* Live Site Activity Card */}
        <div className="lg:col-span-3 bg-white rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="font-bold text-[#1E293B] text-base mb-4">Live Site Activity</h3>
          <div className="divide-y divide-[#F1F5F9] flex-1 flex flex-col justify-between">
            {siteActivity.map((item, index) => (
              <div key={index} className="py-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1E293B]">{item.label}</span>
                <span className="text-sm font-semibold text-[#64748B]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Project Deadlines Card */}
        <div className="lg:col-span-3 bg-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#1E293B] text-base leading-tight">
              Upcoming Project<br />Deadlines
            </h3>
            <button
              onClick={() => navigate("/admin/construction/projects")}
              className="text-xs text-[#64748B] border border-[#E2E8F0] px-2.5 py-1 rounded-md font-medium hover:bg-gray-50"
            >
              View All
            </button>
          </div>

          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-4">
              {upcomingDeadlines.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#1E293B]">{item.title}</p>
                    <p className="text-[#94A3B8] text-[11px] flex items-center gap-1">
                      {item.subtitle} <span className="text-[#F97316] font-bold">•</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#EF4444] font-medium text-[11px]">{item.date}</p>
                    <p className="text-[#1E293B] font-bold text-[10px]">{item.daysLeft}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[#94A3B8] text-center py-8">
              No upcoming project deadlines
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Live Site Construction & Project Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Site Construction Section */}
        <div className="lg:col-span-8 bg-white rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1E293B] text-base">Live Site Construction</h3>
            <button
              onClick={() => navigate("/admin/construction/projects")}
              className="text-xs text-[#64748B] flex items-center gap-1 font-medium hover:text-[#1E293B]"
            >
              View All <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {liveSites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {liveSites.map((site, index) => (
                <div key={index} className="border border-[#E2E8F0] rounded-xl p-3.5 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-[#1E293B] text-xs">
                          {site.projectName || site.jobId || `Construction Site ${index + 1}`}
                        </h4>
                        <p className="text-[#94A3B8] text-[11px]">
                          {site.location || site.currentPhase || "Location N/A"}
                        </p>
                      </div>
                      <button className="text-[#94A3B8] hover:text-[#64748B] text-xs">⋮</button>
                    </div>
                    <div className="space-y-1 my-3">
                      <span className="text-xs text-[#64748B] font-medium">{site.progressPct ?? 0}%</span>
                      <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#F97316] rounded-full"
                          style={{ width: `${site.progressPct ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-[#F8FAFC] rounded-lg p-2 flex items-center justify-between text-[11px]">
                      <div className="text-center">
                        <p className="text-[#94A3B8]">Workers</p>
                        <p className="font-bold text-[#1E293B]">{site.workersOnSite ?? "N/A"}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[#94A3B8]">Equipment</p>
                        <p className="font-bold text-[#1E293B]">{site.equipmentInUse ?? "N/A"}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[#94A3B8]">Tasks</p>
                        <p className="font-bold text-[#1E293B]">{site.tasks ?? 0}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("/admin/construction/projects")}
                      className="w-full text-center text-xs text-[#64748B] font-medium flex items-center justify-center gap-1 pt-1 hover:text-[#1E293B]"
                    >
                      View Site Details <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[#94A3B8] text-center py-10 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0]">
              No live site construction active
            </div>
          )}
        </div>

        {/* Project Timeline (Overall) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1E293B] text-base leading-tight">
              Project Timeline<br /><span className="font-normal text-xs text-[#64748B]">(Overall)</span>
            </h3>
            <button
              onClick={() => navigate("/admin/construction/projects")}
              className="text-xs text-[#64748B] flex items-center gap-1 font-medium hover:text-[#1E293B]"
            >
              View Full Timeline <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { stage: "Planning", status: "Completed", statusBg: "bg-[#DCFCE7] text-[#166534]", icon: "✓", checked: true },
              { stage: "Design", status: "Completed", statusBg: "bg-[#DCFCE7] text-[#166534]", icon: "✓", checked: true },
              { stage: "Procurement", status: "Completed", statusBg: "bg-[#DCFCE7] text-[#166534]", icon: "✓", checked: true },
              { stage: "Execution", status: "In Progress", statusBg: "bg-[#F3E8FF] text-[#9333EA]", checked: false },
              { stage: "Handover", status: "Upcoming", statusBg: "bg-[#FDF4FF] text-[#D946EF]", checked: false },
            ].map((item, idx) => (
              <div key={idx} className="border border-[#F1F5F9] rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${item.checked ? "bg-[#22C55E] text-white" : "border border-[#CBD5E1]"}`}>
                    {item.icon || ""}
                  </div>
                  <div>
                    <span className="font-bold text-[#1E293B]">{item.stage}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${item.statusBg}`}>
                  • {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: 6 Stat Cards & Additional Material Request */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: 6 Stat Cards (2 columns x 3 rows) */}
        <div className="lg:col-span-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bottomStatCards.map((card, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 shadow-sm relative overflow-hidden flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: card.iconBg.replace('bg-[', '').replace(']', '') }}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-xs text-[#64748B] font-medium">{card.title}</p>
                  <p className="text-xl font-bold text-[#1E293B]">{card.value}</p>
                </div>
                {/* Top-right diagonal accent shape matching design */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#FFD8C9] rotate-45 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Additional Material Request */}
        <div className="lg:col-span-6 bg-white rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1E293B] text-base">Additional Material Request</h3>
            <button
              onClick={() => navigate("/admin/construction/materials")}
              className="text-xs text-[#2563EB] border border-[#2563EB] px-3 py-1 rounded-md font-semibold hover:bg-blue-50"
            >
              View All
            </button>
          </div>

          {recentRequests.length > 0 ? (
            <div className="space-y-3">
              {recentRequests.map((request, idx) => (
                <div key={idx} className="border border-[#F1F5F9] rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${request.iconBg} flex items-center justify-center shrink-0`}>
                      <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1E293B] text-xs">{request.title}</h4>
                      <p className="text-[#94A3B8] text-[11px]">{request.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {request.time && <span className="text-[#94A3B8] text-[11px]">{request.time}</span>}
                    <span className={`px-3 py-1 rounded-full text-[10px] font-semibold ${request.statusBg}`}>
                      • {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[#94A3B8] text-center py-8">
              No recent material requests
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Skeleton loading layout for screen content
function DashboardSkeleton() {
  return (
    <div className="min-h-screen p-6 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded-md" />
        <div className="h-4 w-80 bg-gray-200 rounded-md" />
      </div>

      {/* Top 6 Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 shadow-sm space-y-3 border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gray-200" />
            <div className="space-y-2">
              <div className="h-6 w-16 bg-gray-300 rounded" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
            {/* <div className="h-3 w-12 bg-gray-200 rounded" /> */}
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <div className="h-9 w-44 bg-gray-200 rounded-lg" />
          <div className="h-9 w-40 bg-gray-200 rounded-lg" />
          <div className="h-9 w-36 bg-gray-200 rounded-lg" />
          <div className="h-9 w-48 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-9 w-24 bg-gray-200 rounded-lg" />
      </div>

      {/* Row 1 Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="lg:col-span-3 bg-white rounded-xl p-5 shadow-sm space-y-4 border border-gray-100 min-h-[320px]">
            <div className="flex justify-between items-center">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="h-6 w-14 bg-gray-200 rounded" />
            </div>
            <div className="h-44 bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-8 border-gray-200" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-3/4 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Row 2 Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-xl p-5 shadow-sm space-y-4 border border-gray-100">
          <div className="flex justify-between items-center">
            <div className="h-5 w-44 bg-gray-200 rounded" />
            <div className="h-5 w-16 bg-gray-200 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="border border-gray-100 rounded-xl p-3.5 space-y-3">
                <div className="h-4 w-28 bg-gray-200 rounded" />
                <div className="h-28 bg-gray-200 rounded-lg" />
                <div className="h-2 w-full bg-gray-200 rounded" />
                <div className="h-10 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-xl p-5 shadow-sm space-y-4 border border-gray-100">
          <div className="flex justify-between items-center">
            <div className="h-5 w-36 bg-gray-200 rounded" />
            <div className="h-5 w-24 bg-gray-200 rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-11 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Row 3 Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-200" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-5 w-12 bg-gray-300 rounded" />
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-6 bg-white rounded-xl p-5 shadow-sm space-y-4 border border-gray-100">
          <div className="flex justify-between items-center">
            <div className="h-5 w-48 bg-gray-200 rounded" />
            <div className="h-6 w-16 bg-gray-200 rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-12 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
