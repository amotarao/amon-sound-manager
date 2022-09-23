import { Storage } from '@google-cloud/storage';
// eslint-disable-next-line import/no-unresolved
import { ObjectMetadata } from 'firebase-functions/v1/storage';

export const storage = new Storage();

export const downloadObjectBuffer = async (object: Pick<ObjectMetadata, 'name' | 'bucket'>): Promise<Buffer> => {
  const bucket = storage.bucket(object.bucket);
  const file = bucket.file(object.name || '');
  const [data] = await file.download();
  return data;
};
