import classNames from 'classnames';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { convertSearchParamsToObject } from '../libs/searchParams';
import { archivedTag, retakeName, retakeTag } from '../libs/sound/constants';
import { Sound } from '../types/sound';

export type SoundPreviewCardProps = {
  className?: string;
  cardClassName?: string;
  doc: QueryDocumentSnapshot<Sound>;
  currentSound?: string;
  currentTags?: string[];
};

export const SoundPreviewCard: React.FC<SoundPreviewCardProps> = ({ className, doc, currentSound, currentTags }) => {
  const searchParams = useSearchParams();
  const query = convertSearchParamsToObject(searchParams);

  const title = useMemo(() => doc.data().title, [doc]);
  const tags = useMemo(() => doc.data().tags, [doc]);
  const isRetake = useMemo(() => tags.includes(retakeTag), [tags]);
  const viewTags = useMemo(
    () => tags.filter((_tag) => !currentTags?.includes(_tag) && _tag !== retakeTag && _tag !== archivedTag),
    [tags, currentTags]
  );

  return (
    <Link
      className={classNames(
        'grid grid-rows-1 gap-1 px-4 py-2',
        currentSound === doc.id && 'bg-neutral-300 dark:bg-neutral-700',
        className
      )}
      href={{ href: '/', query: { ...query, sound: doc.id } }}
    >
      {title ? (
        <p className="text-sm">
          {isRetake && <RetakeLabel className="mr-1" />}
          <span>{title}</span>
        </p>
      ) : (
        <>
          <p className="text-sm">{isRetake && <RetakeLabel />}</p>
          <p className="text-xs">{doc.data().file.name}</p>
        </>
      )}
      <ul className="flex flex-wrap gap-2 text-white/70">
        {viewTags.map((tag) => (
          <li key={tag}>
            <p className="text-xs">
              <span className="mr-0.5">#</span>
              {tag}
            </p>
          </li>
        ))}
      </ul>
    </Link>
  );
};

const RetakeLabel: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <span className={classNames('rounded-sm bg-white px-1 text-xs text-black', className)} aria-label={retakeName}>
      ▲
    </span>
  );
};
