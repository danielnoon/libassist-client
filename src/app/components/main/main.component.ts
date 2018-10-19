import { Component, Input } from "@angular/core";
import { Section } from "../../../models/state.model";

@Component({
  selector: 'app-main-area',
  templateUrl: 'main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  @Input() section: Section;
}
