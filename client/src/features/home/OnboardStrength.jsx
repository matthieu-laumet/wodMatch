import { PulseLoader } from "react-spinners";
import { useGetStrengthsQuery } from "../../slices/strengthsApiSlice";

const OnboardStrength = () => {
  const { data: strengths, isLoading: isLoadingStrengths, isSuccess: isSuccessStrengths } = useGetStrengthsQuery();

  if (isLoadingStrengths) return <PulseLoader color='#222' size={10} className="mt-12 ml-12"/>

  return (
    <>
      <div className="mt-2 mb-6">
        <h2 className="text-2xl font-semibold mb-2">Quels sont tes points forts ?</h2>
        <p>On a tous nos mouvements préférés, ceux dans lesquels on excelle. Partage-les avec les autres.</p>
      </div>
    </>
  );
};

export default OnboardStrength;