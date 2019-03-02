import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { ILibrary, ISection } from '../../../models/library.model';
import { ElectronService } from 'ngx-electron';
import { MarkdownService } from 'ngx-markdown';

@Component({
  selector: 'app-main-area',
  templateUrl: 'main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  @Input() section: ISection;
  @Input() workingDir: string;
  @Input() project: ILibrary;

  constructor(
    private electron: ElectronService,
    private marked: MarkdownService,
    public element: ElementRef
  ) {}

  openDoc() {
    this.electron.ipcRenderer.send('openDoc');
  }

  ngOnInit() {
    const expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    const regex = new RegExp(expression);
    this.marked.renderer.image = (
      src: string,
      title: string,
      content: string
    ) => `
      <img src="${
        src.match(regex)
          ? src
          : `http://localhost:9949/${this.project.package}/${src}`
      }" alt="${content}" title="${title}">
    `;

    this.marked.renderer.paragraph = text =>
      `<p class="mat-body-1">${text}</p>`;
  }
}
