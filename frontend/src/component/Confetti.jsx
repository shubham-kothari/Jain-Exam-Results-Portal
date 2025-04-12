import React, { useEffect } from 'react';
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";

function Confetti({ show, setShow }) {
  useEffect(() => {
    let timer;
    if (show) {
      timer = setTimeout(() => {
        setShow(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [show, setShow]);

  return <>{show && <Fireworks autorun={{ speed: 3 }} />}</>;
}

export default Confetti;
