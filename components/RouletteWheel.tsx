'use client';
import { useEffect, useState, useRef } from 'react';
import { getColor } from '@/utils/roulette';

interface RouletteWheelProps {
  result: number | null;
  spinning: boolean;
}

const NUMBERS = Array.from({ length: 37 }, (_, i) => i);
const DEGREES_PER_NUMBER = 360 / 37;

export default function RouletteWheel({ result, spinning }: RouletteWheelProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (result !== null && spinning) {
      const targetIndex = NUMBERS.indexOf(result);
      const extraTurns = 360 * 5;
      const targetAngle = 360 - targetIndex * DEGREES_PER_NUMBER;
      setRotation(prev => {
        const remainder = prev % 360;
        return prev - remainder + extraTurns + targetAngle;
      });
      console.log('Запуск вращения к числу', result);
    }
  }, [result, spinning]);

  return (
    <div className="relative w-80 h-80 mx-auto mb-8">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10 w-0 h-0 
        border-l-8 border-r-8 border-t-8 border-transparent border-t-white" />
      <div
        className="w-full h-full rounded-full border-4 border-gray-600 overflow-hidden"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? 'transform 5s ease-out' : 'none',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {NUMBERS.map((num, i) => {
            const angle = DEGREES_PER_NUMBER * i - 90;
            const color = getColor(num);
            return (
              <div
                key={num}
                className="absolute w-full h-full top-0 left-0 flex items-start justify-center"
                style={{
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: 'center center',
                }}
              >
                <div
                  className="w-0 h-0 border-l-20 border-r-20 border-b-150 border-l-transparent border-r-transparent"
                  style={{ borderBottomColor: color, marginTop: '10px' }}
                />
                <span className="absolute top-12 text-xs font-bold text-white drop-shadow-lg">
                  {num}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}