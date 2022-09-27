import * as functions from 'firebase-functions';
// eslint-disable-next-line import/no-unresolved
import { ObjectMetadata } from 'firebase-functions/v1/storage';
import { parseBuffer } from 'music-metadata';
import { firestore } from './libs/firebase';
import { speechClient } from './libs/speech';
import { downloadObjectBuffer } from './libs/storage';

const defaultRegion = functions.region('asia-northeast1');

export const onFinalizeObject = defaultRegion.storage.object().onFinalize(async (object) => {
  if (object.name?.match(/sounds\/.+\.mp3$/)) {
    await runGenerateTextFromMp3(object);
    await parseMp3Metadata(object);
    return;
  }
  if (object.name?.match(/speeches\/.+\.json$/)) {
    await saveTextResultToFirestore(object);
    return;
  }
});

/**
 * mp3 を Speech to Text でテキスト化
 * 非同期処理での実行の開始までを行う
 * 処理完了後、GCS に json が出力される
 */
const runGenerateTextFromMp3 = async (object: Pick<ObjectMetadata, 'name' | 'bucket'>) => {
  const docId = object.name?.replace(/^sounds\//, '').replace(/\.mp3$/, '');
  const docRef = firestore.doc(`/sounds/${docId}`);

  const inputUri = `gs://${object.bucket}/${object.name}`;
  const outputUri = inputUri.replace(/\/sounds\//, '/speeches/').replace(/\.mp3$/, '.json');

  const documentSnapshot = await docRef.get();
  const langs = documentSnapshot.data()?.langs as string[];

  await speechClient.longRunningRecognize({
    audio: {
      uri: inputUri,
    },
    config: {
      encoding: 'MP3',
      sampleRateHertz: 44100,
      languageCode: langs[0] || 'ja-JP',
      alternativeLanguageCodes: langs.slice(1),
    },
    outputConfig: {
      gcsUri: outputUri,
    },
  });
};

/**
 * mp3 のメタ情報を取得し、Firestore に保存する
 */
const parseMp3Metadata = async (object: Pick<ObjectMetadata, 'name' | 'bucket'>) => {
  const docId = object.name?.replace(/^sounds\//, '').replace(/\.mp3$/, '');
  const docRef = firestore.doc(`/sounds/${docId}`);

  const data = await downloadObjectBuffer(object);
  const metadata = await parseBuffer(data, 'audio/mpeg');

  await docRef.update({
    fileMetadata: JSON.parse(JSON.stringify(metadata)),
  });
};

/**
 * GCS に主力された Speech to Text の結果を Firestore に保存する
 */
const saveTextResultToFirestore = async (object: Pick<ObjectMetadata, 'name' | 'bucket'>) => {
  const docId = object.name?.replace(/^speeches\//, '').replace(/\.json$/, '');
  const docRef = firestore.doc(`/sounds/${docId}`);

  const buffer = await downloadObjectBuffer(object);
  const textJson = JSON.parse(buffer.toString());

  await docRef.update({
    text: textJson,
  });
};
