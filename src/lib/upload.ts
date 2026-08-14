import { apiClient } from "@/modules/auth/auth.api";

export async function uploadFileToS3(
  file: File,
  folder: string = "documents",
  onProgress?: (progress: number) => void
): Promise<string> {
  // Step 1: Get presigned URL
  const res = await apiClient.post<{
    success?: boolean;
    data?: { uploadUrl: string; fileUrl: string; key: string };
    uploadUrl?: string;
    fileUrl?: string;
    key?: string;
  }>("/api/upload/presigned-url", {
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    folder,
  });

  const payload = res.data?.data || res.data;
  const uploadUrl = payload?.uploadUrl;
  const fileUrl = payload?.fileUrl;

  if (!uploadUrl || !fileUrl) {
    throw new Error("Invalid presigned URL response from server.");
  }


  // Step 2: Upload the file directly to S3 using XHR for progress tracking
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream"
    );

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve();
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during S3 upload."));
    };

    xhr.send(file);
  });

  // Step 3: Return the fileUrl so it can be saved to the database payload
  return fileUrl;
}

