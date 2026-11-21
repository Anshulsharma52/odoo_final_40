import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check } from 'lucide-react';

const SignaturePad = ({ onSave, initialSignature }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (onSave) {
        onSave(canvas.toDataURL('image/png'));
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    if (onSave) onSave(null);
  };

  return (
    <div className="border border-slate-300 rounded-xl p-3 bg-slate-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          ✍️ Customer Digital Signature
        </span>
        <button
          type="button"
          onClick={clearCanvas}
          className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={480}
        height={140}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-36 bg-white border border-dashed border-slate-300 rounded-lg cursor-crosshair touch-none shadow-inner"
      />
      <div className="mt-1 flex justify-between text-[11px] text-slate-400">
        <span>Draw signature above with mouse or touch screen</span>
        {hasDrawn && <span className="text-emerald-600 font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Signed</span>}
      </div>
    </div>
  );
};

export default SignaturePad;
