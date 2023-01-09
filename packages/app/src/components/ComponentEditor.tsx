import classNames from 'classnames';
import { addDoc, collection } from 'firebase/firestore';
import { useEffect, useMemo, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin, { Region } from 'wavesurfer.js/src/plugin/regions';
import { firestore } from '../libs/firebase';
import { Component } from '../types/component';

export type Range = {
  start: number;
  end: number;
};

export type ComponentEditorProps = {
  className?: string;
  src: string;
  soundDocId: string;
  collectionId: string;
  readonly?: boolean;
  defaultRange?: Range;
  onChangeRange?: (range: Range) => void;
};

export const ComponentEditor: React.FC<ComponentEditorProps> = ({
  className,
  src,
  soundDocId,
  collectionId,
  readonly,
  defaultRange,
  onChangeRange = () => null,
}) => {
  const regionId = useMemo(() => 'region', []);

  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [wavesurfer, setWavesurfer] = useState<WaveSurfer>();
  const [firstDefaultRange] = useState(defaultRange || { start: 0, end: 1 });
  const [range, setRange] = useState(defaultRange || { start: 0, end: 1 });

  const [name, setName] = useState('');
  const [lang, setLang] = useState('');

  useEffect(() => {
    if (!audioRef.current || !containerRef.current) {
      return;
    }

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'violet',
      progressColor: 'purple',
      plugins: [
        RegionsPlugin.create({
          regions: [
            {
              id: regionId,
              start: firstDefaultRange.start,
              end: firstDefaultRange.end,
              loop: false,
              color: 'rgba(255, 255, 255, 0.3)',
            },
          ],
        }),
      ],
    });

    wavesurfer.load(audioRef.current);

    setWavesurfer(wavesurfer);

    return () => {
      wavesurfer.destroy();
    };
  }, [regionId, audioRef, containerRef, firstDefaultRange]);

  useEffect(() => {
    let cb = (region: Region) => {
      const { start, end } = region;
      setRange({ start, end });
      onChangeRange({ start, end });
    };

    wavesurfer?.on('region-updated', cb);

    return () => {
      cb = null as any;
    };
  }, [wavesurfer, onChangeRange]);

  return (
    <section className={classNames('flex flex-col gap-2', className)}>
      <p className="mb-1 text-xs font-bold">Component Editor</p>
      <audio ref={audioRef} className="hidden" src={src} />
      <div ref={containerRef} className="w-full"></div>
      <div className="flex justify-between">
        <button
          className="rounded-sm border px-2 text-sm"
          onClick={() => {
            if (!wavesurfer || !wavesurfer.regions.list[regionId]) {
              return;
            }

            const region = wavesurfer.regions.list[regionId];
            region.play();
          }}
        >
          play
        </button>
        <input
          className="w-[200px]"
          type="range"
          min="20"
          max="1000"
          defaultValue="0"
          onInput={(e) => {
            wavesurfer?.zoom(Number(e.currentTarget.value));
          }}
        />
      </div>
      {!readonly && (
        <>
          <div className="flex gap-1 text-xs">
            <span>{range.start}</span>
            <span>-</span>
            <span>{range.end}</span>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold">Name</p>
            <input
              className="w-full resize-none p-2 text-sm"
              value={name}
              onInput={(e) => {
                setName(e.currentTarget.value);
              }}
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold">Lang</p>
            <input
              className="w-full resize-none p-2 text-sm"
              value={lang}
              onInput={(e) => {
                setLang(e.currentTarget.value);
              }}
            />
          </div>
          <div>
            <button
              className="rounded-sm border px-2 text-sm"
              onClick={() => {
                const data: Component = {
                  soundDocId,
                  start: range.start,
                  end: range.end,
                  name,
                  lang,
                  tags: [],
                };
                addDoc(collection(firestore, collectionId), data);
              }}
            >
              save
            </button>
          </div>
        </>
      )}
    </section>
  );
};
