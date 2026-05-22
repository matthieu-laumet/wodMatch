import { PulseLoader } from "react-spinners";
import { useGetStrengthsQuery } from "../../slices/strengthsApiSlice";
import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faX } from "@fortawesome/free-solid-svg-icons";
import ModalStructure from "../../components/ModalStructure";

const OnboardStrength = ({ setBtnText, setIsDisabled }) => {
  const { data: strengths, isLoading: isLoadingStrengths, isSuccess: isSuccessStrengths } = useGetStrengthsQuery();

  const sentinelRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const [selected, setSelected] = useState(() => {
    const saved = sessionStorage.getItem("onboardStrengths");
    return saved ? JSON.parse(saved) : [];
  });
  const [search, setSearch] = useState("");
  const [filteredStrengths, setFilteredStrengths] = useState([]);
  const MAX_SELECTIONS = 8; // adjust as needed (image 1 shows 0/5, image 2 shows 7/8)

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { setIsSticky(!entry.isIntersecting);},
      { threshold: 0,  rootMargin: "-60px 0px 0px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isSuccessStrengths]);


  useEffect(() => {
    if (isSuccessStrengths) {
      setBtnText(`Suivant (${selected.length}/${MAX_SELECTIONS})`)
      if (search.length > 0) {
        const filterSearch = strengths?.filter((s) =>
          s.label.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredStrengths(filterSearch)
      } else {
        setFilteredStrengths(strengths)
      }
    }
  }, [isSuccessStrengths, search])


  useEffect(() => {
    setBtnText(`Suivant (${selected.length}/${MAX_SELECTIONS})`)
    setIsDisabled(selected.length === 0)
  }, [selected]);


  const toggle = (id) => {
    setSelected((prev) => {
      const next = prev.includes(id)
        ? prev.filter((s) => s !== id)
        : prev.length < MAX_SELECTIONS
        ? [...prev, id]
        : prev;

      sessionStorage.setItem("onboardStrengths", JSON.stringify(next));
      return next;
    });
  };

  
  if (isLoadingStrengths) return <PulseLoader color='#222' size={10} className="mt-12 ml-12"/> 


  return (
    <>
      <div className="onboard-strength mb-12">
        <div className="mt-2 mb-4">
          <h2 className="text-2xl font-semibold mb-2">Quels sont tes points forts ?</h2>
          <p>On a tous nos mouvements préférés, ceux dans lesquels on excelle. Partage-les avec les autres.</p>
        </div>
        <div ref={sentinelRef} style={{ height: "1px" }} />
        <div className={`search-strength${isSticky ? " search-strength--sticky" : ""}`}>
          <input
            type="text" className="onboard-strength__search"
            placeholder="Rechercher un skill..." value={search} onChange={(e) => setSearch(e.target.value)}
          />
          <FontAwesomeIcon icon={faMagnifyingGlass} className="searc-icon"/>
          {search.length > 0 && <FontAwesomeIcon icon={faX} className="close-icon" onClick={() => setSearch('')}/>}
        </div>
        <div className="onboard-strength__tags mt-4">
          {filteredStrengths?.map((strength) => {
            const isSelected = selected.includes(strength.id_strength);
            return (
              <button
                key={strength.id_strength}
                onClick={() => toggle(strength.id_strength)}
                className={`onboard-strength__tag${isSelected ? " onboard-strength__tag--selected" : ""}`}
              >
                {strength.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default OnboardStrength;