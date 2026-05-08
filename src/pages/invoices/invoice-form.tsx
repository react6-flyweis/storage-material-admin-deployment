import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Calendar, Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import InvoiceLineItem from "./invoice-line-item";
import AddMarkupDialog from "@/components/add-markup-dialog";
import AddDiscountDialog from "@/components/add-discount-dialog";
import AddDepositDialog from "@/components/add-deposit-dialog";
import PaymentScheduleDialog from "@/components/payment-schedule-dialog";
import AddClientDialog from "@/components/add-client-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import steelLogo from "@/assets/steel-building-depot-logo.png";
import { useNavigate } from "react-router";
import { getApiErrorMessage } from "@/lib/api-error";
import { useCreateInvoiceMutation } from "@/modules/invoices/invoices.hooks";
import type { CreateInvoicePayload } from "@/modules/invoices/invoices.api";

export interface LineItem {
  id: string;
  description: string;
  notes: string;
  rate: number;
  markup: string;
  quantity: number;
  tax: boolean;
  selectedTax?: string;
  images: string[];
  items: string[];
}

export interface InvoiceFormValues {
  invoiceNumber: string;
  date: string;
  daysToPay: string;
  poNumber: string;
  groupSections: boolean;
  lineItems: LineItem[];
  markupType: "%" | "$";
  markupValue: string;
  discountType: "%" | "$";
  discountValue: string;
  depositType: "%" | "$";
  depositValue: string;
  paymentScheduleType: "%" | "$";
  paymentSchedulePayments: { name: string; amount: string }[];
  clientId: string;
  clientName: string;
  clientAvatar: string;
  taxes: { name: string; rate: string }[];
}

