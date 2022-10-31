import { useCallback, useState } from 'react';

export type UseInputComposition = {
  onCompositionStart: React.CompositionEventHandler<HTMLInputElement>;
  onCompositionEnd: React.CompositionEventHandler<HTMLInputElement>;
  handleKeyDown: (fn: React.KeyboardEventHandler<HTMLInputElement>) => React.KeyboardEventHandler<HTMLInputElement>;
};

export const useInputComposition = (): UseInputComposition => {
  const [isComposition, setIsComposition] = useState(false);

  const onCompositionStart = useCallback(() => {
    setIsComposition(true);
  }, []);
  const onCompositionEnd = useCallback(() => {
    setIsComposition(false);
  }, []);

  const handleKeyDown = useCallback(
    (fn: React.KeyboardEventHandler<HTMLInputElement>): React.KeyboardEventHandler<HTMLInputElement> =>
      (e) => {
        if (e.key === 'Enter' && isComposition) {
          return;
        }
        fn(e);
      },
    [isComposition]
  );

  return {
    onCompositionStart,
    onCompositionEnd,
    handleKeyDown,
  };
};
