export interface File {
  Path: string;
  Replacements: {
    Id: string;
    Value: string;
  }[];
}

interface Options {
  Project: string;
  Type: string;
  Template: string;
  Name: string;
  Example: string;
  Files: File[];
  Ports: string[];
}

export default Options;
