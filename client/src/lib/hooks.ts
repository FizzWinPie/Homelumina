import { useEffect, useRef, useState } from "react";

export function useDebouncedState<T>(initialValue: T, delay: number = 500): {
  value: T,
  debouncedValue: T,
  setValue: (value: T) => void,
} {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [value, setValue] = useState(initialValue);
    const [debouncedValue, setDebouncedValue] = useState(initialValue);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => setDebouncedValue(value), delay);
    }, [value, delay]);

    return {
        value,
        debouncedValue,
        setValue: setValue,
    };
  }

  export const useTypewriter = (phrases: string[], typingSpeed = 40, deletingSpeed = 30, pauseTime = 1500) => {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
  
    useEffect(() => {
      // If we've finished typing the phrase, pause before deleting
      if (!isDeleting && subIndex === phrases[index].length) {
        const timeout = setTimeout(() => setIsDeleting(true), pauseTime);
        return () => clearTimeout(timeout);
      }
  
      // If we've finished deleting, move to the next phrase
      if (isDeleting && subIndex === 4) {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % phrases.length);
        return;
      }
  
      // Handle character addition/removal
      const timeout = setTimeout(() => {
        setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
      }, isDeleting ? deletingSpeed : typingSpeed);
  
      return () => clearTimeout(timeout);
    }, [subIndex, index, isDeleting, phrases]);
  
    return `${phrases[index].substring(0, subIndex)}${subIndex === phrases[index].length ? '' : '|'}`;
  };
  