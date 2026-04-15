import { type ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-[430px] max-h-[85vh] bg-[#12122a] rounded-t-2xl overflow-y-auto">
        <div className="sticky top-0 bg-[#12122a] flex items-center justify-between px-4 py-3 border-b border-[#2a2a44]">
          <h2 className="text-[13px] font-medium text-[#e8e8ff]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#8888aa] text-lg leading-none p-1"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
