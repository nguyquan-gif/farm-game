import { useEffect, useRef } from "react";
import Icon from "./Icon.jsx";
import Feedback from "./Feedback.jsx";
export default function BottomSheet({
  title,
  subtitle,
  children,
  onClose,
  feedback,
}) {
  const ref = useRef(null),
    startY = useRef(0),
    offset = useRef(0);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
      dialog.close();
    };
  }, []);
  const endDrag = () => {
    if (offset.current > 90) onClose();
    if (ref.current) ref.current.style.transform = "";
    offset.current = 0;
  };
  return (
    <dialog
      ref={ref}
      className="bottom-sheet"
      aria-labelledby="sheet-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const rect = ref.current.getBoundingClientRect();
          if (
            e.clientY < rect.top ||
            e.clientX < rect.left ||
            e.clientX > rect.right
          )
            onClose();
        }
      }}
    >
      <div
        className="sheet-grip"
        onPointerDown={(e) => {
          startY.current = e.clientY;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            offset.current = Math.max(0, e.clientY - startY.current);
            ref.current.style.transform = `translateY(${offset.current}px)`;
          }
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span />
      </div>
      <header className="sheet-header">
        <div>
          <p className="eyebrow">{subtitle || "Green Valley"}</p>
          <h2 id="sheet-title">{title}</h2>
        </div>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Đóng bảng"
        >
          <Icon name="close" />
        </button>
      </header>
      <div className="sheet-content">{children}</div>
      <Feedback feedback={feedback} />
    </dialog>
  );
}
