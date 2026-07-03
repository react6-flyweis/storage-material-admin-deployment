import { useState, useEffect } from "react";
import { ArrowLeft, Minus, Plus, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLeadDetailProvider, updateLeadProvider } from "@/modules/leads/leads.api";
import SuccessDialog from "@/components/success-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type LeadFormData = {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  companyName: string;
  jobTitle: string;
  leadSource: string;
  leadStatus: string;
  quoteValue: number;
  priority: string;
  notes: string;
  width: number;
  length: number;
  height: number;
  roofStyle: string;
  buildingType: string;
  doors: number;
  windows: number;
  insulation: number;
  projectName: string;
  location: string;
};

const getInitialFormData = (): LeadFormData => ({
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "+1",
  phone: "",
  companyName: "",
  jobTitle: "",
  leadSource: "",
  leadStatus: "New",
  quoteValue: 0,
  priority: "Medium",
  notes: "",
  width: 0,
  length: 0,
  height: 0,
  roofStyle: "",
  buildingType: "",
  doors: 0,
  windows: 0,
  insulation: 0,
  projectName: "",
  location: "",
});

interface CounterInputProps {
  id: keyof Pick<
    LeadFormData,
    "width" | "length" | "height" | "doors" | "windows" | "insulation"
  >;
  label: string;
  value: number;
  onChange: (field: CounterInputProps["id"], value: number) => void;
}

