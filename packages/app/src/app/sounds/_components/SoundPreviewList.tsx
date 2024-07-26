import classNames from "classnames";
import {
  type CollectionReference,
  type Query,
  type QueryDocumentSnapshot,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import useSWR from "swr";
import { firestore } from "../../../libs/firebase";
import { archivedTag } from "../../../libs/sound/constants";
import { sortByRetake, sortByTitle } from "../../../libs/sound/utils/sort";
import type { Sound } from "../../../types/sound";
import { SoundPreviewCard } from "./SoundPreviewCard";

const collectionId = "sounds";

const getQuery = (tags: string[]): Query<Sound> => {
  const c = collection(firestore, collectionId) as CollectionReference<Sound>;
  let q = query(c, orderBy("file.name"));
  q = query(q, limit(tags.length > 0 ? 1000 : 30));
  if (tags.length) {
    q = query(q, where("tags", "array-contains-any", tags));
  }
  return q;
};

type Props = {
  className?: string;
  currentTags?: string[];
};

export function SoundPreviewList({ className, currentTags }: Props) {
  const { data: docs = [] } = useSWR(
    [collectionId, "docs", { currentTags }],
    async ([, , { currentTags }]) => {
      const query = getQuery(currentTags || []);
      const { docs } = await getDocs(query);
      return docs
        .filter((doc) =>
          currentTags?.every((tag) => doc.data().tags.includes(tag)),
        )
        .sort((a, z) => sortByRetake(a, z) || sortByTitle(a, z));
    },
  );

  return (
    <div className={classNames("grid grid-cols-1 gap-4", className)}>
      <List
        docs={docs.filter((doc) => !doc.data().tags.includes(archivedTag))}
        currentTags={currentTags}
      />
      <List
        cardClassName="opacity-70"
        title="アーカイブ済み"
        docs={docs.filter((doc) => doc.data().tags.includes(archivedTag))}
        currentTags={currentTags}
      />
    </div>
  );
}

type ListProps = {
  cardClassName?: string;
  title?: string;
  docs: QueryDocumentSnapshot<Sound>[];
} & Pick<Props, "currentTags">;

function List({ cardClassName, title, docs, currentTags }: ListProps) {
  if (docs.length === 0) {
    return null;
  }

  return (
    <div>
      {title && <p className="mx-4 border-b py-2 text-xs font-bold">{title}</p>}
      <ul>
        {docs.map((doc) => (
          <li
            key={doc.id}
            className="after:mx-4 after:block after:h-[1px] after:bg-current after:content-['']"
          >
            <SoundPreviewCard
              className={cardClassName}
              doc={doc}
              currentTags={currentTags}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
