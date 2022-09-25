import {
  collection,
  CollectionReference,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
import { FileCard } from '../components/FileCard';
import { firestore } from '../libs/firebase/index';
import { Sound } from '../types/sound';

const Page: NextPage = () => {
  const [docs, setDocs] = useState<QueryDocumentSnapshot<Sound>[]>([]);

  const fetchDocs = useCallback(() => {
    (async () => {
      const c = collection(firestore, 'sounds') as CollectionReference<Sound>;
      let q = query(c, orderBy('file.name'));
      q = query(q, limit(300));
      const querySnapshot = await getDocs(q);
      setDocs(querySnapshot.docs);
    })();
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  return (
    <div className="mx-auto max-w-[640px]">
      <h1 className="mb-4 text-xl">list</h1>
      <div className="flex flex-col gap-4">
        {docs.map((doc) => (
          <FileCard key={doc.id} queryDocumentSnapshot={doc} />
        ))}
      </div>
    </div>
  );
};

export default Page;
