import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable } from 'firebase/storage';
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
  const [state, setState] = useState<'initial' | 'uploading' | 'uploaded' | 'error'>('initial');
  const [uploadRate, setUploadRate] = useState(0);

  useEffectOnce(() => {
    (async () => {
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
      const task = uploadBytesResumable(storageRef, file);

      task.on(
        'state_changed',
        (snapshot) => {
          setState('uploading');
          setUploadRate(snapshot.bytesTransferred / snapshot.totalBytes);
        },
        (error) => {
          setState('error');
          console.error(error);
        },
        () => {
          setState('uploaded');
        }
      );
    })();
  });

  return (
    <div className={`${className} flex gap-2`}>
      <p>[{uid}]</p>
      <p>{file.name}</p>
      <p>{state}</p>
      {state === 'uploading' && <p>{Math.floor(uploadRate * 100)}%</p>}
    </div>
  );
};
