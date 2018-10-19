import { NgModule } from "@angular/core";
import { MatButtonModule, MatExpansionModule, MatListModule, MatCardModule, MatInputModule, MatFormFieldModule } from '@angular/material';

const components: any[] = [
  MatButtonModule,
  MatExpansionModule,
  MatListModule,
  MatCardModule,
  MatInputModule,
  MatFormFieldModule
];

@NgModule({
  imports: components,
  exports: components
})
export class MaterialComponentsModule {}
