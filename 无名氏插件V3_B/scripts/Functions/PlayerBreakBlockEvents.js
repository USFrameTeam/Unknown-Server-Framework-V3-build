import * as mc from "@minecraft/server";
import {
  Land,
  USFPlayer
} from "../API/API.js";
import { sendLog } from "../logServer/server.js"

mc.world.beforeEvents.playerBreakBlock.subscribe((event)=>{
  let landList = Land.manager.getLandList();
  for(let land of landList){
    if(land.inLand(event.block) && !land.setting.canBreak && !(USFPlayer.getId(event.player) === land.owner.id)){
      event.cancel = true;
    }
  };
  sendLog({
		filePath: "usf_log/player/",
		fileName: event.player.name,
		data: `破坏方块 ${event.block.typeId} 在 x: ${event.block.x}, y: ${event.block.y}, z: ${event.block.z} `
	});
});