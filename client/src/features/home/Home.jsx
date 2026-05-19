

const Home = () => {

  const handleNav = ({ url, generateCookie }) => {
    if (generateCookie) {
      const expirationDate = new Date();
      expirationDate.setMinutes(expirationDate.getMinutes() + 20);
      const cookieName = 'wodMatchRedirect';
      const dataToShare = { urlRedirect: process.env.REACT_APP_FRONT_URL, cookieName }
      document.cookie = `${cookieName}=${JSON.stringify(dataToShare)}; domain=.wodzone.fr; path=/; expires=${expirationDate.toUTCString()}`;
    }
    window.location.href = url;
  }

  return (
    <div className="h-[calc(100dvh-60px)] relative">
      <h1 className="banner-title">Swipe ton prochain coéquipier de podium™</h1>
      <img src="images/wodmatch_banner.png" className="banner-image"/>
      <div className="btn-containers">
        <button className="btn btn-register">Créer un compte</button>
        <button 
          className="btn btn-login" 
          onClick={() => handleNav({ url: `${process.env.REACT_APP_FRONT_URL_APP}/auth`, generateCookie: true })}
        >
          Connexion
        </button>
      </div>
      <p className="banner-text">Les photos mettent en scène des mannequins, et sont exclusivement utilisées à des fins d’illustration</p>
    </div>
  )
}

export default Home