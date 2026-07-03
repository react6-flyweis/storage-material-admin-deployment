import React from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Eye, FileText, ArrowDownToLine, Loader2, Image as ImageIcon } from "lucide-react";
import { useLeadDocumentsQuery } from "@/modules/leads/leads.hooks";
import { format } from "date-fns";

export default function LeadDocuments() {
  const navigate = useNavigate();
  const { leadId } = useParams();

  const { data: response, isLoading } = useLeadDocumentsQuery(leadId || "");

  if (isLoading) {
    return (
      <div className="flex-1 bg-[#f8fafc] min-h-screen p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const project = response?.data?.project;
  const documents = response?.data?.documents || [];

  const engineeringFiles = documents.filter(doc => doc.type === "engineering");
  const drawings = documents.filter(doc => doc.type === "drawing");
  const photos = documents.filter(doc => doc.type === "photo");
  const otherFiles = documents.filter(doc => !["engineering", "drawing", "photo"].includes(doc.type));

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getExt = (name: string) => name.split('.').pop()?.toUpperCase() || 'FILE';

  const renderDocumentCard = (doc: any, iconType: "file" | "image" = "file") => (
    <div key={doc._id} className="border rounded-lg p-4 relative pt-6 flex flex-col justify-between">
      <div className="absolute -top-3 right-4">
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-medium capitalize">
          Uploaded
        </Badge>
      </div>
      <div className="flex items-start gap-3">
        {iconType === "image" ? (
          <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
            <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="p-2 bg-blue-50 text-blue-500 rounded font-bold text-xs flex items-center justify-center w-10 h-10">
            {getExt(doc.name)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate" title={doc.name}>{doc.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Uploaded by {doc.uploadedBy?.name || "Unknown"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {doc.uploadedAt ? format(new Date(doc.uploadedAt), "dd MMM yyyy, HH:mm") : "Unknown Date"}
          </p>
        </div>
        <div className="flex gap-1">
          <a href={doc.url} download target="_blank" rel="noreferrer">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
              <ArrowDownToLine className="w-4 h-4" />
            </Button>
          </a>
          <a href={doc.url} target="_blank" rel="noreferrer">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
              <Eye className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-[#f8fafc] min-h-screen p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => navigate(`/leads/${leadId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Drawings & Attachments</h1>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-8">
        <div className="flex justify-between items-start mb-8 pb-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{project?.projectName || "Unknown Project"}</h2>
            <p className="text-sm text-gray-500 mt-1">{project?.jobId || "No Job ID"}</p>
          </div>
          <div className="flex gap-12 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Total Documents</p>
              <p className="font-medium text-gray-900">{response?.data?.total || 0}</p>
            </div>
            {documents.length > 0 && (
              <div>
                <p className="text-gray-500 mb-1">Latest Upload by</p>
                <p className="font-medium text-gray-900">{documents[0]?.uploadedBy?.name || "Unknown"}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-10">
          {documents.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No documents found for this lead.
            </div>
          ) : null}

          {/* Engineering Files */}
          {engineeringFiles.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4">Engineering Files (MBS)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {engineeringFiles.map(doc => renderDocumentCard(doc))}
              </div>
            </div>
          )}

          {/* Attached Drawings */}
          {drawings.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4">Attached Drawings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drawings.map(doc => renderDocumentCard(doc))}
              </div>
            </div>
          )}

          {/* Attached Building Photos */}
          {photos.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4">Attached Building Photos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map(doc => renderDocumentCard(doc, "image"))}
              </div>
            </div>
          )}

          {/* Other Files */}
          {otherFiles.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4">Other Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherFiles.map(doc => renderDocumentCard(doc))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
