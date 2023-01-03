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
  text:
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
  title: string | null;
  textByManual: string | null;
  fileMetadata: Partial<IAudioMetadata>;
};

export type SoundTag = {
  name: string;
};
