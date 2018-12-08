import { NgModule } from "@angular/core";
import { MatButtonModule, MatExpansionModule, MatListModule, MatCardModule, MatInputModule, MatFormFieldModule, MatTabsModule, MatToolbarModule } from '@angular/material';

const components: any[] = [
  MatButtonModule,
  MatExpansionModule,
  MatListModule,
  MatCardModule,
  MatInputModule,
  MatFormFieldModule,
  MatTabsModule,
  MatToolbarModule
];

@NgModule({
  imports: components,
  exports: components
})
export class MaterialComponentsModule {}
