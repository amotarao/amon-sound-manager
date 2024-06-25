import classNames from "classnames";
import { addDoc, collection } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin, { type Region } from "wavesurfer.js/src/plugin/regions";
import { firestore } from "../libs/firebase";
import type { Component } from "../types/component";
import { TagEditor } from "./TagEditor";

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
  const regionId = useMemo(() => "region", []);

  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [wavesurfer, setWavesurfer] = useState<WaveSurfer>();
  const [firstDefaultRange] = useState(defaultRange || { start: 0, end: 1 });
  const [range, setRange] = useState(defaultRange || { start: 0, end: 1 });

  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (!audioRef.current || !containerRef.current) {
      return;
    }

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "violet",
      progressColor: "purple",
      plugins: [
        RegionsPlugin.create({
          regions: [
            {
              id: regionId,
              start: firstDefaultRange.start,
              end: firstDefaultRange.end,
              loop: false,
              color: "rgba(255, 255, 255, 0.3)",
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
  }, [regionId, firstDefaultRange]);

  useEffect(() => {
    const cb = (region: Region) => {
      const { start, end } = region;
      setRange({ start, end });
      onChangeRange({ start, end });
    };

    wavesurfer?.on("region-updated", cb);
  }, [wavesurfer, onChangeRange]);

  return (
    <section className={classNames("flex flex-col gap-2", className)}>
      <p className="mb-1 text-xs font-bold">Component Editor</p>
      <audio ref={audioRef} className="hidden" src={src} />
      <div ref={containerRef} className="w-full" />
      <div className="flex justify-between">
        <button
          className="rounded-sm border px-2 text-sm"
          type="button"
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
            <p className="mb-1 text-xs font-bold">Tags</p>
            <TagEditor defaultValue={[]} onChange={setTags} />
          </div>
          <div>
            <button
              className="rounded-sm border px-2 text-sm"
              type="button"
              onClick={() => {
                const data: Component = {
                  soundDocId,
                  start: range.start,
                  end: range.end,
                  name,
                  tags,
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
