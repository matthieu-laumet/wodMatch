export default function SwipeElement() {
  return (
    <div className="swipe-element-container">
      <button className="w-12 h-12 rounded-full border border-[#303030] flex items-center justify-center bg-white">
        <i className="bi bi-arrow-counterclockwise text-xl text-[#303030]"></i>
      </button>
      <button className="w-14 h-14 rounded-full border border-red-400 flex items-center justify-center bg-white">
        <i className="bi bi-x-lg text-2xl text-red-400"></i>
      </button>
      <button className="w-14 h-14 rounded-full border border-[#87BA7E] flex items-center justify-center bg-white">
        <i className="bi bi-heart-fill text-2xl text-[#87BA7E]"></i>
      </button>
      <button className="w-12 h-12 rounded-full border border-[#303030] flex items-center justify-center bg-white">
        <i className="bi bi-send text-xl text-[#303030]"></i>
      </button>
    </div>
  )
}