import 'core-js/es7/reflect';
import 'reflect-metadata';
import 'hammerjs';
import 'marked';
// import 'zone.js/dist/zone';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
