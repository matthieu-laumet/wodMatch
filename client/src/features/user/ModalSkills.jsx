import { useState } from "react";
import OnboardSkill from "../home/OnboardSkills";

const ModalSkills = ({ userSkills, onSelectionChange }) => {

  return (
    <>
      <div className={`fun-reps-container suggestions`}>
        <div className="fun-reps-suggestions">
          <OnboardSkill userSkills={userSkills} onSelectionChange={onSelectionChange}/>
        </div>
      </div>
    </>
  );
};

export default ModalSkills;