const HeroArrowButton = ({ direction, onClick, disabled }) => {
  const isLeft = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isLeft ? "Chuyển banner trước" : "Chuyển banner sau"}
      className="absolute top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-3 transition hover:bg-black/50 disabled:cursor-not-allowed"
      style={{ [isLeft ? "left" : "right"]: "1rem" }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points={isLeft ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
      </svg>
    </button>
  );
};

const HomeHeroSlider = ({ banners, currentSlide, isAnimating, onPrev, onNext, onSelect, onExplore }) => {
  const slide = banners[currentSlide];

  return (
    <section className="relative h-80 overflow-hidden rounded-b-lg shadow-2xl md:h-96">
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} transition-opacity duration-500`}>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative h-full">
        <div className="absolute inset-0 overflow-hidden">
          <img src={slide.image} alt={slide.title} className="h-full w-full scale-105 object-cover opacity-60" />
        </div>

        <div className="container relative z-10 mx-auto flex h-full items-center px-4">
          <div className="max-w-lg">
            <h1 className="mb-4 text-3xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">{slide.title}</h1>
            <p className="mb-6 text-lg text-white drop-shadow-lg md:text-xl">{slide.description}</p>
            <button
              type="button"
              onClick={onExplore}
              className="rounded-full bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-red-700 hover:to-red-800"
            >
              Khám phá khóa học
            </button>
          </div>
        </div>

        <HeroArrowButton direction="prev" onClick={onPrev} disabled={isAnimating} />
        <HeroArrowButton direction="next" onClick={onNext} disabled={isAnimating} />

        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Chuyển tới banner ${index + 1}`}
              className={`mx-1 h-3 w-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeHeroSlider;
