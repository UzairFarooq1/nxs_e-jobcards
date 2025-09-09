import React, { useRef, useEffect, useState } from "react";
import { X, RotateCcw } from "lucide-react";

interface SignatureCanvasProps {
  onSave: (signature: string) => void;
  onClose: () => void;
}

export function SignatureCanvas({ onSave, onClose }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size with device pixel ratio for crisper lines
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = 400;
    const displayHeight = 200;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    ctx.scale(dpr, dpr);

    // Set drawing styles
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const getPoint = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if ("touches" in e && e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      }
      const mouse = e as MouseEvent;
      return { x: mouse.clientX - rect.left, y: mouse.clientY - rect.top };
    };

    let isCurrentlyDrawing = false;

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      console.log("Starting to draw");
      isCurrentlyDrawing = true;
      setHasSignature(true);
      const { x, y } = getPoint(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isCurrentlyDrawing) return;
      const { x, y } = getPoint(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      console.log("Drawing at:", x, y);
    };

    const stopDrawing = () => {
      isCurrentlyDrawing = false;
    };

    // Mouse events
    const onMouseDown = (e: MouseEvent) => startDrawing(e);
    const onMouseMove = (e: MouseEvent) => draw(e);
    const onMouseUp = () => stopDrawing();
    const onMouseOut = () => stopDrawing();

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseout", onMouseOut);

    // Touch events
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      startDrawing(e);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      draw(e);
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      stopDrawing();
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseout", onMouseOut);
      canvas.removeEventListener("touchstart", onTouchStart as any);
      canvas.removeEventListener("touchmove", onTouchMove as any);
      canvas.removeEventListener("touchend", onTouchEnd as any);
    };
  }, []); // Remove isDrawing dependency to prevent re-initialization

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("No canvas found");
      return;
    }

    if (!hasSignature) {
      console.log("No signature detected");
      return;
    }

    console.log("Saving signature...");
    const signature = canvas.toDataURL("image/png");
    console.log("Signature data URL length:", signature.length);
    onSave(signature);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Capture Signature
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Please sign in the box below:
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              className="border border-gray-200 rounded cursor-crosshair w-full"
              style={{ touchAction: "none" }}
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={clearCanvas}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </button>
          <button
            onClick={saveSignature}
            disabled={!hasSignature}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Signature
          </button>
        </div>
      </div>
    </div>
  );
}
