import Cropper from 'react-easy-crop';
import { useState, useCallback } from 'react';
import getCroppedImg from '../utils/getCroppedImg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';

const CropModal = ({ imageSrc, onConfirm, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
    onConfirm(blob);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col pt-20">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-3 bg-black">
        <button onClick={onCancel} className="text-white text-lg">Annuler</button>
        {/* <span className="text-white font-semibold">Modifier la photo</span> */}
        <button onClick={handleConfirm} className="text-white font-semibold text-lg">Terminé</button>
      </div>

      {/* Cropper */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={3 / 4}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid={true}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-8 px-4 py-4 bg-black">
        <input
          type="range"
          min={1} max={3} step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-white"
        />
        <button onClick={() => setZoom(1)} className="text-white opacity-70 text-2xl">
          <FontAwesomeIcon icon={faArrowsRotate} />
        </button>
      </div>
    </div>
  );
};

export default CropModal;