export default function InvoiceForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createInvoiceMutation = useCreateInvoiceMutation();

  const { register, control, handleSubmit, setValue, getValues } =
    useForm<InvoiceFormValues>({
      defaultValues: {
        invoiceNumber: "2460",
        date: "10-25-2025",
        daysToPay: "15",
        poNumber: "",
        groupSections: false,
        markupType: "%",
        markupValue: "",
        discountType: "%",
        discountValue: "",
        depositType: "%",
        depositValue: "",
        paymentScheduleType: "%",
        paymentSchedulePayments: [],
        clientId: "",
        clientName: "",
        clientAvatar: "",
        taxes: [{ name: "Argyle", rate: "8.25" }],
        lineItems: [
          {
            id: "1",
            description: "Building 1",
            notes: "",
            rate: 75000,
            markup: "Markup",
            quantity: 1,
            tax: true,
            selectedTax: "",
            images: ["Image123.png"],
            items: [],
          },
        ],
      },
    });

  const watchedValues = useWatch({ control }) as InvoiceFormValues;

  const navigate = useNavigate();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
    keyName: "fieldId",
  });

  const watchLineItems = watchedValues?.lineItems ?? [];
  const invoiceNumber = watchedValues?.invoiceNumber ?? "";
  const markupType = watchedValues?.markupType ?? "%";
  const markupValue = watchedValues?.markupValue ?? "";
  const discountType = watchedValues?.discountType ?? "%";
  const discountValue = watchedValues?.discountValue ?? "";
  const depositType = watchedValues?.depositType ?? "%";
  const depositValue = watchedValues?.depositValue ?? "";
  const paymentScheduleType = watchedValues?.paymentScheduleType ?? "%";
  const paymentSchedulePayments = watchedValues?.paymentSchedulePayments ?? [];
  const clientId = watchedValues?.clientId ?? "";
  const clientName = watchedValues?.clientName ?? "";
  const clientAvatar = watchedValues?.clientAvatar ?? "";
  const taxes = watchedValues?.taxes ?? [];

  // const [notesOpen, setNotesOpen] = useState<Record<string, boolean>>({});

  // const toggleNotes = (id: string) => {
  //   setNotesOpen((p) => ({ ...p, [id]: !p[id] }));
  // };

  const addLineItem = () => {
    append({
      id: Date.now().toString(),
      description: "",
      notes: "",
      rate: 0,
      markup: "Markup",
      quantity: 1,
      tax: false,
      selectedTax: "",
      images: [],
      items: [],
    });
  };

  // const removeImage = (index: number, imageIndex: number) => {
  //   const items = getValues("lineItems") || [];
  //   const images = items[index]?.images || [];
  //   const newImages = images.filter((_, i) => i !== imageIndex);
  //   setValue(`lineItems.${index}.images`, newImages);
  // };

  const toNumber = (value: string | number | undefined | null) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const parsed = parseFloat(String(value || "0"));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const resolveAdjustment = (
    type: "%" | "$",
    value: string,
    baseAmount: number,
  ) => {
    const parsed = toNumber(value);
    if (parsed <= 0) return 0;
    return type === "%" ? (baseAmount * parsed) / 100 : parsed;
  };

  const calculateSubtotal = () => {
    const items = watchLineItems || [];
    return items.reduce(
      (sum, item) =>
        sum + (parseFloat(String(item.rate || 0)) || 0) * (item.quantity || 0),
      0,
    );
  };

  const calculateTax = () => {
    const items = watchLineItems || [];
    const available = taxes || [];

    return items.reduce((sum, item) => {
      const itemSubtotal =
        (parseFloat(String(item.rate || 0)) || 0) * (item.quantity || 0);
      const selectedName = item.selectedTax;
      const t = available.find((a) => a.name === selectedName);
      const rate = t ? parseFloat(t.rate || "0") : 0;
      return sum + itemSubtotal * (rate / 100);
    }, 0);
  };

  const calculateMarkupTotal = () => {
    return resolveAdjustment(markupType, markupValue, calculateSubtotal());
  };

  const calculateDiscount = () => {
    return resolveAdjustment(discountType, discountValue, calculateSubtotal());
  };

  const calculateTotal = () => {
    return (
      calculateSubtotal() +
      calculateMarkupTotal() +
      calculateTax() -
      calculateDiscount()
    );
  };

  const buildCreateInvoicePayload = (
    data: InvoiceFormValues,
  ): CreateInvoicePayload => {
    const subtotal = (data.lineItems || []).reduce(
      (sum, item) => sum + toNumber(item.rate) * toNumber(item.quantity || 1),
      0,
    );

    const markupTotal = resolveAdjustment(
      data.markupType,
      data.markupValue,
      subtotal,
    );
    const discount = resolveAdjustment(
      data.discountType,
      data.discountValue,
      subtotal,
    );

    const parsedLineItems = (data.lineItems || []).map((lineItem) => {
      const rate = toNumber(lineItem.rate);
      const quantity = toNumber(lineItem.quantity || 1);
      const lineBase = rate * quantity;

      const lineMarkup =
        data.markupType === "%"
          ? (lineBase * toNumber(data.markupValue)) / 100
          : subtotal > 0
            ? (lineBase / subtotal) * markupTotal
            : 0;

      const selectedTax = taxes.find(
        (taxItem) => taxItem.name === lineItem.selectedTax,
      );
      const taxRate = toNumber(selectedTax?.rate);
      const lineTax = (lineBase * taxRate) / 100;

      return {
        images: lineItem.images || [],
        items:
          (lineItem.items || []).length > 0
            ? lineItem.items
            : lineItem.description
              ? [lineItem.description]
              : [],
        rate,
        markup: lineMarkup,
        quantity,
        tax: lineTax,
        total: lineBase + lineMarkup + lineTax,
      };
    });

    const taxTotal = parsedLineItems.reduce((sum, item) => sum + item.tax, 0);
    const totalAmount = subtotal + markupTotal + taxTotal - discount;
    const depositAmount = resolveAdjustment(
      data.depositType,
      data.depositValue,
      totalAmount,
    );

    return {
      // Current UI doesn't capture dedicated leadId/quotationId yet.
      leadId: "",
      quotationId: (data.poNumber || "").trim(),
      date: data.date
        ? new Date(`${data.date}T00:00:00.000Z`).toISOString()
        : new Date().toISOString(),
      daysToPay: toNumber(data.daysToPay),
      lineItems: parsedLineItems,
      subtotal,
      markupTotal,
      discount,
      depositAmount,
      totalAmount,
    };
  };

  const onSubmit = async (data: InvoiceFormValues) => {
    setErrorMessage(null);

    try {
      const payload = buildCreateInvoicePayload(data);
      const response = await createInvoiceMutation.mutateAsync(payload);

      if (!response.success) {
        setErrorMessage(response.message || "Unable to create invoice.");
        return;
      }

      handlePreview();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to create invoice."));
    }
  };

  const handlePreview = () => {
    const values = getValues();
    const items = (values.lineItems || []).map((li) => ({
      id: li.id,
      description: li.description,
      notes: li.notes,
      rate: li.rate,
      quantity: li.quantity,
      photos: li.images || [],
    }));

    navigate("/invoice/preview", {
      state: {
        invoiceNumber: values.invoiceNumber || invoiceNumber,
        date: values.date,
        daysToPay: values.daysToPay,
        items,
        subtotal: calculateSubtotal(),
        taxAmount: calculateTax(),
        total: calculateTotal(),
      },
    });
  };

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
            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={createInvoiceMutation.isPending}
            className="bg-[#2563EB] hover:bg-blue-700 text-white px-6"
          >
            {createInvoiceMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </header>

      {errorMessage ? (
        <p className="text-sm text-red-500">{errorMessage}</p>
      ) : null}

      <div className="bg-white rounded-md p-4 sm:p-8 lg:p-10 shadow-sm mx-auto max-w-7xl">
        {/* Top Section: Client Info & Invoice Details */}
        <div className="flex flex-col lg:flex-row justify-between gap-10 mb-12">
          {/* Left: Organization Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center shrink-0">
                <img src={steelLogo} alt="The Steel" className="h-10" />
              </div>
            </div>

            <div className="text-sm text-gray-500 leading-relaxed max-w-62.5">
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
            <div className="flex flex-wrap justify-end gap-3">
              <AddClientDialog
                initialSelected={clientId || null}
                onDone={(client) => {
                  if (!client) {
                    setValue("clientId", "");
                    setValue("clientName", "");
                    setValue("clientAvatar", "");
                    return;
                  }

                  setValue("clientId", client.id);
                  setValue("clientName", client.name);
                  setValue("clientAvatar", client.avatar || "");
                }}
              >
                {clientName ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={clientAvatar}
                      alt={clientName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="text-sm font-medium text-gray-900">
                      {clientName}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setValue("clientId", "");
                        setValue("clientName", "");
                        setValue("clientAvatar", "");
                      }}
                      className="text-gray-500 hover:text-red-500 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 w-fit sm:w-auto h-12 px-8 flex items-center gap-2 rounded-md"
                  >
                    <UserPlus className="w-4 h-4" />
                    ADD CLIENT
                  </Button>
                )}
              </AddClientDialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Invoice #
                </label>
                <Input
                  id="invoiceNumber"
                  {...register("invoiceNumber")}
                  className="bg-white border-gray-200 h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Date
                </label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    {...register("date")}
                    className="bg-white border-gray-200 h-11"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Days to pay
                </label>
                <Input
                  id="daysToPay"
                  {...register("daysToPay")}
                  className="bg-white border-gray-200 h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  PO number
                </label>
                <Input
                  id="poNumber"
                  placeholder="PO number"
                  {...register("poNumber")}
                  className="bg-white border-gray-200 h-11"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Headers */}
        <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50/50 py-3 px-4 rounded-lg mb-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-5">Description</div>
          <div className="col-span-2 text-center">Rate</div>
          <div className="col-span-1 text-center">Markup</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-1 text-center">Tax</div>
          <div className="col-span-1 text-right">Total</div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Controller
              control={control}
              name="groupSections"
              render={({ field }) => (
                <div
                  onClick={() => field.onChange(!field.value)}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                    field.value ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm absolute border border-gray-300 transition-transform ${
                      field.value ? "left-5" : "left-0"
                    }`}
                  ></div>
                </div>
              )}
            />
            <span className="text-sm text-gray-500 font-medium">
              Group items into Sections
            </span>
          </div>
        </div>

        {/* Invoice Items List */}
        <div className="space-y-4">
          {fields.map((field, index) => {
            const item = watchLineItems?.[index] || field;
            return (
              <InvoiceLineItem
                key={field.fieldId || field.id}
                field={field}
                index={index}
                item={item}
                control={control}
                register={register}
                getValues={getValues}
                setValue={setValue}
                remove={remove}
                taxes={taxes}
              />
            );
          })}
        </div>

        {/* Add Line Item Button */}
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={addLineItem}
            className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 h-12 border-dashed flex items-center justify-center gap-2 font-medium"
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
                {calculateSubtotal().toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Markup</span>

              {markupValue ? (
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {markupValue}
                    {markupType}
                  </span>
                  <AddMarkupDialog
                    initialType={markupType}
                    initialValue={markupValue}
                    onDone={({ type, value }) => {
                      setValue("markupType", type);
                      setValue("markupValue", value);
                    }}
                  >
                    <button className="text-blue-500 text-xs font-medium hover:underline">
                      Edit
                    </button>
                  </AddMarkupDialog>
                  <button
                    onClick={() => setValue("markupValue", "")}
                    className="text-gray-500 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <AddMarkupDialog
                  initialType={markupType}
                  initialValue={markupValue}
                  onDone={({ type, value }) => {
                    setValue("markupType", type);
                    setValue("markupValue", value);
                  }}
                >
                  <button className="text-blue-500 text-xs font-medium hover:underline">
                    Add
                  </button>
                </AddMarkupDialog>
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Discount</span>

              {discountValue ? (
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {discountValue}
                    {discountType}
                  </span>
                  <AddDiscountDialog
                    initialType={discountType}
                    initialValue={discountValue}
                    onDone={({ type, value }) => {
                      setValue("discountType", type);
                      setValue("discountValue", value);
                    }}
                  >
                    <button className="text-blue-500 text-xs font-medium hover:underline">
                      Edit
                    </button>
                  </AddDiscountDialog>
                  <button
                    onClick={() => setValue("discountValue", "")}
                    className="text-gray-500 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <AddDiscountDialog
                  initialType={discountType}
                  initialValue={discountValue}
                  onDone={({ type, value }) => {
                    setValue("discountType", type);
                    setValue("discountValue", value);
                  }}
                >
                  <button className="text-blue-500 text-xs font-medium hover:underline">
                    Add
                  </button>
                </AddDiscountDialog>
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Request a deposit</span>

              {depositValue ? (
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {depositValue}
                    {depositType}
                  </span>
                  <AddDepositDialog
                    initialType={depositType}
                    initialValue={depositValue}
                    onDone={({ type, value }) => {
                      setValue("depositType", type);
                      setValue("depositValue", value);
                    }}
                  >
                    <button className="text-blue-500 text-xs font-medium hover:underline">
                      Edit
                    </button>
                  </AddDepositDialog>
                  <button
                    onClick={() => setValue("depositValue", "")}
                    className="text-gray-500 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <AddDepositDialog
                  initialType={depositType}
                  initialValue={depositValue}
                  onDone={({ type, value }) => {
                    setValue("depositType", type);
                    setValue("depositValue", value);
                  }}
                >
                  <button className="text-blue-500 text-xs font-medium hover:underline">
                    Add
                  </button>
                </AddDepositDialog>
              )}
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment Schedule</span>

              {((paymentSchedulePayments || [])?.length || 0) > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(paymentSchedulePayments || []).map(
                      (
                        p: {
                          name: string;
                          amount: string;
                        },
                        i: number,
                      ) => (
                        <div
                          key={i}
                          className="bg-gray-100 px-3 py-1 rounded text-sm"
                        >
                          {p.name} {p.amount}
                        </div>
                      ),
                    )}

                    <PaymentScheduleDialog
                      initialType={paymentScheduleType}
                      initialPayments={paymentSchedulePayments}
                      onDone={({ type, payments }) => {
                        setValue("paymentScheduleType", type);
                        setValue("paymentSchedulePayments", payments);
                      }}
                    >
                      <button className="text-blue-500 text-xs font-medium hover:underline">
                        Edit
                      </button>
                    </PaymentScheduleDialog>
                  </div>

                  <button
                    onClick={() => setValue("paymentSchedulePayments", [])}
                    className="text-gray-500 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <PaymentScheduleDialog
                  initialType={paymentScheduleType}
                  initialPayments={paymentSchedulePayments}
                  onDone={({ type, payments }) => {
                    setValue("paymentScheduleType", type);
                    setValue("paymentSchedulePayments", payments);
                  }}
                >
                  <button className="text-blue-500 text-xs font-medium hover:underline">
                    Add
                  </button>
                </PaymentScheduleDialog>
              )}
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
              <span className="text-gray-500">Tax</span>

              <div className="flex items-center gap-3">
                <span className="text-gray-900">
                  $
                  {calculateTax().toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="xl:text-lg font-bold text-gray-600">
                Total(USD)
              </span>
              <span className="xl:text-xl font-bold text-gray-800">
                $
                {calculateTotal().toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
