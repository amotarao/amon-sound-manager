import { FileCard } from "./FileCard";

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
