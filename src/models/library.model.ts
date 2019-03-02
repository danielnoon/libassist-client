export interface IInclude {
  file: string;
}

export interface IExampleFile {
  path: string;
  language: string;
  code: string;
}

export interface IExample {
  type: string;
  name: string;
  files: IExampleFile[];
  ports: string[];
  running: boolean;
  template: string;
  path: string;
}

export interface IContentPart {
  type: 'markdown' | 'example' | 'toc';
  value: string | string[] | IExample;
}

export interface ISection {
  title: string;
  content: IContentPart[];
}

export interface ILibrary {
  name: string;
  description: string;
  path: string;
  assets: string;
  sections: ISection[];
  opened?: boolean;
  package: string;
}

export default interface IState {
  libs: ILibrary[];
}
