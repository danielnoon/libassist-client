import { Component, Input } from "@angular/core";
import { Example, ExampleFile } from "../../../models/state.model";
import Options from "../../../models/options.model";
import { ElectronService } from "ngx-electron";

@Component({
  selector: 'app-example',
  templateUrl: 'example.component.html',
  styleUrls: ['./example.component.css']
})
export class ExampleComponent {
  @Input() example: Example;
  @Input() project: string;
  @Input() workingDir: string;
  consoleBuffer = "";
  processName = "";

  constructor(private electron: ElectronService) {}

  concatCode(file: ExampleFile) {
    const parts = file.content.map(part => part.type === 'code' ? part.value : part.value || `{{${part.id}}}`);
    return parts.join('');
  }

  getInterpolation(file: ExampleFile) {
    const interp: {[key: string]: string} = {};
    file.content.forEach(part => part.type.match('input') ? interp[part.id!] = part.value : false);
    return interp;
  }

  filterForInputs(file: ExampleFile) {
    const filtered = file.content.filter(part => part.type.match('input'));
    return filtered;
  }

  runExample() {
    if (this.example.running) {
      return 1;
    }

    const options: Options = {
      Project: this.project,
      Type: this.example.type,
      Template: this.example.template,
      Name: this.example.name,
      Ports: (this.example.ports || "").split(','),
      Example: this.example.path,
      Files: []
    };

    for (let file of this.example.files) {
      options.Files.push({
        Path: file.path,
        Replacements: file.content
          .map(contents => (contents.type !== 'code' ? {Id: contents.id!, Value: contents.value} : {Id: '', Value: ''}))
          .filter(val => val.Id !== '')
      });
    }

    this.electron.ipcRenderer.send('runExample', options, this.workingDir);
    this.consoleBuffer = "Building...\n";

    this.electron.ipcRenderer.once(`exampleBuilt${options.Name}${options.Project}`,
      (e: Event, name: string) => {
        console.log(this.processName);
      this.processName = name;
      this.consoleBuffer += `Running ${name}...\n`;
    })

    this.electron.ipcRenderer.on(`exampleOutput${options.Name}${options.Project}`, 
      (e: Event, data: string, example: string, ok: boolean) => {
      this.consoleBuffer += data;
    });
    
    this.example.running = true;
  }

  stopExample() {
    console.log(this.processName);
    this.electron.ipcRenderer.send('stopExample', this.processName);
    this.electron.ipcRenderer.once(`stoppedExample${this.processName}`, (event: Event) => {
      this.example.running = false;
    });
  }
}
