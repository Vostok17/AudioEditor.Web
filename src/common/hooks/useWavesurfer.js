import { useContext, useEffect, useState } from 'react';
import { copy, cut, encodeToWave, paste } from 'src/common/utils/audioBuffer';
import WaveSurfer from 'wavesurfer.js';
import Hover from 'wavesurfer.js/dist/plugins/hover.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.js';
import { FileContext } from '../contexts/fileContext';

const useWavesurfer = containerId => {
  const [wavesurfer, setWavesurfer] = useState(null);
  const [regions, setRegions] = useState(null);
  const { fileUrl } = useContext(FileContext);
  const [bufferToPaste, setBufferToPaste] = useState(null);

  useEffect(() => {
    const regionsPlugin = RegionsPlugin.create();
    const ws = WaveSurfer.create({
      container: containerId,
      cursorColor: 'violet',
      waveColor: '#211027',
      progressColor: '#69207F',
      // @ts-ignore
      splitChannels: true,
      sampleRate: 44100,
      plugins: [Timeline.create(), Hover.create(), regionsPlugin],
    });

    if (!fileUrl) {
      ws.load(fileUrl);
    }

    setWavesurfer(ws);
    setRegions(regionsPlugin);

    return () => {
      ws.destroy();
    };
  }, [containerId, fileUrl]);

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

  const handleCut = async () => {
    if (!wavesurfer) return;
    if (regions.getRegions().length === 0) return;
    const region = regions.getRegions()[0];
    const start = region.start;
    const end = region.end;

    const { cutBuffer, remainingBuffer } = cut(wavesurfer.getDecodedData(), start, end);
    setBufferToPaste(cutBuffer);

    const wavBlob = new Blob([await encodeToWave(remainingBuffer)], { type: 'audio/wav' });
    wavesurfer.loadBlob(wavBlob);
    regions.clearRegions();
  };

  const handlePaste = async () => {
    if (!wavesurfer || !bufferToPaste) return;
    const time = wavesurfer.getCurrentTime();
    const combinedBuffer = paste(wavesurfer.getDecodedData(), bufferToPaste, time);
    const wavBlob = new Blob([await encodeToWave(combinedBuffer)], { type: 'audio/wav' });
    wavesurfer.loadBlob(wavBlob);
  };

  const handleCopy = async () => {
    if (!wavesurfer) return;
    if (regions.getRegions().length === 0) return;
    const region = regions.getRegions()[0];
    const start = region.start;
    const end = region.end;

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

  return { wavesurfer, regions, handleCopy, handleCut, handlePaste, handleDownload, bufferToPaste };
};

export default useWavesurfer;
