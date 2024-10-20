import { getDownloadURL, ref } from "firebase/storage";
import useSWR from "swr";
import { storage } from "../../libs/firebase";

export function useGetSoundDownloadUrlSWR(docId: string) {
  return useSWR(
    [getDownloadURL, storage, `sounds/${docId}.mp3`],
    async ([getDownloadURL, storage, fileName]) => {
      const storageRef = ref(storage, fileName);
      const url = await getDownloadURL(storageRef);
      return url;
    },
  );
}
