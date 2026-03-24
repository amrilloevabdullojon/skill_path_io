"use client";

import { useMemo, useState } from "react";
import { FileImage, FileText, Search, Trash2, Upload, Video } from "lucide-react";

import { StatePanel } from "@/components/ui/state-panel";
import { createId, nowIso } from "@/lib/course-builder/helpers";
import { useCourseBuilderStore } from "@/store/admin/use-course-builder-store";
import { MediaAsset } from "@/types/builder/course-builder";

function iconByType(type: MediaAsset["type"]) {
  if (type === "image") return <FileImage className="h-4 w-4" />;
  if (type === "video") return <Video className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

function detectType(file: File): MediaAsset["type"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "file";
}

export function MediaManager() {
  const mediaAssets = useCourseBuilderStore((state) => state.mediaAssets);
  const addMediaAsset = useCourseBuilderStore((state) => state.addMediaAsset);
  const removeMediaAsset = useCourseBuilderStore((state) => state.removeMediaAsset);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mediaAssets.filter((asset) => {
      if (!q) return true;
      return (
        asset.name.toLowerCase().includes(q) ||
        asset.tags.join(" ").toLowerCase().includes(q) ||
        asset.type.toLowerCase().includes(q)
      );
    });
  }, [mediaAssets, query]);

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      addMediaAsset({
        id: createId("media"),
        name: file.name,
        type: detectType(file),
        sizeKb: Math.max(1, Math.round(file.size / 1024)),
        url: `/local-media/${encodeURIComponent(file.name)}`,
        uploadedAt: nowIso(),
        tags: ["local-upload"],
      });
    });
    event.target.value = "";
  }

  return (
    <section className="surface-elevated space-y-4 p-5">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-100">Media Manager</h1>
        <p className="text-sm text-slate-400">Upload and manage covers, icons, files, and lesson attachments (local mock mode).</p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <label className="btn-primary cursor-pointer gap-2">
          <Upload className="h-4 w-4" />
          Upload assets
          <input type="file" multiple className="hidden" onChange={handleUpload} />
        </label>
        <label className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
          <input
            className="input-base pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search media by name, type, tag"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <StatePanel title="No media found" description="Upload assets or clear current search." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((asset) => (
            <article key={asset.id} className="surface-subtle space-y-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="inline-flex items-center gap-2 text-sm text-slate-200">
                  <span className="rounded-lg border border-slate-700 bg-slate-900/80 p-1.5 text-slate-400">{iconByType(asset.type)}</span>
                  <span>{asset.name}</span>
                </div>
                <button type="button" className="btn-destructive px-2 py-1 text-xs" onClick={() => removeMediaAsset(asset.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="text-xs text-slate-500">
                <p>Type: {asset.type}</p>
                <p>Size: {asset.sizeKb} KB</p>
                <p>Uploaded: {new Date(asset.uploadedAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {asset.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1 text-[10px] text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
