import {
  collection,
  CollectionReference,
  deleteDoc,
  doc,
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
import { useEffect, useMemo, useState, useCallback } from 'react';
import { FileCard } from '../components/FileCard';
import { TagItemCard } from '../components/TagItemCard';
import { firestore } from '../libs/firebase/index';
import { Sound, SoundTag } from '../types/sound';

const fetchDocs = async (tag: string | null): Promise<QueryDocumentSnapshot<Sound>[]> => {
  const c = collection(firestore, 'sounds') as CollectionReference<Sound>;
  let q = query(c, orderBy('file.name'));
  q = query(q, limit(tag ? 1000 : 30));
  if (tag) q = query(q, where('tags', 'array-contains', tag));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs;
};

const fetchTags = async (): Promise<string[]> => {
  const c = collection(doc(collection(firestore, 'sounds'), 'tags'), 'tags') as CollectionReference<SoundTag>;
  const querySnapshot = await getDocs(c);
  return querySnapshot.docs.map((doc) => doc.get('name') as string);
};

const Page: NextPage = () => {
  const router = useRouter();
  const tag = useMemo(() => {
    if (!('tag' in router.query) || !router.query.tag) {
      return null;
    }
    if (Array.isArray(router.query.tag)) {
      return router.query.tag[0];
    }
    return router.query.tag;
  }, [router]);
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
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    setDocs([]);
    fetchDocs(tag).then((docs) => {
      setDocs(docs);
    });
  }, [router.isReady, tag]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    setTags([]);
    fetchTags().then((tags) => {
      setTags(tags);
    });
  }, [router.isReady]);

  const deleteTag = useCallback((tag: string) => {
    deleteDoc(doc(collection(doc(collection(firestore, 'sounds'), 'tags'), 'tags'), tag));
  }, []);

  return (
    <div className="grid h-full grid-cols-[240px_320px_1fr] overflow-hidden">
      {/* Tag */}
      <div className="flex h-full flex-col overflow-y-auto border-r pb-10">
        <ul>
          {['ALL', ...tags].map((_tag) => (
            <li key={_tag} className="after:mx-2 after:block after:h-[1px] after:bg-current after:content-['']">
              <TagItemCard tag={_tag} isCurrent={_tag !== 'ALL' ? _tag === tag : !tag} />
            </li>
          ))}
        </ul>
      </div>
      {/* Sound */}
      <div className="flex h-full flex-col overflow-y-auto border-r pb-10">
        {tag && (
          <div className="sticky top-0 border-b bg-black p-4">
            <p>{tag}</p>
            <button
              className="absolute right-4 top-4 rounded border px-2 text-sm"
              onClick={() => {
                deleteTag(tag);
              }}
            >
              Delete
            </button>
          </div>
        )}
        <ul>
          {docs.map((doc) => (
            <li key={doc.id} className="after:mx-2 after:block after:h-[1px] after:bg-current after:content-['']">
              <Link href={{ href: '/', query: { ...router.query, sound: doc.id } }}>
                <a className={`block px-4 py-2 ${soundDocId === doc.id ? 'bg-neutral-300 dark:bg-neutral-700' : ''}`}>
                  <p className="text-sm">{doc.data().file.name}</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {doc
                      .data()
                      .tags.filter((_tag) => tag !== _tag)
                      .map((tag) => (
                        <li key={tag}>
                          <p className="text-xs">
                            <span className="mr-0.5">#</span>
                            {tag}
                          </p>
                        </li>
                      ))}
                  </ul>
                </a>
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
