export interface ExampleContents {
  type: 'code' | 'small-input' | 'large-input';
  value: string;
  id?: string;
}

export interface ExampleFile {
  path: string;
  language: string;
  content: ExampleContents[];
}

export interface Example {
  type: string;
  name: string;
  example: string;
  files: ExampleFile[];
  ports?: string[];
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
}

export default interface State {
  libs: Library[]
}
