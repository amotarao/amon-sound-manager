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
import { useTags } from "../hooks/useTags";
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

  const { currentTags } = useTags(collectionId);
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
        "block px-4 py-2 text-sm",
        isCurrent ? "bg-neutral-300 dark:bg-neutral-700" : null,
        className,
      )}
      href={{ href: "/", query: { ...query, tag: tagQuery } }}
    >
      <p>
        <span className="mr-0.5">#</span>
        <span>{tag}</span>
        {count > -1 && <span> ({count})</span>}
      </p>
    </Link>
  );
};
