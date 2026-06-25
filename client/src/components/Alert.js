import Swal from 'sweetalert2';

const customClass = {
  title: 'swalTitle',
  htmlContainer: 'swalText',
  confirmButton: 'swalConfirm',
  cancelButton: 'swalCancel',
  popup: 'delete__popup',
  footer: 'delete__footer',
}
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

export const alerteChangeEmail = () => {
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

export const alerteDeleteSimple = () => {
  return {
    showCancelButton: true,
    reverseButtons: true,
    confirmButtonText: "Supprimer",
    cancelButtonText: "Annuler",
    showClass: {
      popup: '',
      backdrop: '',
      icon: ''
    },
    hideClass: {
      popup: '',
      backdrop: '',
      icon: ''
    },
    customClass: {
      popup: 'delete__popup photo__popup',
      confirmButton: 'photo__confirm',
      cancelButton: 'photo__cancel',
    },
  }
}

export const alerteWarningSimple = ({ warningText = "Attention, cette action est irréversible." } = {}) => {
  return {
    showCancelButton: true,
    reverseButtons: true,
    confirmButtonText: "Confirmer",
    cancelButtonText: "Annuler",
    showClass: { popup: '', backdrop: '', icon: '' },
    hideClass:  { popup: '', backdrop: '', icon: '' },
    customClass: {
      popup:         'delete__popup photo__popup',
      confirmButton: 'photo__confirm',
      cancelButton:  'photo__cancel',
    },
    html: `
      <div class="photo__warning">
        <span class="photo__warning-icon">⚠️</span>
        <p class="photo__warning-text">${warningText}</p>
      </div>
    `,
  }
}

export const alerteDeleteAccount = ({ isInTeam = false, warningText = "Attention, cette action est irréversible."}) => {
  // Étape 1 : la modale "Masquer vs Supprimer"
  return Swal.fire({
    title: 'Masquer mon compte',
    html: `
      <p>Besoin de break ? Tu peux masquer ton profil et disparaître des recherches. 
      Ton compte reste intact, tu reviens quand tu veux.</p>
    `,
    confirmButtonText: 'Masquer mon compte',
    cancelButtonText: 'Supprimer mon compte',
    showCancelButton: true,
    reverseButtons: false,
    customClass: { ...customClass, footer: null, actions: 'delete-account__actions' },
  }).then((result) => {
    if (result.isConfirmed) {
      // L'utilisateur a choisi "Masquer" → action directe
      return { action: 'hide' }
    } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
      // L'utilisateur a choisi "Supprimer" → étape 2
      return Swal.fire({
        title: 'Confirmer la suppression',
        html: `
          <p>Cette action est <strong>irréversible</strong>. Tu perdras :</p>
          <ul>
            <li>Ton profil et tes photos</li>
            <li>Les informations que tu as saisies</li>
          </ul>
          <p class="grace-info">Tu recevras un email avec un lien pour annuler pendant 14 jours.</p>
        `,
        confirmButtonText: 'Oui, supprimer définitivement',
        cancelButtonText: 'Annuler',
        showCancelButton: true,
        customClass: { ...customClass, footer: null, actions: 'delete-account__actions' },
      }).then((result) => {
        if (result.isConfirmed) return { action: 'delete' }
        return { action: 'cancel' }
      })
    }
    return { action: 'cancel' }
  })
}


export const alerteDeleteAccountConfirm = () => {
  return Swal.fire({
    title: 'Confirmer la suppression',
    html: `
      <p>Cette action est <strong>irréversible</strong>. Tu perdras :</p>
      <ul>
        <li>Ton profil et tes photos</li>
        <li>Les informations que tu as saisies</li>
      </ul>
      <p class="grace-info">Tu recevras un email avec un lien pour annuler pendant 14 jours.</p>
    `,
    confirmButtonText: 'Oui, supprimer définitivement',
    cancelButtonText: 'Annuler',
    showCancelButton: true,
    customClass: { ...customClass, footer: null, actions: 'delete-account__actions' },
  }).then((result) => {
    if (result.isConfirmed) return { action: 'delete' }
    return { action: 'cancel' }
  })
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
