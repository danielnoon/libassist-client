import { Library, Section, Example, ExampleFile } from "../models/state.model";

export default class Parser {
  private library: Library;
  private stack: string[] = [];
  private path: string;

  constructor(path: string, ladoc?: string) {
    this.path = path;
    this.library = ladoc ? this.parse(ladoc) : this.getBlankLib();
  }

  public parse(ladoc: string): Library {
    this.library = this.getBlankLib();
    this.stack = [];

    const lines = ladoc.split(/$/gm)
      .map(line => line.replace(/[\n\r]/g, ''))
      .filter((val, i, arr) => {
        if (val === '') {
          if (arr[i + 1] === '') return true;
          else return false;
        }
        else return true;
      });

    let eof = false;
    let markdown = '';
    while (!eof) {
      const line = lines.shift();
      if (line || line === '') {
        if (line.length > 3 && line.substr(0, 3) === '+++') {
          if (line[3]) {
            if (markdown) {
              this.pushMarkdown(markdown);
              markdown = '';
            }
            const type = line.substr(3);
            if (this.stack[this.stack.length - 1] !== type) this.stack.push(type);
            if (type === 'project') {
              this.library = this.parseAnnotation(lines, this.getBlankLib());
            }
            if (type === 'section') {
              this.library.sections.push(this.parseAnnotation(lines, this.getBlankSection()));
            }
            if (type === 'example') {
              const section = this.library.sections[this.library.sections.length - 1];
              if (section) {
                section.content.push({
                  type: 'example',
                  value: this.parseAnnotation(lines, this.getBlankExample())
                });
              }
              else {
                throw new Error("Example declared out of a section");
              }
            }
          }
        }
        else if (line.substr(0, 3) === '---') {
          this.stack.pop();
        }
        else {
          if (this.stack[this.stack.length - 1] === 'section') markdown += line + '\n';
          if (this.stack[this.stack.length - 1] === 'example') {
            if (line.substring(0, 3) === '```') {
              const meta = line.substring(3).split(":");
              const file: ExampleFile = {
                path: meta[1],
                language: meta[0],
                content: []
              }
              let fileContents = this.getFile(lines);
              console.log(fileContents);
              let contents = this.findReplacements(fileContents);
              console.log(contents);
              let type = contents.first;
              let a = 0, b = 0;
              for (let i = 0; i < contents.file.length + contents.replacements.length; i++) {
                if (type === 0) {
                  file.content.push({
                    type: 'small-input',
                    value: '',
                    id: contents.replacements[a]
                  });
                  a++;
                  type = 1;
                }
                else if (type === 1) {
                  file.content.push({
                    type: 'code',
                    value: contents.file[b]
                  });
                  b++;
                  type = 0;
                }
              }
              console.log(file);
              const sections = this.library.sections;
              const content = sections[sections.length - 1].content;
              const example: Example = (<Example> content[content.length - 1].value);
              example.files.push(file);
              console.log(example);
            }
          }
        }
      }
      else eof = true;
    }
    if (markdown) this.pushMarkdown(markdown);
    return this.library;
  }

  private getFile(lines: string[]) {
    let curLine = lines.shift();
    let file = '';
    while (curLine !== '```') {
      file += curLine + '\n';
      curLine = lines.shift();
    }
    return file.trim();
  } 

  private pushMarkdown(markdown: string) {
    const sections = this.library.sections;
    if (sections[sections.length - 1])
      sections[sections.length -1].content.push({
        type: 'markdown',
        value: markdown
      });
  }

  private findReplacements(file: string) {
    const regex = /{{(\%la:)([^{}]*)}}/g;
    const replacements: string[] = [];
    let firstIndex = -1;
    let execArray: RegExpExecArray | null;
    while ((execArray = regex.exec(file)) !== null) {
      replacements.push(execArray[2]);
      if (firstIndex === -1) firstIndex = execArray.index;
    }
    return {
      replacements,
      file: file.split(regex).filter((a,b) => b % 3 === 0),
      first: firstIndex === 0 ? 0 : 1
    };
  }

  private getBlankLib(): Library {
    return {
      name: "",
      description: "",
      path: this.path,
      sections: [],
    }
  }

  private getBlankSection(): Section {
    return {
      title: "",
      content: [],
    }
  }

  private getBlankExample(): Example {
    return {
      type: '',
      name: '',
      example: '',
      files: [],
      running: false,
      template: 'custom'
    }
  }

  private parseAnnotation<T = Library | Section | Example>(lines: string[], emptyPart: T): T {
    let done = false;

    while (!done) {
      const line = lines.shift();
      if (line) {
        if (line.trim() === '+++') done = true;
        else {
          const firstColon = line.indexOf(':');
          const [key, value]: string[] = 
            [line.substring(0, firstColon), line.substring(firstColon + 1)]
            .map(side => side.trim());
          (<any>emptyPart)[key] = value;
        }
      }
    }

    return emptyPart;
  }
}