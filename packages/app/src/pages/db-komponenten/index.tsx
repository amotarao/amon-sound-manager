import classNames from 'classnames';
import { collection, CollectionReference, getDocs, limit, query, QueryDocumentSnapshot } from 'firebase/firestore';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { ComponentCard } from '../../components/ComponentCard';
import { firestore } from '../../libs/firebase/index';
import { Component } from '../../types/component';

const collectionName = 'dbKomponenten';

const fetchDocs = async (): Promise<QueryDocumentSnapshot<Component>[]> => {
  const c = collection(firestore, collectionName) as CollectionReference<Component>;
  let q = query(c);

  q = query(q, limit(1000));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs;
};

const Page: NextPage = () => {
  const router = useRouter();
  const componentDocId = useMemo(() => {
    if (!('component' in router.query) || !router.query.component) {
      return null;
    }
    if (Array.isArray(router.query.component)) {
      return router.query.component[0];
    }
    return router.query.component;
  }, [router]);

  const [docs, setDocs] = useState<QueryDocumentSnapshot<Component>[]>([]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    setDocs([]);
    fetchDocs().then((docs) => {
      setDocs(docs);
    });
  }, [router.isReady]);

  return (
    <div className="grid h-full grid-cols-[320px_1fr] overflow-hidden">
      {/* Component */}
      <div className="flex h-full flex-col overflow-y-auto border-r pb-10">
        <ul>
          {docs
            .sort((a, z) => {
              const aName = a.data().name;
              const zName = z.data().name;
              const aLang = a.data().lang;
              const zLang = z.data().lang;

              return aName > zName ? 1 : aName < zName ? -1 : aLang > zLang ? 1 : aLang < zLang ? -1 : 0;
            })
            .map((doc) => (
              <li key={doc.id} className="after:mx-2 after:block after:h-[1px] after:bg-current after:content-['']">
                <Link
                  className={classNames(
                    'grid grid-rows-1 gap-1 px-4 py-2',
                    componentDocId === doc.id && 'bg-neutral-300 dark:bg-neutral-700'
                  )}
                  href={{ href: '/', query: { ...router.query, component: doc.id } }}
                >
                  <div className="flex items-center gap-2">
                    <p className="shrink-0 rounded-sm border px-1 text-xs">{doc.data().lang}</p>
                    <p className="text-sm">{doc.data().name}</p>
                  </div>
                </Link>
              </li>
            ))}
        </ul>
      </div>
      {/* Detail */}
      <div className="flex h-full flex-col gap-4 overflow-y-auto">
        {componentDocId && <ComponentCard key={componentDocId} collectionId="dbKomponenten" docId={componentDocId} />}
      </div>
    </div>
  );
};

export default Page;
