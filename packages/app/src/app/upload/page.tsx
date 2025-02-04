"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useUniqueId } from "../../hooks/useUniqueId";
import { TagEditor } from "../TagEditor";
import { UploadingFileCard } from "./UploadingFileCard";

export default function Page() {
  const [files, setFiles] = useState<
    {
      uid: string;
      file: File;
      tags: string[];
      langs: string[];
    }[]
  >([]);
  const [tags, setTags] = useState<string[]>([]);
  const [langs, setLangs] = useState<string[]>([]);
  const langId = useUniqueId();
  const tagsId = useUniqueId();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e,
  ) => {
    const fileList = e.target.files;
    if (!fileList) {
      return;
    }

    setFiles((files) => {
      return [
        ...files,
        ...Array.from(fileList).map((file) => ({
          uid: uuidv4(),
          file,
          tags,
          langs,
        })),
      ];
    });
  };

  return (
    <div className="mx-auto max-w-[640px]">
      <h1 className="mb-4 text-xl">upload</h1>
      <div className="mb-4 flex flex-col gap-4 rounded-sm border p-4">
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
          <TagEditor
            inputId={langId}
            onChange={(langs) => {
              setLangs(langs);
            }}
          />
        </div>
        <p>
          <input type="file" accept=".mp3" multiple onChange={handleChange} />
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {files.map((file) => (
          <UploadingFileCard
            key={file.uid}
            uid={file.uid}
            file={file.file}
            tags={file.tags}
            langs={file.langs}
          />
        ))}
      </div>
    </div>
  );
}
