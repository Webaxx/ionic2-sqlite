import {Page, Platform, Storage, SqlStorage, NavController, Alert} from 'ionic-angular';
import {Http} from 'angular2/http';
import 'rxjs/add/operator/map';
import {Champion} from '../../entity/champion';

@Page({
  templateUrl: 'build/pages/home/home.html',
})
export class HomePage {

  public storage:Storage;
  public nav:NavController;
  public champions:Champion[];

  constructor(platform: Platform, nav:NavController, private http: Http) {

    this.champions = [];
    this.nav = nav;

      platform.ready().then(()=>{

        this.storage = new Storage(SqlStorage, {name:'lol.db'});

        this.storage.query('select * from champions').then(result =>{
          if(result.res.rows.length === 0){
            http.get('http://ddragon.leagueoflegends.com/cdn/6.9.1/data/fr_FR/champion.json')
              .map(champions => champions.json())
              .subscribe(data => {
                this._insertChampions(data)
              });
          }else{
            for(var i = 0; i < result.res.rows.length; i++) {

              this.champions.push({
                "id":result.res.rows.item(i).id,
                "shortname":result.res.rows.item(i).shortname,
                "fullname":result.res.rows.item(i).fullname,
                "story":result.res.rows.item(i).story,
                "title":result.res.rows.item(i).title,
                "likes":result.res.rows.item(i).likes
              });
            }
          }
          console.log();
        });
      });
  }

  /**
  * Win method
  */
  public win(champion:Champion){
    champion.likes = champion.likes+1;
    this.storage.query('update champions set likes=? where id=?', [
      champion.likes,
      champion.id
    ]).then(data=>{
      console.log(data);
    });
  }

  /**
  * Delate a champion
  */
  public deleteChampion(champion:Champion){

    this.nav.present(Alert.create({
      title:'Delete '+champion.fullname+' ?',
      message:'Do you really want to delete '+champion.fullname+' ?',
      buttons:[
        {
          text:'Cancel',
          handler:()=>{

          }
        },
        {
          text:'Delete',
          handler:()=>{
            this._delete(champion);
          }
        }
      ]
    }));
  }

  /**
  * Delate a champion
  */
  private _delete(champion: Champion){

    this.storage.query('delete from champions where id=?', [champion.id]).then(data=>{
      console.log(data);
    });

    for(let i = 0 ; i < this.champions.length ; i++){
      if(this.champions[i].id === champion.id){
        this.champions.splice(i, 1);
        break;
      }
    }
  }

  /**
  * Insert champions
  */
  private _insertChampions(champions:any):void{
    for(let key in champions.data){
      if(!champions.data.hasOwnProperty(key)){
        continue;
      }
      let champion = champions.data[key];
      this.storage.query('insert into champions (shortname, fullname, story, title) values (?,?,?,?)', [
        champion.id,
        champion.name,
        champion.blurb,
        champion.title
      ]).then(data =>{
        this.champions.push({
          "id":data.res.insertId,
          "shortname":champion.id,
          "fullname":champion.name,
          "story":champion.blurb,
          "title":champion.title,
          "likes":0
        });
      });
    }
  }
}
