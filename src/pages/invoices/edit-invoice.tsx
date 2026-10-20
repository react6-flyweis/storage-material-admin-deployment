import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Calendar, Plus, UserPlus, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import InvoiceLineItem from "./invoice-line-item";
import AddMarkupDialog from "@/components/add-markup-dialog";
import AddDiscountDialog from "@/components/add-discount-dialog";
import AddDepositDialog from "@/components/add-deposit-dialog";
import PaymentScheduleDialog from "@/components/payment-schedule-dialog";
import AddClientDialog from "@/components/add-client-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import steelLogo from "@/assets/steel-building-depot-logo.png";
import { useNavigate, useParams } from "react-router";
import { useAppBack } from "@/modules/navigation";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useCreateInvoiceMutation,
  useCreatePaymentScheduleMutation,
  useUpdateInvoiceMutation,
  useGetInvoiceDetailQuery,
  usePaymentScheduleQuery,
} from "@/modules/invoices/invoices.hooks";
import type {
  CreateInvoicePayload,
  CreateInvoiceResponse,
  InvoiceAddress,
  InvoiceBankDetails,
} from "@/modules/invoices/invoices.api";
import EditAddressDialog from "@/components/invoices/edit-address-dialog";
import EditBankInfoDialog from "@/components/invoices/edit-bank-info-dialog";
import AddProjectDialog from "@/components/add-project-dialog";
import { useCustomerProjectsQuery, useCustomersQuery } from "@/modules/customers/customers.hooks";
import { toast } from "sonner";

export interface LineItem {
  id: string;
  description: string;
  notes: string;
  rate: number;
  quantity: number;
  taxType: "%" | "$";
  taxValue: string;
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
  projectId: string;
  projectName: string;
  taxes: { name: string; rate: string; type?: "%" | "$" }[];
  billingAddress: InvoiceAddress;
  recipientAddress: InvoiceAddress;
  bankDetails: InvoiceBankDetails;
}

function parseLocationToAddress(location?: string): {
  line1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
} {
  if (!location || location === "N/A" || location === "—" || location === "-") {
    return {};
  }
  const parts = location.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 1) {
    return { line1: parts[0] };
  }
  if (parts.length === 2) {
    const [city, stateZip] = parts;
    const szParts = stateZip.split(/\s+/).filter(Boolean);
    const state = szParts[0] || "";
    const postalCode = szParts.slice(1).join(" ") || "";
    return { city, state, postalCode };
  }
  if (parts.length >= 3) {
    const line1 = parts.slice(0, parts.length - 2).join(", ");
    const city = parts[parts.length - 2];
    const stateZip = parts[parts.length - 1];
    const szParts = stateZip.split(/\s+/).filter(Boolean);
    const state = szParts[0] || "";
    const postalCode = szParts.slice(1).join(" ") || "";
    return { line1, city, state, postalCode };
  }
  return { line1: location };
}

const defaultBillingAddress: InvoiceAddress = {
  companyName: "STEEL BUILDING DEPOT",
  line1: "1851 Madison Ave Suite 300",
  line2: "",
  city: "Council Bluffs",
  state: "IA",
  postalCode: "51503",
  country: "United States",
};

const defaultRecipientAddress: InvoiceAddress = {
  companyName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "United States",
};

const defaultBankDetails: InvoiceBankDetails = {
  bankName: "Example Bank",
  accountName: "Steel Building Depot LLC",
  accountNumber: "",
  routingNumber: "",
  swiftCode: "",
  iban: "",
  branchAddress: "",
  paymentInstructions: "Include invoice number in memo.",
};

