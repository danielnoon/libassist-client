import { IExample } from './models/library.model';
import { ncp } from 'ncp';
import { ChildProcess, spawn } from 'child_process';

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

export class ExampleRunner {
  constructor(
    private example: IExample,
    private file: string,
    private project: string
  ) {}

  build() {}
}
