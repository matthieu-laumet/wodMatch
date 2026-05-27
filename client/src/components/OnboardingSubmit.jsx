

export default function OnboardingSubmit({ onSubmit, btnText, isDisabled, setSection }) { 

  const handleNext = async () => {
    if (isDisabled) return
    onSubmit && await onSubmit();
    setSection((prev) => prev + 1)
    window.scroll(0, 0);
  };

  return (
    <div className="mt-auto pb-6">
        <button
          onClick={handleNext}
          disabled={isDisabled}
          className={`w-full py-4 rounded-2xl text-white font-semibold text-lg transition-all
            ${isDisabled ? 'bg-[#222] opacity-40 cursor-not-allowed' : 'bg-[#222] active:scale-95'}`}
        >
          {btnText}
        </button>
      </div>
  )
}