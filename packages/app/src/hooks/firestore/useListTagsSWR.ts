import {
  type CollectionReference,
  collection,
  doc,
  getDocs,
} from "firebase/firestore";
import useSWR from "swr";
import { firestore } from "../../libs/firebase";
import type { SoundTag } from "../../types/sound";

export function useListTagsSWR(collectionId: string) {
  return useSWR(["tags"], async () => {
    const c = collection(
      doc(collection(firestore, collectionId), "tags"),
      "tags",
    ) as CollectionReference<SoundTag>;
    const querySnapshot = await getDocs(c);
    const tags = querySnapshot.docs.map((doc) => doc.get("name") as string);
    return tags;
  });
}
