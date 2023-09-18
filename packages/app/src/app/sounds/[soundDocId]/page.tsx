import { FileCard } from '../../../components/FileCard';

type PageContext = {
  params: {
    soundDocId: string;
  };
};

export default function Page({ params: { soundDocId } }: PageContext) {
  return <FileCard docId={soundDocId} />;
}
