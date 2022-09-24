import { IAudioMetadata } from 'music-metadata';

export type Sound = {
  file: {
    name: string;
    type: string;
    size: number;
    lastModified: number;
  };
  langs: string[];
  tags: string[];
  speech:
    | {
        results: {
          alternatives: {
            transcript: string;
            confidence: number;
          }[];
          languageCode: string;
          resultEndTime: string;
        }[];
      }
    | Record<string, never>
    | null;
  fileMetadata?: Partial<IAudioMetadata>;
};
