'use client';

import React from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { generateShapes, getChroma, STANDARD_TUNING } from '@music/core';

export function ChordDiagram() {
  const { selectedRoot, selectedChord } = useCanvasStore();
  const shapes = generateShapes(selectedRoot, selectedChord, STANDARD_TUNING, { maxFret: 5 });
  const shape =
    shapes.length > 0
      ? shapes[0]
      : { frets: [-1, -1, -1, -1, -1, -1], fingers: [-1, -1, -1, -1, -1, -1] };
  const rootChroma = getChroma(selectedRoot);

  const TUNING_CHROMAS = [
    4, // High E (String 1)
    11, // B (String 2)
    7, // G (String 3)
    2, // D (String 4)
    9, // A (String 5)
    4, // Low E (String 6)
  ];

  // Active frets excluding open strings (0) and muted (-1)
  const activeFrets = shape.frets.filter((f) => f > 0);
  const minFret = activeFrets.length > 0 ? Math.min(...activeFrets) : 0;

  // If minFret > 2, we shift the diagram down the neck
  const isShifted = minFret > 2;
  const startFret = isShifted ? minFret - 1 : 1;
  const numFrets = 4;

  const width = 200;
  const height = 240;
  const paddingX = 30;
  const paddingY = 40;

  const stringSpacing = (width - paddingX * 2) / 5;
  const fretSpacing = (height - paddingY * 2) / numFrets;

  return (
    <div className="flex flex-col items-center rounded-xl border border-white/5 bg-[#1a1412] p-6">
      <h4 className="text-muted mb-4 text-sm font-bold uppercase tracking-widest">Chord Shape</h4>

      <svg width={width} height={height} className="text-primary overflow-visible drop-shadow-xl">
        {/* Draw Frets (Horizontal) */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={paddingX}
            y1={paddingY + i * fretSpacing}
            x2={width - paddingX}
            y2={paddingY + i * fretSpacing}
            stroke="currentColor"
            strokeWidth={i === 0 && !isShifted ? 6 : 2}
            opacity={0.3}
          />
        ))}

        {/* Draw Strings (Vertical) */}
        {Array.from({ length: 6 }).map((_, i) => {
          // Reversing because standard diagrams show Low E on the left, High E on the right
          // Our `shape.frets` array has High E at index 0, Low E at index 5.
          const x = paddingX + (5 - i) * stringSpacing;
          return (
            <g key={`string-${i}`}>
              <line
                x1={x}
                y1={paddingY}
                x2={x}
                y2={height - paddingY}
                stroke="currentColor"
                strokeWidth={2}
                opacity={0.3}
              />
              {/* String Name at bottom */}
              <text
                x={x}
                y={height - paddingY + 20}
                fill="currentColor"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                opacity="0.6"
              >
                {['E', 'A', 'D', 'G', 'B', 'e'][5 - i]}
              </text>
            </g>
          );
        })}

        {/* Fret Numbers on the left */}
        {Array.from({ length: numFrets }).map((_, i) => (
          <text
            key={`fret-num-${i}`}
            x={paddingX - 20}
            y={paddingY + (i + 0.5) * fretSpacing + 5}
            fill="currentColor"
            fontSize="14"
            opacity="0.8"
            fontWeight="900"
            textAnchor="end"
          >
            {startFret + i}
          </text>
        ))}

        {/* Draw Dots and X/O */}
        {shape.frets.map((fret, stringIdx) => {
          const stringX = paddingX + (5 - stringIdx) * stringSpacing;

          if (fret === -1) {
            // Muted string (X) above the nut
            return (
              <text
                key={`dot-${stringIdx}`}
                x={stringX}
                y={paddingY - 15}
                fill="#ef4444"
                fontSize="16"
                textAnchor="middle"
                fontWeight="bold"
              >
                X
              </text>
            );
          }

          if (fret === 0) {
            // Open string (O) above the nut
            return (
              <text
                key={`dot-${stringIdx}`}
                x={stringX}
                y={paddingY - 15}
                fill="currentColor"
                fontSize="16"
                textAnchor="middle"
                opacity="0.4"
              >
                O
              </text>
            );
          }

          // Fretted note
          const relativeFret = fret - startFret + 1;
          if (relativeFret > 0 && relativeFret <= numFrets) {
            const dotY = paddingY + (relativeFret - 0.5) * fretSpacing;

            // Check if root
            const chroma = (TUNING_CHROMAS[stringIdx] + fret) % 12;
            const isRoot = chroma === rootChroma;
            const finger = shape.fingers[stringIdx];

            return (
              <g key={`dot-${stringIdx}`}>
                <circle
                  cx={stringX}
                  cy={dotY}
                  r={14}
                  className={isRoot ? 'fill-accent' : 'fill-[#f0f2f0]'}
                  stroke="#1a1412"
                  strokeWidth={3}
                />

                {/* Finger Number */}
                {finger > 0 && (
                  <text
                    x={stringX}
                    y={dotY + 5}
                    fill="#1a1412"
                    fontSize="14"
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    {finger}
                  </text>
                )}
              </g>
            );
          }
          return null;
        })}
      </svg>

      {/* Beginner fingering legend */}
      <div className="text-muted/80 mt-6 flex flex-col gap-1 text-xs">
        <div className="flex w-32 justify-between">
          <span>1</span>
          <span>Index Finger</span>
        </div>
        <div className="flex w-32 justify-between">
          <span>2</span>
          <span>Middle Finger</span>
        </div>
        <div className="flex w-32 justify-between">
          <span>3</span>
          <span>Ring Finger</span>
        </div>
        <div className="flex w-32 justify-between">
          <span>4</span>
          <span>Pinky Finger</span>
        </div>
      </div>
    </div>
  );
}
