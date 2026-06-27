import { useContext } from "react"
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import dataApplicationsContext from "../../context/dataApplicationsContext";

const Tags = ({ tagImages, isActive, handleClicIconFilterRapide, widthCondition }) => {
  const {windowWidth} = useContext(dataApplicationsContext);

  let nbSlides
  if (windowWidth < 1100) {
    nbSlides = 9
  } else if (windowWidth < 1200) {
    nbSlides = 10
  } else if (windowWidth < 1400) {
    nbSlides = 11
  } else if (windowWidth < 1600) {
    nbSlides = 13
  } else {
    nbSlides = 13
  }

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: nbSlides,
    slidesToScroll: nbSlides
  };

  const tags = 
    <div className={`tags-wrapper ${!widthCondition ? 'overflow' : ''} mt-6`}>
      {!widthCondition 
        ? tagImages?.map(tag => {
            return (
              <div  className={`icon-filter-container ${isActive(tag.tag_slug)}`}
                    key={`icon-tag-${tag.tag_name}`} data-filter={tag.tag_slug} onClick={handleClicIconFilterRapide}
              >
                <img src={tag.tag_img} alt={tag.tag_name} data-filter={tag.tag_slug} className="icon-filter"/>
                <p data-filter={tag.tag_slug} className="label-icon-filter">{tag.tag_name.replace(' persons', '')}</p>
              </div>
            )
          })
        : <Slider {...settings}>
            {tagImages.map(tag => {
              return (
                <div  className={`icon-filter-container ${isActive(tag.tag_slug)}`}
                      key={`icon-tag-${tag.tag_name}`} data-filter={tag.tag_slug} onClick={handleClicIconFilterRapide}
                >
                  <img src={tag.tag_img} alt={tag.tag_name} data-filter={tag.tag_slug} className="icon-filter w-[32px]"/>
                  <p data-filter={tag.tag_slug} className="label-icon-filter">{tag.tag_name.replace(' persons', '')}</p>
                </div>
              )
            })}
          </Slider>
      }
    </div>

  return tags
}

export default Tags