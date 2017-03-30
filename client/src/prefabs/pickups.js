import Prefab from './Prefab';
import store from '../store.js';

export default class Pickup extends Prefab {


  constructor(game, name, position, properties){



    switch (properties.type) {
      case 'health':
        properties.texture = 'healthPickup';
        break;
      case 'speed':
        properties.texture = 'speedPickup';
        break;
      default:
        break;
    }




    super(game, name, position, properties);

    if(properties.type === 'speed') this.scale.setTo(0.5);

    this.enableBody = true;
    //this.properties = properties;


  }


  onCollide (player, pickupType){

    if(pickupType === 'healthPickup'){
      if(player.stats.health >= 70) player.stats.health = 100;
      else player.stats.health += 30;
      player.setHealth(player.stats.health);
    }


    else if (pickupType === 'speedPickup') {
      player.stats.movement = 200;
      console.log('PICKED UP SPEEED BOOOST', player)
      setTimeout(()=>{player.stats.movement = 100}, 5000);
    }

    this.kill();
  }



  //dispatch to local state... under player

}

//935,552 speed
//560,528,'heartPickup'
