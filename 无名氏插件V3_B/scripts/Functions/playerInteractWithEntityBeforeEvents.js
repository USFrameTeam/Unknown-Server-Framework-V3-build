import * as mc from "@minecraft/server";
import {
  USFPlayer
} from "../utils/PlayerAPI.js";
import {
	Land
} from "../utils/LandAPI.js";
import { sendLog } from "../logServer/server.js"
mc.world.beforeEvents.playerInteractWithEntity.subscribe((event)=>{
	let land = Land.manager.getLandFromPosition(event.target.location);
  if((land !== undefined) && !(USFPlayer.getId(event.player) === land.owner.id)){
    event.cancel = true;
  };
  sendLog({
  	type: "Log",
		filePath: "usf_log/player/",
		fileName: event.player.name,
		data: `与实体 ${event.target.typeId} 在维度：${event.player.dimension.id}，坐标：x: ${event.target.location.x}, y: ${event.target.location.y}, z: ${event.target.location.z} 交互`
	});
});