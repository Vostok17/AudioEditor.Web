import WavEncoder from 'wav-encoder';

const cut = (buffer: AudioBuffer, start: number, end: number) => {
  // Calculate the start and end sample indices
  const { sampleRate } = buffer;
  const startSample = Math.floor(start * sampleRate);
  const endSample = Math.floor(end * sampleRate);
  const length = endSample - startSample;

  // Create a new buffer for the trimmed segment
  const cutBuffer = new AudioBuffer({
    length,
    numberOfChannels: buffer.numberOfChannels,
    sampleRate,
  });

  const remainingLength = buffer.length - length;
  const remainingBuffer = new AudioBuffer({
    length: remainingLength,
    numberOfChannels: buffer.numberOfChannels,
    sampleRate,
  });

  // Copy the channel data from the original buffer to the new buffer
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    cutBuffer.copyToChannel(channelData.subarray(startSample, endSample), channel);
  }

  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    cutBuffer.copyToChannel(channelData.subarray(startSample, endSample), channel);

    // Copy the data before the cut segment
    remainingBuffer.copyToChannel(channelData.subarray(0, startSample), channel);
    // Copy the data after the cut segment
    remainingBuffer.copyToChannel(channelData.subarray(endSample), channel, startSample);
  }

  return { cutBuffer, remainingBuffer };
};

const paste = (buffer: AudioBuffer, bufferToPaste: AudioBuffer, start: number) => {
  const { sampleRate } = buffer;
  const startSample = Math.floor(start * sampleRate);
  const newLength = buffer.length + bufferToPaste.length;

  // Create a new buffer for the combined segment
  const combinedBuffer = new AudioBuffer({
    length: newLength,
    numberOfChannels: buffer.numberOfChannels,
    sampleRate,
  });

  // Copy the channel data from buffer1 and buffer2 to the new buffer
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const channelData1 = buffer.getChannelData(channel);
    const channelData2 = bufferToPaste.getChannelData(channel);

    // Copy the data before the paste segment
    combinedBuffer.copyToChannel(channelData1.subarray(0, startSample), channel);
    // Copy the data from buffer2
    combinedBuffer.copyToChannel(channelData2, channel, startSample);
    // Copy the remaining data from buffer1 after the paste segment
    combinedBuffer.copyToChannel(
      channelData1.subarray(startSample),
      channel,
      startSample + bufferToPaste.length,
    );
  }

  return combinedBuffer;
};

const copy = (buffer: AudioBuffer, start: number, end: number) => {
  // Calculate the start and end sample indices
  const { sampleRate } = buffer;
  const startSample = Math.floor(start * sampleRate);
  const endSample = Math.floor(end * sampleRate);
  const length = endSample - startSample;

  // Create a new buffer for the copied segment
  const copyBuffer = new AudioBuffer({
    length,
    numberOfChannels: buffer.numberOfChannels,
    sampleRate,
  });

  // Copy the channel data from the original buffer to the new buffer
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    copyBuffer.copyToChannel(channelData.subarray(startSample, endSample), channel);
  }

  return copyBuffer;
};

const encodeToWave = async (buffer: AudioBuffer) =>
  WavEncoder.encode({
    sampleRate: buffer.sampleRate,
    channelData: Array.from({ length: buffer.numberOfChannels }, (_, i) =>
      buffer.getChannelData(i),
    ),
  });

export { copy, cut, encodeToWave, paste };
