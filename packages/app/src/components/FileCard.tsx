import { deleteDoc, doc, DocumentReference, DocumentSnapshot, onSnapshot, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { firestore, storage } from '../libs/firebase';
import { Sound } from '../types/sound';
import { TagEditor } from './TagEditor';

export type FileCardProps = {
  className?: string;
  docId: string;
};

export const FileCard: React.FC<FileCardProps> = ({ className = '', docId }) => {
  const [snapshot, setSnapshot] = useState<DocumentSnapshot<Sound> | null>(null);
  const data = useMemo(() => {
    if (!snapshot) {
      return null;
    }
    return snapshot.data() || null;
  }, [snapshot]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(firestore, 'sounds', docId), (snapshot) => {
      setSnapshot(snapshot as DocumentSnapshot<Sound>);
    });

    return () => {
      unsubscribe();
    };
  }, [docId]);

  const [url, setUrl] = useState('');
  useEffect(() => {
    (async () => {
      const storageRef = ref(storage, `sounds/${docId}.mp3`);
      const url = await getDownloadURL(storageRef);
      setUrl(url);
    })().catch(console.error);
  }, [docId]);

  if (!snapshot || !data) {
    return null;
  }

  return (
    <div className={`${className} relative flex flex-col gap-4 p-4`}>
      <button
        className="absolute right-4 top-4 rounded border px-2 text-sm"
        onClick={() => {
          deleteDoc(snapshot.ref);
        }}
      >
        Delete
      </button>
      <div className="flex flex-col gap-2">
        <p className="text-sm">{data.file.name}</p>
        <p className="text-xs">ID: {docId}</p>
        <p className="text-xs">Title: {data.fileMetadata?.common?.title}</p>
      </div>
      <div>
        <audio className="h-[32px] w-[320px] text-xs" src={url} controls preload="metadata" />
      </div>
      <div>
        <p className="mb-1 text-xs font-bold">Speech to Text</p>
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
      <TextByManualSection docRef={snapshot.ref} defaultValue={data.textByManual} />
      <TagsSection docRef={snapshot.ref} defaultValue={data.tags} />
    </div>
  );
};

const TextByManualSection: React.FC<{
  docRef: DocumentReference<Sound>;
  defaultValue: Sound['textByManual'];
}> = ({ docRef, defaultValue }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue || '');

  const updateValue = useMemo(
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
      <p className="mb-1 text-xs font-bold">Text By Manual</p>
      <textarea
        ref={textareaRef}
        className="min-h-[1px] w-full resize-none p-2 text-sm"
        value={value}
        onInput={(e) => {
          setValue(e.currentTarget.value);
          updateValue(e.currentTarget.value);
          if (textareaRef.current) {
            textareaRef.current.style.height = '0';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
          }
        }}
      ></textarea>
    </div>
  );
};

const TagsSection: React.FC<{
  docRef: DocumentReference<Sound>;
  defaultValue: Sound['tags'];
}> = ({ docRef, defaultValue }) => {
  const [value, setValue] = useState(defaultValue);

  const updateValue = useMemo(
    () =>
      debounce((tags: string[]) => {
        updateDoc(docRef, {
          tags,
        });
      }, 0),
    [docRef]
  );

  return (
    <div>
      <p className="mb-1 text-xs font-bold">Tags</p>
      <TagEditor
        defaultValue={value}
        onChange={(tags) => {
          setValue(tags);
          updateValue(tags);
        }}
      />
    </div>
  );
};
