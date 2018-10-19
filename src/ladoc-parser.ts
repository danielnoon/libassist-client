import { readFileSync } from 'fs';
import { resolve } from 'path';

const pathToLadoc = ["C:", "Users", "delpi", "Documents", "libassist-format", "examples", "example1", "example1.ladoc"].join("\\");

console.log(pathToLadoc);

const ladoc = readFileSync(pathToLadoc, 'utf-8');

console.log(ladoc);
