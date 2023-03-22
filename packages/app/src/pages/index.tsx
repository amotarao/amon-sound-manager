import classNames from 'classnames';
import {
  collection,
  CollectionReference,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  where,
} from 'firebase/firestore';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { FileCard } from '../components/FileCard';
import { TagItemCard } from '../components/TagItemCard';
import { useEffectOnce } from '../hooks/useEffectOnce';
import { useTags } from '../hooks/useTags';
import { firestore } from '../libs/firebase';
import { Sound } from '../types/sound';

const collectionId = 'sounds';

const fetchDocs = async (tag: string | null): Promise<QueryDocumentSnapshot<Sound>[]> => {
  const c = collection(firestore, collectionId) as CollectionReference<Sound>;
  let q = query(c, orderBy('file.name'));
  q = query(q, limit(tag ? 1000 : 30));
  if (tag) q = query(q, where('tags', 'array-contains', tag));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs;
};

const Page: NextPage = () => {
  const router = useRouter();
  const soundDocId = useMemo(() => {
    if (!('sound' in router.query) || !router.query.sound) {
      return null;
    }
    if (Array.isArray(router.query.sound)) {
      return router.query.sound[0];
    }
    return router.query.sound;
  }, [router]);

  const [docs, setDocs] = useState<QueryDocumentSnapshot<Sound>[]>([]);
  const { tags, currentTag, fetchTags, deleteTag } = useTags(collectionId);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    setDocs([]);
    fetchDocs(currentTag).then((docs) => {
      setDocs(docs);
    });
  }, [router.isReady, currentTag, fetchTags]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return (
    <div className="grid h-full grid-cols-[240px_400px_1fr] overflow-hidden">
      {/* Tag */}
      <div className="flex h-full flex-col overflow-y-auto border-r pb-10">
        <ul>
          {['ALL', ...tags].map((_tag) => (
            <li key={_tag} className="after:mx-2 after:block after:h-[1px] after:bg-current after:content-['']">
              <TagItemCard
                collectionId={collectionId}
                tag={_tag}
                isCurrent={_tag !== 'ALL' ? _tag === currentTag : !currentTag}
              />
            </li>
          ))}
        </ul>
      </div>
      {/* Sound */}
      <div className="flex h-full flex-col overflow-y-auto border-r pb-10">
        {currentTag && (
          <div className="sticky top-0 border-b bg-black p-4">
            <p>{currentTag}</p>
            <button
              className="absolute right-4 top-4 rounded border px-2 text-sm"
              onClick={() => {
                deleteTag(currentTag);
              }}
            >
              Delete
            </button>
          </div>
        )}
        <ul>
          {docs
            .sort((a, z) => {
              const aTitle = a.data().title || '';
              const zTitle = z.data().title || '';

              return aTitle > zTitle ? 1 : aTitle === zTitle ? 0 : -1;
            })
            .map((doc) => (
              <li key={doc.id} className="after:mx-2 after:block after:h-[1px] after:bg-current after:content-['']">
                <Link
                  className={classNames(
                    'grid grid-rows-1 gap-1 px-4 py-2',
                    soundDocId === doc.id && 'bg-neutral-300 dark:bg-neutral-700'
                  )}
                  href={{ href: '/', query: { ...router.query, sound: doc.id } }}
                >
                  <p className="text-sm">{doc.data().title}</p>
                  <p className="text-xs">{doc.data().file.name}</p>
                  <ul className="flex flex-wrap gap-2">
                    {doc
                      .data()
                      .tags.filter((_tag) => currentTag !== _tag)
                      .map((tag) => (
                        <li key={tag}>
                          <p className="text-xs">
                            <span className="mr-0.5">#</span>
                            {tag}
                          </p>
                        </li>
                      ))}
                  </ul>
                </Link>
              </li>
            ))}
        </ul>
      </div>
      {/* Detail */}
      <div className="flex h-full flex-col gap-4 overflow-y-auto">
        {soundDocId && <FileCard key={soundDocId} docId={soundDocId} />}
      </div>
    </div>
  );
};

export default Page;
