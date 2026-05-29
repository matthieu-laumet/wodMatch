import { useContext, useEffect, useState } from "react";
import dataApplicationsContext, { titleApp } from "../../context/dataApplicationsContext";
import { useGetUserTempImagesQuery } from "../../slices/imagesApiSlice";
import { PulseLoader } from "react-spinners";

export default function Competitions({ }) {

  return (
    <div className='full-screen'>
      <p>Competitions</p>
    </div>
  )
}