import { useState } from "react";
import { useParams } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, AlertTriangle } from "lucide-react";
import { useLoadPlanningProjectsQuery, useBundlePlanDetailsQuery } from "@/modules/plant/load-planning.hooks";
import Pagination from "@/components/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import QRCodeDataModal from "../components/common_component/QRCodeDataModal";
import { printQRCodeLabel, type QRModalData } from "@/lib/utils/qr";

const formatDecimal = (val: number | undefined | null) => {
  return (val ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

interface Bundle {
  bundleNo: string;
  loadSequence?: number;
  title: string;
  totalWeight: number;
  maxLengthFeet: number;
  _id?: string;
  bundleType?: string;
  status?: string;
}

export default function QrLabelsProject() {
  const { projectId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);

  // Client-side state for search, sort, and pagination
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch load planning projects to find the matching project and extract its bundlePlanId
  const { data: projectsData, isLoading: isProjectsLoading, error: projectsError } = useLoadPlanningProjectsQuery(1, 100);

  const currentProject = projectsData?.data?.projects?.find(
    (p) => p.projectId === projectId
  );
  const bundlePlanId = currentProject?.bundlePlanId;

  // Fetch bundle plan details containing the list of bundles
  const { data: bundlePlanData, isLoading: isPlanLoading, error: planError } = useBundlePlanDetailsQuery(bundlePlanId || "");

  const bundles = bundlePlanData?.data?.bundles || [];
  const bundlePlan = bundlePlanData?.data?.bundlePlan;

  const getModalData = (bundle: Bundle): QRModalData => {
    return {
      projectName: currentProject?.projectName || "",
      shipperRef: bundlePlan?.shipperRequestId || "",
      loadId: bundle.loadSequence ? `LOAD-${bundle.loadSequence}` : "",
      id: bundle.bundleNo || "",
      bundleId: bundle.bundleNo || "",
      parts: bundle.title
        ? bundle.title.includes("-")
          ? bundle.title.split("-")[1]
          : bundle.title
        : "",
      weight: bundle.totalWeight ? String(bundle.totalWeight) : "",
      length: bundle.maxLengthFeet ? String(bundle.maxLengthFeet) : "",
    };
  };

  const handleView = (bundle: Bundle) => {
    setSelectedBundle(bundle);
    setIsModalOpen(true);
  };

  const handlePrint = (bundle: Bundle) => {
    printQRCodeLabel(getModalData(bundle));
  };

  // const getStatusStyles = (status: string) => {
  //   const normalized = status?.toLowerCase() || "";
  //   if (
  //     normalized === "printed" ||
  //     normalized === "completed" ||
  //     normalized === "dispatched" ||
  //     normalized === "assigned_to_truck"
  //   ) {
  //     return "border-green-200 text-green-700 bg-green-50";
  //   }
  //   return "border-blue-200 text-blue-700 bg-blue-50";
  // };

  // const formatStatus = (status: string) => {
  //   if (!status) return "Generated";
  //   return status
  //     .split("_")
  //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  //     .join(" ");
  // };

  // Client-side filtering
  const filteredBundles = bundles.filter((bundle) => {
    const term = search.toLowerCase();
    return (
      bundle.bundleNo.toLowerCase().includes(term) ||
      bundle.title.toLowerCase().includes(term) ||
      bundle.bundleType.toLowerCase().includes(term) ||
      bundle.status.toLowerCase().includes(term)
    );
  });

  // Client-side sorting
  const sortedBundles = [...filteredBundles].sort((a, b) => {
    if (sortBy === "highest") {
      return b.totalWeight - a.totalWeight;
    }
    if (sortBy === "lowest") {
      return a.totalWeight - b.totalWeight;
    }
    if (sortBy === "earliest") {
      if (a.loadSequence !== b.loadSequence) {
        return a.loadSequence - b.loadSequence;
      }
      return a.bundleNo.localeCompare(b.bundleNo);
    }
    // Default: latest (loadSequence descending, then bundleNo descending)
    if (a.loadSequence !== b.loadSequence) {
      return b.loadSequence - a.loadSequence;
    }
    return b.bundleNo.localeCompare(a.bundleNo);
  });

  // Client-side pagination
  const totalItems = sortedBundles.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedBundles = sortedBundles.slice(startIndex, startIndex + rowsPerPage);

  const isLoading = isProjectsLoading || (!!bundlePlanId && isPlanLoading);
  const hasError = !!projectsError || !!planError;

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#fafafa] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
            QR Labels {currentProject ? `- ${currentProject.projectName}` : ""}
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Generate, manage, and print QR labels for bundles and pallets to enable tracking and verification across plant and field operations.
          </p>
        </div>
        <Button variant="outline" className="bg-white text-gray-700 shadow-sm border-gray-200 font-semibold">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search bundles..."
            className="pl-9 bg-white shadow-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <Select
          value={sortBy}
          onValueChange={(val) => {
            setSortBy(val);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[200px] bg-white text-gray-700 font-medium shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="earliest">Sort by : Date (Earliest)</SelectItem>
            <SelectItem value="latest">Sort by : Date (Latest)</SelectItem>
            <SelectItem value="highest">Sort by : Weight (Highest first)</SelectItem>
            <SelectItem value="lowest">Sort by : Weight (Lowest first)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-gray-700 font-semibold border-b">
              <tr>
                <th className="px-6 py-5 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-5">Bundle ID</th>
                <th className="px-6 py-5">Load ID</th>
                <th className="px-6 py-5">Parts ⇅</th>
                <th className="px-6 py-5">Weight ⇅</th>
                <th className="px-6 py-5">Length ⇅</th>
                {/* <th className="px-6 py-5">Status</th> */}
                <th className="px-6 py-5 text-right w-40"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                Array.from({ length: rowsPerPage }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-5 text-center">
                      <Skeleton className="h-4 w-4 mx-auto rounded" />
                    </td>
                    <td className="px-6 py-5">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-5">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-5">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-5">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-6 py-5">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    {/* <td className="px-6 py-5">
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </td> */}
                    <td className="px-6 py-5 text-right">
                      <Skeleton className="h-8 w-24 ml-auto rounded" />
                    </td>
                  </tr>
                ))
              ) : hasError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-red-500">
                    <div className="flex items-center justify-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Failed to load bundles for this project. Please try again.</span>
                    </div>
                  </td>
                </tr>
              ) : !bundlePlanId ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    No bundle plan has been generated for this project yet.
                  </td>
                </tr>
              ) : paginatedBundles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    No bundles match the search criteria.
                  </td>
                </tr>
              ) : (
                paginatedBundles.map((row, idx) => (
                  <tr key={row._id || idx} className="hover:bg-gray-50">
                    <td className="px-6 py-5 text-center">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-6 py-5 text-gray-500 font-medium">{row.bundleNo}</td>
                    <td className="px-6 py-5 text-gray-500">
                      {row.loadSequence ? `LOAD-${row.loadSequence}` : "-"}
                    </td>
                    <td className="px-6 py-5 font-bold text-gray-900">{row.title}</td>
                    <td className="px-6 py-5 text-gray-500">{formatDecimal(row.totalWeight)} LBS</td>
                    <td className="px-6 py-5 text-gray-500">{formatDecimal(row.maxLengthFeet)} FT</td>
                    {/* <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusStyles(row.status)}`}>
                        {formatStatus(row.status)}
                        {row.status?.toLowerCase() === "printed" || row.status?.toLowerCase() === "completed" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <QrCode className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </td> */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-[#4f46e5] hover:bg-[#4338ca] text-white h-8 text-xs font-medium rounded shadow-sm"
                          onClick={() => handleView(row)}
                        >
                          View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-[#0d9488] hover:bg-[#0f766e] text-white h-8 text-xs font-medium rounded shadow-sm"
                          onClick={() => handlePrint(row)}
                        >
                          Print
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !hasError && totalItems > 0 && (
          <Pagination
            totalItems={totalItems}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
          />
        )}
      </Card>

      {/* QR Code Modal */}
      <QRCodeDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedBundle ? getModalData(selectedBundle) : null}
      />
    </div>
  );
}
