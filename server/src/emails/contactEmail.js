const { structureHTML } = require('./emailConfig');

const contactEmail = async (first_name, last_name, email, contactObject, message, target) => {
    return await structureHTML(
        `
            <p class='bold'>Demande de contact :</p>
            <p>${first_name} ${last_name}</p>
            <p><span class='bold'>E-mail : </span>${email}</p>
            <p><span class='bold'>Objet : </span>${contactObject}</p>
            <p><span class='bold'>Cible : </span>${target}</p>
            <br />
            <p class='bold'>Message :</p>
            <p>${message}</p>
        `
    );
}

module.exports = contactEmail;