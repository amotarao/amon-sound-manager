import { useState, useEffect } from 'react';

export type TagEditorProps = {
  className?: string;
  inputId?: string;
  onAdd?: (tag: string) => void;
  onRemove?: (tag: string) => void;
  onChange?: (tags: string[]) => void;
};

export const TagEditor: React.FC<TagEditorProps> = ({
  className = '',
  inputId,
  onAdd = () => null,
  onRemove = () => null,
  onChange = () => null,
}) => {
  const [inputValue, setInputValue] = useState('');

  const [tags, setTags] = useState<string[]>([]);

  const addTag = (tag: string) => {
    if (tags.includes(tag)) {
      return;
    }
    setTags((tags) => [...tags, tag]);
    onAdd(tag);
  };

  const removeTag = (tag: string) => {
    const index = tags.indexOf(tag);
    if (index < 0) {
      return;
    }
    setTags((tags) => [...tags.slice(0, index), ...tags.slice(index + 1)]);
    onRemove(tag);
  };

  useEffect(() => {
    onChange(tags);
  }, [onChange, tags]);

  return (
    <div className={`${className} flex flex-wrap gap-2 rounded border p-2`}>
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
        onKeyDown={(e) => {
          if ([',', 'Enter'].includes(e.key)) {
            addTag((e.target as HTMLInputElement).value);
            setInputValue('');
          }
        }}
        onInput={(e) => {
          setInputValue(e.currentTarget.value);
        }}
      />
    </div>
  );
};
