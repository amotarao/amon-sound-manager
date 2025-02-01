"use client";

import { useSoundTagsSearchParams } from "../../hooks/searchParams/useSoundTagsSearchParams";
import { useTags } from "../../hooks/useTags";
import { TagItemCard } from "../TagItemCard";
import { SoundPreviewList } from "./_components/SoundPreviewList";

const collectionId = "sounds";

export default function Page({ children }: { children: React.ReactNode }) {
  const currentTags = useSoundTagsSearchParams();
  const { tags, fetchTags, deleteTag } = useTags(collectionId);

  return (
    <div className="h-full w-full overflow-x-auto">
      <div className="min-w-1080 grid h-full grid-cols-[240px_400px_1fr] overflow-hidden">
        {/* Tag */}
        <div className="flex h-full flex-col overflow-y-auto border-r pb-10">
          <ul>
            {["ALL", ...tags].map((_tag) => (
              <li
                key={_tag}
                className="after:mx-4 after:block after:h-[1px] after:bg-current after:content-['']"
              >
                <TagItemCard
                  collectionId={collectionId}
                  tag={_tag}
                  isCurrent={
                    _tag !== "ALL"
                      ? currentTags.includes(_tag)
                      : !currentTags.length
                  }
                />
              </li>
            ))}
          </ul>
        </div>
        {/* Sound */}
        <div className="flex h-full flex-col overflow-y-auto border-r pb-10">
          {currentTags.length > 0 && (
            <div className="sticky top-0 border-b bg-black p-4">
              {currentTags.map((tag) => (
                <div key={tag} className="flex">
                  <p className="shrink grow">{tag}</p>
                  <button
                    className="shrink-0 rounded border px-2 text-sm"
                    type="button"
                    onClick={() => {
                      (async () => {
                        await deleteTag(tag);
                        await fetchTags();
                      })();
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
          <SoundPreviewList />
        </div>
        {/* Detail */}
        <div className="h-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
