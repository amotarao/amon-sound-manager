import { QueryDocumentSnapshot } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
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
      <div>
        <p className="text-sm">{queryDocumentSnapshot.data().file.name}</p>
        <p className="mt-2 text-xs">ID: {queryDocumentSnapshot.id}</p>
        <p className="mt-2 text-xs">Title: {queryDocumentSnapshot.data().fileMetadata?.common?.title}</p>
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
