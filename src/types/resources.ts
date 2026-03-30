import type { Tables } from "@/integrations/supabase/types";

export type Resource = Tables<"resources">;
export type SavedResource = Tables<"saved_resources">;
export type ResourceCategory = Resource["category"];

export interface ResourceWithSaved extends Resource {
  is_saved?: boolean;
}

export interface ResourceFilters {
  category?: ResourceCategory | "all";
  state?: string;
  stage?: string;
  search?: string;
  excludeNational?: boolean;
}
