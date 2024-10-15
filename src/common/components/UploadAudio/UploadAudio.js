import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileContext } from 'src/common/contexts/fileContext';

const UploadAudio = () => {
  const inputFile = useRef(null);
  const { setFileUrl } = useContext(FileContext);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (file) {
      setFileUrl(file);
      navigate('/edit');
    }
  }, [file, navigate, setFileUrl]);

  const handleButtonClick = () => {
    inputFile.current.click();
  };

  const handleFileUpload = e => {
    setFile(URL.createObjectURL(e.target.files[0]));
  };

  return (
    <div className="upload-audio">
      <i style={{ fontSize: '5em', color: '#531A65' }} className="material-icons">
        library_music
      </i>
      <h1>Upload here!</h1>
      <button className="upload-btn" onClick={handleButtonClick}>
        Upload
      </button>
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
