import classNames from 'classnames';
import { collection, CollectionReference, getCountFromServer, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useTags } from '../hooks/useTags';
import { firestore } from '../libs/firebase';
import { Sound } from '../types/sound';

const fetchTagCount = async (collectionId: string, tag: string): Promise<number> => {
  const c = collection(firestore, collectionId) as CollectionReference<Sound>;
  const q = query(c, where('tags', 'array-contains', tag));

  const count = await getCountFromServer(q);
  return count.data().count;
};

export type TagItemCardProps = {
  className?: string;
  collectionId: string;
  tag: string;
  isCurrent: boolean;
  mode?: 'multiple';
};

export const TagItemCard: React.FC<TagItemCardProps> = ({ className, collectionId, tag, isCurrent, mode }) => {
  const router = useRouter();
  const { currentTags } = useTags(collectionId);

  const [count, setCount] = useState(-1);

  const tagQuery = useMemo((): string[] | undefined => {
    if (tag === 'ALL') {
      return undefined;
    }

    if (mode !== 'multiple') {
      return [tag];
    }

    if (currentTags.includes(tag)) {
      return currentTags.filter((_tag) => _tag !== tag);
    }

    return [...currentTags, tag];
  }, [tag, mode, currentTags]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (tag === 'ALL') {
      return;
    }

    setCount(-1);
    fetchTagCount(collectionId, tag).then((cound) => {
      setCount(cound);
    });
  }, [router.isReady, collectionId, tag]);

  return (
    <Link
      className={classNames(
        `block px-4 py-2 text-sm`,
        isCurrent ? 'bg-neutral-300 dark:bg-neutral-700' : null,
        className
      )}
      href={{ href: '/', query: { ...router.query, tag: tagQuery } }}
    >
      <p>
        <span className="mr-0.5">#</span>
        <span>{tag}</span>
        {count > -1 && <span> ({count})</span>}
      </p>
    </Link>
  );
};
