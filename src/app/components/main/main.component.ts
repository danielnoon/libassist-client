import { Component, Input, OnInit } from "@angular/core";
import { Library, Section } from "../../../models/library.model";
import { ElectronService } from "ngx-electron";
import { MarkdownService } from "ngx-markdown";

@Component({
  selector: 'app-main-area',
  templateUrl: 'main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  @Input() section: Section;
  @Input() workingDir: string;
  @Input() project: Library;

  constructor(private electron: ElectronService, private marked: MarkdownService) {}

  openDoc() {
    this.electron.ipcRenderer.send('openDoc');
  }

  ngOnInit() {
    this.marked.renderer.image = (src: string, title: string, content: string) => `
      <img src="http://localhost:9949/${this.project.package}/${src}" alt="${title}">
    `
  }
}
