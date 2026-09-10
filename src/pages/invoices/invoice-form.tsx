import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { Calendar, ChevronDown, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import InvoiceLineItem from "./invoice-line-item";
import AddMarkupDialog from "@/components/add-markup-dialog";
import AddDiscountDialog from "@/components/add-discount-dialog";
import AddDepositDialog from "@/components/add-deposit-dialog";
import PaymentScheduleDialog from "@/components/payment-schedule-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import steelLogo from "@/assets/steel-building-depot-logo.png";
import { useNavigate, useSearchParams } from "react-router";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useCreateInvoiceMutation,
  useCreatePaymentScheduleMutation,
  usePaymentScheduleQuery,
} from "@/modules/invoices/invoices.hooks";
import type { CreateInvoicePayload } from "@/modules/invoices/invoices.api";
import AddProjectDialog from "@/components/add-project-dialog";
import { useLeadsQuery } from "@/modules/leads/leads.hooks";
import { useLatestApprovedTaxByLeadQuery } from "@/modules/quotations/quotations.hooks";
import { toast } from "sonner";

export interface LineItem {
  id: string;
  description: string;
  notes: string;
  rate: number;
  markup?: number;
  markupType?: "percentage" | "amount";
  quantity: number;
  taxType: "%" | "$" | "percentage" | "amount";
  taxValue?: string;
  tax?: number;
  taxAmount?: number;
  markupAmount?: number;
  effectiveRate?: number;
  total?: number;
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
  leadId?: string;
  taxes: { name: string; rate: string; type?: "%" | "$" }[];
}

interface InvoiceFormProps {
  invoice?: any;
  paymentSchedule?: any;
  isSummaryReadOnly?: boolean;
}

