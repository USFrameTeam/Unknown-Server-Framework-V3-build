import * as mc from "@minecraft/server";
import {
	UIManager
} from "../UserInterfaces/init.js";
import {
	Land,
	USFPlayer
} from "../API/API.js";
import { sendLog } from "../logServer/server.js"
mc.world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
	if (JSON.parse(mc.world.getDynamicProperty("usf:.openMainItemList")).includes(event.itemStack?.typeId)) {
		event.cancel = true;
		mc.system.run(() => {
			new(UIManager.getUI("mainGUI"))().sendToPlayer(event.player);
		});
	};
	//领地交互检测
	let landList = Land.manager.getLandList();
	for (let land of landList) {
		if (land.inLand(event.block) && !land.setting.canIBlock && !(USFPlayer.getId(event.player) === land.owner.id)) {
			//mc.world.sendMessage("cancel");
			event.cancel = true;
		}
	};
	//领地创建检测
	if (event.player?.land?.create) {
		if (event.player.isSneaking) delete event.player.land;
		if (event.itemStack === undefined) {
			event.player.land.pos.push(event.block);
			if (event.player.land.pos.length > 2) {
				event.player.land.pos.shift();
			}
		}
	};
	
	sendLog({
		filePath: "usf_log/player/",
		fileName: event.player.name,
		data: `与方块交互：${event.block.typeId} 在 x: ${event.block.x}, y: ${event.block.y}, z: ${event.block.z} `
	});
});