const { structureHTML } = require('./emailConfig');

const newUser = async (first_name, link, isNewBox) => {
    return await structureHTML(
        `
            <p class='mt-24'>Bonjour ${first_name}</p>
            <br />
            <p>Bienvenue sur Wodzone, la plateforme dédiée à vos compétitions de CrossFit.</p>
            <p class="mt-16 mb-8">Vous avez presque terminé. il ne vous reste plus qu'à confirmer votre adresse mail en cliquant le sur le bouton ci-dessous</p>
            <a href=${link} class="btn">Comfirmer mon e-mail</a>
            ${isNewBox 
                ?  `<br />
                    <p class="mt-24 sql">Petite remarque : Vous venez de suggérer une nouvelle box. Nous vous en remercions. 
                    Après validation de l'equipe de Wodzone, votre profil sera mis à jour automatiquement.</p>
                    <p class="sql">Vous être en attendant membre de la box Corssfit No Name.</p>
                    `
                : ''
            }
        `
    );
}

module.exports = newUser;