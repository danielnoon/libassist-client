import {
  Component,
  ElementRef,
  Input,
  NgZone,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Example } from '../../../models/library.model';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-example',
  templateUrl: 'example.component.html',
  styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
  @Input() example: Example;
  @Input() project: string;
  @Input() workingDir: string;
  consoleBuffer = '';
  processName = '';
  @ViewChildren('editor') editors: QueryList<ElementRef>;

  constructor(private electron: ElectronService, private zone: NgZone) {}

  runExample() {
    if (this.example.running) {
      return 1;
    }

    this.electron.ipcRenderer.send(
      'runExample',
      this.example,
      this.workingDir,
      this.project
    );
    this.consoleBuffer = 'Building...\n';

    this.electron.ipcRenderer.once(
      `exampleBuilt${this.example.name}${this.project}`,
      (e: Event, name: string) => {
        this.processName = name;
        this.consoleBuffer += `Running ${name}...\n\n`;
        this.electron.ipcRenderer.once(
          `stoppedExample${this.processName}`,
          () => {
            this.zone.run(() => {
              console.log('Example no longer running.');
              this.example.running = false;
            });
          }
        );
      }
    );

    this.electron.ipcRenderer.on(
      `exampleOutput${this.example.name}${this.project}`,
      (e: Event, data: string, example: string, ok: boolean) => {
        console.log(example, ok);
        this.zone.run(() => {
          this.consoleBuffer += data;
        });
      }
    );

    console.log(this.processName);

    this.example.running = true;
  }

  stopExample() {
    console.log(this.processName);
    this.electron.ipcRenderer.send('stopExample', this.processName);
  }
}
