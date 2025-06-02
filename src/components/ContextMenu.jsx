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

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
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
      className="fixed bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-[160px]"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <button
        onClick={handleBookmark}
        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
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
        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
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