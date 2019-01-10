import {
  Example,
  ExampleFile,
  Include,
  Library,
  Section,
} from './models/library.model';
import { readFileSync } from 'fs';
import { parse, resolve } from 'path';

export default class Parser {
  private library: Library;
  private stack: string[] = [];
  private readonly ladoc: string = '';
  private readonly path: string;

  constructor(path: string, ladoc?: string) {
    this.path = path;
    if (!ladoc) {
      this.ladoc = ladoc = readFileSync(path, 'utf-8');
    }
    this.library = ladoc ? this.parse(ladoc) : this.getBlankLib();
  }

  public parse(ladoc?: string): Library {
    if (!ladoc) ladoc = this.ladoc;
    this.library = this.getBlankLib();
    this.stack = [];

    const lines = this.normalizeLines(ladoc);

    let eof = false;
    let markdown = '';
    while (!eof) {
      console.log('loop');
      const line = this.nextLine(lines);
      if (line || line === '') {
        if (line.length > 3 && line.substr(0, 3) === '+++') {
          if (line[3]) {
            if (markdown) {
              this.pushMarkdown(markdown);
              markdown = '';
            }
            const type = line.substr(3);
            if (
              this.stack[this.stack.length - 1] !== type &&
              type !== 'include'
            )
              this.stack.push(type);
            if (type === 'project') {
              this.library = this.parseAnnotation(lines, this.getBlankLib());
            }
            if (type === 'section') {
              this.library.sections.push(
                this.parseAnnotation(lines, this.getBlankSection())
              );
            }
            if (type === 'example') {
              const section = this.library.sections[
                this.library.sections.length - 1
              ];
              if (section) {
                section.content.push({
                  type: 'example',
                  value: this.parseAnnotation(lines, this.getBlankExample()),
                });
              } else {
                throw new Error('Example declared out of a section');
              }
            }
            if (type === 'include') {
              const include = this.parseAnnotation(
                lines,
                this.getBlankInclude()
              );
              const includedFile = readFileSync(
                resolve(parse(this.path).dir, include.file + '.ladoc'),
                'utf-8'
              );
              lines.unshift(...this.normalizeLines(includedFile));
            }
          }
        } else if (line.substr(0, 3) === '---') {
          this.stack.pop();
        } else {
          if (this.stack[this.stack.length - 1] === 'section')
            markdown += line + '\n';
          if (this.stack[this.stack.length - 1] === 'example') {
            if (line.substring(0, 3) === '```') {
              const meta = line.substring(3).split(':');
              const file: ExampleFile = {
                path: meta[1],
                language: meta[0],
                code: this.getFile(lines),
              };
              console.log(file);
              const sections = this.library.sections;
              const content = sections[sections.length - 1].content;
              const example: Example = <Example>(
                content[content.length - 1].value
              );
              example.files.push(file);
              console.log(example);
            }
          }
        }
      } else eof = true;
    }
    if (markdown) this.pushMarkdown(markdown);
    console.log('exited loop');
    console.log(this.library);
    return this.library;
  }

  private normalizeLines(text: string) {
    return text
      .split(/$/gm)
      .map(line => line.replace(/[\n\r]/g, ''))
      .filter((val, i, arr) => {
        if (val === '') {
          return arr[i + 1] === '';
        } else return true;
      });
  }

  private getFile(lines: string[]) {
    let curLine = this.nextLine(lines);
    let file = '';
    while (curLine !== '```') {
      file += curLine + '\n';
      curLine = this.nextLine(lines);
    }
    return file.trim();
  }

  private pushMarkdown(markdown: string) {
    const sections = this.library.sections;
    if (sections[sections.length - 1])
      sections[sections.length - 1].content.push({
        type: 'markdown',
        value: markdown,
      });
  }

  private nextLine(lines: string[]) {
    return lines.shift();
  }

  private getBlankLib(): Library {
    return {
      name: '',
      description: '',
      path: this.path,
      sections: [],
      package: '',
      assets: '',
    };
  }

  private getBlankSection(): Section {
    return {
      title: '',
      content: [],
    };
  }

  private getBlankExample(): Example {
    return {
      type: '',
      name: '',
      files: [],
      running: false,
      template: 'custom',
      ports: [],
      path: '',
    };
  }

  private getBlankInclude(): Include {
    return {
      file: '',
    };
  }

  private parseAnnotation<T = Library | Section | Example | Include>(
    lines: string[],
    emptyPart: T
  ): T {
    let done = false;

    while (!done) {
      const line = this.nextLine(lines);
      if (line) {
        if (line.trim() === '+++') done = true;
        else {
          const firstColon = line.indexOf(':');
          let [key, value]: any[] = [
            line.substring(0, firstColon),
            line.substring(firstColon + 1),
          ].map(side => side.trim());
          if (key === 'ports') value = value.split(',');
          (<any>emptyPart)[key] = value;
        }
      }
    }

    return emptyPart;
  }
}
