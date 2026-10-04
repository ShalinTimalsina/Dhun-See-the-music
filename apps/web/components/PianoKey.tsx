'use client';

import React, { memo } from 'react';

export interface PianoKeyProps {
  index: number;
  note: string;
  type: string;
  keybind: string | undefined;
  isActive: boolean;
  isRoot: boolean;
  isPressed: boolean;
  isFullscreen: boolean;
  /** Left offset in % of the keyboard width (black keys only) */
  leftPct: number;
  /** Width in % of the keyboard width (black keys only) */
  widthPct: number;
  onPress: (index: number) => void;
  onRelease: (index: number) => void;
}

/**
 * One piano key. Memoised so a key press re-renders only that key, not all 61.
 * The outer element is a fixed hit area that never moves; only the inner layer dips,
 * so the pointer can never slip off a key mid-press.
 */
function PianoKeyBase({
  index,
  note,
  type,
  keybind,
  isActive,
  isRoot,
  isPressed,
  isFullscreen,
  leftPct,
  widthPct,
  onPress,
  onRelease,
}: PianoKeyProps) {
  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      onPress(index);
    },
    onPointerUp: () => onRelease(index),
    onPointerLeave: () => onRelease(index),
    onPointerCancel: () => onRelease(index),
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.buttons === 1 && e.pointerType === 'mouse') onPress(index);
    },
  };

  if (type === 'white') {
    return (
      <div
        {...handlers}
        className="group relative z-0 h-full flex-1 cursor-pointer touch-pan-x select-none"
      >
        <div
          className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-end rounded-b-[12px] border-r border-black/10 pb-2 group-active:translate-y-1 group-active:bg-gradient-to-b group-active:from-[#e8e8e8] group-active:to-[#d0d0d0] ${isPressed ? 'translate-y-1 bg-gradient-to-b from-[#e8e8e8] to-[#d0d0d0]' : 'transition-transform duration-[50ms] ease-out'} ${
            isActive
              ? isRoot
                ? 'bg-accent shadow-[inset_0_-4px_10px_rgba(229,149,0,0.4),0_6px_10px_rgba(0,0,0,0.15)]'
                : 'bg-gradient-to-b from-[#ffedb3] to-[#fad880] shadow-[0_6px_10px_rgba(0,0,0,0.15)]'
              : 'bg-gradient-to-b from-white to-[#f4f4f4] shadow-[inset_0_-6px_12px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,1),0_6px_10px_rgba(0,0,0,0.15)]'
          } `}
        >
          {keybind ? (
            <div className="flex w-full flex-col items-center justify-end">
              <span
                className={`${isFullscreen ? 'text-base' : 'text-[10px]'} font-bold ${isActive ? 'text-black' : 'text-gray-400'}`}
              >
                {note}
              </span>
              <span
                className={`${isFullscreen ? 'text-xl' : 'text-xs'} font-bold uppercase ${isActive ? 'text-black' : 'text-gray-400'} mt-1 w-full border-t border-gray-300 pt-1 text-center`}
              >
                {keybind}
              </span>
            </div>
          ) : (
            <span
              className={`${isFullscreen ? 'text-base' : 'text-[10px]'} font-bold ${isActive ? 'text-black' : 'text-gray-400'}`}
            >
              {note}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      {...handlers}
      className="group absolute z-10 h-2/3 -translate-x-1/2 cursor-pointer touch-pan-x select-none"
      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
    >
      <div
        className={`pointer-events-none absolute inset-0 flex flex-col rounded-b-[8px] border border-black group-active:translate-y-1 ${isPressed ? 'translate-y-1' : 'transition-transform duration-[50ms] ease-out'} ${
          isActive
            ? isRoot
              ? 'bg-accent shadow-[inset_0_-6px_10px_rgba(180,100,0,0.8),_0_4px_8px_rgba(0,0,0,0.6)]'
              : 'bg-gradient-to-b from-[#e6a845] to-[#c78b2c] shadow-[inset_0_-6px_10px_rgba(180,100,0,0.5),_0_4px_8px_rgba(0,0,0,0.6)]'
            : 'bg-gradient-to-b from-[#2a2a2a] to-[#0a0a0a] shadow-[inset_0_-8px_15px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.15),0_6px_12px_rgba(0,0,0,0.8)]'
        } `}
      >
        {keybind ? (
          <div className="mb-2 mt-auto flex w-full flex-col items-center justify-end">
            <span className={`text-[8px] font-bold ${isActive ? 'text-black' : 'text-gray-300'}`}>
              {note}
            </span>
            <span
              className={`text-[10px] font-bold uppercase ${isActive ? 'text-black' : 'text-gray-500'} mt-1 w-3/4 border-t border-gray-600/50 pt-1 text-center`}
            >
              {keybind}
            </span>
          </div>
        ) : (
          <span
            className={`mb-2 mt-auto flex justify-center text-[8px] font-bold ${isActive ? 'text-black' : 'text-gray-300'}`}
          >
            {note}
          </span>
        )}
      </div>
    </div>
  );
}

export const PianoKey = memo(PianoKeyBase);
