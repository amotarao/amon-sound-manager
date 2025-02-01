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
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useGetSoundsByTagsSWR } from "../../../../hooks/firestore/useGetSoundsByTagsSWR";
import { useGetSoundDownloadUrlSWR } from "../../../../hooks/others/useGetSoundDownloadUrlSWR";
import { useSoundTagsSearchParams } from "../../../../hooks/searchParams/useSoundTagsSearchParams";
import { firestore } from "../../../../libs/firebase";
import type { Sound } from "../../../../types/sound";
import { ResizableTextarea } from "../../../ResizableTextarea";
import { TagEditor } from "../../../TagEditor";

const ComponentEditor = dynamic(
  () => import("../../../ComponentEditor").then((file) => file.ComponentEditor),
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

  const { data: downloadUrl } = useGetSoundDownloadUrlSWR(docId);

  const tags = useSoundTagsSearchParams();
  const { mutate } = useGetSoundsByTagsSWR(tags);

  if (!snapshot || !data) {
    return null;
  }

  return (
    <div className={classNames("relative flex flex-col gap-4 p-4", className)}>
      <button
        className="absolute right-4 top-4 rounded-sm border px-2 text-sm"
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
          src={downloadUrl}
          controls
          preload="metadata"
        />
      </div>
      <TitleSection
        docRef={snapshot.ref}
        defaultValue={data.title}
        onChangeSuccess={mutate}
      />
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
        onChangeSuccess={mutate}
      />
      <TagsSection
        docRef={snapshot.ref}
        defaultValue={data.tags}
        onChangeSuccess={mutate}
      />
      {data.tags.indexOf("DB") > -1 && downloadUrl && (
        <ComponentEditor
          className="border-t pt-4"
          src={downloadUrl}
          soundDocId={docId}
          collectionId="dbKomponenten"
        />
      )}
    </div>
  );
}

type TitleSectionProps = {
  docRef: DocumentReference<Sound>;
  defaultValue: Sound["title"];
  onChangeSuccess?: () => void;
};

function TitleSection({
  docRef,
  defaultValue,
  onChangeSuccess,
}: TitleSectionProps) {
  const [value, setValue] = useState(defaultValue || "");

  const updateValue = useMemo(
    () =>
      debounce(async (title: string) => {
        await updateDoc(docRef, {
          title,
        });
        onChangeSuccess?.();
      }, 1000),
    [docRef, onChangeSuccess],
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
}

type TextByManualSectionProps = {
  docRef: DocumentReference<Sound>;
  defaultValue: Sound["textByManual"];
  onChangeSuccess?: () => void;
};

function TextByManualSection({
  docRef,
  defaultValue,
  onChangeSuccess,
}: TextByManualSectionProps) {
  const [value, setValue] = useState(defaultValue || "");

  const updateValue = useMemo(
    () =>
      debounce(async (textByManual: string) => {
        await updateDoc(docRef, {
          textByManual: textByManual || null,
        });
        onChangeSuccess?.();
      }, 1000),
    [docRef, onChangeSuccess],
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
}

type TagSectionProps = {
  docRef: DocumentReference<Sound>;
  defaultValue: Sound["tags"];
  onChangeSuccess?: () => void;
};

function TagsSection({
  docRef,
  defaultValue,
  onChangeSuccess,
}: TagSectionProps) {
  const [value, setValue] = useState(defaultValue);

  const updateValue = useMemo(
    () =>
      debounce(async (tags: string[]) => {
        await updateDoc(docRef, {
          tags,
        });
        onChangeSuccess?.();
      }, 0),
    [docRef, onChangeSuccess],
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
}
