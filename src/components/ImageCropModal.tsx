import React, { useState, useRef, useEffect } from 'react';
import { Crop, X, Check, RotateCw, RefreshCw, Move, HelpCircle } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onApplyCrop: (croppedDataUrl: string) => void;
}

interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

type DragHandle = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e' | 'create';

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageUrl,
  onClose,
  onApplyCrop,
}) => {
  const [currentImgSrc, setCurrentImgSrc] = useState<string>(imageUrl);
  const [cropBox, setCropBox] = useState<CropBox>({ x: 20, y: 20, width: 200, height: 150 });
  const [imgDisplaySize, setImgDisplaySize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [imgNaturalSize, setImgNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);
  const [activeHandle, setActiveHandle] = useState<DragHandle | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    initialBox: CropBox;
  } | null>(null);

  // Initialize or reset when modal opens or initial image changes
  useEffect(() => {
    if (isOpen) {
      setCurrentImgSrc(imageUrl);
      setIsReady(false);
    }
  }, [isOpen, imageUrl]);

  // When image loads or resizes, calculate initial crop box
  const handleImageLoaded = () => {
    const img = imageRef.current;
    if (!img) return;

    const naturalW = img.naturalWidth || 800;
    const naturalH = img.naturalHeight || 600;
    const dispW = img.clientWidth;
    const dispH = img.clientHeight;

    setImgNaturalSize({ width: naturalW, height: naturalH });
    setImgDisplaySize({ width: dispW, height: dispH });

    // Center a 16:10 selection box inside the displayed image matching post proportions
    const targetRatio = 16 / 10;
    let initialW = Math.round(dispW * 0.92);
    let initialH = Math.round(initialW / targetRatio);
    if (initialH > dispH * 0.92) {
      initialH = Math.round(dispH * 0.92);
      initialW = Math.round(initialH * targetRatio);
    }
    const initialX = Math.round((dispW - initialW) / 2);
    const initialY = Math.round((dispH - initialH) / 2);

    setCropBox({
      x: Math.max(0, initialX),
      y: Math.max(0, initialY),
      width: Math.max(40, initialW),
      height: Math.max(40, initialH),
    });
    setIsReady(true);
  };

  // Recompute display size on window resize
  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current && isReady) {
        const dispW = imageRef.current.clientWidth;
        const dispH = imageRef.current.clientHeight;
        if (dispW > 0 && dispH > 0 && (dispW !== imgDisplaySize.width || dispH !== imgDisplaySize.height)) {
          const factorX = dispW / (imgDisplaySize.width || dispW);
          const factorY = dispH / (imgDisplaySize.height || dispH);
          setImgDisplaySize({ width: dispW, height: dispH });
          setCropBox((prev) => ({
            x: Math.round(prev.x * factorX),
            y: Math.round(prev.y * factorY),
            width: Math.min(dispW, Math.round(prev.width * factorX)),
            height: Math.min(dispH, Math.round(prev.height * factorY)),
          }));
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isReady, imgDisplaySize]);

  if (!isOpen) return null;

  // Pointer down on a handle or crop area
  const startDrag = (e: React.PointerEvent, handle: DragHandle) => {
    e.preventDefault();
    e.stopPropagation();

    setActiveHandle(handle);
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      initialBox: { ...cropBox },
    };

    if (wrapperRef.current) {
      try {
        wrapperRef.current.setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Pointer down on unselected area to start new box selection
  const handleWrapperPointerDown = (e: React.PointerEvent) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    setActiveHandle('create');
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      initialBox: { x: clickX, y: clickY, width: 0, height: 0 },
    };
    setCropBox({ x: clickX, y: clickY, width: 20, height: 20 });

    try {
      wrapperRef.current.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeHandle || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;
    const { initialBox } = dragStartRef.current;
    const maxW = imgDisplaySize.width;
    const maxH = imgDisplaySize.height;
    const minSize = 35;

    if (activeHandle === 'move') {
      let newX = initialBox.x + dx;
      let newY = initialBox.y + dy;
      // Clamp inside image bounds
      newX = Math.max(0, Math.min(maxW - initialBox.width, newX));
      newY = Math.max(0, Math.min(maxH - initialBox.height, newY));
      setCropBox({
        ...initialBox,
        x: newX,
        y: newY,
      });
      return;
    }

    if (activeHandle === 'create') {
      const currentX = Math.max(0, Math.min(maxW, initialBox.x + dx));
      const currentY = Math.max(0, Math.min(maxH, initialBox.y + dy));
      const left = Math.min(initialBox.x, currentX);
      const top = Math.min(initialBox.y, currentY);
      const width = Math.max(minSize, Math.abs(currentX - initialBox.x));
      const height = Math.max(minSize, Math.abs(currentY - initialBox.y));

      setCropBox({
        x: Math.min(maxW - width, left),
        y: Math.min(maxH - height, top),
        width: Math.min(maxW - left, width),
        height: Math.min(maxH - top, height),
      });
      return;
    }

    let { x, y, width, height } = initialBox;

    // NW (top-left)
    if (activeHandle === 'nw') {
      const newX = Math.max(0, Math.min(initialBox.x + initialBox.width - minSize, initialBox.x + dx));
      const newY = Math.max(0, Math.min(initialBox.y + initialBox.height - minSize, initialBox.y + dy));
      width = initialBox.x + initialBox.width - newX;
      height = initialBox.y + initialBox.height - newY;
      x = newX;
      y = newY;
    }

    // NE (top-right)
    if (activeHandle === 'ne') {
      const newY = Math.max(0, Math.min(initialBox.y + initialBox.height - minSize, initialBox.y + dy));
      width = Math.max(minSize, Math.min(maxW - initialBox.x, initialBox.width + dx));
      height = initialBox.y + initialBox.height - newY;
      y = newY;
    }

    // SW (bottom-left)
    if (activeHandle === 'sw') {
      const newX = Math.max(0, Math.min(initialBox.x + initialBox.width - minSize, initialBox.x + dx));
      width = initialBox.x + initialBox.width - newX;
      height = Math.max(minSize, Math.min(maxH - initialBox.y, initialBox.height + dy));
      x = newX;
    }

    // SE (bottom-right)
    if (activeHandle === 'se') {
      width = Math.max(minSize, Math.min(maxW - initialBox.x, initialBox.width + dx));
      height = Math.max(minSize, Math.min(maxH - initialBox.y, initialBox.height + dy));
    }

    // N (top edge)
    if (activeHandle === 'n') {
      const newY = Math.max(0, Math.min(initialBox.y + initialBox.height - minSize, initialBox.y + dy));
      height = initialBox.y + initialBox.height - newY;
      y = newY;
    }

    // S (bottom edge)
    if (activeHandle === 's') {
      height = Math.max(minSize, Math.min(maxH - initialBox.y, initialBox.height + dy));
    }

    // W (left edge)
    if (activeHandle === 'w') {
      const newX = Math.max(0, Math.min(initialBox.x + initialBox.width - minSize, initialBox.x + dx));
      width = initialBox.x + initialBox.width - newX;
      x = newX;
    }

    // E (right edge)
    if (activeHandle === 'e') {
      width = Math.max(minSize, Math.min(maxW - initialBox.x, initialBox.width + dx));
    }

    setCropBox({ x, y, width, height });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeHandle) {
      setActiveHandle(null);
      dragStartRef.current = null;
      if (wrapperRef.current) {
        try {
          wrapperRef.current.releasePointerCapture(e.pointerId);
        } catch {}
      }
    }
  };

  // Rotate image by 90 degrees on a temporary canvas
  const handleRotate = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      const rotatedUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCurrentImgSrc(rotatedUrl);
    };
    img.src = currentImgSrc;
  };

  // Reset to original image & 16:10 centered crop
  const handleReset = () => {
    setCurrentImgSrc(imageUrl);
    if (imageRef.current) {
      const dispW = imageRef.current.clientWidth;
      const dispH = imageRef.current.clientHeight;
      const targetRatio = 16 / 10;
      let initialW = Math.round(dispW * 0.92);
      let initialH = Math.round(initialW / targetRatio);
      if (initialH > dispH * 0.92) {
        initialH = Math.round(dispH * 0.92);
        initialW = Math.round(initialH * targetRatio);
      }
      setCropBox({
        x: Math.max(0, Math.round((dispW - initialW) / 2)),
        y: Math.max(0, Math.round((dispH - initialH) / 2)),
        width: initialW,
        height: initialH,
      });
    }
  };

  // Quick preset: force exact 16:10 post ratio selection
  const handleSnap16_10 = () => {
    if (imageRef.current) {
      const dispW = imageRef.current.clientWidth;
      const dispH = imageRef.current.clientHeight;
      const targetRatio = 16 / 10;
      let initialW = Math.round(dispW * 0.92);
      let initialH = Math.round(initialW / targetRatio);
      if (initialH > dispH * 0.92) {
        initialH = Math.round(dispH * 0.92);
        initialW = Math.round(initialH * targetRatio);
      }
      setCropBox({
        x: Math.max(0, Math.round((dispW - initialW) / 2)),
        y: Math.max(0, Math.round((dispH - initialH) / 2)),
        width: initialW,
        height: initialH,
      });
    }
  };

  // Crop and output high quality image data URL
  const handleApply = () => {
    const img = imageRef.current;
    if (!img || imgDisplaySize.width <= 0 || imgDisplaySize.height <= 0) return;

    try {
      const scaleX = imgNaturalSize.width / imgDisplaySize.width;
      const scaleY = imgNaturalSize.height / imgDisplaySize.height;

      const sourceX = Math.max(0, cropBox.x * scaleX);
      const sourceY = Math.max(0, cropBox.y * scaleY);
      const sourceW = Math.min(imgNaturalSize.width - sourceX, cropBox.width * scaleX);
      const sourceH = Math.min(imgNaturalSize.height - sourceY, cropBox.height * scaleY);

      if (sourceW <= 0 || sourceH <= 0) return;

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(sourceW);
      canvas.height = Math.round(sourceH);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceW,
        sourceH,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.94);
      onApplyCrop(croppedDataUrl);
      onClose();
    } catch (err) {
      console.error('Error applying crop:', err);
      onClose();
    }
  };

  if (!isOpen || !imageUrl || !currentImgSrc) {
    return null;
  }

  return (
    <div
      id="modal-image-crop"
      className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Recortar imagen</h3>
              <p className="text-[11px] text-slate-500">Selecciona el recuadro que deseas conservar</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stage Container displaying original image with selectable crop rectangle */}
        <div className="p-3 sm:p-4 bg-slate-950 flex flex-col items-center justify-center select-none overflow-hidden min-h-[280px] sm:min-h-[340px] max-h-[58vh]">
          <div
            ref={wrapperRef}
            onPointerDown={handleWrapperPointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative inline-block touch-none select-none overflow-hidden max-w-full"
            style={{ cursor: activeHandle ? 'crosshair' : 'crosshair' }}
          >
            {/* Original Image */}
            {currentImgSrc ? (
              <img
                ref={imageRef}
                src={currentImgSrc}
                alt="Imagen original a recortar"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onLoad={handleImageLoaded}
                className="max-h-[50vh] max-w-full w-auto h-auto object-contain block select-none pointer-events-none rounded-xs"
              />
            ) : null}

            {/* Dark Mask around the selected crop box */}
            {isReady && (
              <>
                {/* Top shaded area */}
                <div
                  className="absolute left-0 top-0 w-full bg-black/65 pointer-events-none"
                  style={{ height: Math.max(0, cropBox.y) }}
                />
                {/* Bottom shaded area */}
                <div
                  className="absolute left-0 w-full bg-black/65 pointer-events-none"
                  style={{
                    top: Math.max(0, cropBox.y + cropBox.height),
                    bottom: 0,
                  }}
                />
                {/* Left shaded area */}
                <div
                  className="absolute left-0 bg-black/65 pointer-events-none"
                  style={{
                    top: Math.max(0, cropBox.y),
                    width: Math.max(0, cropBox.x),
                    height: Math.max(0, cropBox.height),
                  }}
                />
                {/* Right shaded area */}
                <div
                  className="absolute right-0 bg-black/65 pointer-events-none"
                  style={{
                    top: Math.max(0, cropBox.y),
                    left: Math.max(0, cropBox.x + cropBox.width),
                    height: Math.max(0, cropBox.height),
                  }}
                />

                {/* THE MOVABLE & RESIZABLE CROP BOX */}
                <div
                  onPointerDown={(e) => startDrag(e, 'move')}
                  className="absolute border-2 border-emerald-400 shadow-sm cursor-move touch-none group"
                  style={{
                    left: cropBox.x,
                    top: cropBox.y,
                    width: cropBox.width,
                    height: cropBox.height,
                  }}
                >
                  {/* Rule of thirds grid lines */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div />
                  </div>

                  {/* Corner indicator / badge */}
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 text-emerald-400 text-[10px] font-bold pointer-events-none flex items-center gap-1 backdrop-blur-xs">
                    <Move className="w-2.5 h-2.5" />
                    <span>Mover</span>
                  </div>

                  {/* 4 Corner Resize Handles */}
                  {/* NW (Top-Left) */}
                  <div
                    onPointerDown={(e) => startDrag(e, 'nw')}
                    className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-sm shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
                    title="Ajustar esquina superior izquierda"
                  />
                  {/* NE (Top-Right) */}
                  <div
                    onPointerDown={(e) => startDrag(e, 'ne')}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-sm shadow-md cursor-nesw-resize hover:scale-125 transition-transform"
                    title="Ajustar esquina superior derecha"
                  />
                  {/* SW (Bottom-Left) */}
                  <div
                    onPointerDown={(e) => startDrag(e, 'sw')}
                    className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-sm shadow-md cursor-nesw-resize hover:scale-125 transition-transform"
                    title="Ajustar esquina inferior izquierda"
                  />
                  {/* SE (Bottom-Right) */}
                  <div
                    onPointerDown={(e) => startDrag(e, 'se')}
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-sm shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
                    title="Ajustar esquina inferior derecha"
                  />

                  {/* 4 Edge Resize Handles */}
                  {/* N (Top Edge) */}
                  <div
                    onPointerDown={(e) => startDrag(e, 'n')}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-7 h-2.5 bg-white/90 border border-emerald-600 rounded-full shadow-xs cursor-ns-resize hover:scale-110 transition-transform"
                  />
                  {/* S (Bottom Edge) */}
                  <div
                    onPointerDown={(e) => startDrag(e, 's')}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-7 h-2.5 bg-white/90 border border-emerald-600 rounded-full shadow-xs cursor-ns-resize hover:scale-110 transition-transform"
                  />
                  {/* W (Left Edge) */}
                  <div
                    onPointerDown={(e) => startDrag(e, 'w')}
                    className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-7 bg-white/90 border border-emerald-600 rounded-full shadow-xs cursor-ew-resize hover:scale-110 transition-transform"
                  />
                  {/* E (Right Edge) */}
                  <div
                    onPointerDown={(e) => startDrag(e, 'e')}
                    className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-7 bg-white/90 border border-emerald-600 rounded-full shadow-xs cursor-ew-resize hover:scale-110 transition-transform"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Toolbar & Instructions */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="hidden sm:inline">Arrastra el recuadro o sus bordes para cambiar tamaño</span>
            <span className="sm:hidden">Arrastra para mover o recortar</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Format 16:10 button */}
            <button
              type="button"
              id="btn-crop-format-16-10"
              onClick={handleSnap16_10}
              className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-2xs active:scale-95"
              title="Ajustar selección exacta al formato estándar de publicación (16:10)"
            >
              <span>16:10 Post</span>
            </button>

            {/* Rotate Button */}
            <button
              type="button"
              id="btn-crop-rotate"
              onClick={handleRotate}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
              title="Rotar imagen 90°"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Rotar</span>
            </button>

            {/* Reset Button */}
            <button
              type="button"
              id="btn-crop-reset"
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-medium text-xs flex items-center gap-1 transition cursor-pointer shadow-2xs active:scale-95"
              title="Restablecer selección inicial"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-confirm-crop"
            onClick={handleApply}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar recorte</span>
          </button>
        </div>
      </div>
    </div>
  );
};
