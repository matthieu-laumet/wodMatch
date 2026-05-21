import { PulseLoader } from "react-spinners";
import { useGetStrengthsQuery } from "../../slices/strengthsApiSlice";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faX } from "@fortawesome/free-solid-svg-icons";

const OnboardStrength = () => {
  const { data: strengths, isLoading: isLoadingStrengths, isSuccess: isSuccessStrengths } = useGetStrengthsQuery();

  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredStrengths, setFilteredStrengths] = useState([]);
  const MAX_SELECTIONS = 8; // adjust as needed (image 1 shows 0/5, image 2 shows 7/8)

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id) : prev.length < MAX_SELECTIONS
        ? [...prev, id] : prev
    );
  };

  useEffect(() => {
    if (isSuccessStrengths) {
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

  if (isLoadingStrengths) return <PulseLoader color='#222' size={10} className="mt-12 ml-12"/> 
  

  return (
    <div className="onboard-strength mb-12">
      <div className="mt-2 mb-4">
        <h2 className="text-2xl font-semibold mb-2">Quels sont tes points forts ?</h2>
        <p>On a tous nos mouvements préférés, ceux dans lesquels on excelle. Partage-les avec les autres.</p>
      </div>
      <div className="search-strength">
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
  );
};

export default OnboardStrength;