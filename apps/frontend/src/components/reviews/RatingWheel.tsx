"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
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

const ITEM_HEIGHT = 56;
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
  const isUserScrollingRef = useRef(false);
  const values = useMemo(
    () =>
      Array.from(
        { length: Math.floor((max - min) / step) + 1 },
        (_, index) => min + index * step
      ),
    [max, min, step]
  );
  const selectedIndex = clamp(Math.round((value - min) / step), 0, values.length - 1);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior) => {
    scrollerRef.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior });
  }, []);

  useEffect(() => {
    if (!isUserScrollingRef.current) {
      scrollToIndex(selectedIndex, "auto");
    }
  }, [scrollToIndex, selectedIndex]);

  useEffect(
    () => () => {
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }
    },
    []
  );

  const selectIndex = (index: number, behavior: ScrollBehavior = "smooth") => {
    const nextIndex = clamp(index, 0, values.length - 1);
    isUserScrollingRef.current = false;
    onChange(values[nextIndex]);
    scrollToIndex(nextIndex, behavior);
  };

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    isUserScrollingRef.current = true;
    const nextIndex = clamp(Math.round(scroller.scrollTop / ITEM_HEIGHT), 0, values.length - 1);
    const nextValue = values[nextIndex];

    if (nextValue !== value) {
      onChange(nextValue);
    }

    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
    }

    snapTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
      scrollToIndex(nextIndex, "smooth");
    }, SNAP_DELAY_MS);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowUp" || event.key === "ArrowRight") nextIndex = selectedIndex + 1;
    if (event.key === "ArrowDown" || event.key === "ArrowLeft") nextIndex = selectedIndex - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = values.length - 1;

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
      className="relative w-full max-w-[17rem] rounded-[2rem] bg-white outline-none ring-offset-4 focus-visible:ring-2"
      style={{ boxShadow: `0 18px 50px ${color}1F`, outlineColor: color }}
    >
      <div
        className="pointer-events-none absolute inset-x-4 top-1/2 z-10 h-14 -translate-y-1/2 rounded-xl border-y-2"
        style={{ borderColor: color, backgroundColor: surfaceColor }}
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
                fontSize: isSelected ? 42 : distance === 1 ? 26 : 20,
                fontWeight: isSelected ? 900 : 700,
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
