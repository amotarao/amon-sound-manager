"use client";

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
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { firestore, storage } from "../../../libs/firebase";
import type { Sound } from "../../../types/sound";
import { ResizableTextarea } from "../../ResizableTextarea";
import { TagEditor } from "../../TagEditor";

const ComponentEditor = dynamic(
  () => import("../../ComponentEditor").then((file) => file.ComponentEditor),
  {
    ssr: false,
  },
);

const collectionId = "sounds";

type Props = {
  className?: string;
  docId: string;
};

export function FileCard({ className, docId }: Props) {
  const [snapshot, setSnapshot] = useState<DocumentSnapshot<Sound>>();
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
        setSnapshot(snapshot as DocumentSnapshot<Sound>);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [docId]);

  const [url, setUrl] = useState("");
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
        <p className="text-sm">{data.file.name}</p>
        <p className="text-xs">ID: {docId}</p>
        <p className="text-xs">Title: {data.fileMetadata?.common?.title}</p>
      </div>
      <div>
        <audio
          className="h-[32px] w-[320px] text-xs"
          src={url}
          controls
          preload="metadata"
        />
      </div>
      <TitleSection docRef={snapshot.ref} defaultValue={data.title} />
      <div>
        <p className="mb-1 text-xs font-bold">Speech to Text</p>
        {data.text && "results" in data.text ? (
          <p className="text-sm">
            {data.text.results
              .map((result) =>
                result.alternatives
                  .map((alternative) => alternative.transcript)
                  .join("\n"),
              )
              .join("\n")}
          </p>
        ) : (
          <p className="text-sm">データなし</p>
        )}
      </div>
      <TextByManualSection
        docRef={snapshot.ref}
        defaultValue={data.textByManual}
      />
      <TagsSection docRef={snapshot.ref} defaultValue={data.tags} />
      {data.tags.indexOf("DB") > -1 && url && (
        <ComponentEditor
          className="border-t pt-4"
          src={url}
          soundDocId={docId}
          collectionId="dbKomponenten"
        />
      )}
    </div>
  );
}

const TitleSection: React.FC<{
  docRef: DocumentReference<Sound>;
  defaultValue: Sound["title"];
}> = ({ docRef, defaultValue }) => {
  const [value, setValue] = useState(defaultValue || "");

  const updateValue = useMemo(
    () =>
      debounce((title: string) => {
        updateDoc(docRef, {
          title,
        });
      }, 1000),
    [docRef],
  );

  return (
    <div>
      <p className="mb-1 text-xs font-bold">Title</p>
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

const TextByManualSection: React.FC<{
  docRef: DocumentReference<Sound>;
  defaultValue: Sound["textByManual"];
}> = ({ docRef, defaultValue }) => {
  const [value, setValue] = useState(defaultValue || "");

  const updateValue = useMemo(
    () =>
      debounce((textByManual: string) => {
        updateDoc(docRef, {
          textByManual: textByManual || null,
        });
      }, 1000),
    [docRef],
  );

  return (
    <div>
      <p className="mb-1 text-xs font-bold">Text By Manual</p>
      <ResizableTextarea
        className="min-h-[1px] w-full resize-none p-2 text-sm"
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
  docRef: DocumentReference<Sound>;
  defaultValue: Sound["tags"];
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
