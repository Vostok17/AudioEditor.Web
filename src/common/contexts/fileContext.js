import { createContext, useState } from 'react';

const FileContext = createContext({
  fileUrl: '',
  setFileUrl: url => {},
});

const FileContextProvider = ({ children }) => {
  const [fileUrl, setFileUrl] = useState(null);
  return <FileContext.Provider value={{ fileUrl, setFileUrl }}>{children}</FileContext.Provider>;
};

export { FileContext, FileContextProvider };
