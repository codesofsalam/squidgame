import PropTypes from 'prop-types';

const StartScreen = ({ onStart, isVisible }) => {
  return (
    <div
      className={`absolute inset-0 z-30 flex items-center justify-center transition-all duration-1000 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{
        backgroundImage: 'url("/logo.gif")', // Use the GIF file here
        backgroundSize: 'cover', // Ensures the GIF covers the entire container
        backgroundPosition: 'center', // Centers the GIF
        backgroundRepeat: 'no-repeat', // Prevents tiling of the GIF
        height: '100vh', // Full viewport height
        width: '100vw', // Full viewport width
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 text-center space-y-8">
        <img
          src="/start.jpg"
          alt="Start Game"
          onClick={onStart}
          className="w-96 mt-72 commit h-auto mx-auto cursor-pointer transition-transform hover:scale-105"
        />
        <p className="text-white text-xl mt-4">Click Above to Start</p>
      </div>
    </div>
  );
};

StartScreen.propTypes = {
  onStart: PropTypes.func.isRequired,
  isVisible: PropTypes.bool.isRequired,
};

export default StartScreen;
