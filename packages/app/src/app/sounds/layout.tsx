'use client';

import { useEffect } from 'react';
import { SoundPreviewList } from '../../components/SoundPreviewList';
import { TagItemCard } from '../../components/TagItemCard';
import { useTags } from '../../hooks/useTags';

const collectionId = 'sounds';

export default function Page({ children }: { children: React.ReactNode }) {
  const { tags, currentTags, fetchTags, deleteTag } = useTags(collectionId);
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return (
    <div className="h-full w-full overflow-x-auto">
      <div className="grid h-full min-w-1080 grid-cols-[240px_400px_1fr] overflow-hidden">
        {/* Tag */}
        <div className="flex h-full flex-col overflow-y-auto border-r pb-10">
          <ul>
            {['ALL', ...tags].map((_tag) => (
              <li key={_tag} className="after:mx-4 after:block after:h-[1px] after:bg-current after:content-['']">
                <TagItemCard
                  collectionId={collectionId}
                  tag={_tag}
                  isCurrent={_tag !== 'ALL' ? currentTags.includes(_tag) : !currentTags.length}
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
                    onClick={() => {
                      deleteTag(tag);
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
          <SoundPreviewList currentTags={currentTags} />
        </div>
        {/* Detail */}
        <div className="flex h-full flex-col gap-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
