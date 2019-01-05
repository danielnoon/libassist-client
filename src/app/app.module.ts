import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentsModule } from './components/components.module';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { NgxElectronModule } from 'ngx-electron';
import { HighlightModule } from 'ngx-highlightjs';
import { MonacoEditorModule } from 'ngx-monaco';

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
        // useFactory: () => {
        //   const renderer = new MarkedRenderer();
        //   renderer.image = (src: string, title: string, text: string) => `
        //     <img src="/assets/${src}" alt="${title}">
        //   `;
        // }
        useValue: {
          tables: true,
          smartypants: true,
          smartLists: true
        }
      },
    }),
    NgxElectronModule,
    HighlightModule.forRoot({
      path: 'highlight'
    }),
    MonacoEditorModule.forRoot()
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}
