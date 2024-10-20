import classNames from "classnames";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import { useGetSoundsByTagsSWR } from "../../../hooks/firestore/useGetSoundsByTagsSWR";
import { useSoundTagsSearchParams } from "../../../hooks/searchParams/useSoundTagsSearchParams";
import { archivedTag } from "../../../libs/sound/constants";
import type { Sound } from "../../../types/sound";
import { SoundPreviewCard } from "./SoundPreviewCard";

type Props = {
  className?: string;
};

export function SoundPreviewList({ className }: Props) {
  const currentTags = useSoundTagsSearchParams();
  const { data: docs = [] } = useGetSoundsByTagsSWR(currentTags);

  return (
    <div className={classNames("grid grid-cols-1 gap-4", className)}>
      <List
        docs={docs.filter((doc) => !doc.data().tags.includes(archivedTag))}
      />
      <List
        cardClassName="opacity-70"
        title="アーカイブ済み"
        docs={docs.filter((doc) => doc.data().tags.includes(archivedTag))}
      />
    </div>
  );
}

type ListProps = {
  cardClassName?: string;
  title?: string;
  docs: QueryDocumentSnapshot<Sound>[];
};

function List({ cardClassName, title, docs }: ListProps) {
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
            <SoundPreviewCard className={cardClassName} doc={doc} />
          </li>
        ))}
      </ul>
    </div>
  );
}
