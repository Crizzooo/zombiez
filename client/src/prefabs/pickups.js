import Prefab from './Prefab';
import store from '../store.js';
import {PICKUP_RESPAWN_RATE} from '../engine/gameConstants.js';
import {createCreateEvent, createDestroyEvent} from '../engine/managePickups.js';

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

console.log('created prefab position', position)
    super(game, name, position, properties);
    if(properties.type === 'speed') this.scale.setTo(0.5);
    this.enableBody = true;
    //this.properties = properties;

  }


  onCollide (player, pickupType, pickupId){

    //dispatch a destroy event to all players, it should
    console.log('pickupType: ', pickupType);
    createDestroyEvent(pickupType, pickupId);

    if(pickupType === 'health'){
      if(player.stats.health >= 70) player.stats.health = 100;
      else player.stats.health += 30;
      player.setHealth(player.stats.health);
    }  else if (pickupType === 'speed') {
      player.stats.movement += 100;
      console.log('PICKED UP SPEEED BOOOST', player)
      setTimeout(()=>{player.stats.movement -= 100}, 5000);
    }

    setTimeout(()=>{
      createCreateEvent(pickupType);
    }, PICKUP_RESPAWN_RATE)
  }



  //dispatch to local state... under player

}

//935,552 speed
//560,528,'heartPickup'
