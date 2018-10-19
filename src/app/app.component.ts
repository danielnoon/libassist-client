import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import State, { Section } from '../models/state.model';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-main',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  state: State = {
    libs: [
      {
        name: "Ionic",
        description: "Cross-platform component library",
        path: 'C:\\Users\\delpi\\Documents\\libassist-format\\examples\\example1',
        sections: [
          {
            title: "Action Sheet",
            content: [
              {
                type: 'markdown',
                value: "An Action Sheet is a dialog that displays a set of options. It appears on top of the app's content, and must be manually dismissed by the user before they can resume interaction with the app. Destructive options are made obvious in ios mode. There are multiple ways to dismiss the action sheet, including tapping the backdrop or hitting the escape key on desktop.\n\n\n\n\nTEst\n\n\n\n\nwhee\n\n\n\n\nboom\n\n\n\n\nshaka\n\n\n\n\nlaka"
              }
            ]
          },
          {
            title: "Alert",
            content: [
              {
                type: 'markdown',
                value: "An Alert is a dialog that presents users with information or collects information from the user using inputs. An alert appears on top of the app's content, and must be manually dismissed by the user before they can resume interaction with the app. It can also optionally have a header, subHeader and message."
              }
            ]
          },
          {
            title: "Anchor",
            content: [
              {
                type: 'markdown',
                value: "The Anchor component is used for navigating to a specified link. Similar to the browser's anchor tag, it can accept a href for the location, and a direction for the transition animation."
              }
            ]
          },
          {
            title: "Avatar",
            content: [
              {
                type: 'markdown',
                value: "Avatars are circular components that usually wrap an image or icon. They can be used to represent a person or an object.\nAvatars can be used by themselves or inside of any element. If placed inside of an ion-chip or ion-item, the avatar will resize to fit the parent component. To position an avatar on the left or right side of an item, set the slot to start or end, respectively."
              }
            ]
          },
          {
            title: "Badge",
            content: [
              {
                type: 'markdown',
                value: "Badges are inline block elements that usually appear near another element. Typically they contain a number or other characters. They can be used as a notification that there are additional items associated with an element and indicate how many items there are."
              }
            ]
          },
          {
            title: "Button",
            content: [
              {
                type: 'markdown',
                value: `Buttons provide a clickable element, which can be used in forms, or anywhere that needs simple, standard button functionality. They may display text, icons, or both. Buttons can be styled with several attributes to look a specific way.
## Expand
This attribute lets you specify how wide the button should be. By default, buttons are inline blocks, but setting this attribute will change the button to a full-width block element.

| Value | Details |
| ----- | ------- |
| block | Full-width button with rounded corners. |
| full  | Full-width button with square corners and no border on the left or right. |
                `
              },
              {
                type: 'example',
                value: {
                  type: 'node',
                  name: 'Example1',
                  example: 'e1',
                  ports: ['8081:8081'],
                  files: [
                    {
                      path: 'test.js',
                      language: 'javascript',
                      content: [
                        {
                          type: 'code',
                          value: 'app.get("/", (req, res) => res.send(`',
                        },
                        {
                          type: 'large-input',
                          value: '',
                          id: 'html'
                        },
                        {
                          type: 'code',
                          value: '`));'
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          },
          {
            title: "Card",
            content: [
              {
                type: 'markdown',
                value: "Cards are a standard piece of UI that serves as an entry point to more detailed information. A card can be a single component, but is often made up of some header, title, subtitle, and content. ion-card is broken up into several sub-components to reflect this. Please see ion-card-content, ion-card-header, ion-card-title, ion-card-subtitle."
              }
            ]
          },
          {
            title: "Checkbox",
            content: [
              {
                type: 'markdown',
                value: "Checkboxes allow the selection of multiple options from a set of options. They appear as checked (ticked) when activated. Clicking on a checkbox will toggle the checked property. They can also be checked programmatically by setting the checked property."
              }
            ]
          }
        ]
      },
      {
        name: "Angular Material",
        description: "Cool looks",
        path: '',
        sections: [
          {
            title: "Autocomplete",
            content: [
              {
                type: 'markdown',
                value: "Make a button"
              }
            ]
          },
          {
            title: "Checkbox",
            content: [
              {
                type: 'markdown',
                value: "Make a button"
              }
            ]
          },
          {
            title: "Date Picker",
            content: [
              {
                type: 'markdown',
                value: "Make a button"
              }
            ]
          }
        ]
      }
    ]
  }

  currentSection: Section;
  theme: string = 'light-theme';

  constructor(private electron: ElectronService, private ref: ChangeDetectorRef) {
    console.log("WHAT");
    this.currentSection = this.state.libs[0].sections[0];
    console.log(this);
  }

  ngOnInit() {
    const theme = (<'dark' | 'light' | undefined>localStorage.getItem('theme'));
    if (theme) this.changeTheme(theme);
    console.log(this.theme);
    this.electron.ipcRenderer.on('changeTheme', (sender: any, theme: 'dark' | 'light') => {
      this.changeTheme(theme);
    });
  }

  changeTheme(theme: 'dark' | 'light') {
    this.theme = theme + '-theme';
    this.ref.detectChanges();
    localStorage.setItem('theme', theme);
  }

  chooseSection(selection: number[]) {
    this.currentSection = this.state.libs[selection[0]].sections[selection[1]];
  }
}
