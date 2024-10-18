import { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import { Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { FileContext } from 'common/contexts/fileContext';
import './upload-audio.css';

const UploadAudio = () => {
  const inputFile = useRef<HTMLInputElement>(null);
  const { setFileUrl } = useContext(FileContext);
  const [file, setFile] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (file) {
      setFileUrl(file);
      navigate('/edit');
    }
  }, [file, navigate, setFileUrl]);

  const handleButtonClick = () => {
    if (inputFile.current) {
      inputFile.current.click();
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <>
      <Container className="upload">
        <Row className="mt-2">
          <h1 className="upload-audio__header">Upload your audio here!</h1>
        </Row>
        <Row className="justify-content-center mt-3 md-col-2">
          <button
            type="button"
            className="upload-audio__upload-btn glow-on-hover"
            onClick={handleButtonClick}
          >
            Upload
          </button>
        </Row>
        <input
          type="file"
          id="file"
          ref={inputFile}
          style={{ display: 'none' }}
          accept="audio/*"
          onChange={handleFileUpload}
        />
      </Container>
    </>
  );
};

export default UploadAudio;
