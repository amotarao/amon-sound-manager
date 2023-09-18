import classNames from 'classnames';
import { useCallback, useState } from 'react';
import { useInputComposition } from '../hooks/useInputComposition';

type Props = {
  className?: string;
  defaultValue?: string[];
  inputId?: string;
  onAdd?: (tag: string) => void;
  onRemove?: (tag: string) => void;
  onChange?: (tags: string[]) => void;
};

export function TagEditor({
  className,
  defaultValue = [],
  inputId,
  onAdd = () => null,
  onRemove = () => null,
  onChange = () => null,
}: Props) {
  const [inputValue, setInputValue] = useState('');
  const { onCompositionStart, onCompositionEnd, handleKeyDown } = useInputComposition();

  const [tags, setTags] = useState<string[]>(defaultValue);

  const addTag = useCallback(
    (tag: string) => {
      if (tags.includes(tag)) {
        return;
      }
      const newTags = [...tags, tag];
      setTags(newTags);
      onAdd(tag);
      onChange(newTags);
    },
    [tags, onAdd, onChange]
  );

  const removeTag = useCallback(
    (tag: string) => {
      const index = tags.indexOf(tag);
      if (index < 0) {
        return;
      }
      const newTags = [...tags.slice(0, index), ...tags.slice(index + 1)];
      setTags(newTags);
      onRemove(tag);
      onChange(newTags);
    },
    [tags, onRemove, onChange]
  );

  return (
    <div className={classNames('flex flex-wrap gap-2 rounded border p-2', className)}>
      <ul className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li key={tag}>
            <div className="flex w-max gap-2 rounded-full border px-2 text-sm">
              <p>{tag}</p>
              <button
                onClick={() => {
                  removeTag(tag);
                }}
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
      <input
        id={inputId}
        className="w-max text-sm"
        type="text"
        value={inputValue}
        onInput={(e) => {
          setInputValue(e.currentTarget.value);
        }}
        onKeyDown={handleKeyDown((e) => {
          if ([',', 'Enter'].includes(e.key)) {
            addTag((e.target as HTMLInputElement).value);
            setInputValue('');
          }
        })}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
      />
    </div>
  );
}
