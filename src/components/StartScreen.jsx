
import PropTypes from 'prop-types';

const StartScreen = ({ onStart, isVisible }) => {
  return (
    <div 
      className={`absolute inset-0 z-30 flex items-center justify-center transition-all duration-1000 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ 
        backgroundImage: 'url("/wallpaper.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 text-center space-y-8">
        <h1 className="text-6xl font-bold text-white mb-8 animate-pulse">
          Red Light, Green Light
        </h1>
        <img 
          src="/start.jpg"
          alt="Start Game"
          onClick={onStart}
          className="w-96 h-auto mx-auto cursor-pointer transition-transform hover:scale-105"
        />
        <p className="text-white text-xl mt-4">Click to Start</p>
      </div>
    </div>
  );
};
StartScreen.propTypes = {
  onStart: PropTypes.func.isRequired,
  isVisible: PropTypes.bool.isRequired,
};

export default StartScreen;
