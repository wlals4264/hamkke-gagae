"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_LIST } from "@/lib/catalog";
import type { PlaceCategory } from "@/types/place";
import { buttonClass } from "@/lib/ui/button";

const inputClass =
  "w-full rounded-xl border border-ink/10 bg-cream/40 p-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-sage-500";

interface SearchResult {
  name: string;
  address: string;
  categoryName: string;
  lat: number;
  lng: number;
}

function guessCategory(categoryName: string): PlaceCategory {
  if (/카페|제과|베이커리/.test(categoryName)) return "cafe";
  if (/관광|공원|숲|산책/.test(categoryName)) return "park";
  if (/쇼핑|백화점|마트|문화/.test(categoryName)) return "mall";
  return "restaurant";
}

export default function ReportForm() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<PlaceCategory>("cafe");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [indoor, setIndoor] = useState(true);
  const [leashRequired, setLeashRequired] = useState(true);
  const [sizeLimit, setSizeLimit] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/kakao/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "검색에 실패했습니다.");
      setResults(data.results);
      if (data.results.length === 0) setSearchError("검색 결과가 없어요. 다른 이름으로 찾아보세요.");
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "검색에 실패했습니다.");
    } finally {
      setSearching(false);
    }
  }

  function handleSelect(result: SearchResult) {
    setSelected(result);
    setName(result.name);
    setAddress(result.address);
    setCategory(guessCategory(result.categoryName));
    setResults([]);
    setQuery("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          address,
          lat: selected?.address === address ? selected.lat : undefined,
          lng: selected?.address === address ? selected.lng : undefined,
          description,
          petPolicy: { indoor, leashRequired, sizeLimit, notes },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "제보 저장에 실패했습니다.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "제보 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-ink/10 bg-white p-8 text-center">
        <p className="text-3xl">🙏</p>
        <h2 className="mt-3 text-lg font-bold text-ink">제보해주셔서 감사해요!</h2>
        <p className="mt-2 text-sm text-muted">
          운영자 확인 후 승인되면 지도에 바로 반영돼요. 보통 1~2일 정도 걸려요.
        </p>
        <button type="button" onClick={() => router.push("/seoul")} className={buttonClass("primary", "md", "mt-5")}>
          장소 탐색으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-ink/10 bg-white p-6">
        <label className="text-sm font-bold text-ink">장소 검색</label>
        <p className="mt-1 text-xs text-muted">카카오맵에 있는 장소를 검색해서 바로 선택하면 주소/좌표가 자동으로 채워져요.</p>
        <form onSubmit={handleSearch} className="mt-2 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="장소명으로 검색 (예: 멍뭉카페 홍대)"
            className={inputClass}
          />
          <button type="submit" disabled={searching} className={buttonClass("secondary", "md", "shrink-0 disabled:opacity-60")}>
            {searching ? "검색 중..." : "검색"}
          </button>
        </form>
        {searchError && <p className="mt-2 text-sm text-red-700">{searchError}</p>}
        {results.length > 0 && (
          <ul className="mt-3 flex flex-col divide-y divide-ink/5 overflow-hidden rounded-xl border border-ink/10">
            {results.map((r) => (
              <li key={`${r.name}-${r.lat}-${r.lng}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(r)}
                  className="flex w-full flex-col items-start gap-0.5 p-3 text-left text-sm transition hover:bg-cream/60"
                >
                  <span className="font-semibold text-ink">{r.name}</span>
                  <span className="text-xs text-muted">{r.address}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {selected && (
          <p className="mt-3 rounded-xl bg-sage-50 p-3 text-sm text-sage-700">
            ✓ <strong>{selected.name}</strong>을 선택했어요. 아래 정보를 확인하고 제출해주세요.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl border border-ink/10 bg-white p-6">
        <div>
          <label className="text-sm font-bold text-ink">장소명</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            placeholder="예: 멍뭉카페"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>

        <div>
          <label className="text-sm font-bold text-ink">카테고리</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {CATEGORY_LIST.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setCategory(c.slug)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  category === c.slug ? "bg-ink text-white" : "bg-cream text-muted hover:bg-brand-50"
                }`}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-ink">주소</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="위에서 장소를 검색해 선택하거나, 직접 입력해주세요."
            className={`mt-1.5 ${inputClass}`}
          />
        </div>

        <div>
          <label className="text-sm font-bold text-ink">소개 (선택)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="어떤 곳인지 간단히 알려주세요."
            className={`mt-1.5 resize-none ${inputClass}`}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 rounded-xl bg-cream/40 p-3 text-sm">
            <input type="checkbox" checked={indoor} onChange={(e) => setIndoor(e.target.checked)} />
            실내 동반 가능
          </label>
          <label className="flex items-center gap-2 rounded-xl bg-cream/40 p-3 text-sm">
            <input type="checkbox" checked={leashRequired} onChange={(e) => setLeashRequired(e.target.checked)} />
            목줄 필수
          </label>
        </div>

        <div>
          <label className="text-sm font-bold text-ink">크기 제한 (선택)</label>
          <input
            value={sizeLimit}
            onChange={(e) => setSizeLimit(e.target.value)}
            placeholder="예: 소형견만 가능"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>

        <div>
          <label className="text-sm font-bold text-ink">참고 (선택)</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="예: 캐리어 필수, 특정 요일만 가능 등"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={submitting} className={buttonClass("primary", "md", "self-end disabled:opacity-60")}>
          {submitting ? "제출 중..." : "제보하기"}
        </button>
      </form>
    </div>
  );
}
