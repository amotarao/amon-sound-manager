import classNames from 'classnames';
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
  tags?: string[];
  lang?: string;
};

export const UploadingFileCard: React.FC<UploadingFileCardProps> = ({
  className = '',
  uid,
  file,
  tags = [],
  lang = 'ja-JP',
}) => {
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
        langs: [lang],
        tags,
        text: null,
        title: null,
        textByManual: null,
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
    <div className={classNames('flex gap-2', className)}>
      <p>[{uid}]</p>
      <p>{file.name}</p>
      <p>{state}</p>
      {state === 'uploading' && <p>{Math.floor(uploadRate * 100)}%</p>}
    </div>
  );
};
