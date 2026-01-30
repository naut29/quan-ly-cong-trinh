import { callFunction } from "./client";

export type InviteMemberInput = {
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
};

export const inviteMember = async (input: InviteMemberInput) => {
  return callFunction<{ token: string; invite_id: string }>("invites", input);
};

export const acceptInvite = async (token: string) => {
  return callFunction("invites-accept", { token });
};

export const updateMemberRole = async (memberId: string, role: InviteMemberInput["role"]) => {
  return callFunction("members-role", { memberId, role });
};

export const disableMember = async (memberId: string) => {
  return callFunction("members-disable", { memberId });
};
