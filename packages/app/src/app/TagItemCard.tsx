import classNames from "classnames";
import {
  type CollectionReference,
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import useSWR from "swr";
import { SOUNDS_PAGE_TAG_PARAM_KEY } from "../constants/sound";
import { useSoundTagsSearchParams } from "../hooks/searchParams/useSoundTagsSearchParams";
import { firestore } from "../libs/firebase";
import { convertSearchParamsToObject } from "../libs/searchParams";
import type { Sound } from "../types/sound";

const fetchTagCount = async (
  collectionId: string,
  tag: string,
): Promise<number> => {
  const c = collection(firestore, collectionId) as CollectionReference<Sound>;
  const q = query(c, where("tags", "array-contains", tag));

  const count = await getCountFromServer(q);
  return count.data().count;
};

export type TagItemCardProps = {
  className?: string;
  collectionId: string;
  tag: string;
  isCurrent: boolean;
  mode?: "multiple";
};

export const TagItemCard: React.FC<TagItemCardProps> = ({
  className,
  collectionId,
  tag,
  isCurrent,
  mode,
}) => {
  const searchParams = useSearchParams();
  const query = convertSearchParamsToObject(searchParams);

  const currentTags = useSoundTagsSearchParams();
  const tagQuery = useMemo((): string[] | null => {
    if (tag === "ALL") {
      return null;
    }

    if (mode !== "multiple") {
      return [tag];
    }

    if (currentTags.includes(tag)) {
      return currentTags.filter((_tag) => _tag !== tag);
    }

    return [...currentTags, tag];
  }, [tag, mode, currentTags]);

  const { data: count = -1 } = useSWR(["tagCount", tag], async () => {
    if (tag === "ALL") {
      return undefined;
    }
    return fetchTagCount(collectionId, tag);
  });

  return (
    <Link
      className={classNames(
        "block px-4 py-2 text-sm aria-[current=page]:bg-neutral-300 dark:aria-[current=page]:bg-neutral-700",
        className,
      )}
      href={{
        href: "/",
        query: { ...query, [SOUNDS_PAGE_TAG_PARAM_KEY]: tagQuery },
      }}
      aria-current={isCurrent ? "page" : undefined}
    >
      <p>
        <span className="mr-0.5">#</span>
        <span>{tag}</span>
        {count > -1 && <span> ({count})</span>}
      </p>
    </Link>
  );
};
