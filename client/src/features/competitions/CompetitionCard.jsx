import GetImage from "../../components/GetImage";

export default function CompetitionCard({ competition }) {
  const minPrice = Math.min(...competition.divisions.map(d => d.price));
  const maxPrice = Math.max(...competition.divisions.map(d => d.price));
  const date = new Date(competition.begin);
  const day = date.getDate();
  const month = date.toLocaleString('fr-FR', { month: 'short' }).toUpperCase();
  const price = minPrice === 0 ? 'Gratuit' : `${minPrice}${(minPrice !== maxPrice) ? `-${maxPrice}` : ''} €`;

  const competitionModes = [...competition.event_mode].sort((a, b) => a.order - b.order).map(mode => {
    return `#${mode.mode} `
  });

  return (
    <div className="flex items-center gap-4 py-4 border-b">
      
      {/* Date + prix */}
      <div className="flex flex-col items-center min-w-[60px]">
        <div className="flex gap-2 items-baseline">
          <span className="text-xl font-black">{day}</span>
          <span className="text-sm font-semibold">{month}</span>
        </div>
        <GetImage src={competition?.img_small} className={"card-compet-img"}/>
        <span className="text-sm mt-1 font-medium">{price}</span>
      </div>

      {/* Séparateur */}
      <div className="w-px h-20 bg-gray-300" />

      {/* Infos */}
      <div className="flex flex-col grow">
        <div className="flex justify-between items-baseline">
          <p className="text-sm font-medium text-[#808080]">{competitionModes}</p>
          <i className="bi bi-star cursor-pointer text-xl"></i>
        </div>
        <h4 className="font-bold text-base uppercase mt-1">{competition.name}</h4>
        <div className="flex items-start gap-2 mt-1 text-sm text-gray-600">
          <i className="bi bi-geo-alt-fill card-geo-icon"></i>
          <span>{competition.compet_adresse?.trim()},<br/>{competition.compet_code_postal} {competition.compet_ville}</span>
        </div>
      </div>

    </div>
  )
}