'use client';

import React, { useEffect, useRef } from 'react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 128,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [value, size]);

  const generateQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;
    
    // Белый фон
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    // Генерируем простой паттерн на основе значения
    const moduleSize = size / 21;
    ctx.fillStyle = '#000000';
    
    const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Рисуем паттерн
    for (let i = 0; i < 21; i++) {
      for (let j = 0; j < 21; j++) {
        const shouldFill = ((i + j + hash) % 3) === 0;
        if (shouldFill) {
          ctx.fillRect(j * moduleSize, i * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    // Finder patterns по углам
    drawCorner(ctx, 0, 0, moduleSize);
    drawCorner(ctx, 14 * moduleSize, 0, moduleSize);
    drawCorner(ctx, 0, 14 * moduleSize, moduleSize);
    
    // Логотип в центре
    const logoSize = moduleSize * 3;
    const logoX = (size - logoSize) / 2;
    const logoY = (size - logoSize) / 2;
    
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(logoX, logoY, logoSize, logoSize);
    
    ctx.fillStyle = 'white';
    ctx.font = `bold ${logoSize/2}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('SP', logoX + logoSize/2, logoY + logoSize*0.7);
  };

  const drawCorner = (ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
  };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: size }}
    />
  );
};

export default QRCodeGenerator; 
 