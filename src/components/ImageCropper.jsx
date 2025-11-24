import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const ImageCropper = ({ image, onCrop, onClose, aspectRatio = null, minWidth = 50, minHeight = 20 }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (image && imageRef.current) {
      const img = new window.Image();
      img.onload = () => {
        const container = containerRef.current;
        if (container) {
          const containerWidth = container.clientWidth - 40;
          const containerHeight = container.clientHeight - 100;
          
          const scaleX = containerWidth / img.width;
          const scaleY = containerHeight / img.height;
          const newScale = Math.min(scaleX, scaleY, 1);
          
          setScale(newScale);
          setImageSize({
            width: img.width * newScale,
            height: img.height * newScale,
          });

          // Initialize crop area (center, 150x50 default)
          const defaultWidth = Math.min(150, img.width * newScale);
          const defaultHeight = Math.min(50, img.height * newScale);
          setCrop({
            x: (img.width * newScale - defaultWidth) / 2,
            y: (img.height * newScale - defaultHeight) / 2,
            width: defaultWidth,
            height: defaultHeight,
          });
        }
      };
      img.src = image;
    }
  }, [image]);

  const handleMouseDown = (e) => {
    if (!image) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 20;
    const y = e.clientY - rect.top - 20;

    // Check if clicking inside crop area
    if (
      x >= crop.x &&
      x <= crop.x + crop.width &&
      y >= crop.y &&
      y <= crop.y + crop.height
    ) {
      setIsDragging(true);
      setDragStart({ x: x - crop.x, y: y - crop.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !image) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 20;
    const y = e.clientY - rect.top - 20;

    let newX = x - dragStart.x;
    let newY = y - dragStart.y;

    // Constrain to image bounds
    newX = Math.max(0, Math.min(newX, imageSize.width - crop.width));
    newY = Math.max(0, Math.min(newY, imageSize.height - crop.height));

    setCrop({ ...crop, x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResize = (direction, e) => {
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startCrop = { ...crop };

    const handleMouseMoveResize = (moveE) => {
      const deltaX = (moveE.clientX - startX) / scale;
      const deltaY = (moveE.clientY - startY) / scale;

      let newCrop = { ...startCrop };

      if (direction.includes('right')) {
        newCrop.width = Math.max(minWidth / scale, Math.min(startCrop.width + deltaX, imageSize.width / scale - startCrop.x / scale));
      }
      if (direction.includes('left')) {
        const newWidth = Math.max(minWidth / scale, startCrop.width - deltaX);
        newCrop.x = Math.max(0, startCrop.x + (startCrop.width - newWidth) * scale);
        newCrop.width = newWidth;
      }
      if (direction.includes('bottom')) {
        newCrop.height = Math.max(minHeight / scale, Math.min(startCrop.height + deltaY, imageSize.height / scale - startCrop.y / scale));
      }
      if (direction.includes('top')) {
        const newHeight = Math.max(minHeight / scale, startCrop.height - deltaY);
        newCrop.y = Math.max(0, startCrop.y + (startCrop.height - newHeight) * scale);
        newCrop.height = newHeight;
      }

      // Maintain aspect ratio if specified
      if (aspectRatio) {
        if (direction.includes('right') || direction.includes('left')) {
          newCrop.height = newCrop.width / aspectRatio;
        } else {
          newCrop.width = newCrop.height * aspectRatio;
        }
      }

      setCrop(newCrop);
    };

    const handleMouseUpResize = () => {
      document.removeEventListener('mousemove', handleMouseMoveResize);
      document.removeEventListener('mouseup', handleMouseUpResize);
    };

    document.addEventListener('mousemove', handleMouseMoveResize);
    document.addEventListener('mouseup', handleMouseUpResize);
  };

  const handleCrop = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new window.Image();

    img.onload = () => {
      // Calculate actual crop coordinates in original image
      const actualX = (crop.x / scale);
      const actualY = (crop.y / scale);
      const actualWidth = (crop.width / scale);
      const actualHeight = (crop.height / scale);

      // Set canvas size to crop dimensions
      canvas.width = actualWidth;
      canvas.height = actualHeight;

      // Draw cropped image
      ctx.drawImage(
        img,
        actualX, actualY, actualWidth, actualHeight,
        0, 0, actualWidth, actualHeight
      );

      // Convert to base64
      const croppedImage = canvas.toDataURL('image/png');
      onCrop(croppedImage, Math.round(actualWidth), Math.round(actualHeight));
    };

    img.src = image;
  };

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full my-auto flex flex-col max-h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Crop Logo</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-4 sm:p-5 bg-gray-100 dark:bg-gray-900 flex items-center justify-center min-h-[300px]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="relative" style={{ width: imageSize.width, height: imageSize.height }}>
            <img
              ref={imageRef}
              src={image}
              alt="Crop preview"
              style={{
                width: imageSize.width,
                height: imageSize.height,
                display: 'block',
              }}
              draggable={false}
            />
            
            {/* Crop Overlay */}
            <div
              className="absolute border-2 border-primary shadow-lg"
              style={{
                left: crop.x,
                top: crop.y,
                width: crop.width,
                height: crop.height,
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
            >
              {/* Resize Handles */}
              <div
                className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nwse-resize z-10"
                onMouseDown={(e) => handleResize('top-left', e)}
              />
              <div
                className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-nesw-resize z-10"
                onMouseDown={(e) => handleResize('top-right', e)}
              />
              <div
                className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nesw-resize z-10"
                onMouseDown={(e) => handleResize('bottom-left', e)}
              />
              <div
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-nwse-resize z-10"
                onMouseDown={(e) => handleResize('bottom-right', e)}
              />
            </div>

            {/* Dark Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(to right, 
                  rgba(0,0,0,0.5) 0%, 
                  rgba(0,0,0,0.5) ${(crop.x / imageSize.width) * 100}%, 
                  transparent ${(crop.x / imageSize.width) * 100}%, 
                  transparent ${((crop.x + crop.width) / imageSize.width) * 100}%, 
                  rgba(0,0,0,0.5) ${((crop.x + crop.width) / imageSize.width) * 100}%, 
                  rgba(0,0,0,0.5) 100%),
                  linear-gradient(to bottom, 
                  rgba(0,0,0,0.5) 0%, 
                  rgba(0,0,0,0.5) ${(crop.y / imageSize.height) * 100}%, 
                  transparent ${(crop.y / imageSize.height) * 100}%, 
                  transparent ${((crop.y + crop.height) / imageSize.height) * 100}%, 
                  rgba(0,0,0,0.5) ${((crop.y + crop.height) / imageSize.height) * 100}%, 
                  rgba(0,0,0,0.5) 100%)`,
              }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Size: {Math.round(crop.width / scale)} × {Math.round(crop.height / scale)}px
            </span>
            <span>
              Position: ({Math.round(crop.x / scale)}, {Math.round(crop.y / scale)})
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
          >
            Crop & Save
          </button>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageCropper;
