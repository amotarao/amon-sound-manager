import classNames from 'classnames';
import { collection, CollectionReference, getCountFromServer, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
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
};

export const TagItemCard: React.FC<TagItemCardProps> = ({ className, collectionId, tag, isCurrent }) => {
  const router = useRouter();

  const [count, setCount] = useState(-1);

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
      href={{ href: '/', query: { ...router.query, tag: tag !== 'ALL' ? tag : undefined } }}
    >
      <p>
        <span className="mr-0.5">#</span>
        <span>{tag}</span>
        {count > -1 && <span> ({count})</span>}
      </p>
    </Link>
  );
};
