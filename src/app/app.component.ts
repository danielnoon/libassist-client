import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import IState, { Library, Section } from '../models/library.model';
import { ElectronService } from 'ngx-electron';
import { State } from './State';

@Component({
  selector: 'app-main',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  state: IState = {
    libs: [],
  };

  currentSection: Section;
  currentProject: Library;
  theme: string = 'light-theme';
  workingDir: string = '';

  constructor(
    private electron: ElectronService,
    private ref: ChangeDetectorRef,
    private zone: NgZone
  ) {
    console.log(this);
  }

  ngOnInit() {
    const theme = <'dark' | 'light' | undefined>localStorage.getItem('theme');
    if (theme) this.changeTheme(theme);
    this.electron.ipcRenderer.on(
      'changeTheme',
      (sender: any, theme: 'dark' | 'light') => {
        this.zone.run(() => {
          this.changeTheme(theme);
        });
      }
    );
    this.electron.ipcRenderer.on('openLaFile', (sender: any, lib: Library) => {
      this.zone.run(() => {
        this.pushLib(lib);
      });
    });
  }

  pushLib(lib: Library) {
    let match = -1;
    this.state.libs.forEach((lib_, i) => {
      if (lib_.package === lib.package) {
        match = i;
      }
    });
    if (match >= 0) this.state.libs[match] = lib;
    else this.state.libs.push(lib);
    console.log(lib);
  }

  changeTheme(theme: 'dark' | 'light') {
    this.theme = theme + '-theme';
    localStorage.setItem('theme', theme);
    State.Set('theme', theme);
  }

  chooseSection(selection: number[]) {
    this.currentProject = this.state.libs[selection[0]];
    this.currentSection = this.state.libs[selection[0]].sections[selection[1]];
    this.workingDir = this.state.libs[selection[0]].path;
  }
}
