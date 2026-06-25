import Select, { components } from 'react-select';
import { Option, SingleValue, MenuList } from "./selectAthletesConfig";
import { cleanSearch } from "./textTransform";
import { Controller } from 'react-hook-form';
import { useState } from 'react';

export default function SelectAthlete({ 
  name, control, errors, options, placeholder, className, labelClassName, label, 
  customFilter = null, isDisabled = false
}) {
  const [inputText, setInputText] = useState('');
  const [menuIsOpen, setMenuIsOpen] = useState(undefined);

  const getFilteredOptions = () => {
    // Si c'est vide, retourner un tableau vide pour forcer l'affichage du NoOptionsMessage
    if (inputText.length < 1) {
      return [];
    }

    // Si un customFilter est fourni, l'utiliser
    if (customFilter) {
      return options.filter(option => customFilter(option, inputText)).slice(0, 100);
    }

    // Sinon, utiliser le filtre par défaut avec cleanSearch
    const cleanedInput = cleanSearch(inputText).toLowerCase();
    return options
      .filter(option => {
        const cleanedLabel = cleanSearch(option.label).toLowerCase();
        return cleanedLabel.includes(cleanedInput);
      })
      .slice(0, 20);
  };

  const NoOptionsMessage = (props) => {
    const currentValue = props.selectProps.value;

    // Si rien n'est tapé et qu'un athlète est sélectionné
    if (inputText.length < 1 && currentValue) {
      return (
        <components.NoOptionsMessage {...props}>
          Tapez le nom de l'athlète
        </components.NoOptionsMessage>
      );
    }

    // Si on a tapé quelque chose mais aucun résultat
    if (inputText.length >= 1) {
      return (
        <components.NoOptionsMessage {...props}>
          Aucun athlète trouvé
        </components.NoOptionsMessage>
      );
    }

    return null;
  };

  return (
    <div className={`flex flex-col gap-1 ${className || ''}`}>
      {label && (
        <label className={`font-semibold text-sm ${labelClassName || ''}`}>
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {

          const handleSelect = (selectedOption) => {
            field.onChange(selectedOption);
            setMenuIsOpen(false);
            setInputText('');
          };

          const handleInputChange = (newValue, actionMeta) => {
            if (actionMeta.action === 'input-change') {
              setInputText(newValue);
              if (menuIsOpen === false || menuIsOpen === undefined) {
                setMenuIsOpen(true);
              }
            }
            return newValue;
          };

          const handleMenuOpen = () => setMenuIsOpen(true);

          const handleMenuClose = () => {
            setMenuIsOpen(false);
            setInputText('');
          };

          const handleFocus = () => {
            if (field.value) {
              setMenuIsOpen(true);
            }
          };

          return (
            <Select
              options={getFilteredOptions()}
              value={field.value}
              onChange={handleSelect}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              onFocus={handleFocus}
              onInputChange={handleInputChange}
              onMenuOpen={handleMenuOpen}
              onMenuClose={handleMenuClose}
              menuIsOpen={(!(inputText.length === 0 && !field.value) || inputText.length > 0) && menuIsOpen}
              filterOption={() => true} // le filtre est géré manuellement via getFilteredOptions
              components={{ Option, MenuList, SingleValue, NoOptionsMessage }}
              className={`input-select-container select-athlete-container ${errors?.[name] ? 'selectAthleteError' : ''}`}
              classNamePrefix="input-select"
              isSearchable={true}
              isClearable={true}
              maxOptions={20}
              isDisabled={isDisabled}
              placeholder={placeholder || "Taper le nom d'un athlète"}
            />
          );
        }}
      />
      {errors?.[name] && (
        <p className="text-[#df0000] text-sm">{errors[name].message}</p>
      )}
    </div>
  )
}