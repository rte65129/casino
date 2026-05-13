'use client';
import { useEffect, useState, useMemo } from 'react';

interface RouletteWheelProps {
  result: number | null;
  spinning: boolean;
  onAnimationEnd?: () => void; // Новый проп
}

const NUMBERS = Array.from({ length: 37 }, (_, i) => i);
const DEGREES_PER_NUMBER = 360 / 37;

const getNumberColor = (num: number) => {
  if (num === 0) return '#008000';
  const reds = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  return reds.includes(num) ? '#d32f2f' : '#1a1a1a';
};

export default function RouletteWheel({ result, spinning, onAnimationEnd }: RouletteWheelProps) {
  const [rotation, setRotation] = useState(0);

  const gradientBackground = useMemo(() => {
    let gradientParts: string[] = [];
    let startDeg = 0;
    NUMBERS.forEach((num) => {
      const color = getNumberColor(num);
      const endDeg = startDeg + DEGREES_PER_NUMBER;
      gradientParts.push(`${color} ${startDeg}deg ${endDeg}deg`);
      startDeg = endDeg;
    });
    return `conic-gradient(${gradientParts.join(', ')})`;
  }, []);

  useEffect(() => {
    if (result !== null && spinning) {
      const targetIndex = NUMBERS.indexOf(result);
      const extraTurns = 360 * 5;
      // Целевой угол: чтобы число оказалось сверху (под стрелкой)
      const targetAngle = -(targetIndex * DEGREES_PER_NUMBER);
      
      setRotation(prev => {
        const currentRotation = prev;
        return currentRotation + extraTurns + (360 - (currentRotation % 360)) + targetAngle;
      });

      // === ИСПРАВЛЕНИЕ ===
      // Запускаем таймер ровно тогда, когда начался переход (transition)
      // Время должно совпадать с CSS transition (5000ms)
      const timer = setTimeout(() => {
        if (onAnimationEnd) onAnimationEnd();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [result, spinning, onAnimationEnd]);

  return (
    <div className="relative w-80 h-80 mx-auto mb-8 flex items-center justify-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-20 w-0 h-0 
        border-l-[10px] border-r-[10px] border-t-[20px] border-transparent border-t-white filter drop-shadow-md" />

      <div
        className="w-full h-full rounded-full border-4 border-gray-600 overflow-hidden relative"
        style={{
          background: gradientBackground,
          transform: `rotate(${rotation}deg)`,
          // Убедитесь, что время здесь (5s) совпадает с таймером выше (5000ms)
          transition: spinning ? 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-800 rounded-full z-10 border-4 border-gray-500 flex items-center justify-center">
             <div className="w-8 h-8 bg-gray-700 rounded-full" />
        </div>

        {NUMBERS.map((num) => {
          const angle = num * DEGREES_PER_NUMBER;
          const textAngle = angle + (DEGREES_PER_NUMBER / 2); 
          return (
            <div
              key={num}
              className="absolute top-0 left-0 w-full h-full text-center pt-4"
              style={{ transform: `rotate(${textAngle}deg)`, transformOrigin: 'center center' }}
            >
              <span className="inline-block text-xs font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                style={{ transform: 'translateY(12px)' }}>
                {num}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}