import * as mc from "@minecraft/server";
import {
	USFPlayer
} from "../utils/PlayerAPI.js";
import {
	Land
} from "../utils/LandAPI.js";
import {
	sendLog
} from "../logServer/server.js"

mc.world.beforeEvents.playerBreakBlock.subscribe((event) => {
	let land = Land.manager.getLandFromPosition(event.block);
	if ((land !== undefined) && !((land.members[USFPlayer.getId(event.player)]?.permissions?.breakBlock === true) || (USFPlayer.getId(event.player) === land.owner.id))) {
		event.cancel = true;
	};
	mc.system.run(() => {
		sendLog({
			type: "Log",
			filePath: "usf_log/player/",
			fileName: event.player.name,
			data: `破坏方块 ${event.block.typeId}在维度：${event.player.dimension.id}，在 x: ${event.block.x}, y: ${event.block.y}, z: ${event.block.z} `
		});
	});
});