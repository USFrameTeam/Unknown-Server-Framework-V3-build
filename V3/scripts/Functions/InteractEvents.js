import * as mc from "@minecraft/server";
import { UIManager } from "../UserInterfaces/init.js";
import { Options } from "../mainActivity.js"

mc.world.beforeEvents.playerInteractWithBlock.subscribe((event)=>{
  if(Options.openMainItemList.includes(event.itemStack.typeId)){
    new (UIManager.getUI("mainGUI"))().sendToPlayer(event.player);
  }
});