import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * Wrapper autour de useSortable() qui renvoie directement un objet prêt à
 * spreader sur l'élément JSX de la carte. Contrairement à react-beautiful-dnd,
 * dnd-kit ne passe JAMAIS l'élément en position:fixed pendant le drag : il
 * reste dans le flow normal et se contente d'un `transform` CSS. Du coup :
 * - pas de bug de largeur en % qui "grossit" pendant le drag
 * - pas de bug de containing block qui fait dériver la carte au scroll
 *
 */
export function useSortableCard(id) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.85 : undefined,
  };

  return { setNodeRef, attributes, listeners, style, isDragging };
}