import { faCheck, faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import dataApplicationsContext from "../context/dataApplicationsContext";

  function AdminInput({ 
    label, nameInput, inputMode, nameClass, nameClassContainer, type, maxLength, placeholder, nameClassLabel, wodSuggestions, watch, scoreSuffix,
    register, errors, msg, isNumber,  isOptionnal, disabled, tooltip, isAddress, setValue, autoComplete, eventCodePostal, noLabel, noTooltip, noLabelWrapper,
    flashError, flashErrorIndex1, extra, link, validation, validMessage, requireMessage, showPwdStates, setShowPwdStates, toggleEye, inputIndex, autocomplete, noMT, 
    wrapOptionnal, errorClass, isIcon, inputClass, clearErrors, clearsName, isError, isForCap, pattern, iconEnd, min,
    onBlurProps, extraInfo, onIconDismiss
  }) {
    const { setActiveInput } = useContext(dataApplicationsContext);

    const getNestedError = (errors, path) => {
      return path.split('.').reduce((acc, key) => {
        if (acc === undefined || acc === null) return undefined;
        // Gérer les indices de tableau ex: "goodiesData[0]" ou "goodiesData.0"
        const cleanKey = key.replace(/\[(\d+)\]/, '.$1');
        return cleanKey.includes('.') 
          ? cleanKey.split('.').reduce((a, k) => a?.[k], acc)
          : acc[cleanKey];
      }, errors);
    };
    const fieldError = getNestedError(errors, nameInput);

    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef();
    const navigate = useNavigate();

    const index = nameInput.replace(/^.+\.(\d+)\..+$/, '$1');


    const handleChange = (e) => {
      const value = e.target.value;
      setValue(nameInput, value);
      console.log(value);
    }

    const resetInput = () => {
      setValue(nameInput, '');
    }


    const handleFocus = () => {
      if (wodSuggestions) {
        setIsFocused(true);
      }
    };

    const handleBlur = () => {
      if (wodSuggestions) {
        if (!isHovered) {
          setIsFocused(false);
        }
      }
      onBlurProps && onBlurProps()
    };

    const handleNavigate = () => {
      setActiveInput(null)
      navigate(link)
    }

    const togglePassword = (inputName) => {
      setShowPwdStates((prevStates) => ({
        ...prevStates,
        [inputName]: !prevStates[inputName],
      }));
    }

    return(
      <div className={nameClassContainer}>
        {!noLabelWrapper && 
          <div className={`label-tooltip-wrapper ${!noMT ? 'mt-24' : ''}`}>
            {!noLabel && 
              <label htmlFor={nameInput} className={`${nameClassLabel} ${wrapOptionnal ? '' : 'd-flex'}`}>
                <p className="mb-0">{label}</p>
                {(isOptionnal) && <span className="optionnal">(optionnel)</span>}
                {(extraInfo) && <span className="optionnal">({extraInfo})</span>}
              </label>
            }
          </div>
        }
        {((type === 'text' || type === 'number' || type === 'password') && !isAddress) && 
          <>
            {toggleEye && 
              <i  className={`pos-abs right-6 top-38 z-20 ${showPwdStates[nameInput] ? 'bi bi-eye toggleEye' : `bi bi-eye-slash toggleEye`}`}
                  onClick={() => togglePassword(nameInput)}></i>
            }
            {(wodSuggestions && watch(nameInput)?.length > 0) && 
              <i  className={`pos-abs top-38 right-16 z-20 bi bi-x-lg cursor-pointer`}
                  onClick={() => resetInput(nameInput)}></i>
            }
            {isIcon 
              ? (
                <div className="d-flex al-item-center gap-8 infinity_Input">
                  <i className={`${isIcon}`}></i>
                  {onIconDismiss && 
                    <i 
                      className="bi bi-x-lg close-right"
                      onClick={() => {
                        setValue(nameInput, '');   // reset la valeur
                        clearErrors && clearErrors(nameInput);
                        // Pour forcer isIcon à null, il faut remonter l'info
                        // => appelle un callback optionnel si fourni
                        onIconDismiss();
                      }}
                    />
                  }
                </div>
              )
              : <input  
                  onFocus={handleFocus}
                  onWheel={(e) => e.target.blur()}
                  type={type} inputMode={inputMode ?? null} 
                  className={`${nameClass} ${(fieldError || flashError || flashErrorIndex1 || isError) ? 'error-border' : ''}`} 
                  autoComplete="off" autoCorrect="off" pattern={pattern}
                  maxLength={maxLength ?? null} placeholder={placeholder ?? null} id={nameInput} disabled={disabled ?? false}
                  {...register(nameInput, {
                    valueAsNumber: isNumber,
                    onBlur: () => handleBlur(),
                    onChange: (e) => {
                      clearsName && clearErrors(clearsName)
                    },
                    pattern: !validation ? null : {
                      value: validation, message: validMessage
                    },
                    required: {
                      value: !requireMessage ? false : true,
                      message: requireMessage
                    }
                  })}
                />
            }
            {iconEnd && <i className={`${iconEnd} pos-abs right-16 top-40 z-10 op-7`}></i>}
            {(scoreSuffix) && <p className="fz-12 fw-600 ml-8">{scoreSuffix}</p>}
            {extra && <p className='extra-link-input' onClick={handleNavigate}>{extra}</p>}
          </>
        }
        {isFocused && <div className="invisible-bg" onClick={() => setIsFocused(false)}></div>}
        {(fieldError || isError) && 
          <p className={`instruction register-compet-instruction mt-8 ${errorClass ?? 'mb-16'}`}>
            <FontAwesomeIcon icon={faInfoCircle} />
            {isError ? (isError.message || isError) : (fieldError?.message ? fieldError.message : fieldError)}
          </p>
        }
      </div>
    )
  }

  export default AdminInput