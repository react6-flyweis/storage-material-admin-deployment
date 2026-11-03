import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  CircleDollarSign,
  Edit2,
  Layers,
  Loader2,
  MessageSquare,
  Package,
  Plus,
  Ship,
  Trash2,
  Truck,
  Upload,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { formatBusinessUnit } from "@/modules/leads/business-unit";
import SuccessDialog from "@/components/success-dialog";
import {
  useGetLeadBudgetQuery,
  useUpdateLeadBudgetMutation,
  useUpdateLeadBudgetCategoryMutation,
  useAddLeadBudgetCustomLineMutation,
  useUpdateLeadBudgetCustomLineMutation,
  useDeleteLeadBudgetCustomLineMutation,
  useLeadDetailQuery,
  type PlanningCard,
  type CustomBudgetLine,
  type LeadBudgetPayload,
} from "@/modules/leads/leads.hooks";
import { useExpenseCategoriesQuery } from "@/modules/financials/financials.hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DEFAULT_PRESET_CARDS: PlanningCard[] = [
  {
    key: "material",
    label: "Material Budget",
    description: "Estimate all material related costs for the project.",
    amount: 0,
    isPreset: true,
    canDelete: false,
    expenseCategories: [],
  },
  {
    key: "logistic",
    label: "Logistic Budget",
    description: "Estimate all logistic related cost",
    amount: 0,
    isPreset: true,
    canDelete: false,
    expenseCategories: [],
  },
  {
    key: "production",
    label: "Production Budget",
    description: "Estimate Production and fabrication cost",
    amount: 0,
    isPreset: true,
    canDelete: false,
    expenseCategories: [],
  },
  {
    key: "shipper",
    label: "Shipper Budget",
    description: "Estimate shipper quotation and related costs",
    amount: 0,
    isPreset: true,
    canDelete: false,
    expenseCategories: [],
  },
  {
    key: "other",
    label: "Other Costs",
    description: "Estimate any additional miscellaneous costs",
    amount: 0,
    isPreset: true,
    canDelete: false,
    expenseCategories: [],
  },
];

