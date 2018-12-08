// #!/usr/bin/env node
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import * as tempy from 'tempy';
import { ncp } from 'ncp';
import * as fs from 'fs';
import Options from './models/options.model';

function copy(src: string, dest: string) {
  return new Promise((resolve, reject) => {
    ncp(src, dest, () => {
      resolve();
    })
  })
}

function childExit(child: ChildProcess) {
  return new Promise((resolve, reject) => {
    child.on("exit", resolve);
  })
}

// const pwd = process.cwd();

// const options = JSON.parse(process.argv[2]);

// const p = path.resolve("examples", options.Example);
// const tmp = tempy.directory();

// console.log("Example location: ", p);
// console.log("Temporary location: ", tmp);

async function build(options: Options, workingDir: string) {
  const p = path.resolve(workingDir, "examples", options.Example);
  const tmp = tempy.directory();
  await copy(p, tmp);
  console.log("copied!");
  for (let file of options.Files) {
    let edit = fs.readFileSync(path.resolve(tmp, file.Path), 'utf-8');
    for (let replacement of file.Replacements) {
      const interp = `{{%la:${replacement.Id}}}`;
      edit = edit.replace(interp, replacement.Value);
    }
    fs.writeFileSync(path.resolve(tmp, file.Path), edit, 'utf-8');
    console.log("written: " + file.Path);
  }
  const dockerName = `ladoc/${options.Project.toLowerCase()}-${options.Example.toLowerCase()}`;
  const dockerBuild = spawn("docker", ["build", "-t", dockerName, tmp]);
  dockerBuild.stdout.on("message", data => {
    console.log(data);
  });
  dockerBuild.stderr.on("message", data => {
    console.log(data);
  });
  await childExit(dockerBuild);
  console.log("docker container built!");
  return dockerName;
}

export default build;