export default function InvoiceForm({
  invoice,
  paymentSchedule,
  isSummaryReadOnly = false,
}: InvoiceFormProps = {}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createInvoiceMutation = useCreateInvoiceMutation();
  const createPaymentScheduleMutation = useCreatePaymentScheduleMutation();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
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
      leadId: "",
      taxes: [],
      lineItems: [
        {
          id: "1",
          description: "",
          notes: "",
          rate: 0,
          markup: 0,
          markupType: "amount",
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

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const leadIdParam = searchParams.get("leadId");
  const isFromQuotation = typeParam === "quotation";

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
  const projectId = watchedValues?.projectId ?? "";
  const projectName = watchedValues?.projectName ?? "";
  const leadId =
    watchedValues?.leadId ||
    projectId ||
    (typeof invoice?.leadId === "object"
      ? invoice?.leadId?._id
      : invoice?.leadId || invoice?.projectId) ||
    "";
  const taxes = watchedValues?.taxes ?? [];

  // Ref to track which leadId has already had quotation tax data applied
  const lastAppliedLeadTaxIdRef = useRef<string | null>(null);

  // Trigger query when leadId is selected and invoice is not in read-only state
  const latestApprovedTaxQuery = useLatestApprovedTaxByLeadQuery(
    leadId || undefined,
    Boolean(leadId) && !isSummaryReadOnly,
  );

  // Pre-fill lead/project if leadId is passed in search params
  useEffect(() => {
    if (leadIdParam) {
      setValue("leadId", leadIdParam);
      setValue("projectId", leadIdParam);
    }
  }, [leadIdParam, setValue]);

  // Preserve Existing Invoices in Edit Mode
  useEffect(() => {
    if (invoice) {
      // Initialize to existing leadId to avoid overwriting saved line items on mount
      const existingLeadId =
        typeof invoice?.leadId === "object"
          ? invoice?.leadId?._id
          : invoice?.leadId || invoice?.projectId || null;
      lastAppliedLeadTaxIdRef.current = existingLeadId ?? null;
    }
  }, [invoice, paymentSchedule, reset]);

  // Auto-Fill Effect on Lead Change
  useEffect(() => {
    if (!leadId) {
      lastAppliedLeadTaxIdRef.current = null;
      return;
    }

    if (!latestApprovedTaxQuery.isSuccess) {
      return;
    }

    // Prevent repeated runs for the same leadId
    if (lastAppliedLeadTaxIdRef.current === leadId) {
      return;
    }

    lastAppliedLeadTaxIdRef.current = leadId;

    const taxData = latestApprovedTaxQuery.data;
    if (!taxData) return;

    // 1. Base rate before markup
    const baseRate =
      taxData.amountWithoutMarkup ?? taxData.subtotalWithoutMarkup ?? 0;

    setValue("lineItems.0.rate", baseRate);
    setValue("lineItems.0.quantity", getValues("lineItems.0.quantity") || 1);
    if (!getValues("lineItems.0.description")) {
      setValue(
        "lineItems.0.description",
        taxData.quoteNumber
          ? `Quotation ${taxData.quoteNumber}`
          : "Project Quote",
      );
    }

    // 2. Direct Markup Amount ($)
    const markupAmount = taxData.markup ?? 0;
    setValue("markupType", "$");
    setValue("markupValue", markupAmount > 0 ? String(markupAmount) : "");
    setValue("lineItems.0.markup", markupAmount);
    setValue("lineItems.0.markupType", "amount");
    setValue("lineItems.0.markupAmount", markupAmount);
    const effectiveRate = baseRate + markupAmount;
    setValue("lineItems.0.effectiveRate", effectiveRate);
    setValue(
      "lineItems.0.total",
      baseRate * (getValues("lineItems.0.quantity") || 1),
    );

    // 3. Direct Tax Amount & Rate
    const taxRate = taxData.taxRate ?? 0;
    const taxAmount = taxData.tax ?? 0;

    if (taxRate > 0 || taxAmount > 0) {
      const currentTaxes = (getValues("taxes") || []) as InvoiceFormValues["taxes"];
      const rateStr = String(taxRate);
      let matchingTax = currentTaxes.find((t) => parseFloat(t.rate) === taxRate);

      if (!matchingTax && taxRate > 0) {
        const name = `Tax ${rateStr}%`;
        matchingTax = { name, rate: rateStr };
        setValue("taxes", [...currentTaxes, matchingTax]);
      } else if (!matchingTax) {
        matchingTax = { name: "Tax", rate: "0" };
        setValue("taxes", [...currentTaxes, matchingTax]);
      }

      setValue("lineItems.0.selectedTax", matchingTax.name);
      setValue("lineItems.0.tax", taxRate);
      setValue("lineItems.0.taxType", "percentage");
      setValue("lineItems.0.taxAmount", taxAmount);
    } else {
      setValue("lineItems.0.selectedTax", "");
      setValue("lineItems.0.tax", 0);
      setValue("lineItems.0.taxType", "percentage");
      setValue("lineItems.0.taxAmount", 0);
    }
  }, [
    leadId,
    latestApprovedTaxQuery.isSuccess,
    latestApprovedTaxQuery.data,
    setValue,
    getValues,
  ]);

  // const { data: customersData, isLoading: isLoadingCustomers } = useCustomersQuery(1, 100);
  // const mappedCustomers = (customersData?.data?.customers || []).map((c) => ({
  //   id: c._id,
  //   name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.companyName || c.email || "Unknown Customer",
  //   avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${c.firstName || ""} ${c.lastName || ""}`.trim() || c.companyName || "U")}&background=random`,
  // }));

  const { data: leadsData, isLoading: isLoadingProjects } = useLeadsQuery(
    1,
    100,
    {},
  );
  const mappedProjects = (leadsData?.data?.leads || []).map((p) => ({
    id: p._id,
    name: p.projectName?.trim()
      ? p.projectName.replace(/\s*\d{4}-\d{2}-\d{2}T.*Z$/, "")
      : p.jobId || (p._id ? `Project (${p._id.slice(-5)})` : "Project"),
    jobId: p.jobId,
    lifecycleStatus: p.lifecycleStatus,
  }));

  const { data: scheduleData } = usePaymentScheduleQuery(leadId || projectId);

  useEffect(() => {
    if (leadIdParam && mappedProjects.length > 0 && !getValues("projectName")) {
      const match = mappedProjects.find((p) => p.id === leadIdParam);
      if (match) {
        setValue("projectName", match.name);
      }
    }
  }, [leadIdParam, mappedProjects, setValue, getValues]);

  useEffect(() => {
    const schedule = scheduleData?.data?.schedule;
    if (
      schedule &&
      (schedule.payments?.length > 0 || schedule.stages?.length > 0)
    ) {
      // If a schedule exists for this lead, pre-populate it
      const stages = schedule.payments || schedule.stages;
      const type = stages[0]?.amountType === "percentage" ? "%" : "$";
      const formattedStages = stages.map((p: any) => ({
        name: p.name || p.stageName,
        amount: p.amount.toString(),
      }));
      setValue("paymentScheduleType", type);
      setValue("paymentSchedulePayments", formattedStages);
    }
  }, [scheduleData, projectId, setValue]);

  // const toggleNotes = (id: string) => {
  //   setNotesOpen((p) => ({ ...p, [id]: !p[id] }));
  // };

  const addLineItem = () => {
    append({
      id: Date.now().toString(),
      description: "",
      notes: "",
      rate: 0,
      markup: 0,
      markupType: "amount",
      quantity: 1,
      taxType: "%",
      taxValue: "",
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

  // Per-line computed helpers
  const getLineEffectiveRate = (item: LineItem) => {
    const rate = parseFloat(String(item.rate || 0)) || 0;
    const qty = item.quantity || 1;
    const baseSubtotal = calculateBaseSubtotal();
    const markupTotal = calculateMarkupTotal();

    const lineMarkupAmount =
      baseSubtotal > 0 ? ((rate * qty) / baseSubtotal) * markupTotal : 0;
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
    const markupPercent = markupType === "%" ? parseFloat(markupValue) || 0 : 0;
    const markupFixed = markupType === "$" ? parseFloat(markupValue) || 0 : 0;
    const items = watchLineItems || [];
    const available = taxes || [];

    return items.reduce((sum, item, idx) => {
      const selectedName = item.selectedTax;
      const t = available.find((a) => a.name === selectedName);
      const taxRate = t ? parseFloat(t.rate || "0") : 0;

      // Use direct tax amount if pre-populated and tax rate matches
      if (
        typeof item.taxAmount === "number" &&
        !Number.isNaN(item.taxAmount) &&
        item.taxAmount > 0 &&
        (item.tax === taxRate || taxRate === 0)
      ) {
        return sum + item.taxAmount;
      }

      if (!t || taxRate === 0) return sum;

      const rate = parseFloat(String(item.rate || 0)) || 0;
      const quantity = parseFloat(String(item.quantity || 1)) || 0;
      const itemMarkup =
        markupType === "%"
          ? rate * (markupPercent / 100) * quantity
          : idx === 0
          ? markupFixed
          : 0;
      const effectiveRate =
        quantity > 0 ? (rate * quantity + itemMarkup) / quantity : rate;
      const total = effectiveRate * quantity;

      return sum + total * (taxRate / 100);
    }, 0);
  };

  const calculateDiscount = () => {
    return resolveAdjustment(discountType, discountValue, calculateSubtotal());
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  const buildCreateInvoicePayload = (
    data: InvoiceFormValues,
  ): CreateInvoicePayload => {
    const markupPercent =
      data.markupType === "%" ? toNumber(data.markupValue) : 0;
    const markupFixed =
      data.markupType === "$" ? toNumber(data.markupValue) : 0;

    let subtotalWithoutMarkup = 0;
    let markupTotal = 0;
    let taxTotal = 0;

    const parsedLineItems = (data.lineItems || []).map((item, idx) => {
      const rate = toNumber(item.rate);
      const quantity = toNumber(item.quantity || 1);

      const itemMarkupAmount =
        data.markupType === "%"
          ? rate * (markupPercent / 100) * quantity
          : idx === 0
          ? markupFixed
          : 0;
      const effectiveRate =
        quantity > 0 ? (rate * quantity + itemMarkupAmount) / quantity : rate;
      const itemTotal = effectiveRate * quantity;

      const matchingTax = (data.taxes || []).find((t) => t.name === item.selectedTax);
      const taxPercent = matchingTax ? toNumber(matchingTax.rate) : 0;
      const itemTaxAmount =
        typeof item.taxAmount === "number" &&
        item.taxAmount > 0 &&
        (item.tax === taxPercent || taxPercent === 0)
          ? item.taxAmount
          : itemTotal * (taxPercent / 100);

      subtotalWithoutMarkup += rate * quantity;
      markupTotal += itemMarkupAmount;
      taxTotal += itemTaxAmount;

      return {
        description: item.description?.trim() || "",
        notes: item.notes?.trim() || "",
        images: item.images || [],
        items:
          (item.items || []).length > 0
            ? item.items
            : item.description
              ? [item.description]
              : [],
        rate,
        quantity,
        markup: data.markupType === "%" ? markupPercent : itemMarkupAmount,
        markupType: (data.markupType === "%" ? "percentage" : "amount") as
          | "percentage"
          | "amount",
        tax: taxPercent,
        taxType: "percentage" as const,
        effectiveRate,
        markupAmount: itemMarkupAmount,
        taxAmount: itemTaxAmount,
        total: itemTotal,
      };
    });

    const subtotal = subtotalWithoutMarkup + markupTotal;
    const discount = resolveAdjustment(
      data.discountType,
      data.discountValue,
      subtotal,
    );
    const totalAmount = Math.max(0, subtotal - discount + taxTotal);
    const depositAmount = resolveAdjustment(
      data.depositType,
      data.depositValue,
      totalAmount,
    );

    return {
      leadId: data.leadId || data.projectId || "",
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
    };
  };

  const onSubmit = async (data: InvoiceFormValues) => {
    setErrorMessage(null);
    let hasError = false;
    if (!data.projectId) {
      setError("projectId", { type: "manual", message: "Required" });
      hasError = true;
    }
    if (
      data.paymentSchedulePayments &&
      data.paymentSchedulePayments.length > 0 &&
      data.paymentScheduleType === "%"
    ) {
      const depositPercent =
        data.depositType === "%" ? parseFloat(data.depositValue || "0") : 0;
      const target = Math.max(0, 100 - depositPercent);
      const sum = data.paymentSchedulePayments.reduce(
        (acc, curr) => acc + parseFloat(curr.amount || "0"),
        0,
      );
      if (Math.abs(sum - target) > 0.01) {
        toast.error(
          `Please ensure all payment stages add up to exactly ${target}%. Your current total is ${sum}%.`,
        );
        hasError = true;
      }
    }

    if (hasError) return;

    const selectedProject = mappedProjects.find((p) => p.id === data.projectId);
    const lifecycleOrder = [
      "initial_contact",
      "requirements_gathered",
      "proposal_sent",
      "negotiation",
      "deal_closed",
      "payment_done",
      "converted_to_po",
      "sent_to_admin",
    ];

    const currentStatus = selectedProject?.lifecycleStatus || "initial_contact";
    const statusIndex = lifecycleOrder.indexOf(currentStatus);

    if (statusIndex >= 0 && statusIndex < 2) {
      toast.error(
        "Cannot create invoice: Lead must be at least at 'Proposal Sent' stage.",
      );
      return;
    }

    try {
      const payload = buildCreateInvoicePayload(data);
      const response = (await createInvoiceMutation.mutateAsync(
        payload,
      )) as any;

      if (!response.success) {
        setErrorMessage(response.message || "Unable to save invoice.");
        return;
      }

      if (
        data.paymentSchedulePayments &&
        data.paymentSchedulePayments.length > 0 &&
        !scheduleData?.data?.schedule
      ) {
        try {
          await createPaymentScheduleMutation.mutateAsync({
            leadId: data.leadId || data.projectId,
            totalAmount: payload.totalAmount,
            stages: data.paymentSchedulePayments.map((p) => ({
              stageName: p.name,
              amount: parseFloat(p.amount),
              amountType:
                data.paymentScheduleType === "%" ? "percentage" : "fixed",
            })),
          });
        } catch (scheduleError: any) {
          console.error("Failed to create payment schedule:", scheduleError);
          toast.error(
            scheduleError?.response?.data?.message ||
              "Payment schedule already exists for this lead or could not be created.",
          );
        }
      }

      toast.success("Invoice saved successfully!");
      handlePreview(response?.data?.invoice);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to save invoice."));
    }
  };

  const handlePreview = (savedInvoice?: any) => {
    const values = getValues();
    const items = (values.lineItems || []).map((li) => ({
      id: li.id,
      description: li.description,
      notes: li.notes,
      rate: li.rate,
      quantity: li.quantity,
      photos: li.images || [],
      markup:
        getLineEffectiveRate(li) - (parseFloat(String(li.rate || 0)) || 0),
    }));

    navigate("/invoice/preview", {
      state: {
        invoiceId: savedInvoice?._id,
        invoiceNumber:
          savedInvoice?.invoiceNumber || values.invoiceNumber || invoiceNumber,
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
          New Invoice
        </h1>
        <div className="flex items-center gap-3 ml-auto">
          <Button
            variant="outline"
            onClick={() => navigate("/invoices")}
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
        <div className="flex flex-col lg:flex-row justify-between gap-10 mb-12">
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

          <div className="flex-1 max-w-2xl flex flex-col gap-6">
            <div className="flex flex-wrap justify-end gap-3"></div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-6">
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
                    className={`bg-white h-11 ${
                      errors.date
                        ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50"
                        : "border-gray-200"
                    }`}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex justify-between">
                  <span>
                    Project <span className="text-red-500">*</span>
                  </span>
                  {errors.projectId && (
                    <span className="text-red-500 text-xs">Required</span>
                  )}
                </label>
                <AddProjectDialog
                  projects={mappedProjects}
                  isLoading={isLoadingProjects}
                  initialSelected={projectId || null}
                  onDone={(project) => {
                    if (!project) {
                      setValue("projectId", "");
                      setValue("projectName", "");
                      setValue("leadId", "");
                      return;
                    }
                    setValue("projectId", project.id);
                    setValue("projectName", project.name);
                    setValue("leadId", project.id);
                    clearErrors("projectId");

                    const fullProject = leadsData?.data?.leads?.find(
                      (p) => p._id === project.id,
                    );
                    if (fullProject) {
                      setValue("lineItems", [
                        {
                          id: Date.now().toString(),
                          description:
                            fullProject.projectName ||
                            (fullProject._id
                              ? `Project (${fullProject._id.slice(-5)})`
                              : "Project Quote"),
                          notes: "",
                          rate: fullProject.quoteValue || 0,
                          markup: 0,
                          markupType: "amount",
                          quantity: 1,
                          taxType: "%",
                          taxValue: "",
                          images: [],
                          items: [],
                        },
                      ]);
                    }
                  }}
                >
                  <button
                    type="button"
                    className={`flex items-center justify-between w-full h-11 px-3 text-sm text-left bg-white border rounded-md focus:outline-none focus:ring-2 ${
                      errors.projectId
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-200 focus:ring-blue-500"
                    }`}
                  >
                    {" "}
                    <span className="truncate text-gray-700">
                      {projectName || "Select project (lead)"}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                  </button>
                </AddProjectDialog>
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
                ? (((parseFloat(String(item.rate || 0)) || 0) *
                    (item.quantity || 1)) /
                    calculateBaseSubtotal()) *
                  calculateMarkupTotal()
                : 0;
            const markupPerUnit =
              item.quantity > 0 ? lineMarkupAmount / item.quantity : 0;
            const effectiveRate =
              (parseFloat(String(item.rate || 0)) || 0) + markupPerUnit;
            const lineTotal = effectiveRate * (item.quantity || 1);

            return (
              <InvoiceLineItem
                key={field.id}
                index={index}
                item={item}
                control={control}
                register={register}
                getValues={getValues}
                setValue={setValue}
                remove={remove}
                canRemove={!isFromQuotation && fields.length > 1}
                taxes={taxes}
                effectiveRate={effectiveRate}
                lineTotal={lineTotal}
              />
            );
          })}
        </div>

        {!isFromQuotation && (
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={addLineItem}
              className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 h-12 border-dashed flex items-center justify-center gap-2 font-medium cursor-pointer"
            >
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <Plus className="w-3.5 h-3.5" />
              </div>
              ADD LINE ITEM
            </Button>
          </div>
        )}

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

                    // Auto-adjust payment schedule if needed
                    const currentSchedule =
                      getValues("paymentSchedulePayments") || [];
                    const scheduleType = getValues("paymentScheduleType");

                    if (
                      scheduleType === "%" &&
                      type === "%" &&
                      currentSchedule.length > 0
                    ) {
                      const depositPercent = parseFloat(value || "0");
                      const scheduleSum = currentSchedule.reduce(
                        (sum, p) => sum + parseFloat(p.amount || "0"),
                        0,
                      );
                      const targetScheduleSum = Math.max(
                        0,
                        100 - depositPercent,
                      );

                      if (Math.abs(scheduleSum - targetScheduleSum) > 0.01) {
                        const newSchedule = [...currentSchedule];
                        const diff = scheduleSum - targetScheduleSum;

                        for (let i = 0; i < newSchedule.length; i++) {
                          const currentAmount = parseFloat(
                            newSchedule[i].amount || "0",
                          );
                          if (currentAmount > diff) {
                            newSchedule[i].amount = (
                              currentAmount - diff
                            ).toString();
                            break;
                          }
                        }
                        setValue("paymentSchedulePayments", newSchedule);
                      }
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
                        </div>
                      ),
                    )}

                    <PaymentScheduleDialog
                      initialType={paymentScheduleType}
                      initialPayments={paymentSchedulePayments}
                      maxPercent={
                        depositType === "%"
                          ? Math.max(0, 100 - parseFloat(depositValue || "0"))
                          : 100
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
                  maxPercent={
                    depositType === "%"
                      ? Math.max(0, 100 - parseFloat(depositValue || "0"))
                      : 100
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
