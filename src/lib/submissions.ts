import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";
import type { Place, PlaceCategory, PetPolicy } from "@/types/place";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface Submission {
  id: string;
  kakao_id: string;
  nickname: string;
  name: string;
  category: PlaceCategory;
  gu: string;
  gu_name: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  pet_policy: PetPolicy;
  status: SubmissionStatus;
  reviewer_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

function toPlace(row: Submission): Place {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    gu: row.gu,
    guName: row.gu_name,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    description: row.description,
    petPolicy: row.pet_policy,
    source: "community",
  };
}

export async function getApprovedPlaces(): Promise<Place[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("place_submissions").select("*").eq("status", "approved");
  if (error) {
    console.error("승인된 제보 조회 실패:", error);
    return [];
  }
  return (data as Submission[]).map(toPlace);
}

export async function getApprovedPlaceById(id: string): Promise<Place | undefined> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("place_submissions")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();
  if (error || !data) return undefined;
  return toPlace(data as Submission);
}

export async function getPendingSubmissions(): Promise<Submission[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("place_submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("대기 중인 제보 조회 실패:", error);
    return [];
  }
  return data as Submission[];
}

export async function getReviewedSubmissions(): Promise<Submission[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("place_submissions")
    .select("*")
    .neq("status", "pending")
    .order("reviewed_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("처리된 제보 조회 실패:", error);
    return [];
  }
  return data as Submission[];
}

interface CreateSubmissionInput {
  kakaoId: string;
  nickname: string;
  name: string;
  category: PlaceCategory;
  gu: string;
  guName: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  petPolicy: PetPolicy;
}

export async function createSubmission(input: CreateSubmissionInput): Promise<string> {
  const supabase = createAdminClient();
  const id = `community-${randomUUID()}`;
  const { error } = await supabase.from("place_submissions").insert({
    id,
    kakao_id: input.kakaoId,
    nickname: input.nickname,
    name: input.name,
    category: input.category,
    gu: input.gu,
    gu_name: input.guName,
    address: input.address,
    lat: input.lat,
    lng: input.lng,
    description: input.description,
    pet_policy: input.petPolicy,
    status: "pending",
  });
  if (error) throw new Error(`제보 저장 실패: ${error.message}`);
  return id;
}

export async function reviewSubmission(id: string, status: "approved" | "rejected", reviewerNote?: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("place_submissions")
    .update({ status, reviewer_note: reviewerNote ?? null, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`제보 처리 실패: ${error.message}`);
}
