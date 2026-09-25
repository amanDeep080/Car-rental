import { api } from "@/lib/api";

export interface DocumentRecord {
  id: string;
  documentType: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
}

// Performs a real file upload to storage via backend proxy
export async function recordDocument(documentType: string, file: File): Promise<DocumentRecord> {
  const formData = new FormData();
  formData.append("file", file);

  // 1. Upload the physical file
  const { data: uploadData } = await api.post<{ url: string }>("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  // 2. Record the resulting URL against the document type
  const { data } = await api.post<DocumentRecord>("/documents", {
    documentType,
    storageKey: uploadData.url,
  });
  return data;
}

export async function getMyDocuments(): Promise<DocumentRecord[]> {
  const { data } = await api.get<DocumentRecord[]>("/documents");
  return data;
}
