import type { NextPage } from 'next';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { UploadingFileCard } from '../../components/UploadingFileCard';

const Page: NextPage = () => {
  const [files, setFiles] = useState<{ uid: string; file: File }[]>([]);

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
    <div>
      <h1>upload</h1>
      <input type="file" accept=".mp3" multiple onChange={handleChange} />
      <div className="flex flex-col gap-2">
        {files.map((file) => (
          <UploadingFileCard uid={file.uid} file={file.file} key={file.uid} />
        ))}
      </div>
    </div>
  );
};

export default Page;