export default function BudgetPlanning() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const leadId = projectId || "";

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successDialogTitle, setSuccessDialogTitle] = useState("Success!");
  const [successDialogDescription, setSuccessDialogDescription] = useState<
    string | undefined
  >(undefined);

  const showSuccess = (title: string, description?: string) => {
    setSuccessDialogTitle(title);
    setSuccessDialogDescription(description);
    setSuccessDialogOpen(true);
  };

  const { data: leadData } = useLeadDetailQuery(leadId);
  const project = leadData?.data?.lead;

  const { data: budgetData, isLoading: isBudgetLoading } =
    useGetLeadBudgetQuery(leadId);
  const updateBudgetMutation = useUpdateLeadBudgetMutation();
  const updateCategoryMutation = useUpdateLeadBudgetCategoryMutation();
  const addCustomLineMutation = useAddLeadBudgetCustomLineMutation();
  const updateCustomLineMutation = useUpdateLeadBudgetCustomLineMutation();
  const deleteCustomLineMutation = useDeleteLeadBudgetCustomLineMutation();

  const { data: categoriesRes } = useExpenseCategoriesQuery();
  const availableCategories = categoriesRes?.data?.categories || [];

  const [cards, setCards] = useState<PlanningCard[]>(DEFAULT_PRESET_CARDS);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [deleteConfirmKey, setDeleteConfirmKey] = useState<string | null>(null);

  // Dialog state for add/edit custom budget line
  const [customLineDialogOpen, setCustomLineDialogOpen] = useState(false);
  const [editingLineKey, setEditingLineKey] = useState<string | null>(null);
  const [customLineForm, setCustomLineForm] = useState({
    label: "",
    key: "",
    amount: "",
    expenseCategories: [] as string[],
    newCategoryInput: "",
  });

  useEffect(() => {
    if (budgetData?.data?.budget) {
      const b = budgetData.data.budget;
      if (Array.isArray(b.planningCards) && b.planningCards.length > 0) {
        setCards(b.planningCards);
      } else {
        const initialCards: PlanningCard[] = [
          {
            key: "material",
            label: "Material Budget",
            description: "Estimate all material related costs for the project.",
            amount: b.materialBudget || 0,
            isPreset: true,
            canDelete: false,
            expenseCategories: [],
          },
          {
            key: "logistic",
            label: "Logistic Budget",
            description: "Estimate all logistic related cost",
            amount: b.logisticBudget || 0,
            isPreset: true,
            canDelete: false,
            expenseCategories: [],
          },
          {
            key: "production",
            label: "Production Budget",
            description: "Estimate Production and fabrication cost",
            amount: b.productionBudget || 0,
            isPreset: true,
            canDelete: false,
            expenseCategories: [],
          },
          {
            key: "shipper",
            label: "Shipper Budget",
            description: "Estimate shipper quotation and related costs",
            amount: b.shipperBudget || 0,
            isPreset: true,
            canDelete: false,
            expenseCategories: [],
          },
          {
            key: "other",
            label: "Other Costs",
            description: "Estimate any additional miscellaneous costs",
            amount: b.otherCost || 0,
            isPreset: true,
            canDelete: false,
            expenseCategories: [],
          },
        ];

        if (Array.isArray(b.customLines)) {
          b.customLines.forEach((cl) => {
            initialCards.push({
              key: cl.key || cl.label.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
              label: cl.label,
              description: "",
              amount: cl.amount || 0,
              isPreset: false,
              canDelete: true,
              expenseCategories: cl.expenseCategories || [],
            });
          });
        }
        setCards(initialCards);
      }
    }
  }, [budgetData]);

  const totalEstimateCost = cards.reduce(
    (sum, c) => sum + (Number(c.amount) || 0),
    0,
  );

  const quoteValue = project?.quoteValue || 0;

  // Use calculated expected profit or server expectedProfit
  const expectedProfit =
    quoteValue > 0
      ? quoteValue - totalEstimateCost
      : (budgetData?.data?.budget?.expectedProfit ?? 0);
  const expectedProfitPercent =
    quoteValue > 0 ? ((expectedProfit / quoteValue) * 100).toFixed(1) : "0";

  const getCardIcon = (key: string) => {
    switch (key.toLowerCase()) {
      case "material":
        return <Package className="h-6 w-6" />;
      case "logistic":
        return <Truck className="h-6 w-6" />;
      case "production":
        return <Building2 className="h-6 w-6" />;
      case "shipper":
        return <Ship className="h-6 w-6" />;
      case "other":
        return <MessageSquare className="h-6 w-6" />;
      default:
        return <Layers className="h-6 w-6" />;
    }
  };

  const handleAmountChange = (index: number, value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0;
    setCards((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], amount: numValue };
      return next;
    });
  };

  const handleUpdateCard = async (card: PlanningCard) => {
    if (!leadId) return;
    setUpdatingKey(card.key);
    try {
      if (card.isPreset) {
        await updateCategoryMutation.mutateAsync({
          leadId,
          categoryKey: card.key,
          payload: { amount: Number(card.amount) || 0 },
        });
        showSuccess(
          "Update Successful",
          `${card.label} has been updated successfully.`,
        );
      } else {
        await updateCustomLineMutation.mutateAsync({
          leadId,
          lineKey: card.key,
          payload: {
            label: card.label,
            amount: Number(card.amount) || 0,
            expenseCategories: card.expenseCategories || [],
          },
        });
        showSuccess(
          "Update Successful",
          `${card.label} has been updated successfully.`,
        );
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to update ${card.label}`;
      toast.error(msg);
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleDeleteCustomLine = async (lineKey: string) => {
    if (!leadId) return;
    try {
      await deleteCustomLineMutation.mutateAsync({ leadId, lineKey });
      setDeleteConfirmKey(null);
      showSuccess(
        "Deleted Successfully",
        "The custom budget category has been removed.",
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to delete category";
      toast.error(msg);
    }
  };

  const handleOpenAddCustomLineDialog = () => {
    setEditingLineKey(null);
    setCustomLineForm({
      label: "",
      key: "",
      amount: "",
      expenseCategories: [],
      newCategoryInput: "",
    });
    setCustomLineDialogOpen(true);
  };

  const handleOpenEditCustomLineDialog = (card: PlanningCard) => {
    setEditingLineKey(card.key);
    setCustomLineForm({
      label: card.label,
      key: card.key,
      amount: String(card.amount || 0),
      expenseCategories: card.expenseCategories || [],
      newCategoryInput: "",
    });
    setCustomLineDialogOpen(true);
  };

  const handleToggleCategory = (categoryName: string) => {
    setCustomLineForm((prev) => {
      const exists = prev.expenseCategories.includes(categoryName);
      return {
        ...prev,
        expenseCategories: exists
          ? prev.expenseCategories.filter((c) => c !== categoryName)
          : [...prev.expenseCategories, categoryName],
      };
    });
  };

  const handleAddCustomCategoryInput = () => {
    const trimmed = customLineForm.newCategoryInput.trim();
    if (!trimmed) return;
    if (!customLineForm.expenseCategories.includes(trimmed)) {
      setCustomLineForm((prev) => ({
        ...prev,
        expenseCategories: [...prev.expenseCategories, trimmed],
        newCategoryInput: "",
      }));
    } else {
      setCustomLineForm((prev) => ({ ...prev, newCategoryInput: "" }));
    }
  };

  const handleSaveCustomLineDialog = async () => {
    if (!leadId || !customLineForm.label.trim()) return;
    const numAmount =
      parseFloat(customLineForm.amount.replace(/[^0-9.-]+/g, "")) || 0;

    try {
      if (editingLineKey) {
        await updateCustomLineMutation.mutateAsync({
          leadId,
          lineKey: editingLineKey,
          payload: {
            label: customLineForm.label.trim(),
            amount: numAmount,
            expenseCategories: customLineForm.expenseCategories,
          },
        });
        setCustomLineDialogOpen(false);
        showSuccess(
          "Category Updated",
          `Budget category "${customLineForm.label.trim()}" has been updated.`,
        );
      } else {
        const generatedKey =
          customLineForm.key.trim() ||
          customLineForm.label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
        await addCustomLineMutation.mutateAsync({
          leadId,
          payload: {
            label: customLineForm.label.trim(),
            amount: numAmount,
            key: generatedKey,
            expenseCategories: customLineForm.expenseCategories,
          },
        });
        setCustomLineDialogOpen(false);
        showSuccess(
          "Category Added",
          `Budget category "${customLineForm.label.trim()}" has been added.`,
        );
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save category";
      toast.error(msg);
    }
  };

  const buildFullPayload = (): LeadBudgetPayload => {
    const getAmount = (key: string) =>
      Number(cards.find((c) => c.key === key)?.amount) || 0;

    const customLines: CustomBudgetLine[] = cards
      .filter((c) => !c.isPreset)
      .map((c) => ({
        key: c.key,
        label: c.label,
        amount: Number(c.amount) || 0,
        expenseCategories: c.expenseCategories || [],
      }));

    const total = cards.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    return {
      totalBudget: total,
      materialBudget: getAmount("material"),
      logisticBudget: getAmount("logistic"),
      productionBudget: getAmount("production"),
      shipperBudget: getAmount("shipper"),
      otherCost: getAmount("other"),
      customLines,
    };
  };

  const handleSaveDraft = async () => {
    if (!leadId) return;
    try {
      await updateBudgetMutation.mutateAsync({
        leadId,
        payload: buildFullPayload(),
      });
      showSuccess(
        "Draft Saved",
        "Project budget draft has been saved successfully.",
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save draft";
      toast.error(msg);
    }
  };

  const handleUpdateBudget = async () => {
    if (!leadId) return;
    try {
      await updateBudgetMutation.mutateAsync({
        leadId,
        payload: buildFullPayload(),
      });
      showSuccess(
        "Update Successful",
        "Project budget has been updated successfully.",
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update budget";
      toast.error(msg);
    }
  };

  const isSavingFullBudget = updateBudgetMutation.isPending;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="default"
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
              onClick={() => navigate("/customers")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Budget Planning
              </h1>
              <p className="text-sm text-gray-500">
                Plan and manage the estimate budget for the project before
                execution
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              onClick={handleOpenAddCustomLineDialog}
            >
              <Plus className="h-4 w-4 text-blue-600" />
              Add Custom Line
            </Button>
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-2"
              onClick={handleSaveDraft}
              disabled={isSavingFullBudget}
            >
              {isSavingFullBudget ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Save as Draft
            </Button>
            <Button
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white flex items-center gap-2"
              onClick={handleUpdateBudget}
              disabled={isSavingFullBudget}
            >
              {isSavingFullBudget && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Update Budget
            </Button>
          </div>
        </div>

        {/* Project Info Card */}
        <Card className="mt-8 overflow-hidden rounded-xl border-gray-200">
          <div className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {project?.projectName || "Unnamed Project"}
                </h2>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                  {project?.lifecycleStatus || "In Progress"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {project?.jobId || "Q-2025-1047"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Business Unit</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatBusinessUnit(project?.businessUnit, project?.businessUnitLabel)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CircleDollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Total Quote Value</p>
                <p className="text-sm font-medium text-gray-900">
                  ${quoteValue.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CircleDollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Total Estimate Cost</p>
                <p className="text-sm font-medium text-gray-900">
                  ${totalEstimateCost.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CircleDollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Expected Profit</p>
                <p className="text-sm font-medium text-emerald-600">
                  ${expectedProfit.toLocaleString()} ({expectedProfitPercent}%)
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Budget Cards Grid */}
        {isBudgetLoading && cards.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-sm font-medium text-gray-500">
              Loading budget details...
            </span>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            {cards.map((card, index) => {
              const isUpdating = updatingKey === card.key;
              return (
                <Card
                  key={card.key || index}
                  className="rounded-xl border-gray-200 p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          {getCardIcon(card.key)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {card.label}
                            </h3>
                            {!card.isPreset && card.key && (
                              <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                                {card.key}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {card.description ||
                              (!card.isPreset ? "Custom budget item" : "")}
                          </p>
                        </div>
                      </div>
                      {card.canDelete && (
                        <div className="flex items-center gap-1 -mt-1 -mr-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => handleOpenEditCustomLineDialog(card)}
                            title="Edit custom line"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteConfirmKey(card.key)}
                            title="Delete custom line"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Expense Categories tags */}
                    {card.expenseCategories &&
                      card.expenseCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {card.expenseCategories.map((cat, cIdx) => (
                            <span
                              key={cIdx}
                              className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-medium"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-500">
                      Total {card.label} Cost (USD)
                    </label>
                    <div className="flex gap-4">
                      <Input
                        type="number"
                        value={card.amount}
                        onChange={(e) =>
                          handleAmountChange(index, e.target.value)
                        }
                        className="flex-1 text-gray-900 bg-white"
                      />
                      <Button
                        onClick={() => handleUpdateCard(card)}
                        disabled={isUpdating}
                        className="bg-[#1E50A5] hover:bg-[#1a438c] text-white w-24 flex items-center justify-center gap-1.5"
                      >
                        {isUpdating && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Update
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Add Custom Budget Line Card Button */}
            <Card
              onClick={handleOpenAddCustomLineDialog}
              className="rounded-xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#1E50A5] hover:bg-blue-50/20 transition-all min-h-[220px]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
                <Plus className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-gray-900">
                Add Custom Budget Line
              </h4>
              <p className="text-sm text-gray-500 mt-1 max-w-xs">
                Add dynamic budget items such as permits & fees, inspections, or
                specialized contractor costs.
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Add / Edit Custom Budget Line Dialog */}
      <Dialog
        open={customLineDialogOpen}
        onOpenChange={setCustomLineDialogOpen}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {editingLineKey
                ? "Edit Custom Budget Line"
                : "Add Custom Budget Line"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {editingLineKey
                ? "Update the custom budget line details and expense categories mapping."
                : "Define a new budget line item and map it to expense categories."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Line Label <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Permits & fees"
                value={customLineForm.label}
                onChange={(e) => {
                  const val = e.target.value;
                  const autoKey = val
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "_")
                    .replace(/^_+|_+$/g, "");
                  setCustomLineForm((prev) => ({
                    ...prev,
                    label: val,
                    key:
                      !editingLineKey &&
                      (prev.key === "" || prev.key === autoKey.slice(0, -1))
                        ? autoKey
                        : prev.key,
                  }));
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Key Identifier
                </label>
                <Input
                  placeholder="e.g. permits"
                  value={customLineForm.key}
                  disabled={Boolean(editingLineKey)}
                  onChange={(e) =>
                    setCustomLineForm((prev) => ({
                      ...prev,
                      key: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9_]+/g, ""),
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Amount (USD) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={customLineForm.amount}
                  onChange={(e) =>
                    setCustomLineForm((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Expense Categories
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Tag categories that will read from this budget line (e.g.
                permits, administrativeCost).
              </p>

              {/* Selected Categories */}
              {customLineForm.expenseCategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {customLineForm.expenseCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-medium"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => handleToggleCategory(cat)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add Custom Tag Input */}
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Type a category name and press Add"
                  value={customLineForm.newCategoryInput}
                  onChange={(e) =>
                    setCustomLineForm((prev) => ({
                      ...prev,
                      newCategoryInput: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomCategoryInput();
                    }
                  }}
                  className="text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCustomCategoryInput}
                  className="text-xs shrink-0"
                >
                  Add Tag
                </Button>
              </div>

              {/* Quick suggestions from existing categories */}
              {availableCategories.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">
                    Suggested categories:
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {availableCategories.map((c) => {
                      const isSelected =
                        customLineForm.expenseCategories.includes(c.name);
                      return (
                        <button
                          key={c._id}
                          type="button"
                          onClick={() => handleToggleCategory(c.name)}
                          className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setCustomLineDialogOpen(false)}
              disabled={
                addCustomLineMutation.isPending ||
                updateCustomLineMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              className="bg-[#1E50A5] hover:bg-[#1a438c] text-white flex items-center gap-1.5"
              onClick={handleSaveCustomLineDialog}
              disabled={
                !customLineForm.label.trim() ||
                addCustomLineMutation.isPending ||
                updateCustomLineMutation.isPending
              }
            >
              {(addCustomLineMutation.isPending ||
                updateCustomLineMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {editingLineKey ? "Save Changes" : "Add Line Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteConfirmKey)}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmKey(null);
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Delete Custom Category
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Are you sure you want to delete this custom budget category? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmKey(null)}
              disabled={deleteCustomLineMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5"
              onClick={() =>
                deleteConfirmKey && handleDeleteCustomLine(deleteConfirmKey)
              }
              disabled={deleteCustomLineMutation.isPending}
            >
              {deleteCustomLineMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SuccessDialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        title={successDialogTitle}
        description={successDialogDescription}
      />
    </div>
  );
}
