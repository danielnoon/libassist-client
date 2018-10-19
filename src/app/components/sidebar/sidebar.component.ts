import { Component, Input, Output, EventEmitter } from "@angular/core";
import State from "../../../models/state.model";

@Component({
  selector: 'app-sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() state: State;
  @Output() select: EventEmitter<number[]> = new EventEmitter();

  selectItem(libIndex: number, sectionIndex: number) {
    this.select.emit([libIndex, sectionIndex]);
  }
}
