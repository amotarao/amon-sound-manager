import {
  type CollectionReference,
  type Query,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import useSWR from "swr";
import { firestore } from "../../libs/firebase";
import { sortByRetake, sortByTitle } from "../../libs/sound/utils/sort";
import type { Sound } from "../../types/sound";

const collectionId = "sounds";

const getQuery = (tags: string[]): Query<Sound> => {
  const c = collection(firestore, collectionId) as CollectionReference<Sound>;
  let q = query(c, orderBy("file.name"));
  q = query(q, limit(tags.length > 0 ? 1000 : 30));
  if (tags.length) {
    q = query(q, where("tags", "array-contains-any", tags));
  }
  return q;
};

export function useGetSoundsByTagsSWR(tags?: string[]) {
  return useSWR(
    [getDocs, getQuery, { tags }],
    async ([getDocs, getQuery, { tags }]) => {
      const query = getQuery(tags || []);
      const { docs } = await getDocs(query);
      return docs
        .filter((doc) => tags?.every((tag) => doc.data().tags.includes(tag)))
        .sort((a, z) => sortByRetake(a, z) || sortByTitle(a, z));
    },
  );
}
