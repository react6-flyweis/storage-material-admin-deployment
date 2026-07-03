import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft, Calendar, Clock, MapPin, Box, User, Phone, Mail, RotateCcw, 
  Edit3, CalendarDays, CheckSquare, Bell, Download, FileText, CheckCircle2, Check 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RescheduleDeliveryDialog from "@/plant/components/RescheduleDeliveryDialog";
import MarkDeliveredSuccessDialog from "@/plant/components/MarkDeliveredSuccessDialog";

export default function DeliveryDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isMarkDeliveredOpen, setIsMarkDeliveredOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#f9fafb] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/plant')}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
              Delivery Details
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {id || "DEL-001"} - Primary frame steel
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                className="bg-white gap-2 font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white gap-2 font-semibold px-5"
                onClick={() => setIsEditing(false)}
              >
                <Check className="w-4 h-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="bg-white gap-2 font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
                onClick={() => setIsRescheduleOpen(true)}
              >
                <RotateCcw className="w-4 h-4" />
                Reschedule
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold px-5"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-4 h-4" />
                Edit Delivery
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Delivery Overview */}
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900">Delivery Overview</h2>
                <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-700 border-0 px-3 py-1 rounded-full text-xs font-medium">
                  Scheduled
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Project</p>
                  {isEditing ? (
                    <Select defaultValue="industrial_a">
                      <SelectTrigger className="h-10 bg-white">
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="industrial_a">Industrial Complex A</SelectItem>
                        <SelectItem value="storage_b">Storage Facility B</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <BuildingIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-900 font-medium">Industrial Complex A</span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Customer</p>
                  {isEditing ? (
                    <Select defaultValue="acme">
                      <SelectTrigger className="h-10 bg-white">
                        <SelectValue placeholder="Select Customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acme">Acme Corporation</SelectItem>
                        <SelectItem value="buildtech">BuildTech LLC</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm text-slate-900 font-medium">Acme Corporation</span>
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Delivery Date</p>
                  {isEditing ? (
                    <Input type="date" defaultValue="2024-03-25" className="h-10 bg-slate-50 border-slate-200" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-900 font-medium">2024-03-25</span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Time Window</p>
                  {isEditing ? (
                    <Input type="text" defaultValue="8:00 AM - 12:00 PM" className="h-10 bg-slate-50 border-slate-200" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-900 font-medium">8:00 AM - 12:00 PM</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Site Address</p>
                  {isEditing ? (
                    <Input disabled value="1234 Industrial Blvd, Austin, TX 78701" className="h-10 bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-900 font-medium">1234 Industrial Blvd, Austin, TX 78701</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Delivery Information */}
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Delivery Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div className="md:col-span-2">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</p>
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-900">Primary frame steel</span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Material Category</p>
                  <span className="text-sm text-slate-900">Steel</span>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Pickup Date</p>
                  <span className="text-sm text-slate-900">2024-03-24</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Vendor & Delivery Company Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
              <div className="p-6">
                <h2 className="text-base font-bold text-slate-900 mb-5">Vendor</h2>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-900">Steel Supply Co</p>
                  <div className="flex items-center gap-3 text-slate-600">
                    <User className="w-4 h-4" />
                    <span className="text-sm">John Miller</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">+1 555-0101</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">john@steelsupply.com</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
              <div className="p-6">
                <h2 className="text-base font-bold text-slate-900 mb-5">Delivery Company</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TruckIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-900">Fast Freight LLC</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 pl-6">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Sarah Transport</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 pl-6">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">+1 555-0202</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
              <div className="p-6">
                <h2 className="text-base font-bold text-slate-900 mb-5">Internal Owner</h2>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-900">Mike Johnson – Logistics</p>
                  <div className="flex items-center gap-3 text-slate-600">
                    <User className="w-4 h-4" />
                    <span className="text-sm">John Johnson</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">+1 555-0101</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">john@steelsupply.com</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
              <div className="p-6">
                <h2 className="text-base font-bold text-slate-900 mb-5">Delivery Priority, Type, Size</h2>
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-slate-900">DEL-001 – Primary Frame Steel</p>
                  <p className="text-sm font-semibold text-slate-900">Priority: Critical</p>
                  <p className="text-sm font-semibold text-slate-900">Delivery Type: Primary Steel</p>
                  <p className="text-sm font-semibold text-slate-900">Load Size / Quantity: 2 pallets</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Site Coordination */}
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Site Coordination</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Site Instructions</p>
                  {isEditing ? (
                    <Textarea defaultValue="Deliver to rear entrance, mud-free zone required" className="min-h-[80px] bg-white border-slate-200" />
                  ) : (
                    <p className="text-sm text-slate-900 font-medium">Deliver to rear entrance, mud-free zone required</p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Required Equipment</p>
                  {isEditing ? (
                    <Input disabled value="5,000 lb forklift required" className="h-10 bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200" />
                  ) : (
                    <p className="text-sm text-slate-900">5,000 lb forklift required</p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Equipment Confirmation Status</p>
                  <p className="text-sm text-slate-900 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmed
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Special Notes</p>
                  {isEditing ? (
                    <Textarea defaultValue="Call 30 minutes before arrival" className="min-h-[80px] bg-white border-slate-200" />
                  ) : (
                    <p className="text-sm text-slate-900">Call 30 minutes before arrival</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Freight Link */}
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Freight Link</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Freight Load ID</p>
                  <p className="text-sm text-slate-900">FL-2031</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Awarded Carrier</p>
                  <p className="text-sm text-slate-900">Fast Freight LLC</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Price</p>
                  <p className="text-sm text-slate-900">$1,250</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Notification History Snippet */}
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Notification History</h2>
              
              <div className="space-y-3">
                {/* Item 1 */}
                <div className="bg-[#f9fafb] p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Email Confirmation</p>
                      <p className="text-xs text-slate-500">austin@acmecorp.com</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <Badge className="bg-green-100 hover:bg-green-100 text-green-700 border-0">Sent</Badge>
                    <p className="text-xs text-slate-500 mt-1">2024-03-15 10:30 AM</p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="bg-[#f9fafb] p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">48-Hour SMS Reminder, Email ✓ - SMS ✓</p>
                      <p className="text-xs text-slate-500">+1 555-0303</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-700 border-0">Scheduled</Badge>
                    <p className="text-xs text-slate-500 mt-1">2024-03-23 8:00 AM</p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="bg-[#f9fafb] p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">24-Hour SMS Reminder, Email ✓ - SMS ✓</p>
                      <p className="text-xs text-slate-500">+1 555-0303</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-700 border-0">Scheduled</Badge>
                    <p className="text-xs text-slate-500 mt-1">2024-03-24 8:00 AM</p>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="bg-[#f9fafb] p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Delivery Day Email, Email ✓ - SMS ✓</p>
                      <p className="text-xs text-slate-500">austin@acmecorp.com</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-700 border-0">Scheduled</Badge>
                    <p className="text-xs text-slate-500 mt-1">2024-03-25 6:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Receiving Point of Contact */}
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
            <div className="p-6">
              <h2 className="text-base font-bold text-slate-900 mb-5">Receiving Point of Contact</h2>
              <div className="flex items-center gap-3 mb-5">
                <Avatar className="h-10 w-10 bg-blue-100 text-blue-600 font-bold">
                  <AvatarFallback>AM</AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-slate-900">Austin McClume</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">+1 555-0303</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">austin@acmecorp.com</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
            <div className="p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-slate-700 h-11 rounded-lg border-slate-200 hover:bg-slate-50"
                  onClick={() => setIsRescheduleOpen(true)}
                >
                  <CalendarDays className="w-4 h-4 mr-3 text-slate-400" />
                  Reschedule Delivery
                </Button>
                <Button variant="outline" className="w-full justify-start text-slate-700 h-11 rounded-lg border-slate-200 hover:bg-slate-50">
                  <TruckIcon className="w-4 h-4 mr-3 text-slate-400" />
                  Mark In Transit
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-slate-700 h-11 rounded-lg border-slate-200 hover:bg-slate-50"
                  onClick={() => setIsMarkDeliveredOpen(true)}
                >
                  <CheckSquare className="w-4 h-4 mr-3 text-slate-400" />
                  Mark Delivered
                </Button>
                <Button variant="outline" className="w-full justify-start text-slate-700 h-11 rounded-lg border-slate-200 hover:bg-slate-50">
                  <Bell className="w-4 h-4 mr-3 text-slate-400" />
                  Send Reminder Now
                </Button>
                <Button variant="outline" className="w-full justify-start text-slate-700 h-11 rounded-lg border-slate-200 hover:bg-slate-50">
                  <Download className="w-4 h-4 mr-3 text-slate-400" />
                  Download Details
                </Button>
                <Button variant="outline" className="w-full justify-start text-slate-700 h-11 rounded-lg border-slate-200 hover:bg-slate-50">
                  <FileText className="w-4 h-4 mr-3 text-slate-400" />
                  View Documents
                </Button>
              </div>
            </div>
          </Card>

          {/* Status History */}
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
            <div className="p-6">
              <h2 className="text-base font-bold text-slate-900 mb-6">Status History</h2>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                
                <div className="relative flex items-start gap-4">
                  <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white z-10 shrink-0 shadow-sm" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Created</h3>
                    <p className="text-xs text-slate-500 mt-0.5">2024-03-15 10:30 AM</p>
                    <p className="text-[11px] text-slate-500 mt-1">Delivery created and scheduled<br/>by John Smith</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white z-10 shrink-0 shadow-sm" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Confirmed</h3>
                    <p className="text-xs text-slate-500 mt-0.5">2024-03-16 2:15 PM</p>
                    <p className="text-[11px] text-slate-500 mt-1">Delivery confirmed by vendor<br/>by System</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white z-10 shrink-0 shadow-sm" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Rescheduled</h3>
                    <p className="text-xs text-slate-500 mt-0.5">2024-04-01 2:15 PM</p>
                    <p className="text-[11px] text-slate-500 mt-1">Delivery confirmed by vendor<br/>by System</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4 opacity-50">
                  <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white z-10 shrink-0 shadow-sm" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">In Transit</h3>
                    <p className="text-xs text-slate-500 mt-0.5">2024-04-01 2:15 PM</p>
                    <p className="text-[11px] text-slate-500 mt-1">Delivery confirmed by vendor<br/>by System</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4 opacity-50">
                  <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white z-10 shrink-0 shadow-sm" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Delivered</h3>
                    <p className="text-xs text-slate-500 mt-0.5">2024-04-01 2:15 PM</p>
                    <p className="text-[11px] text-slate-500 mt-1">Delivery confirmed by vendor<br/>by System</p>
                  </div>
                </div>

              </div>
            </div>
          </Card>
        </div>
      </div>

      <RescheduleDeliveryDialog 
        open={isRescheduleOpen} 
        onOpenChange={setIsRescheduleOpen} 
      />

      <MarkDeliveredSuccessDialog
        open={isMarkDeliveredOpen}
        onOpenChange={setIsMarkDeliveredOpen}
      />
    </div>
  );
}

function BuildingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function TruckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" />
      <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" />
      <circle cx="7" cy="18" r="2" />
      <path d="M15 18H9" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}
