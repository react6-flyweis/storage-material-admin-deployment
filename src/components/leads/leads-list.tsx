import { Link } from "react-router";
import {
  MessageSquare,
  Eye,
  UserPlus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getLeadLifecycleBadgeClassName } from "@/modules/leads/lead-lifecycle";
import AssignSalesDialog from "@/components/leads/assign-sales-dialog";
import DeleteLeadDialog from "@/components/leads/delete-lead-dialog";
import ChatDialog from "@/components/leads/chat-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type LeadTableRow = {
  id: string;
  backendId?: string;
  name: string;
  customerName: string;
  workshop: string;
  category: string;
  assignedTo: string | null;
  assignedToName: string;
  assignmentStatus: string;
  score: number;
  progress: number;
  progressStep: string;
  lifecycleStatus?: string;
  status: string;
  quoteValue: string;
  chatCount: number;
  createdAt: Date;
};

interface LeadsListProps {
  leads: LeadTableRow[];
  isLoading?: boolean;
  selectedLeads: string[];
  onSelectLead: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  page: number;
  limit: number;
  total: number;
  onPageChange: (newPage: number) => void;
}

const getScoreColorClass = (score: number) => {
  if (score < 30) return "bg-blue-500";
  if (score < 50) return "bg-green-500";
  if (score < 80) return "bg-amber-500";
  return "bg-red-500";
};

const getScoreTextColorClass = (score: number) => {
  if (score < 30) return "text-blue-600";
  if (score < 50) return "text-green-600";
  if (score < 80) return "text-amber-600";
  return "text-red-600";
};

export default function LeadsList({
  leads,
  isLoading = false,
  selectedLeads,
  onSelectLead,
  onSelectAll,
  page,
  limit,
  total,
  onPageChange,
}: LeadsListProps) {
  const isAllSelected = leads.length > 0 && selectedLeads.length === leads.length;

  return (
    <Card className="p-0">
      <CardContent className="p-0">
        <div className="overflow-y-auto">
          <Table>
            <TableHeader className="bg-gray-50 border-b">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="px-4 py-3 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Lead Info
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Assigned To
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Score
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Quote Value
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Chat
                </TableHead>
                <TableHead className="px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    Loading leads...
                  </TableCell>
                </TableRow>
              )}
              {leads.map((lead, index) => (
                <TableRow
                  key={lead.id + index}
                  className="hover:bg-gray-50"
                >
                  <TableCell className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={(e) =>
                        onSelectLead(lead.id, e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-[13px] text-gray-900 text-nowrap whitespace-nowrap">
                        {lead.customerName}
                      </span>
                      {lead.name && (
                        <span className="text-[12px] text-gray-500 text-nowrap mt-0.5">
                          {lead.name}
                        </span>
                      )}
                      <span className="text-[12px] text-gray-500 text-nowrap mt-0.5">
                        {lead.id}
                      </span>
                      <span className="text-[12px] text-gray-500 text-nowrap mt-0.5">
                        {lead.workshop} · {lead.category}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {lead.assignedTo ? (
                        <>
                          <Avatar className="h-7 w-7 bg-green-50 border border-green-100">
                            <AvatarFallback className="text-[11px] font-semibold text-green-700">
                              {lead.assignedToName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-medium text-gray-900 text-nowrap whitespace-nowrap">
                              {lead.assignedToName}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {lead.assignmentStatus}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Avatar className="h-7 w-7 bg-green-50 border border-green-100">
                            <AvatarFallback className="text-[11px] text-green-600">
                              <UserPlus className="h-3.5 w-3.5" />
                            </AvatarFallback>
                          </Avatar>
                          <AssignSalesDialog
                            leadId={lead.backendId!}
                            trigger={
                              <span className="text-[13px] text-blue-600 font-medium cursor-pointer hover:underline">
                                {lead.assignmentStatus}
                              </span>
                            }
                          />
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-4 w-32 rounded-full bg-gray-200 overflow-hidden flex items-center">
                        <div
                          className={cn(
                            "absolute left-0 top-0 h-full rounded-full",
                            getScoreColorClass(lead.score),
                          )}
                          style={{
                            width: `${Math.max(0, Math.min(100, lead.score))}%`,
                          }}
                        />
                        <span
                          className={cn(
                            "absolute right-3 text-[11px] font-bold",
                            getScoreTextColorClass(lead.score),
                          )}
                        >
                          {lead.score}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      className={cn(
                        getLeadLifecycleBadgeClassName(lead.lifecycleStatus),
                        "border-none shadow-none px-3 py-1 font-medium",
                      )}
                    >
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 font-bold text-gray-900 text-[13px]">
                    {lead.quoteValue}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <ChatDialog
                      lead={lead}
                      trigger={
                        <div className="relative inline-flex items-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-full border border-blue-100 text-blue-600 hover:bg-blue-100 h-8 text-[12px] px-3 font-medium bg-blue-50/50"
                          >
                            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                            Chat
                          </Button>
                          {lead.chatCount > 0 && (
                            <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                              {lead.chatCount}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-3 text-indigo-700">
                      <Link to={`/leads/${lead.backendId}`}>
                        <Eye className="w-4 h-4 cursor-pointer hover:text-indigo-900 transition-colors" />
                      </Link>
                      <AssignSalesDialog
                        leadId={lead.backendId!}
                        trigger={
                          <UserPlus className="w-4 h-4 cursor-pointer hover:text-indigo-900 transition-colors" />
                        }
                      />
                      {lead.backendId && (
                        <DeleteLeadDialog
                          leadId={lead.backendId}
                          leadName={lead.customerName || lead.name}
                          trigger={
                            <Trash2 className="w-4 h-4 cursor-pointer text-red-500 hover:text-red-700 transition-colors" />
                          }
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && leads.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No leads match your search or filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && total > 0 ? (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex flex-1 items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(page - 1) * limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * limit, total)}
                  </span>{" "}
                  of <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page * limit >= total}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
