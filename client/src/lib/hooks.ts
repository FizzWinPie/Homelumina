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