import { useParams } from "react-router-dom";

import { isDemoPath } from "@/lib/appMode";

export const useProjectIdParam = () => {
  const { id, projectId } = useParams<{ id?: string; projectId?: string }>();
  return projectId ?? id ?? "";
};

export const getProjectPath = (
  pathname: string,
  projectId: string,
  section: string = "overview",
) => {
  if (isDemoPath(pathname)) {
    return section === "overview"
      ? `/demo/project/${projectId}`
      : `/demo/project/${projectId}/${section}`;
  }

  return `/app/projects/${projectId}/${section}`;
};

export const isProjectDetailPath = (pathname: string) =>
  pathname.includes("/project/") || pathname.includes("/projects/");
