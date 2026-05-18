const reinitPwd = (name, link) => {
    return (
        `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: "Montserrat", sans-serif;
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
                        padding: 12px 24px;
                        margin: 20px 0;
                        text-decoration: none;
                        background-color: #df0000;
                        color: white;
                        border-radius: 5px;
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
                    <p>Bonjour ${name},</p>
                    <p>Nous avons reçu une demande pour réinitialiser votre mot de passe.</p>
                    <p>Si vous n'avez pas fait la demande, ignorez simplement ce message. Sinon, vous pouvez réinitialiser votre mot de passe.</p>
                    <a href="${link}" class="btn">Réinitialiser le mot de passe</a>
                    <p>Merci,</p>
                    <p>L'équipe Wodzone</p>
                </div>
            </body>
            </html>
        `
    )
}

module.exports = reinitPwd;