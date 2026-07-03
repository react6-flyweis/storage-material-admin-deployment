import React, { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Bell,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Mail,
  MessageSquare,
  User,
  Phone,
  Calendar,
} from "lucide-react";

const mockNotifications = [
  {
    id: "NOT-001",
    title: "Delivery Scheduled: Primary frame steel",
    channelType: "Email Confirmation",
    channelIcon: Mail,
    deliveryId: "DEL-001",
    deliveryName: "Industrial Complex A",
    deliveryDesc: "Primary Frame Steel",
    recipientName: "Austin McClume",
    recipientEmail: "austin@acmecorp.com",
    recipientPhone: "",
    deliveryStatus: "Scheduled",
    recipientType: "Customer",
    sentDate: "2024-03-15",
    sentTime: "10:30 AM",
    status: "success",
  },
  {
    id: "NOT-002",
    title: "Reminder: Delivery in 48 hours",
    channelType: "48-Hour Reminder Channel: SMS",
    channelIcon: MessageSquare,
    deliveryId: "DEL-001",
    deliveryName: "Industrial Complex A",
    deliveryDesc: "Primary Frame Steel",
    recipientName: "Austin McClume",
    recipientEmail: "",
    recipientPhone: "+1 555-0303",
    deliveryStatus: "Rescheduled",
    recipientType: "Internal Staff",
    sentDate: "2024-03-23",
    sentTime: "8:00 AM",
    status: "pending",
  },
  {
    id: "NOT-003",
    title: "Delivery Scheduled: Roll-up doors",
    channelType: "Email Confirmation",
    channelIcon: Mail,
    deliveryId: "DEL-002",
    deliveryName: "Storage Facility B",
    deliveryDesc: "Primary Frame Steel",
    recipientName: "Sarah Johnson",
    recipientEmail: "sarah@buildtech.com",
    recipientPhone: "",
    deliveryStatus: "In Transit",
    recipientType: "Customer",
    sentDate: "2024-03-16",
    sentTime: "2:15 PM",
    status: "success",
  },
  {
    id: "NOT-004",
    title: "Reminder: Delivery tomorrow",
    channelType: "48-Hour Reminder Channel: SMS",
    channelIcon: MessageSquare,
    deliveryId: "DEL-001",
    deliveryName: "Industrial Complex A",
    deliveryDesc: "Primary Frame Steel",
    recipientName: "Austin McClume",
    recipientEmail: "",
    recipientPhone: "+1 555-0303",
    deliveryStatus: "Scheduled",
    recipientType: "Internal Staff",
    sentDate: "2024-03-24",
    sentTime: "8:00 AM",
    status: "success",
  },
];

export default function NotificationHistory() {
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRowClick = (notification: any) => {
    setSelectedNotification(notification);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#f9fafb] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
            Notification History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track all delivery notifications and reminders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-[4px] border-l-blue-500 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Sent</p>
              <h2 className="text-3xl font-bold text-slate-800 mt-1">6</h2>
            </div>
            <div className="text-blue-500">
              <Bell className="w-8 h-8" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-[4px] border-l-green-500 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Delivered</p>
              <h2 className="text-3xl font-bold text-slate-800 mt-1">3</h2>
            </div>
            <div className="text-green-500">
              <CheckCircle2 className="w-8 h-8" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-[4px] border-l-orange-500 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Pending</p>
              <h2 className="text-3xl font-bold text-slate-800 mt-1">1</h2>
            </div>
            <div className="text-orange-500">
              <Clock className="w-8 h-8" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-[4px] border-l-red-500 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Failed</p>
              <h2 className="text-3xl font-bold text-slate-800 mt-1">1</h2>
            </div>
            <div className="text-red-500">
              <XCircle className="w-8 h-8" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-sm rounded-xl overflow-hidden border-0">
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search notifications..." 
              className="pl-9 bg-slate-100 border-none rounded-lg"
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
            Filter
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-sm rounded-xl overflow-hidden border-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-slate-500 font-semibold text-xs uppercase border-b">
              <tr>
                <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded" /></th>
                <th className="px-6 py-4">Notification</th>
                <th className="px-6 py-4">Channel</th>
                <th className="px-6 py-4">Delivery</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Delivery Status</th>
                <th className="px-6 py-4">Recipient Type</th>
                <th className="px-6 py-4">Sent Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {mockNotifications.map((item, idx) => {
                const Icon = item.channelIcon;
                return (
                  <tr key={idx} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(item)}>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <div className="mt-1">
                          <div className={`w-3 h-3 rounded-sm ${item.status === 'success' ? 'bg-green-500' : item.status === 'pending' ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight mb-1">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-50 p-1.5 rounded-full text-blue-600">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-slate-600">{item.channelType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{item.deliveryId}</p>
                      <p className="text-xs text-muted-foreground">{item.deliveryName}</p>
                      <p className="text-xs text-muted-foreground">{item.deliveryDesc}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="bg-purple-100 p-1 rounded-full text-purple-600">
                          <User className="w-3 h-3" />
                        </div>
                        <span className="font-medium text-slate-900">{item.recipientName}</span>
                      </div>
                      {item.recipientEmail && (
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{item.recipientEmail}</span>
                        </div>
                      )}
                      {item.recipientPhone && (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{item.recipientPhone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.deliveryStatus}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.recipientType}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-3 h-3 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-slate-600">{item.sentDate}</p>
                          <p className="text-slate-600">{item.sentTime}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dialog Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md text-center p-8 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6">Delivery Scheduled</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <h3 className="text-2xl font-bold text-blue-600 mb-8 leading-tight">
              Primary Frame Steel will<br/>be delivered
            </h3>
            
            <p className="text-lg font-bold text-slate-800 mb-2">
              Date: March 25
            </p>
            <p className="text-lg font-bold text-slate-800 mb-8">
              Time: 8:00 AM – 12:00 PM
            </p>
            
            <Button 
              className="w-full sm:w-[80%] mx-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 text-lg"
              onClick={() => setIsDialogOpen(false)}
            >
              Ok
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
