import {useState, useEffect, useRef} from 'react';

export default function Timer() {
  const [startTimer, setStartTimer] = useState(false);
  const [timerValue, setTimerValue] = useState(0);
  const timerRef = useRef();
  const startRef = useRef(0);      // Date.now() when (re)started
  const baseRef = useRef(0);

  useEffect(() => {
    if (startTimer) {
      startRef.current = Date.now();
      timerRef.current = setInterval(() => {
				// time based approach since setinterval does not guarantee exact time
        setTimerValue(baseRef.current + (Date.now() - startRef.current));
      }, 10);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [startTimer]);

  const handleStart = () => {
    if (!startTimer) {
      setStartTimer(true);
    }
  }

  const handleStop = () => {
    if (startTimer) {
      baseRef.current = timerValue; // freeze what we had
      setStartTimer(false);
    }
  };

  const handleReset = () => {
    setStartTimer(false);
    baseRef.current = 0;
    setTimerValue(0);
  };

  const formatTime = () => {
    const ms = Math.floor(timerValue%1000);
    const sec = Math.floor(timerValue/1000)%60;
    const min = Math.floor(timerValue/(60*1000))%60;
    const h = Math.floor(timerValue/(60*60*1000));
    const formatHour = h/10 >=1 ? h : `0${h}`;
    const formatMin = min/10 >=1 ? min : `0${min}`;
    const formatSecond = sec/10 >=1 ? sec : `0${sec}`;
    return `${formatHour}:${formatMin}:${formatSecond}:${String(ms).padStart(3,'0')}`
  }


  return (
    <div>
      <div>{formatTime()}</div>
      <div style={{marginTop: '12px'}}>
        <button onClick={handleStart}>
          start
        </button>
        <button onClick={handleStop}>stop</button>
        <button onClick={handleReset}>reset</button>
      </div>
    </div>
  )
  
}
