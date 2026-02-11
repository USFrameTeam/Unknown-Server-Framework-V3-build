import * as mc from "@minecraft/server"

mc.system.afterEvents.scriptEventReceive.subscribe((event)=>{
	mc.world.sendMessage("" + event.sourceType);
}, {namespaces: ["neo_usf"]});
//sendScriptEvent