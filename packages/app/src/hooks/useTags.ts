import { collection, CollectionReference, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { firestore } from '../libs/firebase';
import { SoundTag } from '../types/sound';

export const useTags = (collectionId: string) => {
  const router = useRouter();

  const [tags, setTags] = useState<string[]>([]);

  const currentTag = useMemo(() => {
    if (!('tag' in router.query) || !router.query.tag) {
      return null;
    }
    if (Array.isArray(router.query.tag)) {
      return router.query.tag[0];
    }
    return router.query.tag;
  }, [router]);

  const fetchTags = useCallback(async () => {
    setTags([]);
    const c = collection(doc(collection(firestore, collectionId), 'tags'), 'tags') as CollectionReference<SoundTag>;
    const querySnapshot = await getDocs(c);
    const tags = querySnapshot.docs.map((doc) => doc.get('name') as string);
    setTags(tags);
  }, [collectionId]);

  const deleteTag = useCallback(
    (tag: string) => {
      deleteDoc(doc(collection(doc(collection(firestore, collectionId), 'tags'), 'tags'), tag));
    },
    [collectionId]
  );

  return {
    tags,
    currentTag,
    fetchTags,
    deleteTag,
  };
};
