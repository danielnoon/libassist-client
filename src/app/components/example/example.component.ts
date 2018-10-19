import { Component, Input } from "@angular/core";
import { Example, ExampleFile } from "../../../models/state.model";

@Component({
  selector: 'app-example',
  templateUrl: 'example.component.html'
})
export class ExampleComponent {
  @Input() example: Example;

  concatCode(file: ExampleFile) {
    const parts = file.content.map(part => part.type === 'code' ? part.value : part.value || `{{${part.id}}}`);
    return parts.join('');
  }

  getInterpolation(file: ExampleFile) {
    const interp: {[key: string]: string} = {};
    file.content.forEach(part => part.type.match('input') ? interp[part.id!] = part.value : false);
    return interp;
  }

  filterForInputs(file: ExampleFile) {
    const filtered = file.content.filter(part => part.type.match('input'));
    return filtered;
  }
}
