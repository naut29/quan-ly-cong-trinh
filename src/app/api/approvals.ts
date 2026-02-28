import { callFunction } from "./client";

export type ApprovalAction =
  | "create_draft"
  | "submit"
  | "approve"
  | "reject"
  | "cancel";

export interface TransitionApprovalResult {
  approval?: {
    id?: string | null;
    status?: string | null;
  } | null;
}

export const transitionApproval = async (input: {
  action: ApprovalAction;
  entity_type: string;
  entity_id: string;
  decision_note?: string;
}) => {
  return callFunction<TransitionApprovalResult>("approvals", input);
};
