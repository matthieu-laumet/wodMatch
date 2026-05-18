const { structureHTML } = require('./emailConfig');

const confirmEmail = async (first_name, link) => {
    return await structureHTML(
        `
            <p>Bonjour ${first_name}</p>
            <br />
            <p>Pour terminer la vérification d'adresse e-mail, confirmez votre adresse ci-dessous :</p>
            <a href=${link} class="btn">Comfirmer mon e-mail</a>
        `
    );
}

module.exports = confirmEmail;