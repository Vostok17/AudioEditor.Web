import { useContext, useEffect, useRef, useState } from 'react';
import { FileContext } from './contexts/fileContext';

const UploadAudio = () => {
  const inputFile = useRef(null);
  const { fileURL, setFileURL } = useContext(FileContext);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (file) {
      setFileURL(file);
    }
  }, [file, setFileURL]);

  useEffect(() => {
    console.log(file);
  }, [file, fileURL]);

  const handleButtonClick = () => {
    inputFile.current.click();
  };

  const handleFileUpload = e => {
    setFile(URL.createObjectURL(e.target.files[0]));
  };

  return (
    <div className="upload-audio">
      <h1>Upload here!</h1>
      <button onClick={handleButtonClick}>Upload</button>
      <input
        type="file"
        id="file"
        ref={inputFile}
        style={{ display: 'none' }}
        accept="audio/*"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default UploadAudio;
