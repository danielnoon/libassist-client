import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentsModule } from './components/components.module';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { NgxElectronModule } from 'ngx-electron';
import { HighlightModule } from 'ngx-highlightjs';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ComponentsModule,
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useValue: {
          tables: true,
          sanitize: true,
          smartLists: true,
          smartypants: true,
        },
      },
    }),
    NgxElectronModule,
    HighlightModule.forRoot({
      path: 'highlight'
    })
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}
