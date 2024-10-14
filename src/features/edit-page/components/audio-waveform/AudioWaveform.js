import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FastForward, FastRewind, Pause, PlayArrow, Start } from '@mui/icons-material';
import { useWavesurfer } from '@wavesurfer/react';
import { FileContext } from 'src/common/contexts/fileContext';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';

const AudioWaveform = () => {
  const containerRef = useRef(null);
  const { fileURL } = useContext(FileContext);
  const [isPlaying, setIsPlaying] = useState(false);

  const { wavesurfer } = useWavesurfer({
    container: containerRef,
    autoCenter: true,
    cursorColor: 'violet',
    waveColor: '#211027',
    progressColor: '#69207F',
    url: fileURL,
    // @ts-ignore
    plugins: useMemo(() => [Timeline.create()], []),
  });

  const onPlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
    wavesurfer && wavesurfer.playPause();
  }, [wavesurfer]);

  const onSkipForward = useCallback(() => {
    wavesurfer && wavesurfer.skip(5);
  }, [wavesurfer]);

  const onSkipBackward = useCallback(() => {
    wavesurfer && wavesurfer.skip(-5);
  }, [wavesurfer]);

  const onMoveToStart = useCallback(() => {
    wavesurfer && wavesurfer.seekTo(0);
  }, [wavesurfer]);

  const onMoveToEnd = useCallback(() => {
    wavesurfer && wavesurfer.seekTo(1);
  }, [wavesurfer]);

  useEffect(() => {
    if (wavesurfer) {
      // wsf.on('ready', () => {
      //   wsf.play();
      // });
    }
  }, [wavesurfer]);

  return (
    <>
      <div className="waveform-container">
        <div ref={containerRef} />
      </div>
      <div className="controls-bar">
        <button onClick={onMoveToStart}>
          <Start style={{ transform: 'rotate(180deg)' }} />
        </button>
        <button onClick={onSkipBackward}>
          <FastRewind />
        </button>
        <button onClick={onPlayPause}>{isPlaying ? <Pause /> : <PlayArrow />}</button>
        <button onClick={onSkipForward}>
          <FastForward />
        </button>
        <button onClick={onMoveToEnd}>
          <Start />
        </button>
      </div>
    </>
  );
};

export default AudioWaveform;
