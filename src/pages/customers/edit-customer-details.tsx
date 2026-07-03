import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router";
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
import { useCustomerDetailQuery, useUpdateCustomerMutation } from "@/modules/customers/customers.hooks";
import { toast } from "sonner";

type CustomerFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
};

export default function EditCustomerDetailsPage() {
  const navigate = useNavigate();
  const params = useParams();
  const customerId = params.id ?? "";
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: customerData, isLoading, error } = useCustomerDetailQuery(customerId);
  const updateCustomerMutation = useUpdateCustomerMutation();

  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    countryCode: "+1",
  });

  // Populate form with existing customer data
  useEffect(() => {
    if (customerData?.data?.customer) {
      const customer = customerData.data.customer;
      setFormData({
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        email: customer.email || "",
        phoneNumber: customer.phone?.number || "",
        countryCode: customer.phone?.countryCode || "+1",
      });
    }
  }, [customerData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryCodeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, countryCode: value }));
  };

  const handleSelectChange = (name: keyof CustomerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const fullName = [formData.firstName, formData.lastName]
        .filter(Boolean)
        .join(" ");

      const updateData = {
        firstName: fullName, // Merged into a single key as requested
        email: formData.email,
        phone: formData.phoneNumber,
        countryCode: formData.countryCode,
      };

      await updateCustomerMutation.mutateAsync({
        customerId,
        customerData: updateData,
      });

      setShowSuccess(true);
      toast.success("Customer updated successfully!");
    } catch (error) {
      toast.error("Failed to update customer. Please try again.");
      console.error("Update customer error:", error);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate(`/customers/${customerId}`);
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 space-y-6 min-h-screen">
        <div className="flex items-start gap-3">
          <Button
            onClick={() => navigate(`/customers/${customerId}`)}
            className="px-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load customer data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen">
      <div className="flex items-start gap-3">
        <Button
          onClick={() => navigate(`/customers/${customerId}`)}
          className="px-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-slate-900">
            Edit Customer Details
          </h1>
          <p className="text-sm text-slate-600">
            Update customer information and details
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 space-y-7"
      >
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Customer Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Enter First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Enter Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.countryCode}
                  onValueChange={handleCountryCodeChange}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+91">+91</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                    <SelectItem value="+61">+61</SelectItem>
                    <SelectItem value="+86">+86</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Enter Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="flex-1"
                  required
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/customers/${customerId}`)}
            className="min-w-28"
            disabled={updateCustomerMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="min-w-28 bg-[#2864DC] hover:bg-[#1D4FB8]"
            disabled={updateCustomerMutation.isPending}
          >
            {updateCustomerMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>

      <SuccessDialog
        open={showSuccess}
        onClose={handleSuccessClose}
        title="Customer Updated Successfully!"
      />
    </div>
  );
}
