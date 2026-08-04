export type DirectUploadSignature = {
  apiKey: string;
  cloudName: string;
  folder?: string;
  publicId?: string;
  resourceType?: "image" | "raw" | "video" | string;
  signature: string;
  timestamp: number;
  uniqueFilename?: boolean;
  useFilename?: boolean;
};

export type UploadedRawFile = {
  fileName: string;
  fileSize: number;
  mimeType: string;
  secureUrl: string;
};

export const uploadRawFileDirect = async (
  signature: DirectUploadSignature,
  file: File,
): Promise<UploadedRawFile> => {
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", signature.apiKey);
  body.append("timestamp", String(signature.timestamp));
  body.append("signature", signature.signature);

  if (signature.publicId) body.append("public_id", signature.publicId);
  if (signature.folder) body.append("folder", signature.folder);
  if (signature.useFilename) body.append("use_filename", "true");
  if (signature.uniqueFilename) body.append("unique_filename", "true");

  const endpoint = `https://api.cloudinary.com/v1_1/${signature.cloudName}/raw/upload`;
  const response = await fetch(endpoint, { method: "POST", body });
  const result = (await response.json()) as { secure_url?: string; error?: { message?: string } };

  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message || "Khong the upload file");
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || "application/octet-stream",
    secureUrl: result.secure_url,
  };
};
