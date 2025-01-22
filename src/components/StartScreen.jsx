import PropTypes from 'prop-types';

const StartScreen = ({ onStart, isVisible }) => {
  return (
    <div
      className={`absolute inset-0 z-30 flex items-center justify-center transition-all duration-1000 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      } start-screen-bg`}
      style={{
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '100vh',
        width: '100vw',
      }}
    >
      <style>
        {`
          /* Use logomobile.gif for devices with a max-width of 768px */
          @media (max-width: 768px) {
            .start-screen-bg {
              background-image: url('/logomob.gif');
            }
          }

          /* Default to logo.gif for larger devices */
          @media (min-width: 769px) {
            .start-screen-bg {
              background-image: url('/logo.gif');
            }
          }
        `}
      </style>

     
      <div className="absolute inset-0 bg-black/30" />

      
      <div className="relative z-10 text-center space-y-4 md:space-y-8 px-4 md:px-0">
        <img
          src="/start.jpg"
          alt="Start Game"
          onClick={onStart}
          className="w-64 md:w-96 mt-48 md:mt-72 h-auto mx-auto cursor-pointer transition-transform hover:scale-105 active:scale-95"
        />
        <p className="text-white text-lg md:text-xl mt-2 md:mt-4">
          Click Above to Start
        </p>
      </div>
    </div>
  );
};

StartScreen.propTypes = {
  onStart: PropTypes.func.isRequired,
  isVisible: PropTypes.bool.isRequired,
};

export default StartScreen;
