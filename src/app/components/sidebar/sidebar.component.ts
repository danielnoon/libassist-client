import { Component, Input, Output, EventEmitter } from "@angular/core";
import IState from "../../../models/library.model";

@Component({
  selector: 'app-sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() state: IState;
  @Output() select: EventEmitter<number[]> = new EventEmitter();

  selectItem(libIndex: number, sectionIndex: number) {
    this.select.emit([libIndex, sectionIndex]);
  }
}
