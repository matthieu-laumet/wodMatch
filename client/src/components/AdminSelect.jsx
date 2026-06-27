import { useState } from 'react';
import { Controller } from 'react-hook-form';
import Select, { components } from 'react-select';

function AdminSelect({ 
  control, options, name, classContainer, classLabel, classSelect, placeholder, classNamePrefix, label, isOptionnal, defaultValue,
  scrollToValue, tooltipLabel,
  noLabel, noClear, isMulti, required, optionPersonnalize, SingleValue, focus, setFocus, tooltip, handleSelect, extraInfo,
  disabled = false, onlyOpenInSearch = false
 }) {

  const [inputText, setInputText] = useState('');
  const [menuIsOpen, setMenuIsOpen] = useState(undefined);

  const scrollTopOnSelect = () => {
    if (scrollToValue !== undefined) {
      setTimeout(() => {
        window.scrollTo({ top: scrollToValue, left: 0, behavior: "smooth" });
      }, 100);
    }
  }

  const MenuList = ({ children, ...props }) => {
    const { maxOptions } = props.selectProps;
    return (
      <components.MenuList {...props}>
        {Array.isArray(children) ? children.slice(0, maxOptions) : children}
      </components.MenuList>
    );
  };

  // NoOptionsMessage uniquement pour onlyOpenInSearch
  const NoOptionsMessage = (props) => {
    if (inputText.length < 1) return null;
    return (
      <components.NoOptionsMessage {...props}>
        Aucune option trouvée
      </components.NoOptionsMessage>
    );
  };

  const handleFocus = (menuIsOpen) => {
    setFocus && setFocus(menuIsOpen);
  }

  const handleInputChange = (newValue, actionMeta) => {
    if (!onlyOpenInSearch) return newValue;
    if (actionMeta.action === 'input-change') {
      setInputText(newValue);
      if (menuIsOpen === false || menuIsOpen === undefined) setMenuIsOpen(true);
    }
    return newValue;
  };

  const handleMenuOpen = () => {
    if (onlyOpenInSearch) setMenuIsOpen(true);
  };

  const handleMenuClose = () => {
    if (onlyOpenInSearch) {
      setMenuIsOpen(false);
      setInputText('');
    }
  };

  // Filtre les options selon l'input si onlyOpenInSearch
  const getOptions = () => {
    if (!onlyOpenInSearch || inputText.length === 0) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(inputText.toLowerCase())
    ).slice(0, 100);
  };

  return(
    <Controller
      name={name} control={control} defaultValue={defaultValue || ''}
      rules={{ required: required ? 'Ce champ est requis' : false }}
      render={({ field, fieldState }) => {
        return (
          <div className={classContainer}>
            <div className="d-flex"></div>
            {!noLabel && 
              <p className={classLabel}>{label}
                {(isOptionnal || extraInfo) && <span className="optionnal">({extraInfo || 'optionnel'})</span>}
              </p>
            }
            <Select
              {...field}
              components={
                onlyOpenInSearch
                  ? { ...(optionPersonnalize ? { Option: optionPersonnalize, SingleValue } : {}), MenuList, NoOptionsMessage }
                  : { ...(optionPersonnalize ? { Option: optionPersonnalize, SingleValue } : {}), MenuList }
              }
              isMulti={isMulti}
              maxOptions={70}
              disabled={disabled}
              options={getOptions()}
              className={`${classSelect} ${fieldState.error ? 'mb-8 error-border-select' : ''}`}
              classNamePrefix={classNamePrefix}
              isSearchable={true}
              isClearable={!noClear}
              placeholder={placeholder}
              // Props spécifiques à onlyOpenInSearch
              {...(onlyOpenInSearch && {
                menuIsOpen: inputText.length > 0 && menuIsOpen,
                onInputChange: handleInputChange,
                onMenuOpen: handleMenuOpen,
                onMenuClose: handleMenuClose,
                filterOption: () => true,
              })}
              onMenuOpen={() => { handleMenuOpen(); handleFocus(true); }}
              onMenuClose={() => { handleMenuClose(); handleFocus(false); }}
              onChange={(selectedOption) => {
                field.onChange(selectedOption);
                handleSelect && handleSelect(selectedOption);
                if (onlyOpenInSearch) { setMenuIsOpen(false); setInputText(''); }
              }}
              onFocus={scrollToValue ? scrollTopOnSelect : null}
            />
            {fieldState.error && (
              <span className="color-error fw-600 fz-15 mt-8">{fieldState.error.message}</span>
            )}
          </div>
        )
      }}
    />
  )
}

export default AdminSelect;