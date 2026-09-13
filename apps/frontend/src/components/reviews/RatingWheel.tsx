"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import styles from "./RatingFlow.module.css";

interface RatingWheelProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  color: string;
  surfaceColor: string;
}

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const SNAP_DELAY_MS = 100;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function RatingWheel({
  value,
  onChange,
  min,
  max,
  step,
  label,
  color,
  surfaceColor,
}: RatingWheelProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollGeneratedValueRef = useRef<number | null>(null);
  const values = useMemo(
    () =>
      Array.from(
        { length: Math.floor((max - min) / step) + 1 },
        (_, index) => max - index * step
      ),
    [max, min, step]
  );
  const selectedIndex = clamp(Math.round((max - value) / step), 0, values.length - 1);
  const interactiveIndexRef = useRef(selectedIndex);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior) => {
    scrollerRef.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior });
  }, []);

  useLayoutEffect(() => {
    interactiveIndexRef.current = selectedIndex;

    if (scrollGeneratedValueRef.current === value) {
      scrollGeneratedValueRef.current = null;
      return;
    }

    scrollToIndex(selectedIndex, "auto");
  }, [scrollToIndex, selectedIndex, value]);

  useEffect(
    () => () => {
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }
    },
    []
  );

  const selectIndex = (index: number, behavior: ScrollBehavior = "auto") => {
    const nextIndex = clamp(index, 0, values.length - 1);
    interactiveIndexRef.current = nextIndex;
    scrollToIndex(nextIndex, behavior);
  };

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const nextIndex = clamp(Math.round(scroller.scrollTop / ITEM_HEIGHT), 0, values.length - 1);
    const nextValue = values[nextIndex];
    interactiveIndexRef.current = nextIndex;

    if (nextValue !== value) {
      scrollGeneratedValueRef.current = nextValue;
      onChange(nextValue);
    }

    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
    }

    snapTimeoutRef.current = setTimeout(() => {
      scrollToIndex(nextIndex, "smooth");
    }, SNAP_DELAY_MS);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let nextIndex: number | null = null;
    const interactiveIndex = interactiveIndexRef.current;

    if (event.key === "ArrowUp" || event.key === "ArrowRight") nextIndex = interactiveIndex - 1;
    if (event.key === "ArrowDown" || event.key === "ArrowLeft") nextIndex = interactiveIndex + 1;
    if (event.key === "Home") nextIndex = values.length - 1;
    if (event.key === "End") nextIndex = 0;

    if (nextIndex === null) return;

    event.preventDefault();
    selectIndex(nextIndex);
  };

  const sidePadding = ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT;

  return (
    <div
      data-rating-wheel
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value} de ${max}`}
      aria-orientation="vertical"
      onKeyDown={handleKeyDown}
      onPointerDown={() => {
        if (snapTimeoutRef.current) {
          clearTimeout(snapTimeoutRef.current);
        }
      }}
      className="relative w-full max-w-[18rem] rounded-[2rem] bg-white outline-none ring-offset-4 focus-visible:ring-2"
      style={{ boxShadow: `0 18px 50px ${color}1F`, outlineColor: color }}
    >
      <div
        className="pointer-events-none absolute inset-x-4 top-1/2 z-10 -translate-y-1/2 rounded-xl border-y-2"
        style={{ height: ITEM_HEIGHT, borderColor: color, backgroundColor: surfaceColor }}
        aria-hidden="true"
      />

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className={`${styles.wheel} relative z-20 overflow-y-auto snap-y snap-mandatory`}
        style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS, paddingBlock: sidePadding }}
      >
        {values.map((option, index) => {
          const distance = Math.abs(index - selectedIndex);
          const isSelected = distance === 0;

          return (
            <div
              key={option}
              role="presentation"
              onClick={() => selectIndex(index)}
              className="flex cursor-pointer snap-center items-center justify-center select-none transition-[font-size,opacity,color] duration-150"
              style={{
                height: ITEM_HEIGHT,
                color: isSelected ? color : "#475569",
                fontSize: isSelected ? 44 : distance === 1 ? 28 : 21,
                fontWeight: isSelected ? 900 : 700,
                lineHeight: 1,
                opacity: isSelected ? 1 : distance === 1 ? 0.42 : 0.18,
              }}
            >
              {option}
            </div>
          );
        })}
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-30 h-20 rounded-t-[2rem] bg-gradient-to-b from-white to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-20 rounded-b-[2rem] bg-gradient-to-t from-white to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}
