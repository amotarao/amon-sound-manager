import { QueryDocumentSnapshot } from 'firebase/firestore';
import { Sound } from '../../../types/sound';
import { retakeTag } from '../constants';

export const sortByTitle = (a: QueryDocumentSnapshot<Sound>, z: QueryDocumentSnapshot<Sound>): number => {
  const aTitle = a.data().title || '';
  const zTitle = z.data().title || '';

  return aTitle > zTitle ? 1 : aTitle < zTitle ? -1 : 0;
};

export const sortByRetake = (a: QueryDocumentSnapshot<Sound>, z: QueryDocumentSnapshot<Sound>): number => {
  const aHasTag = a.data().tags.includes(retakeTag);
  const zHasTag = z.data().tags.includes(retakeTag);

  return aHasTag && !zHasTag ? -1 : !aHasTag && zHasTag ? 1 : 0;
};