export default function EditInvoice() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = id && id !== "new";

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createInvoiceMutation = useCreateInvoiceMutation();
  const updateInvoiceMutation = useUpdateInvoiceMutation();
  const createPaymentScheduleMutation = useCreatePaymentScheduleMutation();

  const { data: invoiceDetailRes } = useGetInvoiceDetailQuery(isEditMode && id ? id : "");

  const { register, control, handleSubmit, setValue, getValues, reset, setError, clearErrors, formState: { errors } } =
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
        projectId: "",
        projectName: "",
        taxes: [{ name: "Argyle", rate: "8.25" }],
        billingAddress: defaultBillingAddress,
        recipientAddress: defaultRecipientAddress,
        bankDetails: defaultBankDetails,
        lineItems: [
          {
            id: "1",
            description: "",
            notes: "",
            rate: 0,
            quantity: 1,
            taxType: "%",
            taxValue: "",
            images: [],
            items: [],
          },
        ],
      },
    });

  const watchedValues = useWatch({ control }) as InvoiceFormValues;
  const billingAddress =
    watchedValues?.billingAddress || defaultBillingAddress;
  const recipientAddress =
    watchedValues?.recipientAddress || defaultRecipientAddress;
  const bankDetails =
    watchedValues?.bankDetails || defaultBankDetails;

  const navigate = useNavigate();
  const { goBack } = useAppBack("/invoice/list");

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
  const projectId = watchedValues?.projectId ?? "";
  const projectName = watchedValues?.projectName ?? "";
  const taxes = watchedValues?.taxes ?? [];


  const { data: customersData, isLoading: isLoadingCustomers } = useCustomersQuery(1, 100);
  const mappedCustomers = (customersData?.data?.customers || []).map((c) => ({
    id: c._id,
    name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.companyName || c.email || "Unknown Customer",
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${c.firstName || ""} ${c.lastName || ""}`.trim() || c.companyName || "U")}&background=random`,
  }));

  const { data: projectsData } = useCustomerProjectsQuery(clientId);
  const mappedProjects = (projectsData?.data?.projects || []).map((p) => ({
    id: p._id,
    name: p.projectName?.trim() ? p.projectName.replace(/\s*\d{4}-\d{2}-\d{2}T.*Z$/, '') : `Project (${p._id.slice(-5)})`,
  }));

  const { data: scheduleData } = usePaymentScheduleQuery(projectId);

  useEffect(() => {
    const currentPayments = getValues("paymentSchedulePayments");
    const schedule = scheduleData?.data?.schedule;
    if ((!currentPayments || currentPayments.length === 0) && schedule && (schedule.payments?.length > 0 || schedule.stages?.length > 0)) {
      const stages = schedule.payments || schedule.stages;
      const type = stages[0]?.amountType === "percentage" ? "%" : "$";
      const formattedStages = stages.map((p: any) => ({
        name: p.name || p.stageName,
        amount: p.amount.toString(),
      }));
      setValue("paymentScheduleType", type);
      setValue("paymentSchedulePayments", formattedStages);
    }
  }, [scheduleData, projectId, setValue, getValues]);

  useEffect(() => {
    if (isEditMode && invoiceDetailRes?.success && invoiceDetailRes.data?.invoice) {
      const inv = invoiceDetailRes.data.invoice;
      const targetLeadId =
        typeof inv.leadId === "object" && inv.leadId !== null
          ? inv.leadId._id
          : inv.leadId || "";
      const customerLocation =
        typeof inv.leadId === "object" && inv.leadId !== null
          ? inv.leadId.location
          : undefined;
      const parsedLoc = parseLocationToAddress(customerLocation);

      const leadObj =
        typeof inv.leadId === "object" && inv.leadId !== null ? inv.leadId : null;
      const custObj =
        typeof inv.customerId === "object" && inv.customerId !== null
          ? inv.customerId
          : null;
      const resolvedCustomerName =
        inv.recipientAddress?.companyName ||
        (leadObj?.customer && leadObj.customer !== "N/A"
          ? leadObj.customer
          : "") ||
        leadObj?.customerName ||
        (custObj
          ? `${custObj.firstName || ""} ${custObj.lastName || ""}`.trim()
          : "") ||
        custObj?.companyName ||
        leadObj?.name ||
        "";

      reset({
        ...getValues(),
        invoiceNumber: inv.invoiceNumber || "",
        date: inv.date ? inv.date.split("T")[0] : "",
        daysToPay: String(inv.daysToPay || ""),
        poNumber: inv.poNumber || "",
        projectId: targetLeadId,
        clientId: inv.customerId || "",
        billingAddress: {
          companyName:
            inv.billingAddress?.companyName || defaultBillingAddress.companyName,
          line1: inv.billingAddress?.line1 || defaultBillingAddress.line1,
          line2: inv.billingAddress?.line2 || "",
          city: inv.billingAddress?.city || defaultBillingAddress.city,
          state: inv.billingAddress?.state || defaultBillingAddress.state,
          postalCode:
            inv.billingAddress?.postalCode || defaultBillingAddress.postalCode,
          country:
            inv.billingAddress?.country || defaultBillingAddress.country,
        },
        recipientAddress: {
          companyName: resolvedCustomerName,
          line1:
            inv.recipientAddress?.line1 || parsedLoc.line1 || "",
          line2: inv.recipientAddress?.line2 || "",
          city:
            inv.recipientAddress?.city || parsedLoc.city || "",
          state:
            inv.recipientAddress?.state || parsedLoc.state || "",
          postalCode:
            inv.recipientAddress?.postalCode || parsedLoc.postalCode || "",
          country:
            inv.recipientAddress?.country || "United States",
        },
        bankDetails: {
          bankName:
            inv.bankDetails?.bankName || defaultBankDetails.bankName,
          accountName:
            inv.bankDetails?.accountName || defaultBankDetails.accountName,
          accountNumber: inv.bankDetails?.accountNumber || "",
          routingNumber: inv.bankDetails?.routingNumber || "",
          swiftCode: inv.bankDetails?.swiftCode || "",
          iban: inv.bankDetails?.iban || "",
          branchAddress: inv.bankDetails?.branchAddress || "",
          paymentInstructions:
            inv.bankDetails?.paymentInstructions ||
            defaultBankDetails.paymentInstructions,
        },
        lineItems: (inv.lineItems || []).map((item: any, idx: number) => ({
          id: String(idx),
          description: item.items?.[0] || "",
          notes: "",
          rate: item.rate || 0,
          quantity: item.quantity || 1,
          tax: item.tax > 0,
          selectedTax: "",
          images: item.images || [],
          items: item.items || [],
        })),
      });
    }
  }, [isEditMode, invoiceDetailRes, reset, getValues]);

  useEffect(() => {
    if (clientId && !clientName && mappedCustomers.length > 0) {
      const client = mappedCustomers.find((c) => c.id === clientId);
      if (client) {
        setValue("clientName", client.name);
        setValue("clientAvatar", client.avatar);
      }
    }
  }, [clientId, clientName, mappedCustomers, setValue]);

  useEffect(() => {
    if (projectId && !projectName && mappedProjects.length > 0) {
      const project = mappedProjects.find((p) => p.id === projectId);
      if (project) {
        setValue("projectName", project.name);
      }
    }
  }, [projectId, projectName, mappedProjects, setValue]);

  const addLineItem = () => {
    append({
      id: Date.now().toString(),
      description: "",
      notes: "",
      rate: 0,
      quantity: 1,
      taxType: "%",
      taxValue: "",
      images: [],
      items: [],
    });
  };

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

  const calculateBaseSubtotal = () => {
    const items = watchLineItems || [];
    return items.reduce(
      (sum, item) =>
        sum + (parseFloat(String(item.rate || 0)) || 0) * (item.quantity || 0),
      0,
    );
  };

  const calculateMarkupTotal = () => {
    return resolveAdjustment(markupType, markupValue, calculateBaseSubtotal());
  };

  const getLineEffectiveRate = (item: LineItem) => {
    const rate = parseFloat(String(item.rate || 0)) || 0;
    const qty = item.quantity || 1;
    const baseSubtotal = calculateBaseSubtotal();
    const markupTotal = calculateMarkupTotal();

    const lineMarkupAmount = baseSubtotal > 0 ? ((rate * qty) / baseSubtotal) * markupTotal : 0;
    const markupPerUnit = qty > 0 ? lineMarkupAmount / qty : 0;

    return rate + markupPerUnit;
  };

  const getLineTotal = (item: LineItem) => {
    const effectiveRate = getLineEffectiveRate(item);
    const qty = item.quantity || 1;
    return effectiveRate * qty; // ex tax
  };

  const calculateSubtotal = () => {
    const items = watchLineItems || [];
    return items.reduce((sum, item) => sum + getLineTotal(item), 0);
  };

  const calculateTax = () => {
    const items = watchLineItems || [];

    return items.reduce((sum, item) => {
      const itemSubtotal = getLineTotal(item);
      const taxRate = parseFloat(item.taxValue || "0");
      if (isNaN(taxRate) || taxRate <= 0) return sum;

      if (item.taxType === "%") {
        return sum + itemSubtotal * (taxRate / 100);
      }
      return sum + taxRate * (item.quantity || 1);
    }, 0);
  };

  const calculateDiscount = () => {
    return resolveAdjustment(discountType, discountValue, calculateSubtotal());
  };

  const calculateTotal = () => {
    return (
      calculateSubtotal() -
      calculateDiscount() +
      calculateTax()
    );
  };

  const buildCreateInvoicePayload = (
    data: InvoiceFormValues,
  ): CreateInvoicePayload => {
    const baseSubtotal = calculateBaseSubtotal();
    const markupTotal = calculateMarkupTotal();
    const subtotal = calculateSubtotal();
    const discount = resolveAdjustment(data.discountType, data.discountValue, subtotal);

    const parsedLineItems = (data.lineItems || []).map((lineItem) => {
      const rate = toNumber(lineItem.rate);
      const quantity = toNumber(lineItem.quantity || 1);
      const lineBase = rate * quantity;

      const lineMarkupAmount = baseSubtotal > 0 ? (lineBase / baseSubtotal) * markupTotal : 0;
      const effectiveRate = (lineBase + lineMarkupAmount) / quantity;
      const lineTotal = lineBase + lineMarkupAmount;

      const taxVal = toNumber(lineItem.taxValue);
      const tType = lineItem.taxType === "%" ? "percentage" : "amount";

      let taxAmount = 0;
      if (taxVal > 0) {
        if (tType === "percentage") {
          taxAmount = lineTotal * taxVal / 100;
        } else {
          taxAmount = taxVal * quantity;
        }
      }

      let lineMarkupInput = 0;
      let lineMarkupType = "amount";

      if (data.markupType === "%") {
        lineMarkupInput = toNumber(data.markupValue);
        lineMarkupType = "percentage";
      } else {
        lineMarkupInput = lineMarkupAmount;
        lineMarkupType = "amount";
      }

      return {
        images: lineItem.images || [],
        items: (lineItem.items || []).length > 0 ? lineItem.items : lineItem.description ? [lineItem.description] : [],
        rate,
        quantity,
        markup: lineMarkupInput,
        markupType: lineMarkupType as "percentage" | "amount",
        tax: taxVal,
        taxType: tType as "percentage" | "amount",
        effectiveRate,
        markupAmount: lineMarkupAmount,
        taxAmount,
        total: lineTotal,
      };
    });

    const taxTotal = parsedLineItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalAmount = subtotal - discount + taxTotal;
    const depositAmount = resolveAdjustment(
      data.depositType,
      data.depositValue,
      totalAmount,
    );

    const buildAddressLines = (addr?: InvoiceAddress) => {
      if (!addr) return undefined;
      const lines: string[] = [];
      if (addr.line1?.trim()) lines.push(addr.line1.trim());
      if (addr.line2?.trim()) lines.push(addr.line2.trim());
      const cityStateZip = [
        addr.city?.trim(),
        [addr.state?.trim(), addr.postalCode?.trim()].filter(Boolean).join(" "),
      ]
        .filter(Boolean)
        .join(", ");
      if (cityStateZip) lines.push(cityStateZip);
      if (addr.country?.trim()) lines.push(addr.country.trim());
      return lines.length > 0 ? lines : undefined;
    };

    const billingAddressPayload: InvoiceAddress = {
      companyName: data.billingAddress?.companyName?.trim() || undefined,
      line1: data.billingAddress?.line1?.trim() || undefined,
      line2: data.billingAddress?.line2?.trim() || undefined,
      city: data.billingAddress?.city?.trim() || undefined,
      state: data.billingAddress?.state?.trim() || undefined,
      postalCode: data.billingAddress?.postalCode?.trim() || undefined,
      country: data.billingAddress?.country?.trim() || undefined,
      lines: buildAddressLines(data.billingAddress),
    };

    const recipientAddressPayload: InvoiceAddress = {
      companyName: data.recipientAddress?.companyName?.trim() || undefined,
      line1: data.recipientAddress?.line1?.trim() || undefined,
      line2: data.recipientAddress?.line2?.trim() || undefined,
      city: data.recipientAddress?.city?.trim() || undefined,
      state: data.recipientAddress?.state?.trim() || undefined,
      postalCode: data.recipientAddress?.postalCode?.trim() || undefined,
      country: data.recipientAddress?.country?.trim() || undefined,
      lines: buildAddressLines(data.recipientAddress),
    };

    const bankDetailsPayload: InvoiceBankDetails = {
      bankName: data.bankDetails?.bankName?.trim() || undefined,
      accountName: data.bankDetails?.accountName?.trim() || undefined,
      accountNumber: data.bankDetails?.accountNumber?.trim() || undefined,
      routingNumber: data.bankDetails?.routingNumber?.trim() || undefined,
      swiftCode: data.bankDetails?.swiftCode?.trim() || undefined,
      iban: data.bankDetails?.iban?.trim() || undefined,
      branchAddress: data.bankDetails?.branchAddress?.trim() || undefined,
      paymentInstructions:
        data.bankDetails?.paymentInstructions?.trim() || undefined,
    };

    return {
      leadId: data.projectId || "",
      quotationId: (data.poNumber || "").trim(),
      date: data.date
        ? new Date(`${data.date}T00:00:00.000Z`).toISOString()
        : new Date().toISOString(),
      daysToPay: toNumber(data.daysToPay),
      lineItems: parsedLineItems,
      subtotal,
      markupTotal,
      tax: taxTotal,
      discount,
      depositAmount,
      totalAmount,
      billingAddress: billingAddressPayload,
      recipientAddress: recipientAddressPayload,
      bankDetails: bankDetailsPayload,
    };
  };

  const onSubmit = async (data: InvoiceFormValues) => {
    setErrorMessage(null);
    let hasError = false;
    if (!data.clientId) {
      setError("clientId", { type: "manual", message: "Required" });
      hasError = true;
    }
    if (!data.projectId) {
      setError("projectId", { type: "manual", message: "Required" });
      hasError = true;
    }
    if (data.paymentSchedulePayments && data.paymentSchedulePayments.length > 0 && data.paymentScheduleType === "%") {
      const hasDepositRow = data.paymentSchedulePayments.some(
        (p) => p.name.trim().toLowerCase() === "deposit",
      );
      const depositPercent =
        !hasDepositRow && data.depositType === "%"
          ? parseFloat(data.depositValue || "0")
          : 0;
      const sum = data.paymentSchedulePayments.reduce((acc, curr) => acc + parseFloat(curr.amount || "0"), 0);
      const totalSum = sum + depositPercent;
      if (Math.abs(totalSum - 100) > 0.01) {
        toast.error(`Please ensure all payment stages (including deposit) add up to exactly 100%. Your current total is ${totalSum}%.`);
        hasError = true;
      }
    }

    if (hasError) return;

    try {
      const payload = buildCreateInvoicePayload(data);

      let response: any;
      if (isEditMode && id) {
        response = await updateInvoiceMutation.mutateAsync({ ...payload, invoiceId: id });
      } else {
        response = await createInvoiceMutation.mutateAsync(payload);
      }

      if (!response.success) {
        setErrorMessage(response.message || "Unable to save invoice.");
        return;
      }

      if (
        !isEditMode &&
        data.paymentSchedulePayments &&
        data.paymentSchedulePayments.length > 0 &&
        !scheduleData?.data?.schedule
      ) {
        try {
          const stages = [...data.paymentSchedulePayments];
          const hasDeposit = stages.some(
            (s) => s.name.trim().toLowerCase() === "deposit",
          );
          const depositVal = parseFloat(data.depositValue || "0");
          if (!hasDeposit && depositVal > 0) {
            if (data.paymentScheduleType === "%") {
              const depositPercent =
                data.depositType === "%"
                  ? depositVal
                  : payload.totalAmount > 0
                  ? (depositVal / payload.totalAmount) * 100
                  : 0;
              stages.unshift({
                name: "Deposit",
                amount: depositPercent.toString(),
              });
            } else {
              const depositFixed =
                data.depositType === "$"
                  ? depositVal
                  : (payload.totalAmount * depositVal) / 100;
              stages.unshift({
                name: "Deposit",
                amount: depositFixed.toString(),
              });
            }
          }

          await createPaymentScheduleMutation.mutateAsync({
            leadId: data.projectId,
            totalAmount: payload.totalAmount,
            stages: stages.map((p) => ({
              stageName: p.name,
              amount: parseFloat(p.amount),
              amountType: data.paymentScheduleType === "%" ? "percentage" : "fixed",
            })),
          });
        } catch (scheduleError: any) {
          console.error("Failed to create payment schedule:", scheduleError);
          toast.error(
            scheduleError?.response?.data?.message ||
            "Payment schedule already exists for this lead or could not be created."
          );
        }
      }

      handlePreview(response?.data?.invoice);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to save invoice."));
    }
  };

  const handlePreview = (savedInvoice?: any) => {
    const values = getValues();
    const subtotal = calculateSubtotal();
    const items = (values.lineItems || []).map((li) => ({
      id: li.id,
      description: li.description,
      notes: li.notes,
      rate: li.rate,
      quantity: li.quantity,
      photos: li.images || [],
      markup: subtotal > 0 ? ((li.rate * li.quantity) / subtotal) * calculateMarkupTotal() : 0,
    }));

    navigate("/invoice/preview", {
      replace: true,
      state: {
        invoiceId: savedInvoice?._id || id,
        invoiceNumber: savedInvoice?.invoiceNumber || values.invoiceNumber || invoiceNumber,
        date: savedInvoice?.date || values.date,
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
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Invoice#{invoiceNumber}
        </h1>
        <div className="flex items-center gap-3 ml-auto">
          <Button
            variant="outline"
            onClick={() => goBack()}
            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
          >
            Back
          </Button>
          <Button
            variant="outline"
            onClick={() => goBack()}
            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={createInvoiceMutation.isPending || updateInvoiceMutation.isPending}
            className="bg-[#2563EB] hover:bg-blue-700 text-white px-6"
          >
            {createInvoiceMutation.isPending || updateInvoiceMutation.isPending
              ? (isEditMode ? "Updating..." : "Saving...")
              : (isEditMode ? "Update" : "Save")}
          </Button>
        </div>
      </header>

      {errorMessage ? (
        <p className="text-sm text-red-500">{errorMessage}</p>
      ) : null}

      <div className="bg-white rounded-md p-4 sm:p-8 lg:p-10 shadow-sm mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row justify-between gap-10 mb-12">
          {/* Left: Seller Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center shrink-0">
                <img src={steelLogo} alt="The Steel" className="h-10" />
              </div>
            </div>

            <div className="text-base font-bold text-gray-900 tracking-tight">
              {billingAddress.companyName || "STEEL BUILDING DEPOT"}
            </div>

            <div className="text-sm text-gray-600 leading-relaxed space-y-0.5 max-w-62.5">
              <div>
                {billingAddress.line1 || "1851 Madison Ave Suite 300"}
              </div>
              {billingAddress.line2 && <div>{billingAddress.line2}</div>}
              <div>
                {[
                  billingAddress.city || "Council Bluffs",
                  [
                    billingAddress.state || "IA",
                    billingAddress.postalCode || "51503",
                  ]
                    .filter(Boolean)
                    .join(" "),
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>
              <div>{billingAddress.country || "United States"}</div>
              <div>travis@storagematerials.com</div>
              <div>www.storagematerials.com</div>
            </div>

            <EditAddressDialog
              initialValues={billingAddress}
              title="Edit Address"
              description="Update the seller address details for this invoice."
              onDone={(newAddr) => {
                setValue("billingAddress", newAddr, { shouldDirty: true });
              }}
            >
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer block pt-1 text-left"
              >
                Edit address
              </button>
            </EditAddressDialog>
          </div>

          <div className="flex-1 max-w-2xl flex flex-col gap-6">
            <div className="flex flex-col items-end gap-4">
              <div className="flex flex-wrap justify-end gap-3">
                {clientName ? (
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-md opacity-80 cursor-not-allowed w-fit">
                    <img
                      src={clientAvatar}
                      alt={clientName}
                      className="w-8 h-8 rounded-full object-cover grayscale"
                    />
                    <div className="text-sm font-medium text-gray-500">
                      {clientName}
                    </div>
                  </div>
                ) : (
                  <div className="h-12 w-32 bg-gray-100 animate-pulse rounded-md"></div>
                )}
                {errors.clientId && (
                  <span className="text-red-500 text-xs w-full text-right block mt-1">
                    Client is required *
                  </span>
                )}
              </div>

              {/* Recipient Address Preview (Clean, Unboxed, Aligned) */}
              {Boolean(
                recipientAddress.companyName ||
                  recipientAddress.line1 ||
                  recipientAddress.city,
              ) ? (
                <div className="w-full max-w-xs space-y-1 text-left self-end pt-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Billed To
                  </span>
                  <div className="text-base font-bold text-gray-900 tracking-tight">
                    {recipientAddress.companyName}
                  </div>

                  <div className="text-sm text-gray-600 leading-relaxed space-y-0.5">
                    {recipientAddress.line1 && (
                      <div>{recipientAddress.line1}</div>
                    )}
                    {recipientAddress.line2 && (
                      <div>{recipientAddress.line2}</div>
                    )}
                    {(recipientAddress.city ||
                      recipientAddress.state ||
                      recipientAddress.postalCode) && (
                      <div>
                        {[
                          recipientAddress.city,
                          [
                            recipientAddress.state,
                            recipientAddress.postalCode,
                          ]
                            .filter(Boolean)
                            .join(" "),
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                    {recipientAddress.country && (
                      <div>{recipientAddress.country}</div>
                    )}
                  </div>

                  <EditAddressDialog
                    initialValues={recipientAddress}
                    title="Edit Recipient Address"
                    description="Update the bill-to / customer address details for this invoice."
                    onDone={(newAddr) => {
                      setValue("recipientAddress", newAddr, {
                        shouldDirty: true,
                      });
                    }}
                  >
                    <button
                      type="button"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer block pt-1 text-left"
                    >
                      Edit address
                    </button>
                  </EditAddressDialog>
                </div>
              ) : (
                <div className="w-full max-w-xs space-y-1 text-left self-end pt-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Billed To
                  </span>
                  <div className="text-xs text-gray-400 italic">
                    No recipient address added
                  </div>
                  <EditAddressDialog
                    initialValues={recipientAddress}
                    title="Edit Recipient Address"
                    description="Update the bill-to / customer address details for this invoice."
                    onDone={(newAddr) => {
                      setValue("recipientAddress", newAddr, {
                        shouldDirty: true,
                      });
                    }}
                  >
                    <button
                      type="button"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer block pt-1 text-left"
                    >
                      + Edit recipient details
                    </button>
                  </EditAddressDialog>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Invoice # <span className="text-red-500">*</span>
                </label>
                <Input
                  id="invoiceNumber"
                  aria-invalid={!!errors.invoiceNumber}
                  {...register("invoiceNumber", { required: true })}
                  disabled
                  className={`h-11 bg-gray-50 text-gray-500 cursor-not-allowed ${errors.invoiceNumber ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50" : "border-gray-200"
                    }`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    aria-invalid={!!errors.date}
                    {...register("date", { required: true })}
                    className={`bg-white h-11 ${errors.date ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50" : "border-gray-200"
                      }`}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex justify-between">
                  <span>Project <span className="text-red-500">*</span></span>
                  {errors.projectId && <span className="text-red-500 text-xs">Required</span>}
                </label>
                <div className="flex items-center justify-between w-full h-11 px-3 text-sm text-left bg-gray-50 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed">
                  <span className="truncate">
                    {projectName || "Loading..."}
                  </span>
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
                  disabled
                  className="bg-gray-50 border-gray-200 h-11 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50/50 py-3 px-4 rounded-lg mb-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-5">Description</div>
          <div className="col-span-2 text-center">Rate</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-1 text-center">Tax</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        {/* <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Controller
              control={control}
              name="groupSections"
              render={({ field }) => (
                <div
                  onClick={() => field.onChange(!field.value)}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${field.value ? "bg-blue-600" : "bg-gray-200"
                    }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm absolute border border-gray-300 transition-transform ${field.value ? "left-5" : "left-0"
                      }`}
                  ></div>
                </div>
              )}
            />
            <span className="text-sm text-gray-500 font-medium">
              Group items into Sections
            </span>
          </div>
        </div> */}

        <div className="space-y-4">
          {fields.map((field, index) => {
            const item = watchLineItems?.[index] || field;
            const lineMarkupAmount =
              calculateBaseSubtotal() > 0
                ? ((parseFloat(String(item.rate || 0)) || 0) * (item.quantity || 1) / calculateBaseSubtotal()) * calculateMarkupTotal()
                : 0;
            const markupPerUnit = item.quantity > 0 ? lineMarkupAmount / item.quantity : 0;
            const effectiveRate = (parseFloat(String(item.rate || 0)) || 0) + markupPerUnit;
            const lineTotal = effectiveRate * (item.quantity || 1);

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
                effectiveRate={effectiveRate}
                lineTotal={lineTotal}
              />
            );
          })}
        </div>

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

        <div className="mt-12 flex flex-col lg:flex-row justify-between items-start gap-10">
          {/* Left: Banking & Wire Info */}
          <div className="w-full max-w-md bg-white">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900">
                Banking & Wire Info
              </h3>
              <EditBankInfoDialog
                initialValues={bankDetails}
                onDone={(newBank) => {
                  setValue("bankDetails", newBank, { shouldDirty: true });
                }}
              >
                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </EditBankInfoDialog>
            </div>

            <div className="py-2.5 space-y-2 text-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Bank</span>
                <span className="font-semibold text-gray-900">
                  {bankDetails.bankName || "Example Bank"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Account Name</span>
                <span className="font-semibold text-gray-900">
                  {bankDetails.accountName || "Steel Building Depot LLC"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Account #</span>
                <span className="font-semibold text-gray-900 font-mono">
                  {bankDetails.accountNumber || "****1234"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Routing #</span>
                <span className="font-semibold text-gray-900 font-mono">
                  {bankDetails.routingNumber || "021000021"}
                </span>
              </div>
              {Boolean(bankDetails.swiftCode) && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">SWIFT</span>
                  <span className="font-semibold text-gray-900 font-mono">
                    {bankDetails.swiftCode}
                  </span>
                </div>
              )}
              {Boolean(bankDetails.iban) && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">IBAN</span>
                  <span className="font-semibold text-gray-900 font-mono">
                    {bankDetails.iban}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-500 italic">
                Memo:{" "}
                {bankDetails.paymentInstructions ||
                  "Include invoice number in memo."}
              </p>
            </div>
          </div>

          {/* Right: Totals Summary */}
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
                    {markupType === "$" ? "$" : ""}
                    {markupValue}
                    {markupType === "%" ? "%" : ""}
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

                      const currentSchedule = getValues("paymentSchedulePayments") || [];
                      const scheduleType = getValues("paymentScheduleType");

                      if (scheduleType === "%" && type === "%" && currentSchedule.length > 0) {
                        const depositPercent = parseFloat(value || "0");
                        const depositIdx = currentSchedule.findIndex(
                          (p) => p.name.trim().toLowerCase() === "deposit",
                        );

                        const newSchedule = [...currentSchedule];
                        if (depositIdx >= 0) {
                          if (depositPercent > 0) {
                            newSchedule[depositIdx].amount = value;
                          } else {
                            newSchedule.splice(depositIdx, 1);
                          }
                        } else if (depositPercent > 0) {
                          newSchedule.unshift({
                            name: "Deposit",
                            amount: value,
                          });
                        }

                        const totalSum = newSchedule.reduce(
                          (sum, p) => sum + (parseFloat(p.amount || "0") || 0),
                          0,
                        );
                        if (totalSum > 100) {
                          let diff = totalSum - 100;
                          for (let i = newSchedule.length - 1; i >= 0; i--) {
                            if (
                              newSchedule[i].name.trim().toLowerCase() ===
                              "deposit"
                            )
                              continue;
                            const currentAmount = parseFloat(newSchedule[i].amount || "0");
                            if (currentAmount > diff) {
                              newSchedule[i].amount = (currentAmount - diff).toString();
                              diff = 0;
                              break;
                            } else {
                              diff -= currentAmount;
                              newSchedule[i].amount = "0";
                            }
                          }
                        }
                        setValue("paymentSchedulePayments", newSchedule);
                      }
                    }}
                  >
                    <button className="text-blue-500 text-xs font-medium hover:underline">
                      Edit
                    </button>
                  </AddDepositDialog>
                  <button
                    onClick={() => {
                      setValue("depositValue", "");
                      const currentSchedule = getValues("paymentSchedulePayments") || [];
                      const depositIdx = currentSchedule.findIndex(
                        (p) => p.name.trim().toLowerCase() === "deposit",
                      );
                      if (depositIdx >= 0) {
                        const newSchedule = [...currentSchedule];
                        newSchedule.splice(depositIdx, 1);
                        setValue("paymentSchedulePayments", newSchedule);
                      }
                    }}
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

                    // Auto-adjust payment schedule if needed
                    const currentSchedule = getValues("paymentSchedulePayments") || [];
                    const scheduleType = getValues("paymentScheduleType");

                    if (scheduleType === "%" && type === "%" && currentSchedule.length > 0) {
                      const depositPercent = parseFloat(value || "0");
                      const depositIdx = currentSchedule.findIndex(
                        (p) => p.name.trim().toLowerCase() === "deposit",
                      );

                      const newSchedule = [...currentSchedule];
                      if (depositIdx >= 0) {
                        if (depositPercent > 0) {
                          newSchedule[depositIdx].amount = value;
                        } else {
                          newSchedule.splice(depositIdx, 1);
                        }
                      } else if (depositPercent > 0) {
                        newSchedule.unshift({
                          name: "Deposit",
                          amount: value,
                        });
                      }

                      const totalSum = newSchedule.reduce(
                        (sum, p) => sum + (parseFloat(p.amount || "0") || 0),
                        0,
                      );
                      if (totalSum > 100) {
                        let diff = totalSum - 100;
                        for (let i = newSchedule.length - 1; i >= 0; i--) {
                          if (
                            newSchedule[i].name.trim().toLowerCase() ===
                            "deposit"
                          )
                            continue;
                          const currentAmount = parseFloat(newSchedule[i].amount || "0");
                          if (currentAmount > diff) {
                            newSchedule[i].amount = (currentAmount - diff).toString();
                            diff = 0;
                            break;
                          } else {
                            diff -= currentAmount;
                            newSchedule[i].amount = "0";
                          }
                        }
                      }
                      setValue("paymentSchedulePayments", newSchedule);
                    }
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
                          {paymentScheduleType === "%" &&
                          !p.amount.includes("%")
                            ? "%"
                            : ""}
                        </div>
                      ),
                    )}

                    <PaymentScheduleDialog
                      initialType={paymentScheduleType}
                      initialPayments={paymentSchedulePayments}
                      deposit={
                        depositValue
                          ? { type: depositType, value: depositValue }
                          : undefined
                      }
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
                  deposit={
                    depositValue
                      ? { type: depositType, value: depositValue }
                      : undefined
                  }
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
