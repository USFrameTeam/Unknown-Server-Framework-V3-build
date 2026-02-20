import * as mc from "@minecraft/server";
import {
	ChatOptions
} from "../utils/ChatAPI.js";
import {
	sendLog
} from "../logServer/server.js";
/*
	/dimension: dimension.id,
	/name: player.name,
	/time: new Date().toString(),
	/constant: String,
	/team: team.name,
	/health: health
*/



mc.world.beforeEvents.chatSend.subscribe((event) => {
	if (JSON.parse(mc.world.getDynamicProperty("usf:chatSettings.enable"))) {
		event.cancel = true;
		mc.system.run(() => {
			let message = ChatOptions.transForm(event.message, event.sender);
			sendLog({
				type: "Log",
				filePath: "usf_log/player/",
				fileName: event.sender.name,
				data: message
			});
			//if(event.sender.)
			mc.world.sendMessage(message);
		});
	}
});