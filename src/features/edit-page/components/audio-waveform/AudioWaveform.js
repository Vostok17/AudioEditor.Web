import { useEffect, useRef, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
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
import useWavesurfer from 'src/common/hooks/useWavesurfer';
import { encodeToWave } from 'src/common/utils/audioBuffer';
import './audio-waveform.css';

const AudioWaveform = () => {
  /**
   * @type {{ wavesurfer: WaveSurfer|null, regions: RegionsPlugin|null }}
   */
  // @ts-ignore
  const { wavesurfer, regions, handleCopy, handleCut, handlePaste, handleDownload, bufferToPaste } =
    useWavesurfer('#waveform');

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef(null);

  useEffect(() => {
    if (!wavesurfer) return;

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('finish', () => setIsPlaying(false));

    regions.enableDragSelection({});

    const handleClickOutside = event => {
      const waveformContainer = document.getElementById('waveform');
      if (waveformContainer && !waveformContainer.contains(event.target)) {
        regions.clearRegions();
      }
    };
    document.addEventListener('click', handleClickOutside);

    const loadFFmpeg = async () => {
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on('log', ({ message }) => {
        if (messageRef.current) messageRef.current.innerHTML = message;
      });
      await ffmpeg.load();
      console.log('ffmpeg loaded');
    };

    loadFFmpeg();

    return () => {
      document.removeEventListener('click', handleClickOutside);
      wavesurfer.destroy();
    };
  }, [regions, wavesurfer]);

  const applyEffect = async () => {
    if (!wavesurfer) return;
    const existingRegions = regions.getRegions();

    // Apply to region if it exists, otherwise apply to the whole audio
    let start, end;
    const region = existingRegions[0];
    start = region.start;
    end = region.end;

    // Create url for the wavesurfer's audio source
    const url = URL.createObjectURL(new Blob([await encodeToWave(wavesurfer.getDecodedData())], { type: 'audio/wav' }));

    // Apply filter
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile('input.wav', await fetchFile(url));

    // Extract the selected fragment
    await ffmpeg.exec([
      '-i',
      'input.wav',
      '-ss',
      start.toString(),
      '-to',
      end.toString(),
      '-c',
      'copy',
      'fragment.wav',
    ]);

    // Apply reverb effect to the extracted fragment
    await ffmpeg.exec(['-i', 'fragment.wav', '-af', 'aecho=0.8:0.88:60:0.4', 'reverbed_fragment.wav']);

    // Merge the modified fragment back into the original audio
    await ffmpeg.exec([
      '-i',
      'input.wav',
      '-i',
      'reverbed_fragment.wav',
      '-filter_complex',
      `[0:a]atrim=end=${start},asetpts=PTS-STARTPTS[part1];[0:a]atrim=start=${end},asetpts=PTS-STARTPTS[part3];[part1][1:a][part3]concat=n=3:v=0:a=1[out]`,
      '-map',
      '[out]',
      'output.wav',
    ]);

    const fileData = await ffmpeg.readFile('output.wav');

    // @ts-ignore
    const data = new Uint8Array(fileData);
    wavesurfer.loadBlob(new Blob([data.buffer], { type: 'audio/wav' }));
  };

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
      <Container style={{ maxWidth: '100vw' }}>
        <>
          <button onClick={() => applyEffect()}>Transcode webm to mp4</button>
        </>
        <Row className="mb-5">
          <div id="waveform"></div>
        </Row>
        <Row className="md-col-3 mb-3">
          <div className="controls-bar">
            <Button type="primary" onClick={() => wavesurfer.seekTo(0)}>
              <Start style={{ transform: 'rotate(180deg)' }} />
            </Button>
            <Button type="primary" onClick={() => wavesurfer.skip(-5)}>
              <FastRewind />
            </Button>
            <Button type="primary" onClick={() => wavesurfer.playPause()}>
              {isPlaying ? <Pause /> : <PlayArrow />}
            </Button>
            <Button type="primary" onClick={() => wavesurfer.skip(5)}>
              <FastForward />
            </Button>
            <Button type="primary" onClick={() => wavesurfer.seekTo(1)}>
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
            <Button onClick={handlePaste} disabled={bufferToPaste === null}>
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
