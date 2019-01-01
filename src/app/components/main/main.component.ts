import { Component, Input } from "@angular/core";
import { Library, Section } from "../../../models/library.model";
import { ElectronService } from "ngx-electron";

@Component({
  selector: 'app-main-area',
  templateUrl: 'main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  @Input() section: Section;
  @Input() workingDir: string;
  @Input() project: Library;

  constructor(private electron: ElectronService) {}

  openDoc() {
    this.electron.ipcRenderer.send('openDoc');
  }
}
