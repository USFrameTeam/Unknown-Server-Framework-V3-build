import * as mc from "@minecraft/server";

const PlayerInitProps = [
	{
		name: "usf:chat_format",
		value: ()=>{
			return null;
		}
	},
	{
		name: "usf:permission",
		value: ()=>{
			return JSON.stringify({});
		}
	}
];

/*
	class Manager {
		level: Number,
		name: String,
		id: USFID,
		permissions: Object
	}
*/

let usfManagerList = {};
mc.system.run(()=>{
	usfManagerList = JSON.parse(mc.world.getDynamicProperty("usf:managerList") || "{}");
});

export class USFPlayer {
  static managerAPI = {
    getLevelFromPlayer: (player) => {
      return usfManagerList[USFPlayer.getId(player)]?.level;
    },
    getLevelFromID: (neoUSFID) => {
      return usfManagerList[neoUSFID]?.level;
    },
    setLevelFromPlayer: (player, level) => {
    	if(level === 0){
      	delete usfManagerList[USFPlayer.getId(player)];
      	return;
      };
    	if(usfManagerList[USFPlayer.getId(player)] === undefined){
    		usfManagerList[USFPlayer.getId(player)] = {};
    	};
      usfManagerList[USFPlayer.getId(player)].level = level;
      usfManagerList[USFPlayer.getId(player)].name = player.name;
      mc.world.setDynamicProperty("usf:managerList", JSON.stringify(usfManagerList));
    },
    setLevelFromID: (neoUSFID, level, playerName = undefined) => {
    	if(level === 0){
      	delete usfManagerList[neoUSFID];
      	return;
      };
    	if(usfManagerList[neoUSFID] === undefined){
    		usfManagerList[neoUSFID] = {};
    	};
    	
      usfManagerList[neoUSFID].level = level;
      if(playerName){
      	usfManagerList[neoUSFID].name = playerName;
      };
      mc.world.setDynamicProperty("usf:managerList", JSON.stringify(usfManagerList));
    },
    
    getPermissionFromPlayer: (player)=>{
    	return usfManagerList[USFPlayer.getId(player)]?.permissions;
    },
    getPermissionFromID: (neoUSFID)=>{
    	return usfManagerList[neoUSFID]?.permissions;
    },
    setPermissionFromPlayer: (player, permissions)=>{
    	if(usfManagerList[USFPlayer.getId(player)] === undefined){
    		//usfManagerList[USFPlayer.getId(player)] = {};
    		return false;
    	};
    	usfManagerList[USFPlayer.getId(player)].permissions = permissions;
    	mc.world.setDynamicProperty("usf:managerList", JSON.stringify(usfManagerList));
    },
    setPermissionFromID: (neoUSFID, permissions)=>{
    	if(usfManagerList[neoUSFID] === undefined){
    		//usfManagerList[neoUSFID] = {};
    		return false;
    	};
    	usfManagerList[neoUSFID].permissions = permissions;
    	mc.world.setDynamicProperty("usf:managerList", JSON.stringify(usfManagerList));
    },
    getList: ()=>{
    	return usfManagerList;
    }
  }
  static getId = (player) => {
    if(player.getDynamicProperty("usf:playerId") === undefined) {
      player.setDynamicProperty("usf:playerId", mc.world.getDynamicProperty("usf:playerGenId"));
      mc.world.setDynamicProperty("usf:playerGenId", mc.world.getDynamicProperty("usf:playerGenId") + 1);
    }
    return player.getDynamicProperty("usf:playerId");
  };
  static init = (player) => {
  	for(let data of PlayerInitProps){
  		if(player.getDynamicProperty(data.name) === undefined){
  			player.setDynamicProperty(data.name, data.value());
  		}
  	}
  }
};