import * as fs from 'fs';
import path from 'path';

type Dependencies = { [key: string]: string };

function readFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, data) => {
      resolve(data);
    });
  });
}

export default function loadDeps(root: string): Promise<string[]> {
  return new Promise(async (resolve, reject) => {
    const pakjson = JSON.parse(
      fs.readFileSync(path.resolve(root, 'package.json'), 'utf-8')
    );
    const regDeps = pakjson['dependencies'];
    const devDeps = pakjson['devDependencies'];
    const deps = Object.assign({}, regDeps, devDeps) as Dependencies;

    const roots: string[] = [];

    for (let dependency in deps) {
      const depRoot = path.resolve(root, 'node_modules', dependency);
      const data = JSON.parse(
        await readFile(path.join(depRoot, 'package.json'))
      );
      if (data['ladoc']) {
        roots.push(path.resolve(depRoot, data.ladoc));
      }
    }

    resolve(roots);
  });
}
//
// function load
//
// function getRoot(dep: string) {
//
// }
