import * as mc from "@minecraft/server";
import {
	sendLog
} from "../logServer/server.js";
import {
	USFPlayer
} from "../utils/PlayerAPI.js";
import {
	Land
} from "../utils/LandAPI.js";

mc.world.beforeEvents.entityHurt.subscribe((events) => {
	if (events.damageSource.damagingEntity?.typeId === "minecraft:player") {
		let land = Land.manager.getLandFromPosition(events.hurtEntity.location);
		if ((land !== undefined) && !((land.members[USFPlayer.getId(events.damageSource.damagingEntity)]?.permissions?.attackEntity === true) || (USFPlayer.getId(events.damageSource.damagingEntity) === land.owner.id))) {
			events.cancel = true;
		};
	}
});