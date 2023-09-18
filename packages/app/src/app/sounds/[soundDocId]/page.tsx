import { FileCard } from './FileCard';

type PageContext = {
  params: {
    soundDocId: string;
  };
};

export default function Page({ params: { soundDocId } }: PageContext) {
  return <FileCard docId={soundDocId} />;
}
