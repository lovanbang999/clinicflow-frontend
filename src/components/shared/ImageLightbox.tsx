'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { XIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon, DownloadSimpleIcon } from '@phosphor-icons/react';
import Image from 'next/image';

interface ImageLightboxProps {
  url: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ url, alt = 'Image', isOpen, onClose }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleClose = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.5, 0.5));

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow drag if left clicking and not clicking buttons
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel to zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Top action bar */}
      <div className="absolute top-0 left-0 right-0 p-5 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 to-transparent">
        <button
          onClick={onClose}
          className="p-2.5 bg-white/10 hover:bg-white/25 text-white rounded-full transition-colors backdrop-blur-md"
          title="Đóng (Esc)"
        >
          <XIcon size={24} weight="bold" />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleZoomOut} className="p-2.5 bg-white/10 hover:bg-white/25 text-white rounded-full transition-colors backdrop-blur-md" title="Thu nhỏ">
            <MagnifyingGlassMinusIcon size={22} weight="bold" />
          </button>
          <span className="text-white text-[15px] font-medium w-14 text-center select-none shadow-sm">
            {Math.round(scale * 100)}%
          </span>
          <button onClick={handleZoomIn} className="p-2.5 bg-white/10 hover:bg-white/25 text-white rounded-full transition-colors backdrop-blur-md" title="Phóng to">
            <MagnifyingGlassPlusIcon size={22} weight="bold" />
          </button>
          <div className="w-[1.5px] h-6 bg-white/20 mx-2 rounded-full" />
          <a
            href={url}
            download
            target="_blank"
            rel="noreferrer"
            className="p-2.5 bg-white/10 hover:bg-white/25 text-white rounded-full transition-colors backdrop-blur-md"
            title="Tải xuống ảnh gốc"
          >
            <DownloadSimpleIcon size={22} weight="bold" />
          </a>
        </div>
      </div>

      {/* Image container */}
      <div
        className={cn(
          "w-full h-full flex items-center justify-center overflow-hidden outline-none select-none",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <Image
          src={url}
          alt={alt}
          width={1920}
          height={1080}
          className="max-w-none max-h-none shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] transition-transform ease-out pointer-events-none rounded-sm"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transitionDuration: isDragging ? '0ms' : '200ms',
            maxHeight: scale === 1 ? '90vh' : 'none',
            maxWidth: scale === 1 ? '90vw' : 'none',
          }}
          draggable={false}
        />
      </div>
    </div>,
    document.body
  );
}
