import { PagePropsBase } from "../../../types/page-layout";
import { FileCard } from "./_components/FileCard";

type Props = PagePropsBase<{
  soundDocId: string;
}>;

export default async function Page({ params }: Props) {
  const { soundDocId } = await params;

  return (
    <div>
      <FileCard docId={soundDocId} />
    </div>
  );
}
