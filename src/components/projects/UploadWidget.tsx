import React, { useCallback, useState } from "react";
import { Download, Loader2, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { listProjectFiles } from "@/lib/api/files";
import { completeUpload, createUpload, getDownloadUrl, type ProjectFileRecord } from "@/lib/api/uploads";
import { appFetch } from "@/lib/runtime/appFetch";

interface UploadWidgetProps {
  projectId: string;
}

const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes < 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const UploadWidget: React.FC<UploadWidgetProps> = ({ projectId }) => {
  const [files, setFiles] = useState<ProjectFileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    if (!projectId) {
      setFiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rows = await listProjectFiles(projectId);
      setFiles(rows);
    } catch (queryError) {
      setError(queryError instanceof Error ? queryError.message : "Khong the tai danh sach tep.");
      setFiles([]);
    }
    setLoading(false);
  }, [projectId]);

  React.useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || uploading) {
      return;
    }

    const contentType = file.type?.trim() || "application/octet-stream";
    setUploading(true);
    try {
      const createResponse = await createUpload({
        project_id: projectId,
        filename: file.name,
        content_type: contentType,
        size: file.size,
      });

      const putResponse = await appFetch(createResponse.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
        body: file,
      });

      if (!putResponse.ok) {
        throw new Error(`Upload failed (${putResponse.status})`);
      }

      await completeUpload({
        project_id: projectId,
        objectKey: createResponse.objectKey,
        filename: file.name,
        content_type: contentType,
        size: file.size,
      });

      toast({
        title: "Tải tệp thành công",
        description: `${file.name} đã được lưu vào dự án.`,
      });
      await loadFiles();
    } catch (uploadError: any) {
      toast({
        title: "Không thể tải tệp",
        description: uploadError?.message ?? "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      event.target.value = "";
      setUploading(false);
    }
  };

  const handleDownload = async (fileId: string) => {
    setDownloadingId(fileId);
    try {
      const downloadUrl = await getDownloadUrl(fileId);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (downloadError: any) {
      toast({
        title: "Không thể tải xuống",
        description: downloadError?.message ?? "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Tệp dự án</CardTitle>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void loadFiles()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <label>
            <Input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            <Button type="button" size="sm" asChild disabled={uploading}>
              <span>
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploading ? "Đang tải..." : "Tải tệp lên"}
              </span>
            </Button>
          </label>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Đang tải danh sách tệp...</p>
        ) : error ? (
          <p className="text-sm text-destructive">Không thể tải danh sách tệp: {error}</p>
        ) : files.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có tệp nào cho dự án này.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên tệp</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="text-right">Dung lượng</TableHead>
                <TableHead className="text-right">Ngày tải</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">{file.filename}</TableCell>
                  <TableCell>{file.content_type}</TableCell>
                  <TableCell className="text-right">{formatFileSize(file.size)}</TableCell>
                  <TableCell className="text-right">
                    {new Date(file.created_at).toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={downloadingId === file.id}
                      onClick={() => void handleDownload(file.id)}
                    >
                      {downloadingId === file.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadWidget;
