import { QueryDocumentSnapshot } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useEffectOnce } from '../hooks/useEffectOnce';
import { storage } from '../libs/firebase';
import { Sound } from '../types/sound';

export type FileCardProps = {
  className?: string;
  queryDocumentSnapshot: QueryDocumentSnapshot<Sound>;
};

export const FileCard: React.FC<FileCardProps> = ({ className = '', queryDocumentSnapshot }) => {
  const data = useMemo(() => {
    return queryDocumentSnapshot.data();
  }, [queryDocumentSnapshot]);
  const [url, setUrl] = useState('');

  useEffectOnce(() => {
    (async () => {
      const storageRef = ref(storage, `sounds/${queryDocumentSnapshot.id}.mp3`);
      const url = await getDownloadURL(storageRef);
      setUrl(url);
    })();
  });

  return (
    <div className={`${className} flex flex-col gap-4 border p-4`}>
      <div className="flex flex-col gap-2">
        <p className="text-sm">{queryDocumentSnapshot.data().file.name}</p>
        <p className="text-xs">ID: {queryDocumentSnapshot.id}</p>
        <p className="text-xs">Title: {queryDocumentSnapshot.data().fileMetadata?.common?.title}</p>
        <div className="text-xs">
          <p>Tags:</p>
          <ul className="mt-1 flex gap-2">
            {(queryDocumentSnapshot.data().tags || []).map((tag) => (
              <li key={tag}>
                <Link href={{ href: '/', query: { tag } }}>
                  <a className="rounded-full border px-2">{tag}</a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <audio className="h-[32px] w-[320px] text-xs" src={url} controls preload="none" />
      </div>
      <div>
        <p className="mb-1 text-xs font-bold">[Speech to Text]</p>
        {'speech' in data && data.speech && 'results' in data.speech ? (
          <p className="text-sm">
            {data.speech.results
              .map((result) => result.alternatives.map((alternative) => alternative.transcript).join('\n'))
              .join('\n')}
          </p>
        ) : (
          <p className="text-sm">データなし</p>
        )}
      </div>
    </div>
  );
};
