import { useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useDeleteTempImageMutation, useGetUserTempImagesQuery, useUploadTempImagesMutation } from "../../slices/imagesApiSlice";
import { PulseLoader } from "react-spinners";
import { useEffect } from "react";
import { toast } from 'react-toastify';


const OnboardPhotos = () => {
  const [photos, setPhotos] = useState([]);
  const [loadingCount, setLoadingCount] = useState(0); // ✅ nb de slots en chargement
  const inputRef = useRef(null);
  const MAX_PHOTOS = 6;

  const [uploadTempImages] = useUploadTempImagesMutation();
  const [deleteTempImage] = useDeleteTempImageMutation();
  const { data: remotePhotos = [], isLoading: isLoadingTempImages, isSuccess: isSuccessTempImages } = useGetUserTempImagesQuery();

  useEffect(() => {
    if (remotePhotos.length === 0) return;
    setPhotos(remotePhotos.map(photo => ({
      id: crypto.randomUUID(),
      filename: photo.filename,
      url: photo.url, // ✅ base64 direct, pas besoin d'un 2ème appel
    })));
  }, [remotePhotos]);

  const handleAddPhoto = async (e) => {
    const files = Array.from(e.target.files).slice(0, MAX_PHOTOS - photos.length - loadingCount);
    if (files.length === 0) return;
    setLoadingCount((prev) => prev + files.length); // ✅ ouvre les slots loading
    try {
      const results = await uploadTempImages(files).unwrap();
      const newPhotos = results.map((result) => ({
        id: crypto.randomUUID(),
        filename: result.filename,
        url: URL.createObjectURL(files.find(f => f.name === result.filename) || files[0]),
      }));
      setPhotos((prev) => [...prev, ...newPhotos]);
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error(error?.message || error?.data?.error || 'Une erreur est survenue lors de la soumission.', { 
        autoClose: 6000, closeButton: true, className: 'toast-error-register' 
      });
    } finally {
      setLoadingCount((prev) => prev - files.length); // ✅ ferme les slots loading
    }
    e.target.value = null;
  };

  const handleRemove = async (id) => {
    const photo = photos.find((p) => p.id === id);
    setPhotos((prev) => prev.filter((p) => p.id !== id)); // optimistic update
    if (photo?.filename) {
      try {
        await deleteTempImage(photo.filename).unwrap();
      } catch (error) {
        console.error('Erreur suppression:', error);
        setPhotos((prev) => [...prev, photo]); // rollback si erreur
      }
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(photos);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setPhotos(reordered);
  };

  const totalUsed = photos.length + loadingCount;
  const slots = [...photos];

  // ✅ Slots de chargement
  for (let i = 0; i < loadingCount; i++) {
    slots.push({ id: `loading-${i}`, isLoading: true });
  }

  // Slot "ajouter"
  if (totalUsed < MAX_PHOTOS) slots.push({ id: 'add', isAdd: true });
  // Padding pour aligner la grille
  while (slots.length % 3 !== 0) slots.push({ id: `empty-${slots.length}`, isEmpty: true });

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
                    if (slot.isAdd) return (
                      <div
                        key="add"
                        onClick={() => inputRef.current.click()}
                        className="aspect-[3/4] rounded-xl border-2 border-dashed border-[#505050] bg-gray-100 flex items-center justify-center cursor-pointer"
                      >
                        <span className="text-2xl text-gray-950">+</span>
                      </div>
                    );

                    if (slot.isEmpty) return (
                      <div key={slot.id} className="aspect-[3/4]" />
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
    </>
  );
};

export default OnboardPhotos;