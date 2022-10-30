import {
  collection,
  CollectionReference,
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
import { useEffect, useMemo, useState } from 'react';
import { FileCard } from '../components/FileCard';
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

    fetchDocs(tag).then((docs) => {
      setDocs(docs);
    });
  }, [router.isReady, tag]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    fetchTags().then((tags) => {
      setTags(tags);
    });
  }, [router.isReady]);

  return (
    <div className="grid grid-cols-[240px_320px_1fr]">
      {/* Operator */}
      {/* <div className="flex h-screen flex-col gap-4 overflow-y-auto border-r pb-10">
        <ul>
          {['DB', 'SBB', 'RhB'].map((operator) => (
            <li key={operator} className="border-b">
              <Link href={{ href: '/', query: { ...router.query, operator } }}>
                <a className="block px-4 py-2 text-sm">
                  <p>{operator}</p>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </div> */}
      {/* Station */}
      {/* <div className="flex h-screen flex-col gap-4 overflow-y-auto border-r pb-10">
        <ul>
          {['Samdan', 'Klosters Platz'].map((station) => (
            <li key={station} className="border-b">
              <Link href={{ href: '/', query: { ...router.query, station } }}>
                <a className="block px-4 py-2 text-sm">
                  <p>{station}</p>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </div> */}
      {/* Tag */}
      <div className="flex h-screen flex-col gap-4 overflow-y-auto border-r pb-10">
        <ul>
          {tags.map((tag) => (
            <li key={tag} className="after:mx-2 after:block after:h-[1px] after:bg-current after:content-['']">
              <Link href={{ href: '/', query: { ...router.query, tag } }}>
                <a
                  className={`block px-4 py-2 text-sm ${
                    tag === router.query.tag ? 'bg-neutral-300 dark:bg-neutral-700' : ''
                  }`}
                >
                  <p>
                    <span className="mr-0.5">#</span>
                    {tag}
                  </p>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* Sound */}
      <div className="flex h-screen flex-col gap-4 overflow-y-auto border-r pb-10">
        <ul>
          {docs.map((doc) => (
            <li key={doc.id} className="after:mx-2 after:block after:h-[1px] after:bg-current after:content-['']">
              <Link href={{ href: '/', query: { ...router.query, sound: doc.id } }}>
                <a className={`block px-4 py-2 ${soundDocId === doc.id ? 'bg-neutral-300 dark:bg-neutral-700' : ''}`}>
                  <p className="text-sm">{doc.data().file.name}</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {doc
                      .data()
                      .tags.filter((tag) => router.query.tag !== tag)
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
      <div className="flex h-screen flex-col gap-4 overflow-y-auto">
        {soundDocId && <FileCard key={soundDocId} docId={soundDocId} />}
      </div>
    </div>
  );
};

export default Page;
