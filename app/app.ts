import {App, Platform, Storage, SqlStorage} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {HomePage} from './pages/home/home';

@App({
  template: '<ion-nav [root]="rootPage"></ion-nav>',
  config: {}
})
export class MyApp {
  rootPage: any = HomePage;

  constructor(platform: Platform) {
    platform.ready().then(() => {
      StatusBar.styleBlackTranslucent();

      let storage = new Storage(SqlStorage, {name:'lol.db'});
      storage.query('CREATE TABLE IF NOT EXISTS champions (id integer primary key, shortname text not null, fullname text, story text, title text, likes integer)');
      
    });
  }
}
