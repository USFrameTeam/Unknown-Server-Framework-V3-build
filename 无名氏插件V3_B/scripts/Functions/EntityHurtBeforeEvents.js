import * as mc from "@minecraft/server";
import {
	sendLog
} from "../logServer/server.js";

mc.world.beforeEvents.entityHurt.subscribe((events) => {
	if (events.damageSource.damagingEntity?.typeId === "minecraft:player") {
		let land = Land.manager.getLandFromPosition(events.hurtEntity.location);
		if ((land !== undefined) && !(USFPlayer.getId(events.damageSource.damagingEntity) === land.owner.id)) {
			events.cancel = true;
		};
	}
});