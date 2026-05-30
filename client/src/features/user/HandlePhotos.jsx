import { useState } from "react";
import OnboardPhotos from "../home/OnboardPhotos";
import { useNavigate } from "react-router-dom";

export default function HandlePhotos({ }) {

  const [btnText, setBtnText] = useState('Ajouter un média');
  const [isDisabled, setIsDisabled] = useState(false);
  const navigate = useNavigate();

  const handlePrev = () => {
    window.scroll(0, 0);
    navigate('/profil')
  };

  return (
    <div className='full-screen padding pt-6'>
       <i className="bi bi-arrow-left-circle text-3xl cursor-pointer" onClick={handlePrev}></i>
      <OnboardPhotos btnText={btnText} setBtnText={setBtnText} setIsDisabled={setIsDisabled} showAllSlots/>
    </div>
  )
}