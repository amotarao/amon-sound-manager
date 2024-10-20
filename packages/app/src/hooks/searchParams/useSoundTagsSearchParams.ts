import { useSearchParams } from "next/navigation";
import { SOUNDS_PAGE_TAG_PARAM_KEY } from "../../constants/sound";

export function useSoundTagsSearchParams() {
  const searchParams = useSearchParams();
  const tags = searchParams.getAll(SOUNDS_PAGE_TAG_PARAM_KEY);
  return tags;
}
