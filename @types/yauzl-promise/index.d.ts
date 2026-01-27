declare module 'yauzl-promise' {
  import { Readable } from 'node:stream';
  
  export interface Entry {
    filename: string;
    externalFileAttributes: number;
    openReadStream(): Promise<Readable>;
  }
  
  export interface ZipFile {
    readEntry(): Promise<Entry | null>;
    close(): Promise<void>;
  }
  
  export function open(path: string): Promise<ZipFile>;
  
  namespace yauzl {
    export { Entry, ZipFile, open };
  }
  
  export default yauzl;
}
