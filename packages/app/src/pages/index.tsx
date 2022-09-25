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
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { FileCard } from '../components/FileCard';
import { firestore } from '../libs/firebase/index';
import { Sound } from '../types/sound';

const fetchDocs = async (tag: string | null): Promise<QueryDocumentSnapshot<Sound>[]> => {
  const c = collection(firestore, 'sounds') as CollectionReference<Sound>;
  let q = query(c, orderBy('file.name'));
  q = query(q, limit(tag ? 1000 : 30));
  if (tag) q = query(q, where('tags', 'array-contains', tag));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs;
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

  const [docs, setDocs] = useState<QueryDocumentSnapshot<Sound>[]>([]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    fetchDocs(tag).then((docs) => {
      setDocs(docs);
    });
  }, [router.isReady, tag]);

  return (
    <div className="mx-auto max-w-[640px]">
      <h1 className="mb-4 text-xl">{tag || 'ALL'}</h1>
      <div className="flex flex-col gap-4">
        {docs.map((doc) => (
          <FileCard key={doc.id} queryDocumentSnapshot={doc} />
        ))}
      </div>
    </div>
  );
};

export default Page;
