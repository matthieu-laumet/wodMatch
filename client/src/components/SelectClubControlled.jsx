// SelectClubControlled.jsx
import { useState } from "react";
import Select, { components } from 'react-select';
import { Controller } from 'react-hook-form';
import { cleanSearch } from "./textTransform";
import AdminInput from "./AdminInput";

function SelectClubControlled({ 
  clubsOptions, 
  control, 
  name = 'club',
  register,
  errors,
  watch,
  setValue,
  isNewBox, 
  setisNewBox,
  placeholder = 'Tapez le nom de votre box',
  noBoxOption,
  defaultValue
}) {
  const [inputText, setInputText] = useState('');
  const [menuIsOpen, setMenuIsOpen] = useState(undefined);
  const [isNoBox, setIsNoBox] = useState(false);
  
  const clubValue = watch(name);
  
  const getFilteredOptions = () => {
    const cleanedInput = cleanSearch(inputText).toLowerCase();
    
    if (inputText.length < 1) {
      return [];
    }
    
    return clubsOptions
      .filter(option => {
        const cleanedLabel = cleanSearch(option.label).toLowerCase();
        return cleanedLabel.includes(cleanedInput);
      })
      .slice(0, 100);
  };
  
  const NoOptionsMessage = (props) => {
    if (inputText.length < 1 && clubValue) {
      return (
        <components.NoOptionsMessage {...props}>
          Tapez le nom de la box
        </components.NoOptionsMessage>
      );
    }
    
    if (inputText.length >= 1) {
      return (
        <components.NoOptionsMessage {...props}>
          Aucune box trouvée
        </components.NoOptionsMessage>
      );
    }
    
    return null;
  };
  
  const handleSelect = (selectedOption, onChange) => {
    onChange(selectedOption);
    setMenuIsOpen(false);
    setInputText('');
    setIsNoBox(false);
  };
  
  const handleNoBox = () => {
    const newNoBoxState = !isNoBox;
    setIsNoBox(newNoBoxState);
    
    if (newNoBoxState) {
      setValue(name, noBoxOption);
    } else {
      setValue(name, defaultValue || null);
    }
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
  
  const handleMenuOpen = () => {
    setMenuIsOpen(true);
  };
  
  const handleMenuClose = () => {
    setMenuIsOpen(false);
    setInputText('');
  };
  
  const handleFocus = () => {
    if (clubValue) {
      setMenuIsOpen(true);
    }
  };
  
  return (
    <>
      {!isNewBox 
        ? <div className="d-flex sp-bw al-item-center">
            <div className="flex-gr-1">
              <Controller
                name={name}
                control={control}
                defaultValue={defaultValue}
                render={({ field: { onChange, value, ref } }) => (
                  <Select 
                    ref={ref}
                    options={getFilteredOptions()}
                    onChange={(option) => handleSelect(option, onChange)}
                    value={value}
                    placeholder={placeholder}
                    className="input-select-container"
                    classNamePrefix="input-select"
                    isSearchable
                    isDisabled={isNoBox}
                    isClearable={false}
                    onInputChange={handleInputChange}
                    onMenuOpen={handleMenuOpen}
                    onMenuClose={handleMenuClose}
                    onFocus={handleFocus}
                    menuIsOpen={(!(inputText.length === 0 && !value) || inputText.length > 0) && menuIsOpen}
                    components={{ NoOptionsMessage }}
                    filterOption={() => true}
                  />
                )}
              />
            </div>
            <div className="line-checkbox-container simpleCheckbox register-chexbox-column">
              <input 
                id="no-box" 
                type="checkbox" 
                checked={isNoBox} 
                onChange={handleNoBox}
              />
              <label htmlFor="no-box">
                <span></span>
              </label>
              <label htmlFor="no-box" className="label-no-box fz-14 cursor-pointer ml-16">
                No box
              </label>
            </div>
          </div>
        : <div className="d-flex sp-bw al-item-center">
            <AdminInput
              nameClass="input-admin"
              nameClassContainer="input-admin-container"
              nameClassLabel="fz-15 mb-8 fw-600"
              label="Nouvelle box"
              nameInput="newBox"
              type="text"
              register={register}
              errors={errors}
              msg="Le nom de la box est obligatoire."
              placeholder="Saisir le nom de la box"
              requireMessage="Veuillez renseigner le champs ci-dessus."
              noMT
              watch={watch}
            />
            <i 
              className="bi bi-x-lg fz-18 cursor-pointer ml-4" 
              onClick={() => {
                setisNewBox(false);
                setValue('newBox', '');
              }}
            />
          </div>
      }
      {!isNewBox && 
        <p 
          className="fw-600 mb-4 cursor-pointer text-underline w-fit-content mt-12" 
          onClick={() => setisNewBox(true)}
        >
          Ma box n'est pas dans la liste...
        </p>
      }
    </>
  );
}

export default SelectClubControlled;