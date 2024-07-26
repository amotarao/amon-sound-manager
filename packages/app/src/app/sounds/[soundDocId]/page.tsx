import { FileCard } from "./_components/FileCard";

type PageContext = {
  params: {
    soundDocId: string;
  };
};

export default function Page({ params: { soundDocId } }: PageContext) {
  return (
    <div>
      <FileCard docId={soundDocId} />
    </div>
  );
}
