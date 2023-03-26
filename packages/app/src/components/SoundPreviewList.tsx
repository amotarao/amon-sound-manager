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
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { firestore } from '../libs/firebase';
import { sortByArchived, sortByRetake, sortByTitle } from '../libs/sound/utils/sort';
import { Sound } from '../types/sound';
import { SoundPreviewCard } from './SoundPreviewCard';

const collectionId = 'sounds';

const fetchDocs = async (tags: string[]): Promise<QueryDocumentSnapshot<Sound>[]> => {
  const c = collection(firestore, collectionId) as CollectionReference<Sound>;
  let q = query(c, orderBy('file.name'));
  q = query(q, limit(tags ? 1000 : 30));
  if (tags.length) {
    q = query(q, where('tags', 'array-contains-any', tags));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs;
};

export type SoundPreviewListProps = {
  className?: string;
  currentSound?: string;
  currentTags?: string[];
};

export const SoundPreviewList: React.FC<SoundPreviewListProps> = ({ className, currentSound, currentTags }) => {
  const router = useRouter();

  const [docs, setDocs] = useState<QueryDocumentSnapshot<Sound>[]>([]);
  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    setDocs([]);
    fetchDocs(currentTags || []).then((docs) => {
      setDocs(docs);
    });
  }, [router.isReady, currentTags]);

  if (docs.length === 0) {
    return null;
  }

  return (
    <ul className={className}>
      {docs
        .filter((doc) => currentTags?.every((tag) => doc.data().tags.includes(tag)))
        .sort((a, z) => sortByArchived(a, z) || sortByRetake(a, z) || sortByTitle(a, z))
        .map((doc) => (
          <li key={doc.id} className="after:mx-2 after:block after:h-[1px] after:bg-current after:content-['']">
            <SoundPreviewCard doc={doc} currentSound={currentSound} currentTags={currentTags} />
          </li>
        ))}
    </ul>
  );
};
