import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

type AddNotesFormValues = {
  title: string;
  notes: string;
};

export type { AddNotesFormValues };

export function AddNotesDialog({
  onSave,
}: {
  onSave: (data: AddNotesFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddNotesFormValues>({
    defaultValues: {
      title: "",
      notes: "",
    },
  });

  const onSubmit = (data: AddNotesFormValues) => {
    onSave(data);
    reset();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-[#1D51A4] text-[#1D51A4] hover:bg-slate-50 rounded-[6px]"
        >
          Add Notes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <DialogHeader className="">
            <DialogTitle className="text-xl font-semibold">
              Add Notes
            </DialogTitle>
            <div className="sr-only">
              Add a title and note content for this project.
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="note-title">Notes Title</Label>
              <Input
                id="note-title"
                className="h-12 rounded-[10px] border border-slate-200 bg-slate-50"
                placeholder="Steel Investment"
                {...register("title", {
                  required: "Notes title is required",
                })}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-details">Notes</Label>
              <Textarea
                id="note-details"
                className="rounded-[10px] border border-slate-200 bg-slate-50 p-4"
                placeholder={`Reliable for long-distance steel transport.\nPreferred carrier for Texas routes.\nFast response time during bidding.`}
                {...register("notes", {
                  required: "Notes are required",
                })}
              />
              {errors.notes && (
                <p className="text-xs text-red-500">{errors.notes.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex items-center sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="lg"
              className=""
              disabled={isSubmitting}
            >
              Add Note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
