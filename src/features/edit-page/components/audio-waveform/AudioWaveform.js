import { useCallback, useContext, useEffect, useState } from 'react';
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
import { FileContext } from 'src/common/contexts/fileContext';
import WaveSurfer from 'wavesurfer.js';
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';

const AudioWaveform = () => {
  const [wavesurfer, setWavesurfer] = useState(null);
  const [regions, setRegions] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const { fileUrl } = useContext(FileContext);

  useEffect(() => {
    const regionsPlugin = RegionsPlugin.create();
    const ws = WaveSurfer.create({
      container: '#waveform',
      cursorColor: 'violet',
      waveColor: '#211027',
      progressColor: '#69207F',
      // @ts-ignore
      plugins: [Timeline.create(), Hover.create(), regionsPlugin],
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));

    setWavesurfer(ws);
    setRegions(regionsPlugin);
    regionsPlugin.enableDragSelection({});

    return () => {
      ws.destroy();
    };
  }, []);

  useEffect(() => {
    fileUrl && wavesurfer && wavesurfer.load(fileUrl);
  }, [fileUrl, wavesurfer]);

  useEffect(() => {
    wavesurfer &&
      wavesurfer.on('click', () => {
        regions.clearRegions();
      });

    regions &&
      regions.on('region-created', () => {
        const existingRegions = regions.getRegions();
        if (existingRegions.length > 1) {
          existingRegions[0].remove();
        }
      });
  }, [wavesurfer, regions]);

  const onPlayPause = useCallback(() => {
    wavesurfer.playPause();
  }, [wavesurfer]);

  const onSkipForward = useCallback(() => {
    wavesurfer.skipForward();
  }, [wavesurfer]);

  const onSkipBackward = useCallback(() => {
    wavesurfer.skipBackward();
  }, [wavesurfer]);

  const onMoveToStart = useCallback(() => {
    wavesurfer.seekTo(0);
  }, [wavesurfer]);

  const onMoveToEnd = useCallback(() => {
    wavesurfer.seekTo(1);
  }, [wavesurfer]);

  const handleVolumeSlider = e => {
    setVolume(e.target.value);
    wavesurfer.setVolume(volume);
  };

  const handleZoomSlider = e => {
    setZoom(e.target.value);
    wavesurfer.zoom(zoom);
  };

  const handlePlaybackSpeedChange = e => {
    const newSpeed = parseFloat(e.target.value);
    setPlaybackSpeed(newSpeed);
    wavesurfer.setPlaybackRate(newSpeed);
  };

  return (
    <>
      <div id="waveform"></div>
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
      <div className="playback-speed-container">
        <label htmlFor="playbackSpeed">Playback Speed: </label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={playbackSpeed}
          onChange={handlePlaybackSpeedChange}
          className="slider playback-speed-slider"
        />
      </div>
    </>
  );
};

export default AudioWaveform;
