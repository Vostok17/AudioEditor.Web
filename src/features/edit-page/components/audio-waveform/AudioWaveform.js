import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  AddCircle,
  FastForward,
  FastRewind,
  Pause,
  PlayArrow,
  RemoveCircle,
  Start,
  VolumeOffRounded,
  VolumeUpRounded,
} from '@mui/icons-material';
import { useWavesurfer } from '@wavesurfer/react';
import { FileContext } from 'src/common/contexts/fileContext';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';

const AudioWaveform = () => {
  const containerRef = useRef(null);
  const { fileURL } = useContext(FileContext);
  const [volume, setVolume] = useState(1);
  const [zoom, setZoom] = useState(1);

  const { wavesurfer, isPlaying, isReady } = useWavesurfer({
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

  const handleVolumeSlider = e => {
    setVolume(e.target.value);
  };

  const handleZoomSlider = e => {
    setZoom(e.target.value);
  };

  useEffect(() => {
    wavesurfer && wavesurfer.setVolume(volume);
  }, [volume, wavesurfer]);

  useEffect(() => {
    isReady && wavesurfer.zoom(zoom);
  }, [zoom, wavesurfer, isReady]);

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
      <div className="volume-slide-container">
        {volume > 0 ? <VolumeUpRounded /> : <VolumeOffRounded />}
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeSlider}
          className="slider volume-slider"
        />
      </div>
      <div className="volume-slide-container">
        <RemoveCircle />
        <input
          type="range"
          min="1"
          max="1000"
          value={zoom}
          onChange={handleZoomSlider}
          className="slider zoom-slider"
        />
        <AddCircle />
      </div>
    </>
  );
};

export default AudioWaveform;
