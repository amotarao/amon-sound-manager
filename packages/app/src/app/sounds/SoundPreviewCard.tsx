import classNames from 'classnames';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { archivedTag, retakeName, retakeTag } from '../../libs/sound/constants';
import { Sound } from '../../types/sound';

type Props = {
  className?: string;
  cardClassName?: string;
  doc: QueryDocumentSnapshot<Sound>;
  currentTags?: string[];
};

export const SoundPreviewCard: React.FC<Props> = ({ className, doc, currentTags }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSoundDocId = pathname.split('/').at(2);

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
        currentSoundDocId === doc.id && 'bg-neutral-300 dark:bg-neutral-700',
        className
      )}
      href={`/sounds/${doc.id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
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
