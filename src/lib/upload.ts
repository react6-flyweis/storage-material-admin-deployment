import { apiClient } from "@/modules/auth/auth.api";

export async function uploadFileToS3(file: File, folder: string = "documents"): Promise<string> {
  // Step 1: Get presigned URL
  const { data } = await apiClient.post<{ uploadUrl: string; fileUrl: string; key: string }>(
    "/api/upload/presigned-url",
    {
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      folder,
    }
  );

  // Step 2: Upload the file directly to S3 using uploadUrl
  const response = await fetch(data.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file to S3: ${response.statusText}`);
  }

  // Step 3: Return the fileUrl so it can be saved to the database payload
  return data.fileUrl;
}
