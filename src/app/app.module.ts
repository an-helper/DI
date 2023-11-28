import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent, PAGE_CONFIG } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: PAGE_CONFIG,
      useValue: { title: 'Hello' }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
