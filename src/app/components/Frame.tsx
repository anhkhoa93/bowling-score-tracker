"use client";

import { memo } from 'react';

// Constants
const MAX_POINTS = 10;

interface FrameProps {
  frame: number[];
  frameIndex: number;
  isCurrentFrame?: boolean;
}

const Frame = memo(function Frame({ frame, frameIndex, isCurrentFrame = false }: FrameProps) {
  const isStrike = (pins: number) => pins === MAX_POINTS;
  const isSpare = (first: number, second: number) => first + second === MAX_POINTS && first !== MAX_POINTS;
  
  // Get display values for the frame
  const getDisplayValues = (): string[] => {
    const display = [];
    
    // First throw
    if (isStrike(frame[0])) {
      display.push('X'); // Strike
      if (frameIndex < 9) {
        display.push('-'); // No second throw needed for strikes in frames 1-9
        return display;
      }
    } else {
      display.push(frame[0].toString());
    }

    // Second throw
    if (isStrike(frame[1])) {
      display.push('X'); // Strike (only in 10th frame)
    } else if (isSpare(frame[0], frame[1])) {
      display.push('/'); // Spare
    } else {
      display.push(frame[1].toString());
    }

    // Third throw (only in 10th frame)
    if (frameIndex === 9 && frame.length > 2) {
      if (isStrike(frame[2])) {
        display.push('X');
      } else {
        display.push(frame[2].toString());
      }
    }

    return display;
  };

  const displayValues = getDisplayValues();

  return (
    <div 
      className={`border border-gray-300 rounded-lg p-2 bg-white ${isCurrentFrame ? 'bg-yellow-200' : ''}`} 
      data-testid={`frame-${frameIndex}`}
    >
      <div className="flex items-center justify-between">
        {displayValues.map((value, index) => (
          <span 
            key={index}
            className={`${value === 'X' ? 'text-red-600 font-bold' : value === '/' ? 'text-blue-600 font-bold' : ''}`}
            data-testid={`frame-${frameIndex}-value-${index}`}
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
});

export default Frame;