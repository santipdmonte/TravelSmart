import logoImage from '../assets/logos/logo-v2-sin-bordes.png';

const Navbar = () => {
  return (
    <header className="bg-[#EEF5FB]/95 shadow-md fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
      <div className="max-w-[1400px] w-full mx-auto py-2 px-6 md:px-8 flex items-center">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="TravelSmart Logo" className="h-10 md:h-12" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#003B66]">TravelSmart</h1>
            <p className="text-sm text-[#003B66]/80">Planifica tu próxima aventura</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 