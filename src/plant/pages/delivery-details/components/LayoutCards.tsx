import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, Truck } from "lucide-react";
import { StatusBadge } from "./InfoDisplay";

export const CustomCard = ({
  title,
  children,
  status,
  className
}: {
  title: string;
  children: React.ReactNode;
  status?: string;
  className?: string;
}) => (
  <Card className={className}>
    <CardHeader className="pb-0">
      <CardTitle className="text-base lg:text-lg font-semibold text-[#212B36]">{title}</CardTitle>
      {status && (
        <CardAction>
          <StatusBadge status={status} />
        </CardAction>
      )}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export const ContactCard = ({
  title,
  company,
  contact,
  phone,
  email,
  showTruckIcon
}: {
  title: string;
  company?: string;
  contact?: string;
  phone?: string;
  email?: string;
  showTruckIcon?: boolean;
}) => (
  <div className="bg-white border border-gray-100 rounded-[14px] p-4 lg:p-6 shadow-sm space-y-4 min-h-[180px] font-inter">
    <h3 className="text-base font-medium text-[#212B36]">{title}</h3>

    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {showTruckIcon ? (
          <Truck size={18} className="text-[#6A7282] shrink-0" />
        ) : (
          <User size={18} className="text-[#6A7282] shrink-0" />
        )}
        <p className="font-medium text-[#212B36] text-base">{company}</p>
      </div>

      <div className="space-y-2.5">
        {contact && (
          <div className="flex items-center gap-3 text-[#6A7282] shrink-0">
            <User size={18} strokeWidth={2} />
            <span className="text-sm font-normal text-[#4A5565]">{contact}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-3 text-[#6A7282] shrink-0">
            <Phone size={18} strokeWidth={2} />
            <span className="text-sm font-medium text-[#4A5565]">{phone}</span>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-3 text-[#6A7282] shrink-0">
            <Mail size={18} strokeWidth={2} />
            <span className="text-sm font-medium text-[#4A5565] text-ellipsis overflow-hidden">{email}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

export const QuickActionButton = ({
  icon: Icon,
  label,
  onClick,
  disabled
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    variant="outline"
    className="w-full justify-start gap-2"
  >
    <Icon size={16} />
    <span className="text-sm md:text-base font-medium text-[#0A0A0A]">{label}</span>
  </Button>
);

export const TimelineItem = ({
  status,
  date,
  description,
  isLast
}: {
  status: string;
  date: string;
  description: string;
  isLast?: boolean;
}) => (
  <div className="flex gap-4 relative font-inter">
    {!isLast && <div className="absolute left-[5px] top-4 bottom-0 w-[2px] bg-[#E5E7EB]" />}
    <div className="w-3 h-3 rounded-full bg-[#2B7FFF] shrink-0 mt-1.5 z-10" />
    <div className="flex-1 min-w-0 pb-6">
      <p className="text-sm font-semibold text-[#212B36]">{status}</p>
      <p className="text-xs font-normal text-[#6A7282] shrink-0 mt-0.5">{date}</p>
      <p className="text-xs text-[#6A7282] shrink-0 mt-1.5 leading-relaxed bg-[#F4F6F8] p-2 md:p-2.5 rounded-lg border border-gray-50">
        {description}
      </p>
    </div>
  </div>
);
