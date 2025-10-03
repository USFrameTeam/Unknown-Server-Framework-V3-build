import * as mc from "@minecraft/server";
import { sendLog } from "../logServer/server.js"

mc.world.afterEvents.playerDimensionChange.subscribe((event)=>{
  delete event.player.land;
  sendLog({
		filePath: "usf_log/player/",
		fileName: event.player.name,
		data: `从 ${ event.fromDimension.id } 去了 ${ event.toDimension.id }`
	});
})