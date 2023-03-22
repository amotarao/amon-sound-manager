import * as functions from 'firebase-functions';

export const defaultRegion = functions.region('asia-northeast1');

export * from './handlers/onFinalizeStorageObject';
export * from './handlers/onWriteFirestoreSoundDocument';
export * from './handlers/onWriteFirestoreDbKomponentDocument';
