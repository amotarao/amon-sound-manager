import { useCallback, useEffect, useRef } from "react";

type Props = React.ComponentPropsWithRef<"textarea">;

export function ResizableTextarea(props: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const calc = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "0";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    calc();
  }, [calc]);

  return (
    <textarea
      ref={textareaRef}
      {...props}
      onInput={(e) => {
        props.onInput?.(e);
        calc();
      }}
    />
  );
}
