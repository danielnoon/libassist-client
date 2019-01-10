import {
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
} from '@angular/core';
import 'brace';
import 'brace/mode/text';
import 'brace/mode/javascript';
import 'brace/mode/typescript';
import 'brace/mode/markdown';
import 'brace/theme/github';
import 'brace/theme/twilight';
import { State } from '../../State';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnDestroy {
  @Input() code: string;
  @Input() language: string;
  @Output() codeChange = new EventEmitter<string>();

  theme = State.Get('theme');
  themeListenerId: number;

  constructor(private zone: NgZone) {
    this.themeListenerId = State.Listen('theme', val => {
      this.zone.run(() => {
        this.theme = <string>val;
      });
    });
  }

  ngOnDestroy() {
    State.UnListen(this.themeListenerId);
  }
}
