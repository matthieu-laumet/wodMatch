// components/InputText.jsx
export default function InputText({ 
  label, name, register, errors, type = "text", inputMode = null, placeholder, className, inputClassName, labelClassName,
}) {
  return (
    <div className={`flex flex-col gap-1 ${className || ''}`}>
      {label && (
        <label className={`font-semibold text-sm ${labelClassName || ''}`}>
          {label}
        </label>
      )}
      <input
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        {...register(name)}
        className={`border rounded-lg px-4 py-3 text-[#222] text-base outline-none transition-colors
          ${errors?.[name] ? 'border-[#df0000]' : 'border-[#ccc]'}
          ${inputClassName || ''}
        `}
      />
      {errors?.[name] && (
        <p className="text-[#df0000] text-sm">{errors[name].message}</p>
      )}
    </div>
  )
}