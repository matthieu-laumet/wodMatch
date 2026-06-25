export const stylingText = (input) => {
  if (input) {
    const formatedText = input
      .replaceAll('$b', '<b class="bold-text">')
      .replaceAll('$/b', '</b>')
      .replaceAll('$l', "<div class='wods-text-light'>")
      .replaceAll('$/l', '</div>')
      .replaceAll('$h', "<div class='wods-text-highlight'>")
      .replaceAll('$/h', '</div>');

    return { __html: formatedText };
  }
}

export const capitalizeString = (str) => {
  return str?.split(' ')?.map(word => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()).join(' ');
}

export function formatterNombreAvecEspaces(nombre) {
  return nombre.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ").replace(/^(.+)\.0$/, '$1');
}

export const formatChampsError = (str) => {
  if (!str) return
  const cleanStr = str?.replace(/^(.*)\d+$/, '$1');
  if (cleanStr === 'teamName') {
    return "le nom d'équipe"
  } else if (cleanStr === 'email') {
    return "l'adresse e-mail"
  } else if (cleanStr === 'first_name') {
    return "le prénom"
  } else if (cleanStr === 'last_name') {
    return "le nom de famille"
  } else if (cleanStr === 'birth_date') {
    return "la date de naissance"
  } else if (cleanStr === 'telephone' || cleanStr === 'has_telephone') {
    return "le numero de téléphone"
  } else return cleanStr;
}

export function cleanSearch(input) {
  if (!input || typeof input !== "string") return "";

  return input
    .replace(/[-_\s]/g, "") // Remove '-', '_' and spaces
    .normalize("NFD") // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, ""); // Remove diacritics
}


export function liaisonVille(ville) {
  const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
  if (vowels.includes(ville[0].toLowerCase())) {
    return `d'${capitalizeString(ville)}`;
  } else {
    return `de ${capitalizeString(ville)}`
  };
}



export const ToChronoFormat = (input) => {
  // Supprime tous les caractères non numériques
  let sanitizedValue = input.toString().replace(/\D/g, '');
  
  if (sanitizedValue.length >= 8) {
    sanitizedValue = sanitizedValue.replace(/^00(.+)$/, '$1');
  }
  // Formate le texte en groupes de deux chiffres avec des séparateurs
  return sanitizedValue.replace(/(\d{2})(?=\d)/g, '$1 : ')
}

export const ToSeconds = (input) => {
  const sanitizedValue = input.replace(/\s/g, '');
  const minutes = parseInt(sanitizedValue.split(':')[0], 10) * 60;
  const seconds = parseInt(sanitizedValue.split(':')[1], 10);
  return minutes + seconds
}

export const tooltipText = (name, index) => {
  if (name === 'order') {
    return "Ce WOD est dans quel ordre dans la compétition ?"
  } else if (name === 'maxPoint') {
    return `Attribution d'un nombre de points au vainqueur du WOD et ce, quelque soit le nombre de participant. 
    Le coefficient sera calculé automatiquement pour l'attribution des points pour les autres concurrents.`
  } else if (name === 'cap') {
    return `La durée totale / maximale du WOD. Format : heure heure : minute minute : seconde seconde`
  } else if (name === 'pointPerScore') {
    return `Le nombre de point que rapporte chaque répétition au classement général.
    Par exemple, si un WOD est optionnel, chaque athlète qui y participe fait remporter à son équipe le nombre de point défini au classement général, quelque soit le résultat.
    Si renseigné, les max points et coef sont désactivés.`
  } else if (name === 'coef') {
    return `Coefficient de point. Correspond à l'écart de point au classement entre les athlètes.`
  } else if (name.includes('wod_level')) {
    return `Niveau demandé qui sera affiché au dessus de la description du WOD.
    Exemple : RX - Inter`
  } else if (name.includes('wod_description')) {
    return `Description du WOD, pouvant être mis en page en gras, surligné, ou light.
    Doit correspondre au niveau demandé dans le nom de la varation.`
  } else if (name.includes(`scoreDetails.${index}.name`)) {
    return `Par exemple : Athlète A
    ou le nom d'un mouvement.`
  } else if (name.includes(`isForAllDivisions`)) {
    return `Si le WOD a le cap, même type de WOD (AMRAP, For Time..) pour toutes les divisions.`
  } else if (name.includes(`isSpotLimited`)) {
    return `Indiquez le nombre d'athlete participant à ce wod. 
    Par exemple dans le cas d'une finale ou seul les X premiers athlètes sont qualifiés.`
  } else if (name.includes(`scoreDetails.${index}.coef`)) {
    return `Coefficient du score combiné. 
    Lors de la saisie le score sera automatiquement multiplié par ce coef.`
  } else if (name.includes(`wodDetails.${index}.detail`)) {
    return `Permet d'indiquer des informations supplémentaires, détails du scoring par exemple.`
  } else if (name.includes(`placeLimited`)) {
    return `Indiquez le nombre d'athlete participant à ce wod. Par exemple dans le cas d'une finale ou seul les X premiers athlètes sont qualifiés.`
  } else if (name.includes(`isWodCombine`)) {
    return `Le score de ce WOD est composé de plusieurs de partie.
    Par exemple : Max tonnage par Athlete A + Max tonnage Athlete B. Le score total sera ensuite calculé automatiquement.`
  } else if (name.includes(`isJustForScoring`)) {
    return `Lorsque que le WOD créé ne sert uniquement que pour le scoring de la compétition.
    Celui ne sera pas affiché sur la page /workouts avec le détails du WOD.`
  } else if (name.includes(`isDisplay-competition`)) {
    return `Permet d'afficher la compétition aux utilisateurs.
    Si non coché, vous pouvez programmer une date à laquelle celle-ci sera accessible aux athlètes.`
  } else if (name.includes(`isDisplay`)) {
    return `Permet d'afficher le descriptif du WOD dans la page /workouts.
    Si non coché, vous pouvez programmer une date à laquelle le WOD sera accessible aux athlètes.`
  } else {
    return name
  }
}


