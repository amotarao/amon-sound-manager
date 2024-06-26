import classNames from "classnames";
import {
  type DocumentReference,
  type DocumentSnapshot,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { firestore, storage } from "../../libs/firebase";
import type { Component } from "../../types/component";
import type { Range } from "../ComponentEditor";
import { TagEditor } from "../TagEditor";

const ComponentEditor = dynamic(
  () => import("../ComponentEditor").then((file) => file.ComponentEditor),
  {
    ssr: false,
  },
);

type Props = {
  className?: string;
  collectionId: string;
  docId: string;
};

export function ComponentCard({ className, collectionId, docId }: Props) {
  const [snapshot, setSnapshot] = useState<DocumentSnapshot<Component>>();

  const data = useMemo(() => {
    if (!snapshot) {
      return;
    }
    return snapshot.data();
  }, [snapshot]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(firestore, collectionId, docId),
      (snapshot) => {
        setSnapshot(snapshot as DocumentSnapshot<Component>);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [collectionId, docId]);

  const { data: downloadUrl } = useSWR(
    data?.soundDocId ? ["downloadUrl", `sounds/${data.soundDocId}.mp3`] : null,
    async ([, fileName]) => {
      const storageRef = ref(storage, fileName);
      const url = await getDownloadURL(storageRef);
      return url;
    },
  );

  if (!snapshot || !data) {
    return null;
  }

  return (
    <div className={classNames("relative flex flex-col gap-4 p-4", className)}>
      <button
        className="absolute right-4 top-4 rounded border px-2 text-sm"
        type="button"
        onClick={() => {
          deleteDoc(snapshot.ref);
        }}
      >
        Delete
      </button>
      <div className="flex flex-col gap-2">
        <p className="text-sm">{data.name}</p>
        <p className="text-xs">ID: {docId}</p>
      </div>
      <NameSection docRef={snapshot.ref} defaultValue={data.name} />
      <TagsSection docRef={snapshot.ref} defaultValue={data.tags} />
      {downloadUrl && (
        <ComponentSection
          docRef={snapshot.ref}
          defaultValue={{ start: data.start, end: data.end }}
          url={downloadUrl}
          soundDocId={data.soundDocId}
        />
      )}
    </div>
  );
}

const NameSection: React.FC<{
  docRef: DocumentReference<Component>;
  defaultValue: Component["name"];
}> = ({ docRef, defaultValue }) => {
  const [value, setValue] = useState(defaultValue || "");

  const updateValue = useMemo(
    () =>
      debounce((name: string) => {
        updateDoc(docRef, {
          name,
        });
      }, 1000),
    [docRef],
  );

  return (
    <div>
      <p className="mb-1 text-xs font-bold">Name</p>
      <input
        className="w-full resize-none p-2 text-sm"
        value={value}
        onInput={(e) => {
          setValue(e.currentTarget.value);
          updateValue(e.currentTarget.value);
        }}
      />
    </div>
  );
};

const TagsSection: React.FC<{
  docRef: DocumentReference<Component>;
  defaultValue: Component["tags"];
}> = ({ docRef, defaultValue }) => {
  const [value, setValue] = useState(defaultValue);

  const updateValue = useMemo(
    () =>
      debounce((tags: string[]) => {
        updateDoc(docRef, {
          tags,
        });
      }, 0),
    [docRef],
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

const ComponentSection: React.FC<{
  docRef: DocumentReference<Component>;
  defaultValue: Range;
  url: string;
  soundDocId: string;
}> = ({ docRef, defaultValue, url, soundDocId }) => {
  const updateValue = useMemo(
    () =>
      debounce(({ start, end }: Range) => {
        updateDoc(docRef, {
          start,
          end,
        });
      }, 1000),
    [docRef],
  );

  return (
    <ComponentEditor
      className="border-t pt-4"
      src={url}
      soundDocId={soundDocId}
      collectionId="dbKomponenten"
      readonly
      defaultRange={{ start: defaultValue.start, end: defaultValue.end }}
      onChangeRange={updateValue}
    />
  );
};
