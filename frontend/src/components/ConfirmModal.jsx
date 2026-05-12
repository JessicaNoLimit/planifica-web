import { useEffect } from 'react';

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCancel();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className="confirm-modal-overlay" onClick={onCancel} role="presentation">
      <section
        aria-modal="true"
        className="confirm-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="confirm-modal-actions">
          <button className="secondary-button" onClick={onCancel} type="button">
            {cancelText}
          </button>
          <button className="danger-button" onClick={onConfirm} type="button">
            {confirmText}
          </button>
        </div>
      </section>
    </div>
  );
}
