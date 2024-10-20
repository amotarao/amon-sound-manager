import { collection, deleteDoc, doc } from "firebase/firestore";
import { useCallback } from "react";
import { firestore } from "../libs/firebase";
import { useListTagsSWR } from "./firestore/useListTagsSWR";

export const useTags = (collectionId: string) => {
  const { data = [], mutate } = useListTagsSWR(collectionId);

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
    fetchTags: mutate,
    deleteTag,
  };
};
