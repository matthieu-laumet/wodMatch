const pwdUpdated = (inputUpdated, link, now, location, deviceInfo) => {
    return (
        `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>@import url(https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800;900&family=Permanent+Marker&display=swap);</style>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 16px;
                    }
                    .container {
                        border-radius: 10px;
                        width: 50%;
                        margin: 0 auto;
                        padding: 50px;
                        border: 1px solid #A9A9A9;
                    }
                    .btn {
                        display: inline-block;
                        padding: 16px 28px;
                        margin: 20px 0;
                        text-decoration: none;
                        background-color: #df0000;
                        color: white;
                        border-radius: 5px;
                    }
                    .section {
                        display: inline-block;
                        padding-top: 20px;
                        width: 100%;
                        padding-bottom: 20px;
                        border-top: 1px solid #A9A9A9;
                    }
                    p, h1, h3, h4 {
                        font-family: "Montserrat", sans-serif;
                        margin: 0;
                    }
                    h1 {
                        font-size: 24px;
                        font-weight: 600;
                        margin-top: 20px;
                        margin-bottom: 12px;
                    }
                    h3 {
                        margin: 0;
                        margin-bottom: 16px;
                        font-weight: 600;
                        margin-top: 40px;
                    }
                    h4 {
                        margin: 0;
                        margin-bottom: 4px;
                    }
                    p {
                        font-size: 16px;
                        font-weight: 500;
                        line-height: 25px;
                    }
                    .light {
                        font-size: 14px;
                        font-weight: 400;
                        line-height: 25px;
                    }
                    @media only screen and (max-width: 600px) {
                        .container {
                            padding: 24px;
                            width: 90%;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <img 
                        src="https://res.cloudinary.com/dkz9knsgj/image/upload/v1708697111/wq1sx6mw5awrzzsb3nhr.png" 
                        alt="Image de réinitialisation" 
                        style="width:100%; max-width:130px; height:auto;"
                    >
                    <h1>Avez-vous modifié votre ${inputUpdated} ?</h1>
                    <p>Nous avons remarqué que le ${inputUpdated} de votre compte Wodzone a récemment été modifié. Si vous n'avez pas effectué cette modification, vérifiez votre compte dès maintenant. <br> Si vous êtes à l'origine de cette opération, vous pouvez ignorer cet e-mail en toute sécurité.</p>
                    <h3 class="1st se">${inputUpdated} modifié</h3>
                    <div class='section'>
                        <h4>Horaires</h4>
                        <p>${now}</p>
                    </div>
                    <div class='section'>
                        <h4>Lieu</h4>
                        <p>${location}</p>
                        <p class="light">à +/- 200 km ^^</p>
                    </div>
                    <div class='section'>
                        <h4>Type d'appareil</h4>
                        <p>${deviceInfo.device} avec Navigateur ${deviceInfo.navigateur}</p>
                        <a href="${link}" class="btn">Vérifier mon compte</a>
                    </div>
                </div>
            </body>
            </html>
        `
    )
}

module.exports = pwdUpdated;