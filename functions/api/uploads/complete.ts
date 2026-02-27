import {
  HttpError,
  assertObjectKeyBelongsToProject,
  assertProjectMembership,
  getAuthUser,
  jsonResponse,
  optionsResponse,
  parseJsonBody,
  readRequiredSize,
  readRequiredString,
  toErrorResponse,
  type UploadContext,
} from "./_shared";

export const onRequestOptions = ({ request }: UploadContext) => optionsResponse(request);

export const onRequestPost = async ({ request, env }: UploadContext) => {
  try {
    const payload = await parseJsonBody(request);
    const projectId = readRequiredString(payload, "project_id", { maxLength: 120 });
    const objectKey = readRequiredString(payload, "objectKey", { maxLength: 1200 });
    const filename = readRequiredString(payload, "filename", { maxLength: 255 });
    const contentType = readRequiredString(payload, "content_type", { maxLength: 255 });
    const size = readRequiredSize(payload, "size");

    const { userId, admin } = await getAuthUser(env, request);
    const { orgId } = await assertProjectMembership(admin, userId, projectId);
    assertObjectKeyBelongsToProject(orgId, projectId, objectKey);

    const { data, error } = await admin
      .from("project_files")
      .insert({
        org_id: orgId,
        project_id: projectId,
        object_key: objectKey,
        filename,
        size,
        content_type: contentType,
        created_by: userId,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new HttpError(409, "File already exists");
      }
      throw new HttpError(500, error.message);
    }

    return jsonResponse(request, 200, { record: data });
  } catch (error) {
    return toErrorResponse(request, error);
  }
};
