interface Options {
  Project: string;
  Type: string;
  Name: string,
  Example: string,
  File: string,
  Replace: {
    Id: string,
    Value: string
  }[]
}

export default Options;