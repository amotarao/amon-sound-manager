import type { QueryDocumentSnapshot } from "firebase/firestore";
import type { Sound } from "../../../types/sound";
import { archivedTag, retakeTag } from "../constants";

export const sortByTitle = (
  a: QueryDocumentSnapshot<Sound>,
  z: QueryDocumentSnapshot<Sound>,
): number => {
  const aTitle = a.data().title || "";
  const zTitle = z.data().title || "";

  return aTitle > zTitle ? 1 : aTitle < zTitle ? -1 : 0;
};

export const sortByRetake = (
  a: QueryDocumentSnapshot<Sound>,
  z: QueryDocumentSnapshot<Sound>,
): number => {
  const aHasTag = a.data().tags.includes(retakeTag);
  const zHasTag = z.data().tags.includes(retakeTag);

  return aHasTag && !zHasTag ? -1 : !aHasTag && zHasTag ? 1 : 0;
};

export const sortByArchived = (
  a: QueryDocumentSnapshot<Sound>,
  z: QueryDocumentSnapshot<Sound>,
): number => {
  const aHasTag = a.data().tags.includes(archivedTag);
  const zHasTag = z.data().tags.includes(archivedTag);

  return aHasTag && !zHasTag ? 1 : !aHasTag && zHasTag ? -1 : 0;
};
