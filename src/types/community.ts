import type { Tables } from "@/integrations/supabase/types";

export type CommunityChannel = Tables<"community_channels">;
export type CommunityMessage = Tables<"community_messages">;
export type ChannelMembership = Tables<"channel_memberships">;

export interface MessageWithProfile extends CommunityMessage {
  profile?: {
    display_name: string | null;
  };
  user_role?: "family_member" | "navigator" | "admin" | null;
}

export interface ChannelWithUnread extends CommunityChannel {
  unread_count?: number;
}
