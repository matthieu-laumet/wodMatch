import { useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useDeleteTempImageMutation, useGetUserTempImagesQuery, useReorderTempImagesMutation, useUploadTempImagesMutation } from "../../slices/imagesApiSlice";
import { PulseLoader } from "react-spinners";
import { useEffect } from "react";
import { toast } from 'react-toastify';
import { MAX_PHOTOS } from "../../context/dataApplicationsContext";
import CropModal from "../../components/CropModal";
import Swal from 'sweetalert2';
import { alerteDeleteFunrep, alerteDeletePhoto } from "../../components/Alert";


const OnboardPhotos = ({ setBtnText, setIsDisabled, btnText = 'Suivant', showAllSlots = false }) => {
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

  useEffect(() => {
    if (remotePhotos.length === 0) return;
    setPhotos(remotePhotos.map(photo => ({
      id: crypto.randomUUID(),
      filename: photo.filename,
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
        id: crypto.randomUUID(),
        filename: results[0].filename,
        url: URL.createObjectURL(blob),
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
      const result = await Swal.fire(alerteDeletePhoto());
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

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reordered = Array.from(photos);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setPhotos(reordered); // optimistic update immédiat

    try {
      const results = await reorderTempImages({ filenames: reordered.map(p => p.filename) }).unwrap();
      // Mettre à jour les filenames avec les nouveaux noms
      setPhotos(reordered.map((photo, i) => ({
        ...photo,
        filename: results[i].newFilename,
      })));
    } catch (error) {
      console.error('Erreur reorder:', error);
      setPhotos(photos); // rollback
    }
  };

  const totalUsed = photos.length + loadingCount;
  const slots = [...photos];

  // ✅ Slots de chargement
  for (let i = 0; i < loadingCount; i++) {
    slots.push({ id: `loading-${i}`, isLoading: true });
  }

  if (showAllSlots) {
    // Affiche tous les slots vides jusqu'à MAX_PHOTOS, avec un seul bouton "+"
    const remaining = MAX_PHOTOS - totalUsed;
    for (let i = 0; i < remaining; i++) {
      slots.push({ id: `add-${i}`, isAdd: true });
    }
  } else {
    // Comportement par défaut : un seul slot "+"
    if (totalUsed < MAX_PHOTOS) slots.push({ id: 'add', isAdd: true });
  }

  // Padding pour aligner la grille (plus nécessaire avec showAllSlots car MAX_PHOTOS est divisible par 3)
  while (slots.length % 3 !== 0) slots.push({ id: `empty-pad-${slots.length}`, isEmpty: true });

  return (
    <>
      <div className="mt-2 mb-6">
        <h2 className="text-2xl font-semibold mb-2">Ajoute tes photos récentes</h2>
        <p>Montre à une team pourquoi elle doit te choisir. Sélectionne des photos qui révèlent tes talents d'athlète.</p>
      </div>

      {isLoadingTempImages && <PulseLoader color='#222' size={10} className="mt-12 ml-12"/>}
      {isSuccessTempImages &&
        <>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="photos" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-3 gap-2"
                >
                  {slots.map((slot, index) => {
                    const slotPosition = index;
                    if (slot.isAdd) return (
                      <div
                        key={slot.id}
                        onClick={() => handleSlotClick(slotPosition)}
                        className="aspect-[3/4] rounded-xl border-2 border-dashed border-[#505050] bg-gray-100 flex items-center justify-center cursor-pointer"
                      >
                        <span className="text-2xl text-gray-950">+</span>
                      </div>
                    );

                    if (slot.isEmpty) return (
                      <div
                        key={slot.id}
                        className={`aspect-[3/4] rounded-xl ${slot.isPlaceholder ? 'border-2 border-dashed border-[#505050] bg-gray-100' : ''}`}
                      />
                    );

                    if (slot.isLoading) return (
                      <div
                        key={slot.id}
                        className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-gray-300"
                      >
                        <PulseLoader color='#505050' size={8} className="ml-6 mt-16"/>
                      </div>
                    );

                    return (
                      <Draggable key={slot.id} draggableId={slot.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-black
                              ${snapshot.isDragging ? 'ring-2 ring-brand' : ''}`}
                              // ✅ border-2 border-black sur les cards complètes
                          >
                            <img src={slot.url} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={() => handleRemove(slot.id)}
                              className="absolute bottom-1 right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center shadow text-xs text-white"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

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

export default OnboardPhotos;