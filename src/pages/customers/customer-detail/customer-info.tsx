import { useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useParams, useLocation, useSearchParams } from "react-router";
import { useAppBack } from "@/modules/navigation";
import {
  ArrowLeft,
  Clock3,
  DollarSign,
  Eye,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  MailIcon,
  MessageSquare,
  Printer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StatCard from "@/components/ui/stat-card";
import ProfileCard from "@/components/profile-card";
import {
  useCustomerDetailQuery,
  useCustomerProjectsQuery,
  useCustomerInvoicesQuery,
  useAdminCustomerDocumentsQuery,
} from "@/modules/customers/customers.hooks";
import { StatCardSkeleton } from "@/components/ui/skeleton";
import { CustomerDocumentsTab } from "@/components/customers/customer-documents/customer-documents-tab";
import type { CustomerProject } from "@/modules/customers/customers.types";

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatProjectBudget(
  budget?: CustomerProject["budget"],
  quoteValue?: number
): string {
  if (budget != null) {
    if (typeof budget === "number") {
      if (Number.isFinite(budget) && budget > 0) return formatCurrency(budget);
    } else if (typeof budget === "object") {
      const total =
        typeof budget.totalBudget === "number"
          ? budget.totalBudget
          : Array.isArray(budget.customLines) && budget.customLines.length > 0
            ? budget.customLines.reduce((acc, line) => acc + (line.amount || 0), 0)
            : null;

      if (total != null && Number.isFinite(total) && total > 0) {
        return formatCurrency(total);
      }
    }
  }

  if (typeof quoteValue === "number" && Number.isFinite(quoteValue) && quoteValue > 0) {
    return formatCurrency(quoteValue);
  }

  if (typeof budget === "number" && Number.isFinite(budget)) {
    return formatCurrency(budget);
  }

  return "N/A";
}

function extractKPIValue(
  preferred: number | undefined | null,
  aliases: (number | undefined | null)[],
  fallback: number | null = null
): number | null {
  if (typeof preferred === "number" && Number.isFinite(preferred)) {
    return preferred;
  }
  for (const alias of aliases) {
    if (typeof alias === "number" && Number.isFinite(alias)) {
      return alias;
    }
  }
  if (typeof fallback === "number" && Number.isFinite(fallback)) {
    return fallback;
  }
  return null;
}

function formatJoinedDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Strips trailing timestamp suffix appended by backend
// e.g. "Ayesha Saloon garage 2026-05-18T22-25-15-035Z" → "Ayesha Saloon garage"
function cleanProjectName(name?: string) {
  if (!name) return "-";
  return name.replace(/\s*\d{4}-\d{2}-\d{2}T[\d-]+Z$/, "").trim() || name;
}

export default function CustomerDetailLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const id = params.id ?? "unknown";
  const { goBack } = useAppBack("/customers");

  const {
    data: customerDetailResponse,
    isLoading,
    isError,
    refetch: refetchCustomerDetail,
    isFetching: isFetchingCustomerDetail,
  } = useCustomerDetailQuery(id);

  const {
    data: projectsResponse,
    isLoading: isProjectsLoading,
    isSuccess: isProjectsSuccess,
  } = useCustomerProjectsQuery(id);
  const apiProjects = projectsResponse?.data?.projects ?? [];

  const { data: invoicesResponse } = useCustomerInvoicesQuery(id);
  const apiInvoices = invoicesResponse?.data?.invoices ?? [];

  const customerData = customerDetailResponse?.data.customer;
  const customerMongoId = customerData?._id || (id !== "unknown" ? id : "");

  const { data: customerDocumentsResponse } = useAdminCustomerDocumentsQuery(customerMongoId);
  const documentsCount = customerDocumentsResponse?.data?.documents?.length;

  const currentTab = searchParams.get("tab") === "documents" ? "documents" : "projects";

  const handleTabChange = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === "projects") {
          next.delete("tab");
        } else {
          next.set("tab", value);
        }
        return next;
      },
      { replace: true }
    );
  };

  const detailData = customerDetailResponse?.data as any;

  // Check whether financials or any KPI alias exists in detail data
  const hasFinancialsData = Boolean(
    detailData?.financials && Object.keys(detailData.financials).length > 0
  ) || Boolean(
    detailData?.customerRevenue && Object.keys(detailData.customerRevenue).length > 0
  ) || Boolean(
    detailData?.kpis && Object.keys(detailData.kpis).length > 0
  ) || typeof detailData?.totalPaid === "number"
    || typeof detailData?.revenueGenerated === "number"
    || typeof detailData?.pendingPayment === "number";

  const hasRefetchedRef = useRef(false);

  useEffect(() => {
    hasRefetchedRef.current = false;
  }, [id]);

  useEffect(() => {
    // If projects have loaded and detail financials was missing, refetch detail once
    if (isProjectsSuccess && !isProjectsLoading && customerDetailResponse?.data) {
      if (!hasFinancialsData && !hasRefetchedRef.current) {
        hasRefetchedRef.current = true;
        void refetchCustomerDetail();
      }
    }
  }, [isProjectsSuccess, isProjectsLoading, customerDetailResponse, hasFinancialsData, refetchCustomerDetail]);

  const isKpisLoading =
    isLoading ||
    (!hasFinancialsData &&
      (isProjectsLoading || isFetchingCustomerDetail || !hasRefetchedRef.current));

  // Fallbacks from projects and invoices if financials is missing from API
  const fallbackRevenue = useMemo(() => {
    if (!apiProjects.length) return null;
    return apiProjects.reduce((sum, p) => {
      const val =
        typeof p.quoteValue === "number" && Number.isFinite(p.quoteValue)
          ? p.quoteValue
          : typeof p.budget === "number" && Number.isFinite(p.budget)
            ? p.budget
            : typeof p.budget === "object" && typeof p.budget?.totalBudget === "number"
              ? p.budget.totalBudget
              : 0;
      return sum + val;
    }, 0);
  }, [apiProjects]);

  const fallbackInvoices = useMemo(() => {
    if (typeof invoicesResponse?.data?.total === "number") {
      return invoicesResponse.data.total;
    }
    if (apiInvoices.length > 0) {
      return apiInvoices.length;
    }
    return null;
  }, [invoicesResponse, apiInvoices]);

  const { fallbackPaid, fallbackPending } = useMemo(() => {
    if (!apiInvoices.length) return { fallbackPaid: null, fallbackPending: null };
    let paid = 0;
    let pending = 0;
    let hasPaid = false;
    let hasPending = false;
    for (const inv of apiInvoices) {
      const amount = inv.totalAmount ?? 0;
      const status = inv.status?.toLowerCase();
      if (status === "paid") {
        paid += amount;
        hasPaid = true;
      } else {
        pending += amount;
        hasPending = true;
      }
    }
    return {
      fallbackPaid: hasPaid ? paid : null,
      fallbackPending: hasPending ? pending : null,
    };
  }, [apiInvoices]);

  const totalPaidVal = extractKPIValue(
    detailData?.financials?.totalPaid,
    [
      detailData?.totalPaid,
      detailData?.kpis?.totalPaid,
      detailData?.customerRevenue?.totalReceived,
    ],
    fallbackPaid
  );

  const pendingPaymentVal = extractKPIValue(
    detailData?.financials?.pendingPayment,
    [
      detailData?.pendingPayment,
      detailData?.customerRevenue?.outstandingAmount,
      detailData?.kpis?.pendingPayment,
      detailData?.totalPending,
    ],
    fallbackPending
  );

  const totalInvoicesVal = extractKPIValue(
    detailData?.financials?.totalInvoices,
    [
      detailData?.totalInvoices,
      detailData?.kpis?.totalInvoices,
    ],
    fallbackInvoices
  );

  const revenueGeneratedVal = extractKPIValue(
    detailData?.financials?.revenueGenerated,
    [
      detailData?.revenueGenerated,
      detailData?.kpis?.revenueGenerated,
      detailData?.customerRevenue?.totalQuotedValue,
      detailData?.financials?.totalQuotedValue,
      detailData?.financials?.totalInvoiced,
    ],
    fallbackRevenue
  );

  const customerName =
    `${customerData?.firstName ?? ""} ${customerData?.lastName ?? ""}`.trim() ||
    "-";

  const phoneNumber = customerData?.phone?.number ?? "";
  const phoneCountryCode = customerData?.phone?.countryCode ?? "";
  const phone =
    phoneCountryCode && phoneNumber
      ? `${phoneCountryCode} ${phoneNumber}`
      : phoneNumber || "-";

  const joinedDate = formatJoinedDate(customerData?.createdAt);

  const customer = {
    id: customerData?.customerId ?? customerData?._id ?? id,
    customerName,
    email: customerData?.email ?? "-",
    phone,
    inquiryFor:
      customerDetailResponse?.data.projects?.[0]?.buildingType?.trim() ||
      apiProjects?.[0]?.buildingType?.trim() ||
      "-",
    status: customerData?.isActive ? "Active" : "Inactive",
    joined: joinedDate,
    address: "-",
  };

  const profileData = {
    name: customer.customerName,
    status: customer.status as "Active" | "Inactive",
    id: customer.id,
    joined: customer.joined,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
  };

  function humanizeStatus(s?: string) {
    if (!s) return "-";
    return s.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function formatDate(value?: string | null) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }

  // const photos = [photo1, photo2, photo3, photo4, photo5];
  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={() => goBack()}
            className="px-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-lg ">Customer Info</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button
            asChild
            className="w-full sm:w-auto bg-[#4285F4] hover:bg-blue-600 text-white shadow-xs"
          >
            <Link to={`/communication?customerId=${customerData?._id || id}`}>
              <MessageSquare className="h-4 w-4 mr-1.5" />
              Message Customer
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto bg-black px-4">
            <Link to={`/customers/${id}/edit`} state={{ from: location.pathname + location.search }}>Edit</Link>
          </Button>
          <Link to={`/customers/${id}/projects/new`}>
            <Button className="w-full sm:w-auto bg-[#1F86D5] hover:bg-[#1769A7]">
              Create new Project
            </Button>
          </Link>
          <Link to="/customers/meetings/schedule">
            <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
              <MailIcon className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </Link>
        </div>
      </div>

      {isError ? (
        <Card className="p-4">
          <CardContent className="px-0 py-0 text-sm text-red-600">
            Failed to load customer details. Please refresh and try again.
          </CardContent>
        </Card>
      ) : null}

      {/* Profile Card */}
      <ProfileCard profile={profileData} isLoading={isLoading} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isKpisLoading ? (
          <>
            <StatCardSkeleton color="bg-[#1D51A4]" />
            <StatCardSkeleton color="bg-[#FD8D5B]" />
            <StatCardSkeleton color="bg-[#EAB308]" />
            <StatCardSkeleton color="bg-[#A855F7]" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Paid"
              value={formatCurrency(totalPaidVal ?? 0)}
              color="bg-[#1D51A4]"
              icon={<DollarSign className="h-5 w-5 text-[#1D51A4]" />}
            />
            <StatCard
              title="Pending Payment"
              value={formatCurrency(pendingPaymentVal ?? 0)}
              color="bg-[#FD8D5B]"
              icon={<Clock3 className="h-5 w-5 text-[#FD8D5B]" />}
            />
            <StatCard
              title="Total Invoices"
              value={String(totalInvoicesVal ?? 0)}
              color="bg-[#EAB308]"
              icon={<FileText className="h-5 w-5 text-[#EAB308]" />}
            />
            <StatCard
              title="Revenue Generated"
              value={formatCurrency(revenueGeneratedVal ?? 0)}
              color="bg-[#A855F7]"
              icon={<DollarSign className="h-5 w-5 text-[#A855F7]" />}
            />
          </>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-2">
          <TabsList className="bg-slate-100 p-1 rounded-lg inline-flex">
            <TabsTrigger
              value="projects"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1D51A4] data-[state=active]:shadow-xs px-4 py-2 text-sm font-medium transition-all"
            >
              <FolderKanban className="h-4 w-4" />
              <span>Projects</span>
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1D51A4] data-[state=active]:shadow-xs px-4 py-2 text-sm font-medium transition-all"
            >
              <FileText className="h-4 w-4" />
              <span>Customer Documents</span>
              {typeof documentsCount === "number" && (
                <Badge
                  variant="secondary"
                  className="ml-1 text-[11px] px-1.5 py-0 bg-slate-200 text-slate-700 font-semibold"
                >
                  {documentsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="projects" className="mt-0 space-y-6 focus-visible:outline-none">
          <Card>
            <CardHeader>
              <CardTitle>All Project</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-0 pb-2">
              <div className="overflow-x-auto">
                <table className="w-full min-w-205">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4">
                        Project
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4">
                        Job ID
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4">
                        Project Name
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4">
                        Budget
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4">
                        Start Date
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiProjects.map((p, index) => (
                      <tr
                        key={p._id ?? index}
                        className="border-b last:border-0 hover:bg-transparent"
                      >
                        {/* Project N */}
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          Project {index + 1}
                        </td>
                        {/* Job ID */}
                        <td className="px-6 py-4 text-sm text-gray-700 font-mono text-xs">
                          {p._id.slice(-6).toUpperCase()}
                        </td>
                        {/* Project Name */}
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {cleanProjectName(p.projectName)}
                        </td>
                        {/* Budget */}
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatProjectBudget(p.budget, p.quoteValue)}
                        </td>
                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-medium ${p.isTerminated
                                ? "text-red-600"
                                : (p.lifecycleStatus || "").toLowerCase().includes("closed_won")
                                  ? "text-green-600"
                                  : "text-orange-500"
                              }`}
                          >
                            {p.isTerminated ? "Terminated" : humanizeStatus(p.lifecycleStatus)}
                          </span>
                        </td>
                        {/* Start Date */}
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatDate(p.createdAt)}
                        </td>
                        {/* Action */}
                        <td className="px-6 py-4">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() =>
                              navigate(
                                `/customers/${id}/project-details/${p._id}`,
                                { state: { from: location.pathname + location.search } },
                              )
                            }
                            className="h-6 w-6 rounded-full p-0 text-[#3B82F6] hover:bg-blue-50 hover:text-blue-700"
                            aria-label={`View ${cleanProjectName(p.projectName)}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pt-4 pb-2 text-center">
                <Button
                  variant="link"
                  className="text-blue-600 text-sm"
                  onClick={() =>
                    navigate(`/customers/${id}/projects`, {
                      state: { from: location.pathname + location.search },
                    })
                  }
                >
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>Invoice List</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 w-9 rounded border bg-white p-0 text-red-600 hover:bg-red-50"
                  aria-label="Export PDF"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 w-9 rounded border bg-white p-0 text-green-600 hover:bg-green-50"
                  aria-label="Export Excel"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 w-9 rounded border bg-white p-0 text-gray-600 hover:bg-gray-50"
                  aria-label="Print"
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-0 pt-0 pb-2">
              <div className="overflow-x-auto">
                <table className="w-full min-w-225">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Invoice Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Paid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Amount Due
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiInvoices.map((inv) => {
                      const invoiceDate = inv.date ? new Date(inv.date) : null;
                      const dueDate =
                        invoiceDate && typeof inv.daysToPay === "number"
                          ? new Date(
                            invoiceDate.getTime() +
                            inv.daysToPay * 24 * 60 * 60 * 1000,
                          )
                          : invoiceDate;

                      const amount = inv.totalAmount ?? 0;
                      const paid = inv.paidAt ? amount : (inv.depositAmount ?? 0);
                      const amountDue = Math.max(
                        0,
                        amount - (inv.depositAmount ?? 0),
                      );

                      return (
                        <tr
                          key={inv._id ?? inv.invoiceNumber}
                          className="border-b last:border-0 hover:bg-transparent"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-orange-500">
                            {inv.invoiceNumber ??
                              inv._id?.slice(-6).toUpperCase() ??
                              "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {dueDate
                              ? dueDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                              })
                              : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {formatCurrency(amount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {formatCurrency(paid)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {formatCurrency(amountDue)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold text-white ${(inv.status || "").toLowerCase() === "paid"
                                  ? "bg-emerald-500"
                                  : "bg-red-600"
                                }`}
                            >
                              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white" />
                              {inv.status ?? "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {inv.status === "Unpaid" ? (
                              <Button
                                type="button"
                                className="h-6 rounded-md bg-indigo-600 px-2.5 text-xs font-medium text-white hover:bg-indigo-700"
                              >
                                Mark as paid
                              </Button>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pt-0 pb-6">
              <div className="flex flex-col items-center justify-center py-10 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p>Not found</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-0 focus-visible:outline-none">
          <CustomerDocumentsTab
            customerId={customerMongoId}
            customerName={customerName}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
