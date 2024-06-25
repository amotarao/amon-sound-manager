import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { defaultRegion } from "..";
import { firestore } from "../libs/firebase";

export const onWriteFirestoreDbKomponentDocument = onDocumentWritten(
  {
    document: "dbKomponenten/{ID}",
    region: defaultRegion,
  },
  async (event) => {
    const data = event.data?.after
      ? event.data.after.data()
      : event.data?.before.data();
    if (!data) {
      return;
    }

    const tags = (data?.tags as string[]) ?? [];

    const bulkWriter = firestore.bulkWriter();
    const collection = firestore
      .collection("dbKomponenten")
      .doc("tags")
      .collection("tags");
    tags.forEach((tag) => {
      bulkWriter.create(collection.doc(tag), {
        name: tag,
      });
    });
    await bulkWriter.close();
  },
);
