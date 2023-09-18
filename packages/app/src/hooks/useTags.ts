import { collection, CollectionReference, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { firestore } from '../libs/firebase';
import { SoundTag } from '../types/sound';

export const useTags = (collectionId: string) => {
  const searchParams = useSearchParams();

  const [tags, setTags] = useState<string[]>([]);
  const [currentTags, setCurrentTags] = useState<string[]>([]);

  useEffect(() => {
    const tags = searchParams.getAll('tag');
    JSON.stringify(currentTags) !== JSON.stringify(tags) && setCurrentTags(tags);
  }, [searchParams, currentTags]);

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
    currentTags,
    fetchTags,
    deleteTag,
  };
};
