import { useNavigate, useSearchParams } from "react-router-dom"
import dataApplicationsContext from "../context/dataApplicationsContext";
import { useContext, useEffect, useState } from "react";
import { useGetAllTopicsQuery } from "../slices/topicsApiSlice";

const SearchInput = ({ formClass, readOnly, wrapperClass, color = '#df0000' }) => {
  const { isSearchActive, setIsSearchActive, search, setSearch, windowWidth } = useContext(dataApplicationsContext);
  const { data: topics, isLoading, isSuccess, isError, error } = useGetAllTopicsQuery();

  const [searchParams] = useSearchParams();
  const [displayArticles, setDisplayArticles] = useState([]);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const query = searchParams.get('q'); // Récupère la valeur du paramètre 'q'

  useEffect(() => {
    if (query) {
      setSearch(query)
    } else {
      setSearch('')
    }
  }, [isSearchActive])

  const navigate = useNavigate();

  const handleReset = (e) => {
    setSearch('')
  }

  const handleSearch = (e) => {
    setSearch(e.target.value);
  }
  
  const handleNavigate = (link) => {
    navigate(link);
    window.scrollTo(0,0);
    setIsSearchActive(false)
    setShowSuggestion(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    if (search.trim()) { // Vérifie que la recherche n'est pas vide
      // Encode la recherche pour l'URL
      const searchQuery = encodeURIComponent(search.trim());
      // Navigate vers la page de recherche avec le query parameter
      handleNavigate(`/search?q=${searchQuery}`);
      setShowSuggestion(false);
    }
  };

  const handleClickInput = (e) => {
    if (windowWidth < 744) {
      e.preventDefault(); // Empêche le comportement par défaut
      e.stopPropagation(); // Arrête la propagation de l'événement
      setIsSearchActive(true);
      // // Focus l'autre input via la ref du contexte
      // searchInputRef.current?.focus();
    } else {
      setShowSuggestion(true)
    }
  }

  const handleSuggest = (suggestion) => {
    handleNavigate(`/search?q=${suggestion}`);
    (windowWidth >= 744 && suggestion) && setSearch(suggestion)
  }

  useEffect(() => {
    if (search.length > 0 && isSuccess) {
      const articlesResults = topics.filter((article) => {
        const lowerSearch = search
          
        const hasMatchingTag = article.tags?.some(tag => 
          tag.toLowerCase().startsWith(lowerSearch)
        );
        if (hasMatchingTag) {
          return article
        }
      })

      setDisplayArticles([[{suggestion: search}], articlesResults].flat())
    }
  }, [search, isSuccess]);


  // Ajoutez ces états
  const [selectedIndex, setSelectedIndex] = useState(-1); // -1 signifie aucune sélection
  const [articles, setArticles] = useState([
    // Pour les articles principaux quand search est vide
    { suggestion: "Rechercher des compétitions", path: '/topics/rechercher/26' },
    { suggestion: "Supprimer mon compte", path: '/topics/compte/12' },
    { suggestion: "Gestion portail organisateur", path: '#' }
  ]);


  // Gestionnaire d'événements clavier pour l'input
  const handleKeyDown = (e) => {
    const suggestions = search?.length > 0 ? displayArticles.slice(0, 5) : articles;
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : -1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (search?.length > 0) {
            handleSuggest(suggestions[selectedIndex].suggestion);
          } else {
            handleNavigate(suggestions[selectedIndex].path);
          }
          setSelectedIndex(-1);
          setShowSuggestion(false);
        } else {
          handleNavigate(`/search?q=${search}`);
          setShowSuggestion(false)
        }
        break;
        
      case 'Escape':
        setShowSuggestion(false);
        setSelectedIndex(-1);
        break;
    }
  };

  
  // if (isLoading) return <PulseLoader color={color} className='user-setting-container help' size={10}/>

  return (
    <div className={wrapperClass}>
      <form className={formClass} onSubmit={handleSubmit} onClick={handleClickInput}>
        <i className={`fa-solid fa-magnifying-glass loupe op-6`}></i>
        {(search.length > 0 && windowWidth >= 744) && <i className={`bi bi-x-lg close-search`} onClick={handleReset}></i>}
        <input 
          autoComplete="off"  type="text"  className='chart-search-input min-h-40' 
          placeholder={windowWidth >= 400 ? 'Rechercher des guides pratiques et plus' : "Rechercher dans l'aide"}
          value={windowWidth >= 744 ? search : query || ''} onChange={handleSearch} readOnly={readOnly} onKeyDown={handleKeyDown}
          onBlur={() => setSelectedIndex(-1)}
        />
      </form>
      {(windowWidth >= 744 && showSuggestion) &&
        <div className="suggestion-search-container pt-8 pb-8">
          {search.length === 0 &&
            articles.map((article, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div 
                    className={`article pt-8 pb-8 ${isSelected ? 'selected' : ''}`}
                    key={`article-${index}`}
                    onClick={() => handleNavigate(article.path)}
                  >
                    <i className="fa-regular fa-newspaper article-icon fz-18"></i>
                    <p className="fz-14 fw-500">{article.suggestion}</p>
                  </div>
                );
              })
          }
          {search.length > 0 &&
            displayArticles.slice(0,5).map((article, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div className={`article pt-8 pb-8 gap-24 ${isSelected ? 'selected' : ''}`} key={`suggestion-${index}`} onClick={() => handleSuggest(article.suggestion)}>
                  <i className={`fa-solid fa-magnifying-glass article-icon fz-16`}></i>
                  <p className="fw-500 fz-14">{article.suggestion}</p>
                </div>
              )
            })
          }
        </div>
      }
      {showSuggestion && <div className="background-close-search" onClick={() => setShowSuggestion(false)}></div>}
    </div>
  )
}

export default SearchInput