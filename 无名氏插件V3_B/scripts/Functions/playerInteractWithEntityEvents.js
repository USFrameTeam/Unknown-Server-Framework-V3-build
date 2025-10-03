import * as mc from "@minecraft/server";
import {
  Land,
  USFPlayer
} from "../API/API.js";
import { sendLog } from "../logServer/server.js"
mc.world.beforeEvents.playerInteractWithEntity.subscribe((event)=>{
  let landList = Land.manager.getLandList();
  for(let land of landList){
    if(land.inLand(event.target) && !land.setting.canIEntity && !(USFPlayer.getId(event.player) === land.owner.id)){
      event.cancel = true;
    }
  };
  sendLog({
		filePath: "usf_log/player/",
		fileName: event.player.name,
		data: `与实体 ${event.target.typeId} 在 x: ${event.target.location.x}, y: ${event.target.location.y}, z: ${event.target.location.z} `
	});
});