// export interface ExampleContents {
//   type: 'code' | 'small-input' | 'large-input';
//   value: string;
//   id?: string;
// }

export interface ExampleFile {
  path: string;
  language: string;
  code: string;
}

export interface Example {
  type: string;
  name: string;
  files: ExampleFile[];
  ports: [];
  running: boolean;
  template: string;
  path: string;
}

export interface ContentPart {
  type: 'markdown' | 'example' | 'toc';
  value: string | string[] | Example;
}

export interface Section {
  title: string;
  content: ContentPart[];
}

export interface Library {
  name: string;
  description: string;
  path: string;
  sections: Section[];
  opened?: boolean;
  package: string;
}

export default interface IState {
  libs: Library[]
}
