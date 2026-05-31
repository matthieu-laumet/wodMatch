import { PulseLoader } from "react-spinners";
import { useGetSkillsQuery } from "../../slices/skillsApiSlice";
import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faX } from "@fortawesome/free-solid-svg-icons";
import { MAX_SELECTIONS } from "../../context/dataApplicationsContext";

const OnboardSkill = ({ setBtnText = null, setIsDisabled = false, userSkills = null, onSelectionChange = null }) => {
  const { data: skills, isLoading: isLoadingSkills, isSuccess: isSuccessSkills } = useGetSkillsQuery();

  const sentinelRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const [selected, setSelected] = useState(() => {
    const saved = sessionStorage.getItem("onboardSkills");
    if (userSkills) return userSkills;
    return saved ? JSON.parse(saved) : [];
  });
  const [search, setSearch] = useState("");
  const [filteredSkills, setFilteredSkills] = useState([]);

  useEffect(() => {
    if (userSkills) {
      setSelected(userSkills)
    }
  }, [userSkills])

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { setIsSticky(!entry.isIntersecting);},
      { threshold: 0,  rootMargin: "-60px 0px 0px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isSuccessSkills]);


  useEffect(() => {
    if (isSuccessSkills) {
      if (search.length > 0) {
        const filterSearch = skills?.filter((s) =>
          s.label.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredSkills(filterSearch)
      } else {
        setFilteredSkills(skills)
      }
    }
  }, [isSuccessSkills, search])


  useEffect(() => {
    if (setBtnText) {
      setBtnText(`Suivant (${selected.length}/${MAX_SELECTIONS})`);
      setIsDisabled(selected.length === 0);
    }
    onSelectionChange?.(selected); // 👈 déplacé ici
  }, [selected]);


  const toggle = (skill) => {
    setSelected((prev) => {
      const exists = prev.find((s) => s.id_skill === skill.id_skill);
      const next = exists
        ? prev.filter((s) => s.id_skill !== skill.id_skill)
        : prev.length < MAX_SELECTIONS ? [...prev, skill] : prev;
      !userSkills && sessionStorage.setItem("onboardSkills", JSON.stringify(next));
      return next;
    });
  };
  
  if (isLoadingSkills) return <PulseLoader color='#222' size={10} className="mt-12 ml-12"/> 

  return (
    <>
      <div className="onboard-skill mb-12">
        <div className="mt-2 mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold mb-2">Quels sont tes points forts ?</h2>
            <h2 className="text-md font-regular mb-2">({selected?.length}/{MAX_SELECTIONS})</h2>
          </div>
          <p>On a tous nos mouvements préférés, ceux dans lesquels on excelle. Partage-les avec les autres.</p>
        </div>
        <div ref={sentinelRef} style={{ height: "1px" }} />
        <div className={`search-skill${isSticky ? " search-skill--sticky" : ""}`}>
          <input
            type="text" className="onboard-skill__search"
            placeholder="Rechercher un skill..." value={search} onChange={(e) => setSearch(e.target.value)}
          />
          <FontAwesomeIcon icon={faMagnifyingGlass} className="searc-icon"/>
          {search.length > 0 && <FontAwesomeIcon icon={faX} className="close-icon" onClick={() => setSearch('')}/>}
        </div>
        <div className="onboard-skill__tags mt-4">
          {filteredSkills?.map((skill) => {
            const isSelected = selected.some((s) => s.id_skill === skill.id_skill);
            return (
              <button
                key={skill.id_skill}
                onClick={() => toggle(skill)}
                className={`onboard-skill__tag${isSelected ? " onboard-skill__tag--selected" : ""}`}
              >
                {skill.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default OnboardSkill;