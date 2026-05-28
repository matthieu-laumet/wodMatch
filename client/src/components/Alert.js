import Swal from 'sweetalert2';

const customClass = {
  title: 'swalTitle',
  htmlContainer: 'swalText',
  confirmButton: 'swalConfirm',
  cancelButton: 'swalCancel',
  popup: 'delete__popup',
  footer: 'delete__footer',
}
const showCancelButton = true;
const reverseButtons = true;
const icon = 'warning';
const cancelButtonText = 'Annuler';


export const alerteDeleteFunrep = () => {
  return {
    title: `Supprimer`,
    text: `Tu veux vraiment supprimer cette Fun Rep ?`,
    showCancelButton: true,
    reverseButtons: true,
    customClass: customClass,
    confirmButtonText: "Confirmer", // Modifier le texte du bouton de confirmation ici
    icon: 'info',
    cancelButtonText
  }
}

// export const AlerteSlotsOpen = (participant) => {
//   return {
//     title: `Êtes-vous sûr(e) ?`,
//     html: `
//       <div class='pl-32 pr-32'>
//         <p class='mb-0'>Tous les athlètes des catégories sélectionnées seront automatiquement retirés de la liste d'attente. Cette action est irréversible.</p>
//         <div style="margin-top: 20px;">
//           <label for="confirmation-input" style="display: block; margin-bottom: 8px; text-align: left;">
//             Pour confirmer, veuillez taper : <strong>prévenir tous les athlètes</strong>
//           </label>
//           <input 
//             type="text" 
//             id="confirmation-input" 
//             class="swal2-input" 
//             placeholder="Tapez la phrase de confirmation"
//             style="width: 100%; margin: 0;"
//           >
//         </div>
//       </div>
//     `,
//     icon,
//     showCancelButton,
//     reverseButtons,
//     customClass,
//     cancelButtonText,
//     confirmButtonText: 'Confirmer',
//     preConfirm: () => {
//       const input = document.getElementById('confirmation-input');
//       const value = input.value.trim();
      
//       if (value?.toLowerCase() !== 'prévenir tous les athlètes') {
//         Swal.showValidationMessage(
//           'Vous devez taper exactement : "prévenir tous les athlètes"'
//         );
//         return false;
//       }
//       return true;
//     }
//   }
// }
