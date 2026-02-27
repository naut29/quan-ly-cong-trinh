import {
  UPLOAD_URL_EXPIRES_SECONDS,
  assertProjectMembership,
  buildObjectKey,
  createUploadUrl,
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
    const filename = readRequiredString(payload, "filename", { maxLength: 255 });
    const contentType = readRequiredString(payload, "content_type", { maxLength: 255 });
    const size = readRequiredSize(payload, "size");

    const { userId, admin } = await getAuthUser(env, request);
    const { orgId } = await assertProjectMembership(admin, userId, projectId);

    const objectKey = buildObjectKey(orgId, projectId, filename);
    const uploadUrl = await createUploadUrl(env, objectKey, contentType, size);

    return jsonResponse(request, 200, {
      uploadUrl,
      objectKey,
      expiresIn: UPLOAD_URL_EXPIRES_SECONDS,
    });
  } catch (error) {
    return toErrorResponse(request, error);
  }
};
