import {
  type CollectionReference,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import useSWR from "swr";
import { firestore } from "../libs/firebase";
import type { SoundTag } from "../types/sound";

export const useTags = (collectionId: string) => {
  const searchParams = useSearchParams();
  const currentTags = searchParams.getAll("tag");

  const { data = [], mutate } = useSWR(["tags"], async () => {
    const c = collection(
      doc(collection(firestore, collectionId), "tags"),
      "tags",
    ) as CollectionReference<SoundTag>;
    const querySnapshot = await getDocs(c);
    const tags = querySnapshot.docs.map((doc) => doc.get("name") as string);
    return tags;
  });

  const deleteTag = useCallback(
    async (tag: string) => {
      await deleteDoc(
        doc(
          collection(doc(collection(firestore, collectionId), "tags"), "tags"),
          tag,
        ),
      );
    },
    [collectionId],
  );

  return {
    tags: data,
    currentTags,
    fetchTags: mutate,
    deleteTag,
  };
};
