import { PulseLoader } from "react-spinners";
import { useCleanUpsertUserSkillsMutation, useGetSkillsQuery } from "../../slices/skillsApiSlice";
import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faX } from "@fortawesome/free-solid-svg-icons";

const OnboardSkill = ({ setBtnText, setIsDisabled }) => {
  const { data: skills, isLoading: isLoadingSkills, isSuccess: isSuccessSkills } = useGetSkillsQuery();

  const sentinelRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const [selected, setSelected] = useState(() => {
    const saved = sessionStorage.getItem("onboardSkills");
    return saved ? JSON.parse(saved) : [];
  });
  const [search, setSearch] = useState("");
  const [filteredSkills, setFilteredSkills] = useState([]);
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
    setBtnText(`Suivant (${selected.length}/${MAX_SELECTIONS})`)
    setIsDisabled(selected.length === 0)
  }, [selected]);


  const toggle = (id) => {
    setSelected((prev) => {
      const next = prev.includes(id)
        ? prev.filter((s) => s !== id) : prev.length < MAX_SELECTIONS 
          ? [...prev, id] : prev;
      sessionStorage.setItem("onboardSkills", JSON.stringify(next));
      return next;
    });
  };

  
  if (isLoadingSkills) return <PulseLoader color='#222' size={10} className="mt-12 ml-12"/> 

  return (
    <>
      <div className="onboard-skill mb-12">
        <div className="mt-2 mb-4">
          <h2 className="text-2xl font-semibold mb-2">Quels sont tes points forts ?</h2>
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
            const isSelected = selected.includes(skill.id_skill);
            return (
              <button
                key={skill.id_skill}
                onClick={() => toggle(skill.id_skill)}
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