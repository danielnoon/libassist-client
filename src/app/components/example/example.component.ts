import {
  Component,
  ElementRef,
  Input,
  NgZone,
  QueryList,
  ViewChildren,
  OnInit,
  ViewChild,
} from '@angular/core';
import { IExample } from '../../../models/library.model';
import { ElectronService } from 'ngx-electron';
import { sanitizeName } from '../../../utils';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';

@Component({
  selector: 'app-example',
  templateUrl: 'example.component.html',
  styleUrls: ['./example.component.scss'],
})
export class ExampleComponent implements OnInit {
  @Input() example: IExample;
  @Input() project: string;
  @Input() workingDir: string;
  processName = '';
  terminal = new Terminal();
  showConsole = false;
  @ViewChildren('editor') editors: QueryList<ElementRef>;
  @ViewChild('console') console: ElementRef;

  constructor(private electron: ElectronService, private zone: NgZone) {}

  ngOnInit() {
    Terminal.applyAddon(fit);

    this.electron.ipcRenderer.on(
      sanitizeName(`exampleOutput${this.example.name}${this.project}`),
      (e: Event, data: string, example: string, ok: boolean) => {
        console.log(example, ok);
        this.zone.run(() => {
          this.terminal.write(data);
        });
      }
    );

    this.terminal.open(this.console.nativeElement);
    // @ts-ignore
    this.terminal.fit();
  }

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
    this.showConsole = true;

    this.electron.ipcRenderer.once(
      sanitizeName(`exampleBuilt${this.example.name}${this.project}`),
      (e: Event, name: string) => {
        this.processName = name;
        this.terminal.write(`Running ${name}...\n\n`);
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

    console.log(this.processName);

    this.example.running = true;
  }

  stopExample() {
    console.log(this.processName);
    this.electron.ipcRenderer.send('stopExample', this.processName);
  }
}
