import { useRef, useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useDeleteTempImageMutation, useGetUserTempImagesQuery, useReorderTempImagesMutation, useUploadTempImagesMutation } from "../slices/imagesApiSlice";
import { PulseLoader } from "react-spinners";
import { toast } from 'react-toastify';
import { MAX_PHOTOS } from "../context/dataApplicationsContext";
import CropModal from "./CropModal";
import Swal from 'sweetalert2';
import { alerteDeleteSimple } from "./Alert";
import { useSortablePhotos } from "../hooks/useSortablePhotos";
import { useSortableCard } from "../hooks/useSortableCard";

// Carte photo individuelle : c'est ELLE qui appelle useSortable (impossible à éviter, dnd-kit fonctionne par hook posé sur chaque item triable).
const PhotoCard = ({ id, url, onRemove }) => {
  const { setNodeRef, attributes, listeners, style, isDragging } = useSortableCard(id);

  return (
    <div
      ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 ${isDragging ? 'border-brand' : 'border-black'}`}
    >
      <img src={url} alt="" className="w-full h-full object-cover" />
      <button
        onClick={() => onRemove(id)}
        onPointerDownCapture={(e) => e.stopPropagation()} // empêche le bouton de déclencher un drag
        className="absolute bottom-1 right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center shadow text-xs text-white"
      >
        ✕
      </button>
    </div>
  );
};

const HandlePhotos = ({ setBtnText, setIsDisabled, btnText = 'Suivant', showAllSlots = false }) => {
  const [photos, setPhotos] = useState([]);
  const [loadingCount, setLoadingCount] = useState(0); // ✅ nb de slots en chargement
  const [cropQueue, setCropQueue] = useState([]); // fichiers en attente de crop
  const [currentCrop, setCurrentCrop] = useState(null); // { file, objectUrl }

  const inputRef = useRef(null);

  useEffect(() => {
    setBtnText(btnText)
    setIsDisabled(photos.length === 0)
  }, [photos])

  const [uploadTempImages] = useUploadTempImagesMutation();
  const [deleteTempImage] = useDeleteTempImageMutation();
  const [reorderTempImages] = useReorderTempImagesMutation();
  const { data: remotePhotos = [], isLoading: isLoadingTempImages, isSuccess: isSuccessTempImages } = useGetUserTempImagesQuery();

  // ✅ tout le câblage dnd-kit (sensors + handleDragEnd) vit dans ce hook
  const { sensors, handleDragEnd } = useSortablePhotos(photos, setPhotos, reorderTempImages);

  useEffect(() => {
    if (remotePhotos.length === 0) return;
    setPhotos(remotePhotos.map(photo => ({
      id: crypto.randomUUID(), filename: photo.filename,
      url: photo.url, // ✅ base64 direct, pas besoin d'un 2ème appel
    })));
  }, [remotePhotos]);

  const handleSlotClick = () => {
    inputRef.current.click();
  };

  const handleAddPhoto = async (e) => {
    const targetSlot = photos.length + loadingCount; // ← toujours la suite, peu importe le slot cliqué
    const files = Array.from(e.target.files).slice(0, MAX_PHOTOS - photos.length - loadingCount);
    if (files.length === 0) return;
    e.target.value = null;
    const [first, ...rest] = files;
    setCropQueue(rest.map((file, i) => ({ file, slotIndex: targetSlot + 1 + i })));
    setCurrentCrop({ file: first, objectUrl: URL.createObjectURL(first), slotIndex: targetSlot });
  };

  const handleCropConfirm = async (blob) => {
    const slotIndex = currentCrop.slotIndex;
    const file = new File([blob], currentCrop.file.name, { type: 'image/jpeg' });
    URL.revokeObjectURL(currentCrop.objectUrl);

    if (cropQueue.length > 0) {
      const [next, ...rest] = cropQueue;
      setCropQueue(rest);
      setCurrentCrop({ file: next.file, objectUrl: URL.createObjectURL(next.file), slotIndex: next.slotIndex });
    } else {
      setCurrentCrop(null);
    }

    setLoadingCount((prev) => prev + 1);
    try {
      const results = await uploadTempImages({ files: [file], slot: slotIndex }).unwrap();
      const newPhoto = {
        id: crypto.randomUUID(), filename: results[0].filename, url: URL.createObjectURL(blob),
      };
      setPhotos((prev) => [...prev, newPhoto]);
    } catch (error) {
      toast.error(error?.data?.error || 'Erreur upload', { autoClose: 6000 });
    } finally {
      setLoadingCount((prev) => prev - 1);
    }
  };

  const handleCropCancel = () => {
    URL.revokeObjectURL(currentCrop.objectUrl);
    if (cropQueue.length > 0) {
      const [next, ...rest] = cropQueue;
      setCropQueue(rest);
      setCurrentCrop({ file: next.file, objectUrl: URL.createObjectURL(next.file), slotIndex: next.slotIndex });
    } else {
      setCurrentCrop(null);
    }
  };

  const handleRemove = async (id) => {
    try {
      const result = await Swal.fire(alerteDeleteSimple());
      if (!result.isConfirmed) return;

      const photo = photos.find((p) => p.id === id);
      const newPhotos = photos.filter((p) => p.id !== id);
      setPhotos(newPhotos); // optimistic update

      if (photo?.filename) {
        try {
          await deleteTempImage(photo.filename).unwrap();

          // Réordonner seulement si ce n'était pas la dernière photo
          if (newPhotos.length > 0) {
            const results = await reorderTempImages({ filenames: newPhotos.map(p => p.filename) }).unwrap();
            setPhotos(newPhotos.map((p, i) => ({
              ...p,
              filename: results[i].newFilename,
            })));
          }
        } catch (error) {
          console.error('Erreur suppression:', error);
          setPhotos(photos); // rollback
        }
      }
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  };

  const totalUsed = photos.length + loadingCount;
  const emptySlots = [];

  // ✅ Slots de chargement
  for (let i = 0; i < loadingCount; i++) {
    emptySlots.push({ id: `loading-${i}`, isLoading: true });
  }

  if (showAllSlots) {
    const remaining = MAX_PHOTOS - totalUsed;
    for (let i = 0; i < remaining; i++) {
      emptySlots.push({ id: `add-${i}`, isAdd: true });
    }
  } else {
    if (totalUsed < MAX_PHOTOS) emptySlots.push({ id: 'add', isAdd: true });
  }

  while ((photos.length + emptySlots.length) % 3 !== 0) {
    emptySlots.push({ id: `empty-pad-${emptySlots.length}`, isEmpty: true });
  }

  return (
    <>
      <div className="mt-2 mb-6">
        <h2 className="text-2xl font-semibold mb-2">Ajoute tes photos récentes</h2>
        <p>Montre à une team pourquoi elle doit te choisir. Sélectionne des photos qui révèlent tes talents d'athlète.</p>
      </div>

      {isLoadingTempImages && <PulseLoader color='#222' size={10} className="mt-12 ml-12"/>}
      {isSuccessTempImages &&
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                  <PhotoCard key={photo.id} id={photo.id} url={photo.url} onRemove={handleRemove} />
                ))}

                {emptySlots.map((slot) => {
                  if (slot.isAdd) return (
                    <div
                      key={slot.id}
                      onClick={handleSlotClick}
                      className="aspect-[3/4] rounded-xl border-2 border-dashed border-[#505050] bg-gray-100 flex items-center justify-center cursor-pointer"
                    >
                      <span className="text-2xl text-gray-950">+</span>
                    </div>
                  );

                  if (slot.isLoading) return (
                    <div key={slot.id} className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-gray-300">
                      <PulseLoader color='#505050' size={8} className="ml-6 mt-16"/>
                    </div>
                  );

                  // slot.isEmpty (padding pour aligner la grille)
                  return <div key={slot.id} className="aspect-[3/4] rounded-xl" />;
                })}
              </div>
            </SortableContext>
          </DndContext>

          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAddPhoto} />
          <p className="text-black-950 mt-4">Pour réorganiser tes photos, effectue un drag and drop.</p>
        </>
      }
      {currentCrop && (
        <CropModal
          imageSrc={currentCrop.objectUrl}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
};

export default HandlePhotos;