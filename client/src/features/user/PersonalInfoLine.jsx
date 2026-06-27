import { useEffect, useState, useContext } from "react";
import dataApplicationsContext from "../../context/dataApplicationsContext";
import { PulseLoader } from "react-spinners";
import { toast } from 'react-toastify';
import { useScrollLock } from "../../hooks/useScrollLock";
import AdminInput from "../../components/AdminInput";
import AdminSelect from "../../components/AdminSelect";
import SelectClubControlled from "../../components/SelectClubControlled";

export default function PersonalInfoLine({ 
  label, value, isSensible, name, editInputs, register, errors, setValue, noLabel, explication, handleSubmit, 
  type, control, options, watch, watchH, watchF, validation, defaultValue, scrollToValue, updateFonction, 
  btnText, watchNewPwd, watchConfirmPwd, clearErrors, watchEmail, watchSMS, slug, noBoxOption, insertClubOnValidation,
  setInfoMessage, placeholder = 'Choisissez votre box', isSendMail = true, classWrapper, classContainer, reset,
  body = <></>
}) {
  const { auth, activeInput, setActiveInput, setAuth, windowWidth } = useContext(dataApplicationsContext);
  const { unlockScroll } = useScrollLock();

  const isActive = (activeInput && activeInput === name);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [flashError, setFlashError] = useState(null);
  const [flashErrorIndex1, setFlashErrorIndex1] = useState(null);
  const [showPwdStates, setShowPwdStates] = useState({});
  const isSmallDevice = windowWidth < 1021;

  const handleClick = (e) => {
    const click = e.target.dataset.click;
    if (isActive) {
      setActiveInput(null)
      setFlashError(null)
      setFlashErrorIndex1(null)
      setShowPwdStates({})
      reset && reset()
      clearErrors && clearErrors();
      
      // Réinitialiser avec la valeur actuelle de l'utilisateur si elle existe
      if (auth?.user?.[name] !== undefined) {
        setValue(name, auth.user[name])
      } else if (defaultValue) {
        setValue(name, defaultValue)
      } else if (isSensible) {
        setValue(name, '')
      }
    } else {
      setActiveInput(click)
    }
    activeInput === 'birth_date' && unlockScroll()
  }

  // permet de supprimer le message d'erreur
  useEffect(() => {
    if (flashError) {
      setFlashError(null)
    } 
  }, [watch]);

  // permet de supprimer le message d'erreur
  useEffect(() => {
    if (flashErrorIndex1) {
      setFlashErrorIndex1(null)
    } 
  }, [watchNewPwd, watchConfirmPwd]);


  // permet de preremplir les infos
  useEffect(() => {
    if (isSensible && isActive) {
      editInputs.map(input => {
        setValue(input.name, '')
      })
    } 
  }, [isActive]);

  const onSubmit = async (data) => {
    console.log(data);
    setIsSubmitting(true);
    try {
      if (updateFonction) {
        await updateFonction(data);
        setActiveInput(null);
        clearErrors && clearErrors();
      }
    } catch (error) {
      console.log(error)
      toast.error(error.data?.message || 'erreur serveur', {
        autoClose: 5000, className: 'toast-error-register' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }


  const userInput = (input, index) => {
    if (type === 'text' || type === 'password') {
      const inputType = name === 'pwd' ? showPwdStates[input.name] ? 'text' : 'password': type;
      return (
        <>
          <AdminInput
            nameClass={"input-admin"} nameClassContainer={"input-admin-container"} nameClassLabel={"label-user-input"}
            label={input.label} nameInput={input.name} type={inputType} register={register} errors={errors} msg="Le nom est WOD est obligatoire."
            placeholder={input.placeholder ?? input.label} noLabel={noLabel} inputMode={input.inputMode} 
            validation={input.validation} validMessage={input.validMessage} requireMessage={input.requireMessage} 
            setShowPwdStates={setShowPwdStates} showPwdStates={showPwdStates} toggleEye={input.toggleEye} noMT watch={watch}
            extra={input.extra} link={input.link} flashError={flashError} flashErrorIndex1={index > 0 && flashErrorIndex1}
          />
        </>
      ) 
    } else if (type === 'select' && name === 'club') {
      return (
        <SelectClubControlled
          clubsOptions={options}
          control={control}
          name={input.name}
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          placeholder={placeholder}
          noBoxOption={noBoxOption}
          defaultValue={defaultValue}
        />
      );
    } else if (type === 'select' && name !== 'club') {
      return (
        <AdminSelect
          control={control}
          options={options}
          name={input.name} 
          classContainer="score-select-admin-container mt-16"
          classLabel="label-line-checkbox full-line"
          classSelect="input-select-container"
          classNamePrefix="input-select"
          placeholder={placeholder}
          label={input.name}
          defaultValue={defaultValue}
          scrollToValue={scrollToValue}
          noLabel={noLabel}
        />
      );
    }
  } 

  const checkboxInputs = 
    <>
      <div className="flex gap-4 mt-8 mb-8">
        {editInputs.map((input, index) => {
            let isChecked = input.value;
            return (
              <div className="" key={index}>
                <div className={`line-checkbox-container simpleCheckbox ${index > 0 ? 'ml-4' : ''}`}>
                  <input 
                    id={input.name} 
                    type='checkbox' 
                    checked={isChecked}
                    disabled={input.locked}
                    onChange={(e) => {
                      if (isChecked && (watchH || watchF)) return // Permet d'eviter la decoche si clic sur la meme checkbox. ex = si valeur homme, si je reclic sur homme, la case reste cochée
                      const { checked } = e.target;
                      editInputs.forEach((item) => { // Permet de gerer le toggle
                        if ((watchH || watchF) && (item.name !== input.name)) {
                          // Décocher toutes les autres cases sauf celle cliquée
                          setValue(item.name, false);
                        }
                      });
                      // // Mettre à jour la valeur de la case cochée
                      setValue(input.name, checked);
                    }}
                  />
                  <label htmlFor={input.name} className={input.locked ? 'op-5' : ''}>
                    <span></span>
                  </label>
                  <label htmlFor={input.name} className={`label ${input.locked ? 'op-5 cursor-not-allowed' : ''}`}>{input.label}</label>
                </div>
              </div>
            )
          })
        }
      </div>
    </>

  
  return (
    <div className={`main-personal-wrapper ${classWrapper, classWrapper}`}>
      <div className={`PersonalInfoLine-container ${isActive ? 'no-border pb-0' : ''}`} id={(activeInput && activeInput !== name) ? 'inactive' : ''}>
        <div className="PersonalInfoLine-content">
          <p className="PersonalInfoLine-label">{label}</p>
          {!isActive && <p className="PersonalInfoLine-value">{value ?? 'Information non fournie'}</p>}
        </div>
        <p className="PersonalInfoLine-edit" data-click={name} onClick={handleClick}>{isActive ? 'Annuler' : value ? 'modifier' : 'Ajouter'}</p>
      </div>
      {isActive && 
        <div className={`user-info-input-containers ${classContainer}`}>
          <p className="w-full text-[#808080] pt-4">{explication}</p>
          {flashError && <p className="instruction register-compet-instruction mb-4 mt-8">{flashError}</p>}
          {editInputs.map((input, index) => {
            return (
              <div className={''} key={index}>
                {(index === 1 && flashErrorIndex1) && <p className="instruction register-compet-instruction mb-4 mt-8">{flashErrorIndex1}</p>}
                {userInput(input, index)}
              </div>
            )
          })}
          {type === 'checkbox' && checkboxInputs}
          {body}
          {isSubmitting 
            ? <PulseLoader color='#fff' size={6} className="button-loader"/>
            : <button className={`btn black px-8 py-4`} onClick={handleSubmit(onSubmit)}>{btnText ?? 'Enregister'}</button>
          }
        </div>
      }
    </div>
  )
}