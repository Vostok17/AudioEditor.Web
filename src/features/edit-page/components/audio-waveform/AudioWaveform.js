import { useCallback, useContext, useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import {
  DownloadOutlined,
  FastForward,
  FastRewind,
  Pause,
  PlayArrow,
  PlayCircleOutlined,
  Start,
  VolumeOffRounded,
  VolumeUpRounded,
  ZoomOutOutlined,
} from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import Slider from '@mui/material/Slider';
import { Button, Typography } from 'antd';
import { FileContext } from 'src/common/contexts/fileContext';
import { copy, cut, encodeToWave, paste } from 'src/common/utils/audioBuffer';
import WaveSurfer from 'wavesurfer.js';
import Hover from 'wavesurfer.js/dist/plugins/hover.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.js';
import './audio-waveform.css';

const AudioWaveform = () => {
  /**
   * @type {[WaveSurfer|null, Function]} wavesurfer
   */
  const [wavesurfer, setWavesurfer] = useState(null);
  /**
   * @type {[RegionsPlugin|null, Function]} regions
   */
  const [regions, setRegions] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [bufferToPaste, setBufferToPaste] = useState(null);

  const { fileUrl } = useContext(FileContext);

  useEffect(() => {
    const regionsPlugin = RegionsPlugin.create();
    const ws = WaveSurfer.create({
      container: '#waveform',
      cursorColor: 'violet',
      waveColor: '#211027',
      progressColor: '#69207F',
      splitChannels: true,
      sampleRate: 44100,
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
    wavesurfer.skip(5);
  }, [wavesurfer]);

  const onSkipBackward = useCallback(() => {
    wavesurfer.skip(-5);
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

  const handleCut = async () => {
    if (!wavesurfer) return;
    const region = regions.getRegions()[0];
    const start = region.start;
    const end = region.end;
    console.log(start, end);

    const { cutBuffer, remainingBuffer } = cut(wavesurfer.getDecodedData(), start, end);
    setBufferToPaste(cutBuffer);

    const wavBlob = new Blob([await encodeToWave(remainingBuffer)], { type: 'audio/wav' });
    wavesurfer.loadBlob(wavBlob);
    setIsPlaying(false);
  };

  const hanglePaste = async () => {
    if (!wavesurfer || !bufferToPaste) return;
    const time = wavesurfer.getCurrentTime();
    const combinedBuffer = paste(wavesurfer.getDecodedData(), bufferToPaste, time);
    const wavBlob = new Blob([await encodeToWave(combinedBuffer)], { type: 'audio/wav' });
    wavesurfer.loadBlob(wavBlob);
  };

  const handleCopy = async () => {
    if (!wavesurfer) return;
    const region = regions.getRegions()[0];
    const start = region.start;
    const end = region.end;
    console.log(start, end);

    const copyBuffer = copy(wavesurfer.getDecodedData(), start, end);
    setBufferToPaste(copyBuffer);
  };

  const handleDownload = async () => {
    if (wavesurfer) {
      const url = URL.createObjectURL(
        new Blob([await encodeToWave(wavesurfer.getDecodedData())], { type: 'audio/wav' }),
      );
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'your-audio.wav';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <Container style={{ maxWidth: '100vw' }}>
        <Row className="mb-5">
          <div id="waveform"></div>
        </Row>
        <Row className="md-col-3 mb-3">
          <div className="controls-bar">
            <Button type="primary" onClick={onMoveToStart}>
              <Start style={{ transform: 'rotate(180deg)' }} />
            </Button>
            <Button type="primary" onClick={onSkipBackward}>
              <FastRewind />
            </Button>
            <Button type="primary" onClick={onPlayPause}>
              {isPlaying ? <Pause /> : <PlayArrow />}
            </Button>
            <Button type="primary" onClick={onSkipForward}>
              <FastForward />
            </Button>
            <Button type="primary" onClick={onMoveToEnd}>
              <Start />
            </Button>
          </div>
        </Row>
        <Row className="md-col-3 mb-3">
          <div className="controls-bar controls-bar__edit">
            <Button onClick={handleCut}>
              <ContentCutIcon />
              Cut
            </Button>
            <Button onClick={handleCopy}>
              <ContentCopyIcon />
              Copy
            </Button>
            <Button onClick={hanglePaste} disabled={bufferToPaste === null}>
              <ContentPasteGoIcon />
              Paste
            </Button>
          </div>
        </Row>
        <Button onClick={handleDownload} type="primary" icon={<DownloadOutlined />} className="download-btn">
          Download
        </Button>
        <Row className="controls-bar__sliders">
          <div className="sliders-container__row">
            <div className="sliders-container__label">
              <Typography className="sliders-container__label">Volume</Typography>
              {volume > 0 ? (
                <VolumeUpRounded className="sliders-container__icon" />
              ) : (
                <VolumeOffRounded className="sliders-container__icon" />
              )}
            </div>
            <Slider sx={{ width: '20%' }} min={0} max={1} step={0.001} value={volume} onChange={handleVolumeSlider} />
          </div>
          <div className="sliders-container__row">
            <div className="sliders-container__label">
              <Typography className="sliders-container__label">Zoom</Typography>
              <ZoomOutOutlined className="sliders-container__icon" />
            </div>
            <Slider sx={{ width: '20%' }} min={1} max={1000} value={zoom} onChange={handleZoomSlider} />
          </div>
          <div className="sliders-container__row">
            <div className="sliders-container__label">
              <Typography className="sliders-container__label">Speed</Typography>
              <PlayCircleOutlined className="sliders-container__icon" />
            </div>
            <Slider
              sx={{ width: '20%' }}
              valueLabelDisplay="auto"
              min={0.5}
              max={2.0}
              step={0.1}
              marks
              value={playbackSpeed}
              onChange={handlePlaybackSpeedChange}
            />
          </div>
        </Row>
      </Container>
    </>
  );
};

export default AudioWaveform;
