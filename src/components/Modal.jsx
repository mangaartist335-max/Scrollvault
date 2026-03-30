import { useEffect, useRef } from 'react';

const Modal = ({ Icon, title, body, onClose, iconGlow }) => {
  const closeRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="document">
        {Icon ? (
          <div className="appIconTile" style={{ '--icon-glow': iconGlow }}>
            <Icon />
          </div>
        ) : null}
        <p className="eyebrow">Coming soon</p>
        <h3>{title}</h3>
        <p className="muted">{body}</p>
        <button ref={closeRef} className="btn primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;