function CounterInput({ id, label, value, onChange }: CounterInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs text-slate-600">
        {label}
      </Label>
      <div className="flex h-10 items-center rounded-md border border-slate-200 bg-white px-2">
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-500 transition hover:bg-slate-100"
          onClick={() => onChange(id, Math.max(0, value - 1))}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          id={id}
          type="number"
          min={0}
          value={value}
          onChange={(e) =>
            onChange(id, Math.max(0, Number(e.target.value) || 0))
          }
          className="h-full flex-1 border-none bg-transparent text-center text-sm text-slate-700 outline-none"
        />
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded text-blue-600 transition hover:bg-blue-50"
          onClick={() => onChange(id, value + 1)}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function EditLeadPage() {
  const navigate = useNavigate();
  const { leadId } = useParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<LeadFormData>(getInitialFormData());

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof LeadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCounterChange = (
    field: CounterInputProps["id"],
    value: number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ["lead", "detail", leadId],
    queryFn: () => getLeadDetailProvider(leadId!),
    enabled: !!leadId,
  });

  useEffect(() => {
    if (response?.data) {
      const lead = response.data.lead;
      const customer = response.data.customer;

      setFormData({
        firstName: customer?.firstName || "",
        lastName: customer?.lastName || "",
        email: customer?.email || "",
        countryCode: (() => {
          const p = typeof customer?.phone === 'object' ? customer?.phone?.number : (customer?.phone || "");
          if (p.startsWith("+44")) return "+44";
          if (p.startsWith("+91")) return "+91";
          if (p.startsWith("+61")) return "+61";
          if (p.startsWith("+86")) return "+86";
          return "+1";
        })(),
        phone: (() => {
          const p = typeof customer?.phone === 'object' ? customer?.phone?.number : (customer?.phone || "");
          if (p.startsWith("+44")) return p.slice(3).trim();
          if (p.startsWith("+91")) return p.slice(3).trim();
          if (p.startsWith("+61")) return p.slice(3).trim();
          if (p.startsWith("+86")) return p.slice(3).trim();
          if (p.startsWith("+1")) return p.slice(2).trim();
          const digits = p.replace(/\D/g, "");
          return digits.startsWith("1") ? digits.slice(1) : digits;
        })(),
        companyName: customer?.company || lead?.company || "",
        jobTitle: lead?.jobTitle || "",
        leadSource: lead?.source || "",
        leadStatus: lead?.lifecycleStatus || "New",
        quoteValue: Number(lead?.quoteValue) || 0,
        priority: lead?.priority || "Medium",
        notes: lead?.notes || "",
        width: Number(lead?.width) || 0,
        length: Number(lead?.length) || 0,
        height: Number(lead?.height) || 0,
        roofStyle: lead?.roofStyle || "",
        buildingType: lead?.buildingType || "",
        doors: Number(lead?.numDoors) || 0,
        windows: Number(lead?.numWindows) || 0,
        insulation: Number(lead?.numInsulation) || 0,
        projectName: lead?.projectName || "",
        location: lead?.location || "",
      });
    }
  }, [response]);

  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateLeadProvider(leadId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", "detail", leadId] });
      setShowSuccess(true);
      setTimeout(() => navigate('/leads'), 1500);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      customerFirstName: formData.firstName,
      customerLastName: formData.lastName,
      customerEmail: formData.email,
      customerPhone: `${formData.countryCode} ${formData.phone}`.trim(),
      company: formData.companyName,
      jobTitle: formData.jobTitle,
      source: formData.leadSource,
      lifecycleStatus: formData.leadStatus,
      quoteValue: Number(formData.quoteValue) || 0,
      priority: formData.priority,
      notes: formData.notes,
      width: Number(formData.width) || 0,
      length: Number(formData.length) || 0,
      height: Number(formData.height) || 0,
      roofStyle: formData.roofStyle,
      buildingType: formData.buildingType,
      doors: Number(formData.doors) || 0,
      windows: Number(formData.windows) || 0,
      insulation: Number(formData.insulation) || 0,
      projectName: formData.projectName,
      location: formData.location,
    });
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#eef2ff]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-0 p-4 sm:p-6">
      <div className="mb-4 flex gap-1">
        <Button
          type="button"
          className="h-8 bg-blue-600 px-4 text-xs font-medium hover:bg-blue-700"
          onClick={() => navigate("/leads")}
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back
        </Button>
        <div className="">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Edit Leads
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Create a new lead record and assign it to your pipeline
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full rounded-lg border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-6"
      >
        <div className="space-y-7">
          <section>
            <h2 className="mb-4 text-base font-semibold text-slate-800">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs text-slate-600">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter First Name"
                  className="h-10"
                  required
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs text-slate-600">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter Last Name"
                  className="h-10"
                  required
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs text-slate-600">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter Email Address"
                  className="h-10"
                  required
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs text-slate-600">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.countryCode}
                    onValueChange={(value) => handleSelectChange("countryCode", value)}
                    disabled
                  >
                    <SelectTrigger className="w-[110px] h-10 shrink-0">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+1">🇺🇸 +1</SelectItem>
                      <SelectItem value="+44">🇬🇧 +44</SelectItem>
                      <SelectItem value="+91">🇮🇳 +91</SelectItem>
                      <SelectItem value="+61">🇦🇺 +61</SelectItem>
                      <SelectItem value="+86">🇨🇳 +86</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter Phone Number"
                    className="h-10 flex-1"
                    required
                    disabled
                  />
                </div>
              </div>
            </div>
          </section>





          <section>
            <h2 className="mb-4 text-base font-semibold text-slate-800">
              Project & Site Location
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="projectName" className="text-xs text-slate-600">
                  Project Name
                </Label>
                <Input
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  placeholder="Enter Project Name"
                  className="h-10"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location" className="text-xs text-slate-600">
                  Location (City, State)
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter Location"
                  className="h-10"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="quoteValue" className="text-xs text-slate-600">
                  Quote Value
                </Label>
                <Input
                  id="quoteValue"
                  name="quoteValue"
                  type="number"
                  value={formData.quoteValue || ""}
                  onChange={(e) => setFormData(p => ({ ...p, quoteValue: Number(e.target.value) }))}
                  placeholder="Enter Quote Value"
                  className="h-10"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-base font-semibold text-slate-800">
              Project Specification
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <CounterInput
                  id="width"
                  label="Width (ft/m)"
                  value={formData.width}
                  onChange={handleCounterChange}
                />
                <CounterInput
                  id="length"
                  label="Length (ft/m)"
                  value={formData.length}
                  onChange={handleCounterChange}
                />
                <CounterInput
                  id="height"
                  label="Height (ft/m)"
                  value={formData.height}
                  onChange={handleCounterChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="roofStyle" className="text-xs text-slate-600">
                    Roof Style
                  </Label>
                  <Select
                    key={formData.roofStyle || "roofStyle"}
                    value={formData.roofStyle || undefined}
                    onValueChange={(value) =>
                      handleSelectChange("roofStyle", value)
                    }
                  >
                    <SelectTrigger id="roofStyle" className="h-10">
                      <SelectValue placeholder="Select Roof Style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gable">Gable</SelectItem>
                      <SelectItem value="hip">Hip</SelectItem>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="mansard">Mansard</SelectItem>
                      <SelectItem value="gambrel">Gambrel</SelectItem>
                      <SelectItem value="shed">Shed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="buildingType"
                    className="text-xs text-slate-600"
                  >
                    Building Type
                  </Label>
                  <Select
                    key={formData.buildingType || "buildingType"}
                    value={formData.buildingType || undefined}
                    onValueChange={(value) =>
                      handleSelectChange("buildingType", value)
                    }
                  >
                    <SelectTrigger id="buildingType" className="h-10">
                      <SelectValue placeholder="Select Building Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arch-buildings">Arch Buildings</SelectItem>
                      <SelectItem value="aviation">Aviation</SelectItem>
                      <SelectItem value="carports">Carports</SelectItem>
                      <SelectItem value="workshops">Workshops</SelectItem>
                      <SelectItem value="agricultural">Agricultural</SelectItem>
                      <SelectItem value="warehouses">Warehouses</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="sales-storage">Sales Storage</SelectItem>
                      <SelectItem value="barndominiums">Barndominiums</SelectItem>
                      <SelectItem value="garages">Garages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <CounterInput
                  id="doors"
                  label="Doors"
                  value={formData.doors}
                  onChange={handleCounterChange}
                />
                <CounterInput
                  id="windows"
                  label="Windows"
                  value={formData.windows}
                  onChange={handleCounterChange}
                />
                <CounterInput
                  id="insulation"
                  label="Insulation"
                  value={formData.insulation}
                  onChange={handleCounterChange}
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 min-w-24"
              onClick={() => navigate("/leads")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="h-10 min-w-28 bg-blue-600 hover:bg-blue-700"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Lead
            </Button>
          </div>
        </div>
      </form>

      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Lead Updated Successfully!"
      />
    </div>
  );
}
