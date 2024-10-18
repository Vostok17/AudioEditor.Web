import { FC, useEffect, useRef, useState } from 'react';
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
import Effects from 'common/content/effects';
import useClickOutside from 'common/hooks/useClickOutside';
import useFFmpeg from 'common/hooks/useFFmpeg';
import useWavesurfer from 'common/hooks/useWavesurfer';
import { encodeToWave } from 'common/utils/audioBuffer';
import './audio-waveform.css';

interface AudioWaveformProps {
  effectToApply: Effects | null;
  onEffectApplied: () => void;
}

const AudioWaveform: FC<AudioWaveformProps> = ({ effectToApply, onEffectApplied }) => {
  const { wavesurfer, regions, handleCopy, handleCut, handlePaste, handleDownload, bufferToPaste } =
    useWavesurfer('#waveform');
  const wavesurferRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const { applyEffect } = useFFmpeg();

  useClickOutside(wavesurferRef, () => regions.clearRegions());

  useEffect(() => {
    if (!wavesurfer) return;

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('finish', () => setIsPlaying(false));

    regions.enableDragSelection({});

    return () => {
      wavesurfer.destroy();
    };
  }, [regions, wavesurfer]);

  const handleEffectApply = async (effect: Effects) => {
    if (!wavesurfer) return;
    const url = URL.createObjectURL(
      new Blob([await encodeToWave(wavesurfer.getDecodedData()!)], { type: 'audio/wav' }),
    );
    const existingRegions = regions.getRegions();

    let data;
    if (existingRegions.length === 0) {
      data = await applyEffect(url, effect);
    } else {
      const region = existingRegions[0];
      data = await applyEffect(url, effect, region.start, region.end);
    }

    wavesurfer.loadBlob(new Blob([data], { type: 'audio/wav' }));
  };

  return (
    <>
      <Container>
        <Button
          type="primary"
          className="mt-4 mb-3"
          disabled={!effectToApply}
          onClick={() => {
            handleEffectApply(effectToApply!);
            onEffectApplied();
          }}
        >
          Apply
        </Button>

        <Row className="mb-5">
          <div ref={wavesurferRef} id="waveform" />
        </Row>
        <Row className="md-col-3 mb-3">
          <div className="controls-bar">
            <Button type="primary" onClick={() => wavesurfer?.seekTo(0)}>
              <Start style={{ transform: 'rotate(180deg)' }} />
            </Button>
            <Button type="primary" onClick={() => wavesurfer?.skip(-5)}>
              <FastRewind />
            </Button>
            <Button type="primary" onClick={() => wavesurfer?.playPause()}>
              {isPlaying ? <Pause /> : <PlayArrow />}
            </Button>
            <Button type="primary" onClick={() => wavesurfer?.skip(5)}>
              <FastForward />
            </Button>
            <Button type="primary" onClick={() => wavesurfer?.seekTo(1)}>
              <Start />
            </Button>
          </div>
        </Row>
        <Row className="md-col-3 mb-3">
          <div className="controls-bar controls-bar__edit">
            <Button
              onClick={() => {
                handleCut();
                setIsPlaying(false);
                wavesurfer?.seekTo(0);
              }}
            >
              <ContentCutIcon />
              Cut
            </Button>
            <Button onClick={handleCopy}>
              <ContentCopyIcon />
              Copy
            </Button>
            <Button onClick={handlePaste} disabled={bufferToPaste === null}>
              <ContentPasteGoIcon />
              Paste
            </Button>
          </div>
        </Row>
        <Button
          onClick={handleDownload}
          type="primary"
          icon={<DownloadOutlined />}
          className="download-btn"
        >
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
            <Slider
              sx={{ width: '20%' }}
              min={0}
              max={1}
              step={0.001}
              onChange={(e, value) => {
                setVolume(value as number);
                wavesurfer?.setVolume(volume);
              }}
            />
          </div>
          <div className="sliders-container__row">
            <div className="sliders-container__label">
              <Typography className="sliders-container__label">Zoom</Typography>
              <ZoomOutOutlined className="sliders-container__icon" />
            </div>
            <Slider
              sx={{ width: '20%' }}
              min={1}
              max={1000}
              onChange={(e, value) => {
                setZoom(value as number);
                wavesurfer?.zoom(zoom);
              }}
            />
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
              onChange={(e, value) => {
                setPlaybackSpeed(value as number);
                wavesurfer?.setPlaybackRate(playbackSpeed);
              }}
            />
          </div>
        </Row>
      </Container>
    </>
  );
};

export default AudioWaveform;
