import * as fs from 'fs';
import path from 'path';

type Dependencies = { [key: string]: string };

export default function loadDeps(root: string) {
  const pakjson = JSON.parse(
    fs.readFileSync(path.resolve(root, 'package.json'), 'utf-8')
  );
  const regDeps = pakjson['dependencies'];
  const devDeps = pakjson['devDependencies'];
  const deps = Object.assign({}, regDeps, devDeps) as Dependencies;

  const roots: string[] = [];

  for (let dependency in deps) {
    roots.push(path.resolve(root, 'node_modules', dependency));
  }

  console.log(roots);
}
//
// function load
//
// function getRoot(dep: string) {
//
// }
