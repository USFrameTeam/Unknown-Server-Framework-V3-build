import * as mc from "@minecraft/server"
import { DefaultOptions } from "./options.js"
import "./UserInterfaces/init.js";
import "./Functions/init.js";

let Options = DefaultOptions;

/*function initOptions(DP, json){
  
}

mc.world.afterEvents.worldLoad.subscribe(()=>{
  Options = JSON.parse(mc.world.getDynamicProperty("plug-in-options"));
  for(let key in DefaultOptions){
    if(DefaultOptions[key]){
      
    }
  }
});*/

export { Options };