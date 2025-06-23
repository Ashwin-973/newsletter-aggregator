import { useState, useEffect, useRef } from 'react';
import { BookmarkIcon, ClockIcon, BookmarkCheck } from 'lucide-react';

export function ContextMenu({ 
  isOpen, 
  position, 
  onClose, 
  newsletter, 
  onBookmark, 
  onReadLater 
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
      document.addEventListener('keydown', handleEscape); //esc key support
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset'; /*how exactly does this restore scroll? */
      
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBookmark = () => {
    onBookmark(newsletter);
    onClose();
  };

  const handleReadLater = () => {
    onReadLater(newsletter);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="!absolute bg-white border border-gray-200 rounded-md shadow-lg py-1 z-1 min-w-[160px]"
      style={{
        left: `${position.x}px`, //what does this actually do? , maybe it aligns it's position wrt click-coordinates
        top: `${position.y}px`,
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' 
      }}
    >
      <button
        onClick={handleBookmark}
        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={newsletter.incomplete} // Disable for incomplete newsletters
      >
        {newsletter.bookmark ? (
          <>
            <BookmarkCheck size={14} />
            Remove from Bookmarks
          </>
        ) : (
          <>
            <BookmarkIcon size={14} />
            Add to Bookmarks
          </>
        )}
      </button>
      
      <button
        onClick={handleReadLater}
        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={newsletter.incomplete} // Disable for incomplete newsletters
      >
        {newsletter.readLater ? (
          <>
            <ClockIcon size={14} />
            Remove from Read Later
          </>
        ) : (
          <>
            <ClockIcon size={14} />
            Add to Read Later
          </>
        )}
      </button>
    </div>
  );
}