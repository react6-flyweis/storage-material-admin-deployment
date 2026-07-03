import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Client = { id: string; name: string; avatar?: string };

type Props = {
  children?: React.ReactNode;
  clients?: Client[];
  isLoading?: boolean;
  initialSelected?: string | null;
  onDone: (client: Client | null) => void;
};

export default function AddClientDialog({
  children,
  clients,
  isLoading = false,
  initialSelected = null,
  onDone,
}: Props) {
  const defaultClients: Client[] = clients ?? [
    {
      id: "1",
      name: "Randy Dorwart",
      avatar: "https://i.pravatar.cc/40?img=12",
    },
    {
      id: "2",
      name: "Abram Vaccaro",
      avatar: "https://i.pravatar.cc/40?img=5",
    },
    {
      id: "3",
      name: "Kaiya Ekstrom Bothman",
      avatar: "https://i.pravatar.cc/40?img=14",
    },
    {
      id: "4",
      name: "Hanne Workman",
      avatar: "https://i.pravatar.cc/40?img=8",
    },
  ];

  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<Client[]>(defaultClients);
  const [selectedId, setSelectedId] = React.useState<string | null>(
    initialSelected
  );

  React.useEffect(() => {
    setItems(clients ?? defaultClients);
  }, [clients]);

  React.useEffect(() => {
    setSelectedId(initialSelected ?? null);
  }, [initialSelected]);

  const handleDone = () => {
    const client = items.find((c) => c.id === selectedId) ?? null;
    onDone(client);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md p-0">
        <div className="p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              Add Client
            </DialogTitle>
            <DialogDescription className="sr-only">
              Select a client
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <div className="space-y-4">
              <div className="text-base font-medium text-slate-900">
                Select Client
              </div>

              <Select value={selectedId || undefined} onValueChange={(val) => setSelectedId(val)}>
                <SelectTrigger className="w-full h-11 rounded-xl border-gray-300 bg-white px-4 text-left text-sm text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {isLoading ? (
                    <div className="p-3 text-sm text-gray-500 flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  ) : items.length > 0 ? (
                    items.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <div className="flex items-center gap-3">
                          {c.avatar && (
                            <img
                              src={c.avatar}
                              alt={c.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <span>{c.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500 text-center">
                      Data not found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex items-center justify-between">
          <DialogClose asChild>
            <Button
              size="lg"
              className="rounded-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Cancel
            </Button>
          </DialogClose>

          <Button
            size="lg"
            onClick={handleDone}
            className="rounded-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
