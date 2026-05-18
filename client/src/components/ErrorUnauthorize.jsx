import { Link } from "react-router-dom";

const ErrorUnauthorize = () => {
  
  return (
    <div className={`bodyContainer`} id="body-container-error-401">
      <div className="oops-container"  id="oops-401">
        <div className="oops-wrapper" id="oops-wrapper-404">
          <div className="oops-content">
            <div className="oops-text">
              <div className="oops-title">
                <h1>Oups !</h1>
              </div>
              <p className="oops-text-text">Désolé, Mais vous n'êtes pas autorisé à accéder a cette page... En cas de besoin veuillez nous contacter.</p>
            </div>
            <Link to="/" className="oops-btn">Retour à l'accueil</Link>
          </div>
          <img src="/images/401-error.svg" alt="Error-404" className="img-error" id="img-error-401"></img>
        </div>
      </div>
    </div>
  )
}

export default ErrorUnauthorize