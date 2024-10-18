import { createContext, ReactNode, useState } from 'react';

interface FileContextType {
  fileUrl: string;
  setFileUrl: (url: string) => void;
}

const FileContext = createContext<FileContextType>({
  fileUrl: '',
  setFileUrl: () => {},
});

const FileContextProvider = ({ children }: { children: ReactNode }) => {
  const [fileUrl, setFileUrl] = useState('');
  return <FileContext.Provider value={{ fileUrl, setFileUrl }}>{children}</FileContext.Provider>;
};

export { FileContext, FileContextProvider };
