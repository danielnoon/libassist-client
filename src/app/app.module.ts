import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentsModule } from './components/components.module';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { NgxElectronModule } from 'ngx-electron';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ComponentsModule,
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useValue: {
          tables: true,
          smartypants: true,
          smartLists: true,
        },
      },
    }),
    NgxElectronModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
