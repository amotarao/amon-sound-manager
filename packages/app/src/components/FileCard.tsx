import { deleteDoc, DocumentReference, QueryDocumentSnapshot, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { debounce } from 'lodash';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
    })().catch((error) => {
      console.error(error);
    });
  });

  return (
    <div className={`${className} relative flex flex-col gap-4 border p-4`}>
      <button
        className="absolute right-4 top-4 rounded border px-2 text-sm"
        onClick={() => {
          deleteDoc(queryDocumentSnapshot.ref);
        }}
      >
        Delete
      </button>
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
        {data.text && 'results' in data.text ? (
          <p className="text-sm">
            {data.text.results
              .map((result) => result.alternatives.map((alternative) => alternative.transcript).join('\n'))
              .join('\n')}
          </p>
        ) : (
          <p className="text-sm">データなし</p>
        )}
      </div>
      <TextByManualSection docRef={queryDocumentSnapshot.ref} defaultTextByManual={data.textByManual} />
    </div>
  );
};

const TextByManualSection: React.FC<{
  docRef: DocumentReference<Sound>;
  defaultTextByManual: Sound['textByManual'];
}> = ({ docRef, defaultTextByManual }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [tmpTextByManual, setTmpTextByManual] = useState(defaultTextByManual || '');

  const updateTextByManual = useMemo(
    () =>
      debounce((textByManual: string) => {
        updateDoc(docRef, {
          textByManual: textByManual || null,
        });
      }, 1000),
    [docRef]
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '0';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [textareaRef]);

  return (
    <div>
      <p className="mb-1 text-xs font-bold">[Text By Manual]</p>
      <textarea
        ref={textareaRef}
        className="min-h-[1px] w-full resize-none p-2 text-sm"
        value={tmpTextByManual}
        onInput={(e) => {
          setTmpTextByManual(e.currentTarget.value);
          updateTextByManual(e.currentTarget.value);
          if (textareaRef.current) {
            textareaRef.current.style.height = '0';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
          }
        }}
      ></textarea>
    </div>
  );
};
