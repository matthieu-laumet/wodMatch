import { useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

/**
 * Encapsule tout le câblage dnd-kit pour réordonner une liste de photos :
 * - les sensors (souris/tactile + clavier pour l'accessibilité)
 * - le calcul du nouvel ordre (arrayMove, basé sur les ids, pas des indexes bruts)
 * - l'update optimiste + l'appel à la mutation de reorder + le rollback si erreur
 */
export function useSortablePhotos(photos, setPhotos, reorderTempImages) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // évite qu'un simple tap sur la carte (ou sur la croix ✕) ne démarre un drag
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(photos, oldIndex, newIndex);
    setPhotos(reordered); // optimistic update immédiat

    try {
      const results = await reorderTempImages({ filenames: reordered.map((p) => p.filename) }).unwrap();
      setPhotos(reordered.map((photo, i) => ({ ...photo, filename: results[i].newFilename })));
    } catch (error) {
      console.error("Erreur reorder:", error);
      setPhotos(photos); // rollback à l'ordre d'avant
    }
  };

  return { sensors, handleDragEnd };
}