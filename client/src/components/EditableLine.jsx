import { useEffect, useRef, useState } from "react";

export default function EditableLine({ 
  label, value, onSave, type = 'text', className = '', isActive, onToggle, inputMode = 'text',
  onClick
}) {
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    if (isActive) {
      inputRef.current?.focus();
    }
  }, [isActive]);

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      await onSave(inputValue);
      onToggle(); // ferme seulement si onSave s'est bien passé
    } catch {
      // reste ouvert
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // empêche la soumission du form parent
      handleSave(e);
    }
  };

  return (
    <div className={`full-line-container ${isActive ? 'active' : ''} ${className}`} onClick={onClick}>
      <div className="full-line" onClick={onToggle}>
        <p className="label">{label}</p>
        <div className="flex items-center ml-4 min-w-0">
          {(!isActive && value) && (
            <p className="text-sm font-regular truncate">{value}</p>
          )}
          <i className={`bi bi-chevron-${!isActive ? 'right' : 'down'} ml-2 text-sm flex-shrink-0`}></i>
        </div>
      </div>
      <div className="input-section flex items-center gap-2 py-3">
        <input
          type={type}
          ref={inputRef}
          inputMode={inputMode}
          value={inputValue}
          onKeyDown={handleKeyDown}
          onChange={(e) => setInputValue(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="editable-input"
        />
        <button
          onClick={handleSave}
          className="text-sm font-semibold text-white bg-black rounded-lg px-4 py-3 flex-shrink-0"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}