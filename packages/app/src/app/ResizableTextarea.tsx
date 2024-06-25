import { useCallback, useEffect, useRef } from "react";

export type ResizableTextareaProps = JSX.IntrinsicElements["textarea"];

export const ResizableTextarea: React.FC<ResizableTextareaProps> = (props) => {
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
};
