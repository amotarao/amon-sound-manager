'use client';

import type { NextPage } from 'next';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useUniqueId } from '../../hooks/useUniqueId';
import { TagEditor } from '../TagEditor';
import { UploadingFileCard } from './UploadingFileCard';

const Page: NextPage = () => {
  const [files, setFiles] = useState<{ uid: string; file: File }[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [lang, setLang] = useState('');
  const langId = useUniqueId();
  const tagsId = useUniqueId();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(async (e) => {
    const fileList = e.target.files;
    if (!fileList) {
      return;
    }

    setFiles((files) => {
      return [...files, ...Array.from(fileList).map((file) => ({ uid: uuidv4(), file }))];
    });
  }, []);

  return (
    <div className="mx-auto max-w-[640px]">
      <h1 className="mb-4 text-xl">upload</h1>
      <div className="mb-4 flex flex-col gap-4 rounded border p-4">
        <div className="flex flex-col gap-2">
          <label className="block text-xs" htmlFor={tagsId}>
            Tags
          </label>
          <TagEditor
            inputId={tagsId}
            onChange={(tags) => {
              setTags(tags);
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="block text-xs" htmlFor={langId}>
            Language
          </label>
          <input
            id={langId}
            className="px-2 py-1"
            type="text"
            placeholder="lang"
            value={lang}
            onChange={(e) => {
              setLang(e.currentTarget.value);
            }}
          />
        </div>
        <p>
          <input type="file" accept=".mp3" multiple onChange={handleChange} />
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {files.map((file) => (
          <UploadingFileCard key={file.uid} uid={file.uid} file={file.file} tags={tags} lang={lang} />
        ))}
      </div>
    </div>
  );
};

export default Page;
