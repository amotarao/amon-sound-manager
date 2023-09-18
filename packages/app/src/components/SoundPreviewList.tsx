import classNames from 'classnames';
import {
  collection,
  CollectionReference,
  limit,
  onSnapshot,
  orderBy,
  Query,
  query,
  QueryDocumentSnapshot,
  where,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { firestore } from '../libs/firebase';
import { archivedTag } from '../libs/sound/constants';
import { sortByRetake, sortByTitle } from '../libs/sound/utils/sort';
import { Sound } from '../types/sound';
import { SoundPreviewCard } from './SoundPreviewCard';

const collectionId = 'sounds';

const getQuery = (tags: string[]): Query<Sound> => {
  const c = collection(firestore, collectionId) as CollectionReference<Sound>;
  let q = query(c, orderBy('file.name'));
  q = query(q, limit(tags ? 1000 : 30));
  if (tags.length) {
    q = query(q, where('tags', 'array-contains-any', tags));
  }
  return q;
};

export type SoundPreviewListProps = {
  className?: string;
  currentSound?: string;
  currentTags?: string[];
};

export const SoundPreviewList: React.FC<SoundPreviewListProps> = ({ className, currentSound, currentTags }) => {
  const router = useRouter();

  const [docs, setDocs] = useState<QueryDocumentSnapshot<Sound>[]>([]);
  const query = useMemo(() => getQuery(currentTags || []), [currentTags]);
  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    setDocs([]);
    const unsubscribe = onSnapshot(query, (querySnapshot) => {
      setDocs(
        querySnapshot.docs
          .filter((doc) => currentTags?.every((tag) => doc.data().tags.includes(tag)))
          .sort((a, z) => sortByRetake(a, z) || sortByTitle(a, z))
      );
    });

    return () => {
      unsubscribe();
    };
  }, [router.isReady, query, currentTags]);

  return (
    <div className={classNames('grid grid-cols-1 gap-4', className)}>
      <List
        docs={docs.filter((doc) => !doc.data().tags.includes(archivedTag))}
        currentSound={currentSound}
        currentTags={currentTags}
      />
      <List
        cardClassName="opacity-70"
        title="アーカイブ済み"
        docs={docs.filter((doc) => doc.data().tags.includes(archivedTag))}
        currentSound={currentSound}
        currentTags={currentTags}
      />
    </div>
  );
};

const List: React.FC<
  {
    cardClassName?: string;
    title?: string;
    docs: QueryDocumentSnapshot<Sound>[];
  } & Pick<SoundPreviewListProps, 'currentSound' | 'currentTags'>
> = ({ cardClassName, title, docs, currentSound, currentTags }) => {
  if (docs.length === 0) {
    return null;
  }

  return (
    <div>
      {title && <p className="mx-4 border-b py-2 text-xs font-bold">{title}</p>}
      <ul>
        {docs.map((doc) => (
          <li key={doc.id} className="after:mx-4 after:block after:h-[1px] after:bg-current after:content-['']">
            <SoundPreviewCard
              className={cardClassName}
              doc={doc}
              currentSound={currentSound}
              currentTags={currentTags}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};