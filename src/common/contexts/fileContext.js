import { createContext, useState } from 'react';

const FileContext = createContext({
  fileURL: '',
  setFileURL: url => {},
});

const FileContextProvider = ({ children }) => {
  const [fileURL, setFileURL] = useState(null);
  return <FileContext.Provider value={{ fileURL, setFileURL }}>{children}</FileContext.Provider>;
};

export { FileContext, FileContextProvider };
