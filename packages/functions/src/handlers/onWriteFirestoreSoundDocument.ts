import { defaultRegion } from '..';
import { firestore } from '../libs/firebase';

export const onWriteFirestoreSoundDocument = defaultRegion.firestore.document('sounds/{ID}').onWrite(async (change) => {
  const data = change.after ? change.after.data() : change.before.data();
  const tags = (data?.tags as string[]) ?? [];

  const bulkWriter = firestore.bulkWriter();
  const collection = firestore.collection('sounds').doc('tags').collection('tags');
  tags.forEach((tag) => {
    bulkWriter.create(collection.doc(tag), {
      name: tag,
    });
  });
  await bulkWriter.close();
});
