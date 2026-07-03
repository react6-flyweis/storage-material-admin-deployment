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
import { Upload } from "lucide-react";

type Props = {
  children?: React.ReactNode;
  onUpload: (files: File[]) => void;
};

export default function UploadImageDialog({ children, onUpload }: Props) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    setFiles((s) => [...s, ...Array.from(list)]);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const list = e.dataTransfer?.files;
    if (!list) return;
    setFiles((s) => [...s, ...Array.from(list)]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleUpload = () => {
    if (files.length) onUpload(files);
    setFiles([]);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" size="sm" className="text-blue-600">
            <Upload className="w-4 h-4 mr-2" />
            Upload photos
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg p-0">
        <div className="p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              Upload Image
            </DialogTitle>
            <DialogDescription className="sr-only">
              Drop your Image here or click to browse
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 p-2">
            <label
              className="block"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div
                className={`border-2 border-dashed rounded-2xl p-6 text-center hover:bg-gray-50 relative transition-colors ${
                  isDragging ? "border-blue-300 bg-blue-50" : "border-gray-200"
                }`}
              >
                {/* make the whole area clickable */}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                />

                <div className="flex flex-col items-center justify-center gap-3 relative z-10 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="text-gray-700 text-lg font-medium">
                    Drop your Image here
                  </div>
                  <div className="text-gray-400 text-sm">
                    or click to browse
                  </div>

                  <div className="pt-3">
                    <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 pointer-events-auto" onClick={() => inputRef.current?.click()}>
                      Choose file
                    </Button>
                  </div>
                </div>
              </div>
            </label>

            {files.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium">Selected files</div>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span className="truncate pr-2">{f.name}</span>
                      <button
                        onClick={() =>
                          setFiles((s) => s.filter((_, idx) => idx !== i))
                        }
                        className="text-sm text-red-500 ml-2"
                        type="button"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex items-center justify-between">
          <DialogClose asChild>
            <Button
              size="lg"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg w-32"
            >
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              size="lg"
              onClick={handleUpload}
              className="rounded-lg w-32"
            >
              Upload
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
