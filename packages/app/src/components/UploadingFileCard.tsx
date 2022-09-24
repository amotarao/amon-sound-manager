import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import { useEffectOnce } from '../hooks/useEffectOnce';
import { firestore, storage } from '../libs/firebase';
import { Sound } from '../types/sound';

export type UploadingFileCardProps = {
  className?: string;
  uid: string;
  file: File;
};

export const UploadingFileCard: React.FC<UploadingFileCardProps> = ({ className = '', uid, file }) => {
  const [state, setState] = useState<'initial' | 'uploading' | 'uploaded'>('initial');

  useEffectOnce(() => {
    (async () => {
      setState('uploading');

      const data: Sound = {
        file: {
          lastModified: file.lastModified,
          name: file.name,
          size: file.size,
          type: file.type,
        },
        langs: ['de-DE', 'en-GB'],
        speech: null,
        fileMetadata: {},
      };
      const storageRef = ref(storage, `sounds/${uid}.mp3`);

      await setDoc(doc(firestore, 'sounds', uid), data);
      await uploadBytes(storageRef, file);

      setState('uploaded');
    })();
  });

  return (
    <div className={`${className} flex gap-2`}>
      <p>[{uid}]</p>
      <p>{file.name}</p>
      <p>{state}</p>
    </div>
  );
};
