// #!/usr/bin/env node
import * as path from 'path';
import { ChildProcess, spawn } from 'child_process';
import * as tempy from 'tempy';
import { ncp } from 'ncp';
import * as fs from 'fs';
import { Example } from './models/library.model';

function copy(src: string, dest: string) {
  return new Promise((resolve, reject) => {
    ncp(src, dest, err => {
      err ? reject() : resolve();
    });
  });
}

function childExit(child: ChildProcess) {
  return new Promise(resolve => {
    child.on('exit', resolve);
  });
}

async function build(options: Example, workingDir: string, dockerName: string) {
  const p =
    options.template === 'custom'
      ? path.resolve(workingDir, 'examples', options.path)
      : workingDir;
  const tmp = tempy.directory();
  await copy(p, tmp);
  console.log('copied!');
  for (let file of options.files) {
    fs.writeFileSync(path.resolve(tmp, file.path), file.code, 'utf-8');
  }
  const dockerBuild = spawn('docker', ['build', '-t', dockerName, tmp]);
  dockerBuild.stdout.on('message', data => {
    console.log(data);
  });
  dockerBuild.stderr.on('message', data => {
    console.log(data);
  });
  await childExit(dockerBuild);
  console.log('docker container built!');
  return dockerName;
}

export default build;
