import {
  HttpError,
  assertProjectMembership,
  createDownloadUrl,
  getAuthUser,
  jsonResponse,
  optionsResponse,
  toErrorResponse,
  type UploadContext,
} from "./_shared";

export const onRequestOptions = ({ request }: UploadContext) => optionsResponse(request);

export const onRequestGet = async ({ request, env }: UploadContext) => {
  try {
    const { userId, admin } = await getAuthUser(env, request);
    const url = new URL(request.url);
    const fileId = url.searchParams.get("file_id")?.trim() ?? "";
    if (!fileId) {
      throw new HttpError(400, "Missing file_id");
    }

    const { data: file, error: fileError } = await admin
      .from("project_files")
      .select("id, org_id, project_id, object_key")
      .eq("id", fileId)
      .maybeSingle();

    if (fileError) {
      throw new HttpError(500, fileError.message);
    }
    if (!file?.id) {
      throw new HttpError(404, "File not found");
    }

    const access = await assertProjectMembership(admin, userId, file.project_id);
    if (String(file.org_id) !== access.orgId) {
      throw new HttpError(403, "Forbidden");
    }

    const downloadUrl = await createDownloadUrl(env, file.object_key);

    return jsonResponse(request, 200, { downloadUrl });
  } catch (error) {
    return toErrorResponse(request, error);
  }
};
