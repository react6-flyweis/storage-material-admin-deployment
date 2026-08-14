import { ContactCard } from "./LayoutCards";

interface DeliveryContactsProps {
  vendorName: string;
  vendorContact: string;
  vendorPhone: string;
  vendorEmail: string;
  carrierName: string;
  carrierContact: string;
  carrierPhone: string;
  internalOwnerName: string;
  internalOwnerPhone: string;
  internalOwnerEmail: string;
  deliveryId: string;
  deliveryDescription: string;
  loadSizeQty: string;
  deliveryMaterialType: string;
}

export const DeliveryContacts = ({
  vendorName,
  vendorContact,
  vendorPhone,
  vendorEmail,
  carrierName,
  carrierContact,
  carrierPhone,
  internalOwnerName,
  internalOwnerPhone,
  internalOwnerEmail,
  deliveryId,
  deliveryDescription,
  loadSizeQty,
  deliveryMaterialType
}: DeliveryContactsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <ContactCard
        title="Vendor"
        company={vendorName || "—"}
        contact={vendorContact || "—"}
        phone={vendorPhone || "—"}
        email={vendorEmail || "—"}
      />
      <ContactCard
        title="Delivery Company"
        company={carrierName || "—"}
        contact={carrierContact || "—"}
        phone={carrierPhone || "—"}
        showTruckIcon
      />
      <ContactCard
        title="Internal Owner"
        company={internalOwnerName || "—"}
        contact={internalOwnerName || "—"}
        phone={internalOwnerPhone || "—"}
        email={internalOwnerEmail || "—"}
      />

      <div className="bg-white border border-gray-100 rounded-[14px] p-4 lg:p-6 shadow-sm space-y-4 min-h-[180px] font-inter">
        <h3 className="text-base font-medium text-[#212B36]">Delivery Priority, Type, Size</h3>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#212B36]">
            {deliveryId || "—"} – {deliveryDescription || "—"}
          </p>
          <div className="space-y-2 text-sm text-[#212B36]">
            <p>
              <span className="font-semibold text-[#6A7282] uppercase text-xs mr-2">Priority:</span> Critical
            </p>
            <p>
              <span className="font-semibold text-[#6A7282] uppercase text-xs mr-2">Delivery Type:</span>{" "}
              {deliveryMaterialType || "—"}
            </p>
            <p>
              <span className="font-semibold text-[#6A7282] uppercase text-xs mr-2">Load Size / Quantity:</span>{" "}
              {loadSizeQty || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
