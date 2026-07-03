import { useState } from "react";
import { Plus, Upload, List } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "../assets/logo.svg";
import AddClientIcon from "../assets/icon/AddClientIcon.svg";
import AddClientModal from "../components/modals/AddClientModal";
import UploadImageModal from "../components/modals/UploadImageModal";
import ItemListModal from "../components/modals/ItemListModal";
import TaxModal, { type TaxRate } from "../components/modals/TaxModal";
import InvoiceActionModal from "../components/modals/InvoiceActionModal";
import PaymentScheduleModal, {
  type PaymentEntry,
} from "../components/modals/PaymentScheduleModal";
import SuccessModal from "../components/common_components/SuccessModal";

// Types
interface InvoiceItem {
  id: string;
  description: string;
  rate: number;
  markup: number;
  quantity: number;
  tax: TaxRate | null;
  notes: string;
  photos: string[];
}

export default function NewInvoice() {
  const navigate = useNavigate();
  const [invoiceNumber, setInvoiceNumber] = useState("2460");
  const [date, setDate] = useState("2025-10-25");
  const [daysToPay, setDaysToPay] = useState("15");
  const [poNumber, setPoNumber] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      description: "",
      rate: 75000.0,
      markup: 0,
      quantity: 1,
      tax: { id: "1", name: "Argyle", rate: 8.25 },
      notes: "",
      photos: ["Image123.png"],
    },
    {
      id: "2",
      description: "",
      rate: 75000.0,
      markup: 0,
      quantity: 1,
      tax: null,
      notes: "",
      photos: [],
    },
  ]);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [activeUploadItemId, setActiveUploadItemId] = useState<string | null>(
    null
  );

  const [isItemListModalOpen, setIsItemListModalOpen] = useState(false);
  const [activeItemListId, setActiveItemListId] = useState<string | null>(null);

  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [activeTaxItemId, setActiveTaxItemId] = useState<string | null>(null);

  const [markup, setMarkup] = useState({ value: 0, unit: "%" as "%" | "$" });
  const [discount, setDiscount] = useState({
    value: 0,
    unit: "%" as "%" | "$",
  });
  const [deposit, setDeposit] = useState({ value: 0, unit: "%" as "%" | "$" });

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [activeActionType, setActiveActionType] = useState<
    "markup" | "discount" | "deposit" | null
  >(null);

  const [paymentSchedule, setPaymentSchedule] = useState<{
    payments: PaymentEntry[];
    unit: "%" | "$";
  }>({
    payments: [{ id: "1", name: "Deposit", amount: 0 }],
    unit: "%",
  });
  const [isPaymentScheduleModalOpen, setIsPaymentScheduleModalOpen] =
    useState(false);

  const addNewItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: "",
        rate: 0,
        markup: 0,
        quantity: 1,
        tax: null,
        notes: "",
        photos: [],
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleAddClient = (selectedClients: any[]) => {
    console.log("Adding clients:", selectedClients);
    // Logic to update invoice with client info would go here
    setIsClientModalOpen(false);
  };

  const handleUploadPhoto = (file: File) => {
    if (activeUploadItemId) {
      const fileUrl = URL.createObjectURL(file);
      setItems(
        items.map((i) =>
          i.id === activeUploadItemId
            ? { ...i, photos: [...i.photos, fileUrl] }
            : i
        )
      );
      setActiveUploadItemId(null);
      setIsUploadModalOpen(false);
    }
  };

  const handleItemListSelect = (description: string) => {
    if (activeItemListId) {
      setItems(
        items.map((i) =>
          i.id === activeItemListId ? { ...i, description } : i
        )
      );
      setIsItemListModalOpen(false);
      setActiveItemListId(null);
    }
  };

  const handleTaxSelect = (tax: TaxRate | null) => {
    if (activeTaxItemId) {
      setItems(
        items.map((i) => (i.id === activeTaxItemId ? { ...i, tax } : i))
      );
      setIsTaxModalOpen(false);
      setActiveTaxItemId(null);
    }
  };

  const calculateTotal = (item: InvoiceItem) => {
    // Basic calculation logic without tax for the column usually?
    // Or normally Total column includes Tax if "Tax Inclusive"?
    // Let's assume Total column is pre-tax in this UI based on footer summary usually adding tax at end.
    // BUT the footer adds tax.
    // Looking at the footer, Subtotal + Tax = Total.
    // So line item "Total" usually means Quantity * Rate.
    return item.rate * item.quantity;
  };

  const subtotal = items.reduce((acc, item) => acc + calculateTotal(item), 0);

  const calculateMarkup = () => {
    if (markup.unit === "%") {
      return subtotal * (markup.value / 100);
    }
    return markup.value;
  };

  const calculateDiscount = () => {
    if (discount.unit === "%") {
      return (subtotal + calculateMarkup()) * (discount.value / 100);
    }
    return discount.value;
  };

  const markupAmount = calculateMarkup();
  const discountAmount = calculateDiscount();

  const taxAmount = items.reduce((acc, item) => {
    if (item.tax) {
      return acc + item.rate * item.quantity * (item.tax.rate / 100);
    }
    return acc;
  }, 0);

  const total = subtotal + markupAmount - discountAmount + taxAmount;

  const calculateDeposit = () => {
    if (deposit.unit === "%") {
      return total * (deposit.value / 100);
    }
    return deposit.value;
  };

  const depositAmount = calculateDeposit();

  return (
    <div className="md:px-5 px-2 md:pt-5 pb-10 space-y-6 min-w-xs">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Invoice#{invoiceNumber}
        </h1>
        <div className="flex items-center gap-3 ml-auto">
          <Button
            variant="outline"
            className="bg-white hover:bg-gray-50 text-black border-gray-200"
            onClick={() => navigate('/accounts/invoices')}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#2563EB] hover:bg-blue-700 text-white px-6"
            onClick={() => {
              setModalTitle("Invoice Generated Successfully");
              setIsSuccessModalOpen(true);
              setTimeout(() => {
                setIsSuccessModalOpen(false);
              }, 3000);
            }}
          >
            Save
          </Button>
        </div>
      </header>

      <div className="bg-white rounded-md p-4 sm:p-8 lg:p-10 shadow-sm mx-auto max-w-7xl">
        {/* Top Section: Client Info & Invoice Details */}
        <div className="flex flex-col lg:flex-row justify-between gap-10 mb-12">
          {/* Left: Organization Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center shrink-0">
                <img
                  src={logo}
                  alt="Logo"
                  className="md:w-29 w-20 md:h-16  object-contain"
                />
              </div>
            </div>

            <div className="text-sm text-#616161 leading-relaxed max-w-[250px]">
              1851 Madison Ave Suite 300
              <br />
              Council Bluffs, IA
              <br />
              51503
              <br />
              United States
              <br />
              travis@storagematerials.com
              <br />
              www.storagematerials.com
            </div>
          </div>

          {/* Right: Invoice Meta & Client Add */}
          <div className="flex-1 max-w-2xl flex flex-col gap-6">
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="lg:w-60 lg:h-15 border-blue-200 text-blue-600 hover:bg-blue-50 sm:w-auto h-12 px-8 flex items-center gap-2 rounded-md font-normal lg:text-sm"
                onClick={() => setIsClientModalOpen(true)}
              >
                <img
                  src={AddClientIcon}
                  alt="Add Client"
                  className="md:h-5 md:w-5 h-4 w-4"
                />
                ADD CLIENT
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Invoice #
                </label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="bg-white border-[#C5C5C5] mt-2 h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">Date</label>
                <Input
                  type="date"
                  className="bg-white border-[#C5C5C5] mt-2 h-11"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Days to pay
                </label>
                <Input
                  value={daysToPay}
                  onChange={(e) => setDaysToPay(e.target.value)}
                  className="bg-white border-[#C5C5C5] mt-2 h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  PO number
                </label>
                <Input
                  placeholder="PO number"
                  className="bg-white border-[#C5C5C5] mt-2 h-11"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Headers */}
        <div className="hidden md:grid grid-cols-12 gap-4 bg-[#F9FAFB] py-3 px-4 rounded-lg mb-4 text-xs font-normal text-[#6B7280] uppercase tracking-wider">
          <div className="col-span-5">Description</div>
          <div className="col-span-2 text-center">Rate</div>
          <div className="col-span-1 text-center">Markup</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-1 text-center">Tax</div>
          <div className="col-span-1 text-right">Total</div>
        </div>

        {/* <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${"bg-gray-200"}`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${"translate-x-1"}`}
              />
            </button>
            <span className="text-sm text-[#6B7280] font-normal font-inter">
              Group items into Sections
            </span>
          </div>
        </div> */}

        {/* Invoice Items List */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <button
                onClick={() => removeItem(item.id)}
                className="absolute md:-left-8 left-0.5 top-4.5 text-red-500 hover:text-red-700  group-hover:opacity-100 transition-opacity"
                title="Remove item"
              >
                <div className="md:w-5 md:h-5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white">
                  <span className="h-0.5 w-3 bg-white"></span>
                </div>
              </button>

              <div className="border border-gray-200 rounded-lg overflow-x-auto scroll-smooth">
                {/* Main Item Row */}
                <div className="grid grid-cols-12 bg-white min-w-[900px]">
                  {/* Description & Item List - Full width on mobile */}
                  <div className="col-span-5 min-w-[300px] p-3 flex items-center gap-4 border-r border-gray-300">
                    <input
                      type="text"
                      placeholder="Description"
                      className="md:ml-2 ml-4 text-sm md:max-w-lg text-gray-600 placeholder:text-gray-400 focus:outline-none focus:bg-gray-50/50 transition-colors"
                      // value={item.description}
                      onChange={() => {}}
                    />
                    <div className="ml-auto">
                      <button
                        className="text-[#2563EB] flex items-center gap-1.5 text-xs font-normal hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                        onClick={() => {
                          setActiveItemListId(item.id);
                          setIsItemListModalOpen(true);
                        }}
                      >
                        <List className="w-3 h-3" />
                        Item list
                      </button>
                    </div>
                  </div>

                  {/* Rate */}
                  <div className="col-span-2 p-3 flex items-center justify-center border-r border-gray-300">
                    {/* <span className="md:hidden text-gray-400 text-[10px] uppercase tracking-wide mb-1">
                      Rate
                    </span> */}
                    <span className="text-gray-600 text-sm font-medium">
                      $
                      {item.rate.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  {/* Markup */}
                  <div className="col-span-1 p-3 flex items-center justify-center border-r border-gray-300">
                    {/* <span className="md:hidden text-gray-400 text-[10px] uppercase tracking-wide mb-1">
                      Markup
                    </span> */}
                    <span className="text-gray-600 text-sm">Markup</span>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-1 p-3 flex items-center justify-center border-r border-gray-300">
                    {/* <span className="md:hidden text-gray-400 text-[10px] uppercase tracking-wide mb-1">
                      Quantity
                    </span> */}
                    <span className="text-gray-600 text-sm">
                      {item.quantity}
                    </span>
                  </div>

                  {/* Tax */}
                  <div className="col-span-1 p-3 flex items-center justify-center border-r border-gray-300">
                    {/* <span className="md:hidden text-gray-400 text-[10px] uppercase tracking-wide mb-1">
                      Tax
                    </span> */}
                    <button
                      className={`text-xs font-normal truncate max-w-[80px] text-[#2563EB]`}
                      onClick={() => {
                        setActiveTaxItemId(item.id);
                        setIsTaxModalOpen(true);
                      }}
                    >
                      {"Tax"}
                    </button>
                  </div>

                  {/* Total - Full width on mobile/special align */}
                  <div className="col-span-2 p-3 flex items-center justify-end pr-6 bg-gray-50 md:bg-white min-w-[120px]">
                    <span className="text-gray-900 md:text-gray-600 text-sm font-medium">
                      $
                      {calculateTotal(item).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {/* Notes Row */}
                <div className="border-t border-gray-300 p-0 min-w-[900px]">
                  <input
                    type="text"
                    placeholder="Notes"
                    className="w-full px-5 py-3 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:bg-gray-50/50 transition-colors"
                    value={item.notes}
                    onChange={() => {}}
                  />
                </div>

                {/* Upload Row */}
                <div className="border-t border-gray-300 p-3 bg-gray-50/10 flex items-center gap-4 min-w-[900px]">
                  <Button
                    variant="outline"
                    className="border-[#2563EB] text-blue-600 hover:bg-blue-50 h-9 rounded-full px-4 text-xs font-medium flex gap-2"
                    onClick={() => {
                      setActiveUploadItemId(item.id);
                      setIsUploadModalOpen(true);
                    }}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload photos
                  </Button>
                  <span className="text-gray-400 text-xs">(Max 4)</span>

                  {item.photos.map((photo, i) => (
                    <span key={i} className="text-xs text-gray-500">
                      {photo}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Line Item Button */}
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={addNewItem}
            className="w-full border-[#2563EB] text-blue-600 hover:bg-blue-50 h-12 flex items-center justify-center gap-2 font-medium"
          >
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <Plus className="w-3.5 h-3.5" />
            </div>
            ADD LINE ITEM
          </Button>
        </div>

        {/* Footer Summary */}
        <div className="mt-12 flex justify-end">
          <div className="w-full max-w-sm space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900 font-medium">
                $
                {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Markup</span>
              <div className="flex items-center gap-2">
                {markup.value > 0 && (
                  <span className="text-gray-900 font-medium">
                    {markup.unit === "$" ? "$" : ""}
                    {markup.value}
                    {markup.unit === "%" ? "%" : ""}
                  </span>
                )}
                <button
                  className="text-[#2563EB] text-xs font-medium hover:underline"
                  onClick={() => {
                    setActiveActionType("markup");
                    setIsActionModalOpen(true);
                  }}
                >
                  {markup.value > 0 ? "Edit" : "Add"}
                </button>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Discount</span>
              <div className="flex items-center gap-2">
                {discount.value > 0 && (
                  <span className="font-medium text-red-500">
                    -{discount.unit === "$" ? "$" : ""}
                    {discount.value}
                    {discount.unit === "%" ? "%" : ""}
                  </span>
                )}
                <button
                  className="text-[#2563EB] text-xs font-medium hover:underline"
                  onClick={() => {
                    setActiveActionType("discount");
                    setIsActionModalOpen(true);
                  }}
                >
                  {discount.value > 0 ? "Edit" : "Add"}
                </button>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Request a deposit</span>
              <div className="flex items-center gap-2">
                {deposit.value > 0 && (
                  <span className="text-gray-900 font-medium">
                    {deposit.unit === "$" ? "$" : ""}
                    {deposit.value}
                    {deposit.unit === "%" ? "%" : ""}
                  </span>
                )}
                <button
                  className="text-[#2563EB] text-xs font-medium hover:underline"
                  onClick={() => {
                    setActiveActionType("deposit");
                    setIsActionModalOpen(true);
                  }}
                >
                  {deposit.value > 0 ? "Edit" : "Add"}
                </button>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment Schedule</span>
              <div className="flex items-center gap-2">
                {paymentSchedule.payments.some((p) => p.amount > 0) && (
                  <span className="text-gray-900 font-medium">
                    {
                      paymentSchedule.payments.filter((p) => p.amount > 0)
                        .length
                    }{" "}
                    payments
                  </span>
                )}
                <button
                  className="text-[#2563EB] text-xs font-medium hover:underline"
                  onClick={() => setIsPaymentScheduleModalOpen(true)}
                >
                  {paymentSchedule.payments.some((p) => p.amount > 0)
                    ? "Edit"
                    : "Add"}
                </button>
              </div>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
              <span className="text-gray-500">Tax</span>
              <span className="text-gray-900">
                $
                {taxAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-300">
              <span className="xl:text-lg font-bold text-gray-600">
                Total(USD)
              </span>
              <span className="xl:text-xl font-bold text-gray-800">
                ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {depositAmount > 0 && (
              <div className="flex justify-between items-center pt-2 text-sm">
                <span className="text-gray-500 italic">Deposit required</span>
                <span className="text-gray-900 font-medium">
                  $
                  {depositAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onAdd={handleAddClient}
      />

      <UploadImageModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setActiveUploadItemId(null);
        }}
        onUpload={handleUploadPhoto}
      />

      <ItemListModal
        isOpen={isItemListModalOpen}
        onClose={() => {
          setIsItemListModalOpen(false);
          setActiveItemListId(null);
        }}
        onSelect={handleItemListSelect}
      />

      <TaxModal
        isOpen={isTaxModalOpen}
        onClose={() => {
          setIsTaxModalOpen(false);
          setActiveTaxItemId(null);
        }}
        onSelect={handleTaxSelect}
        currentTax={items.find((i) => i.id === activeTaxItemId)?.tax}
      />

      {activeActionType && (
        <InvoiceActionModal
          isOpen={isActionModalOpen}
          onClose={() => {
            setIsActionModalOpen(false);
            setActiveActionType(null);
          }}
          type={activeActionType}
          initialValue={
            activeActionType === "markup"
              ? markup.value
              : activeActionType === "discount"
              ? discount.value
              : deposit.value
          }
          initialUnit={
            activeActionType === "markup"
              ? markup.unit
              : activeActionType === "discount"
              ? discount.unit
              : deposit.unit
          }
          onDone={(val, unt) => {
            if (activeActionType === "markup")
              setMarkup({ value: val, unit: unt });
            else if (activeActionType === "discount")
              setDiscount({ value: val, unit: unt });
            else if (activeActionType === "deposit")
              setDeposit({ value: val, unit: unt });
          }}
        />
      )}

      <PaymentScheduleModal
        isOpen={isPaymentScheduleModalOpen}
        onClose={() => setIsPaymentScheduleModalOpen(false)}
        total={total}
        initialPayments={paymentSchedule.payments}
        initialUnit={paymentSchedule.unit}
        onDone={(payments, unit) => setPaymentSchedule({ payments, unit })}
      />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={modalTitle}
      />
    </div>
  );
}
