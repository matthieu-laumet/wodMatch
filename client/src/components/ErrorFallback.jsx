// import Navbar from './Navbar';
import Footer from './Footer';
import { useContext } from 'react';
import { Link } from "react-router-dom";
import dataApplicationsContext from '../context/dataApplicationsContext';
import Navbar from './Navbar';

const ErrorFallback = ({noFooter, hasErrorBondary, error, errorInfo, firstStack, stack}) => {
  const { windowWidth } = useContext(dataApplicationsContext);

  let errorMsg, errorConnue = false
  if (error) {
    if (error?.status === 'FETCH_ERROR') {
      errorConnue = true
      errorMsg = `DSL, mais le serveur est cassé...`
    } else {
      errorMsg = `${error.toString()}`
    }
  }
  
  let stackMessage=[];
  for (let i=1; i < 4; i++) {
    stackMessage.push(<p className="detail-error-msg" key={i}>{errorInfo?.componentStack ? `${stack[i]}` : 'No stack trace available.'}</p>);
  }

  const limitWidth = 600;
  const src = (windowWidth >= limitWidth || window.innerWidth >= limitWidth) ? "/images/500_lg.png" : "/images/erreur-500-tel.webp";
  
  return (
    <>
      <div className={`bodyContainer`}>
        <div className="oops-container" id="oops-container-404">
          <div className="oops-wrapper" id="oops-wrapper-404">
            <div className="oops-content err-500" id="oops-content-404">
              <div className="oops-text" id='oops-text-500'>
                <div className="oops-title-container">
                  <h1 className="oops-title er-500" id='oops-title-500'>Oups ! Erreur server...</h1>
                </div>
                <p className="detail-error-msg er-500" id='detail-error-msg-500'>Actualisez la page ou contactez-nous si le problème persiste.</p>
              </div>
              <a href="/" className="oops-btn" id="btn-500">Retour à l'accueil</a>
            </div>
            <img src={src} alt="Error-500" className={`img-error ${windowWidth >= 1200 ? 'xl' : windowWidth >= limitWidth ? 'lg' : ''}`} id="img-500"/>
          </div>
        </div>
      </div>
      {!noFooter && <Footer />}
    </>
  )

  // return (
  //   <>
  //     <div className={`oops-container`} id="oops-container-500">
  //       <div className={`oops-wrapper`} id="oops-wrapper-500">
  //         <div className="oops-content" id="oops-content-500">
  //           <div className="oops-text" id='oops-text-500'>
  //             <div className="oops-title-container">
  //               <h1 className="oops-title" id='oops-title-500'>Oups ! Erreur server...</h1>
  //             </div>
  //             {/* <p className="detail-error-msg" id='detail-error-msg-500'>Désolé, mais cette pauvre conne a laché la kettle...</p> */}
  //             <p className="detail-error-msg" id='detail-error-msg-500'>Actualisez la page ou contactez-nous si le problème persiste.</p>
  //             {/* <p className="detail-error-msg" id='detail-error-msg-500'>Essayez de rafraîchir cette page ou n'hésitez pas à nous contacter si le problème persiste.</p> */}
  //             {/* <p className="detail-error-msg" id='detail-error-msg-500'>{error && errorMsg}</p> */}
  //             <a href="/" className="oops-btn" id="btn-500">Retour à l'accueil</a>
  //           </div>
  //         </div>
  //         <img src="/images/erreur-500-tel.webp" alt="Error-500" className="img-error" id="img-500"/>
  //       </div>
  //     </div>
  //     {!noFooter && <Footer />}
  //   </>
  // )
}

export default ErrorFallback
