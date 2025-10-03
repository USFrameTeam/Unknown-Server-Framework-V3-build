import * as mc from "@minecraft/server";
import {
  USFPlayer
} from "../API/API.js";
import { sendLog } from "../logServer/server.js"
mc.world.afterEvents.playerSpawn.subscribe((event)=>{
  if(event.initialSpawn){
    USFPlayer.getId(event.player);
  };
  sendLog({
		filePath: "usf_log/player/",
		fileName: event.player.name,
		data: `玩家生成在 x: ${event.player.location.x}, y: ${event.player.location.y}, z: ${event.player.location.z} `
	});
});