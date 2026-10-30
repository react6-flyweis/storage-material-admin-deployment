import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import SuccessDialog from "@/components/success-dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldDescription,
  FieldSet,
} from "@/components/ui/field";
import { useProfile, useUpdateProfileMutation } from "@/modules/profile";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const ProfileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  mobile: z.string().optional(),
});

type ProfileForm = z.infer<typeof ProfileSchema>;

export default function ProfileDialog({ open, onOpenChange }: Props) {
  const [localOpen, setLocalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const isControlled =
    typeof open === "boolean" && typeof onOpenChange === "function";
  const dialogOpen = isControlled ? open! : localOpen;
  const setDialogOpen = (v: boolean) => {
    if (isControlled) onOpenChange!(v);
    else setLocalOpen(v);
  };

  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      mobile: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        mobile: profile.mobile || "",
      });
    }
  }, [profile, reset]);

  const handleSave = async (data: ProfileForm) => {
    const payload: {
      name?: string;
      email?: string;
      phone?: string;
      mobile?: string;
    } = {};

    if (data.name.trim() !== (profile?.name || "").trim()) {
      payload.name = data.name.trim();
    }
    if (data.email.trim() !== (profile?.email || "").trim()) {
      payload.email = data.email.trim();
    }
    if ((data.phone || "").trim() !== (profile?.phone || "").trim()) {
      payload.phone = (data.phone || "").trim();
    }
    if ((data.mobile || "").trim() !== (profile?.mobile || "").trim()) {
      payload.mobile = (data.mobile || "").trim();
    }

    if (Object.keys(payload).length === 0) {
      setDialogOpen(false);
      return;
    }

    try {
      await updateProfileMutation.mutateAsync(payload);
      setDialogOpen(false);
      setShowSuccess(true);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to update profile"));
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="flex-row items-center p-5 border-b gap-4">
          <Avatar className="w-16 h-16 border-2 border-gray-100">
            {profile?.avatar && (
              <AvatarImage
                src={profile.avatar}
                alt={watch("name")}
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
              {getInitials(watch("name") || profile?.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <DialogTitle className="text-lg font-semibold">
              {watch("name") || "Staff Profile"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {watch("email") || "Loading..."}
            </DialogDescription>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleSave)} className="p-6">
            <FieldSet>
              <Field orientation="horizontal">
                <FieldLabel>Name</FieldLabel>
                <FieldContent>
                  <Input
                    {...register("name")}
                    className="text-right border-0 border-b border-gray-200 focus:outline-none"
                  />
                  <FieldError
                    errors={errors.name ? [{ message: errors.name.message }] : []}
                  />
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <FieldLabel>Email account</FieldLabel>
                <FieldContent>
                  <Input
                    {...register("email")}
                    className="text-right border-0 border-b border-gray-200 focus:outline-none"
                  />
                  <FieldError
                    errors={
                      errors.email ? [{ message: errors.email.message }] : []
                    }
                  />
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <FieldLabel>Primary phone</FieldLabel>
                <FieldContent>
                  <Input
                    {...register("phone")}
                    placeholder="+1 555-0100"
                    className="text-right border-0 border-b border-gray-200 focus:outline-none"
                  />
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <FieldLabel>Mobile number</FieldLabel>
                <FieldContent>
                  <Input
                    {...register("mobile")}
                    placeholder="+1 555-0199"
                    className="text-right border-0 border-b border-gray-200 focus:outline-none"
                  />
                  <FieldDescription className="text-xs text-muted-foreground">
                    Optional mobile contact
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldSet>
          </form>
        )}

        <DialogFooter className="px-6 py-4 border-t sm:justify-between items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDialogOpen(false);
              navigate("/profile");
            }}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Full Profile & Security
          </Button>

          <Button
            onClick={handleSubmit(handleSave)}
            disabled={updateProfileMutation.isPending}
            className="rounded-md w-36 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Profile Updated Successfully!"
      />
    </Dialog>
  );
}
