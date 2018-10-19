interface Options {
  Project: string;
  Type: string;
  Template: string;
  Name: string;
  Example: string;
  File: string;
  Ports: string[];
  Replace: {
    Id: string;
    Value: string;
  }[]
}

export default Options;