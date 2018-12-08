import { readFileSync } from 'fs';
import Parser from './parse';

export default function parse(path: string) { 
  const ladoc = readFileSync(path, 'utf-8');
  const parser = new Parser(path);
  const document = parser.parse(ladoc);
  return document;
}
