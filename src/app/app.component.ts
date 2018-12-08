import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import State, { Section, Library } from '../models/state.model';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-main',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  state: State = {
    libs: []
  };

  currentSection: Section;
  theme: string = 'light-theme';
  workingDir: string = '';

  constructor(private electron: ElectronService, private ref: ChangeDetectorRef, private zone: NgZone) {
    console.log(this);
  }

  ngOnInit() {
    const theme = (<'dark' | 'light' | undefined>localStorage.getItem('theme'));
    if (theme) this.changeTheme(theme);
    this.electron.ipcRenderer.on('changeTheme', (sender: any, theme: 'dark' | 'light') => {
      this.zone.run(() => {
        this.changeTheme(theme);
      });
    });
    this.electron.ipcRenderer.on('openLaFile', (sender: any, lib: Library) => {
      this.zone.run(() => {
        this.pushLib(lib);
      });
    });
  }

  pushLib(lib: Library) {
    this.state.libs.push(lib);
    console.log(lib);
  }

  changeTheme(theme: 'dark' | 'light') {
    this.theme = theme + '-theme';
    localStorage.setItem('theme', theme);
  }

  chooseSection(selection: number[]) {
    this.currentSection = this.state.libs[selection[0]].sections[selection[1]];
    this.workingDir = this.state.libs[selection[0]].path;
  }
}
