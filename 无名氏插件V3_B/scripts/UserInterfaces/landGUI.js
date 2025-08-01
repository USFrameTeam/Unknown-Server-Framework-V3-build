import {
  ScriptUI
} from "../API/UIAPI.js";
import {
  UIManager
} from "./init.js";
import {
  USFPlayer,
  Land
} from "../API/API.js";
import * as mc from "@minecraft/server";



class LandGUI extends ScriptUI.ActionFormData {
  constructor() {
    super();
    this.setTitle("领地");
    this.setButtonsArray([{
      buttonDef: {
        text: "添加领地"
      },
      event: (player) => {
        player.land = {
          create: true,
          pos: []
        }
      }
    }]);
    this.setBeforeSendEvents((player) => {
      let player_land = Land.manager.getLandList({
        playerId: USFPlayer.getId(player)
      });
      for(let land of player_land){
        this.addButton({
          buttonDef: {
            text: `${land.name}`
          },
          event: (player)=>{
            new LandEditGUI(land).sendToPlayer(player);
          }
        });
      }
    });
  };
  static typeId = "LandGUI";
  static addLandGUI = () => {
    return AddLandGUI;
  };
  static managerGUI = () =>{
    return LandManagerGUI;
  }
};
mc.system.run(() => {
  UIManager.addUI(LandGUI);
});


class AddLandGUI extends ScriptUI.ModalFormData {
  constructor() {
    super();
    this.setTitle("添加领地");
    this.setButtonsArray([{
        typeId: "textField",
        id: "land_name",
        label: "领地名称",
        setting: {}
      },
      {
        typeId: "toggle",
        id: "land_create",
        label: "确认创建",
        setting: {}
      }
    ]);
    this.setBeforeSendEvents((player, ui) => {
      let data = {
        isCreate: true,
        owner: {
          id: USFPlayer.getId(player),
          name: player.name
        },
        dimension: player.dimension,
        pos: {
          from: player.land.pos[0],
          to: player.land.pos[1]
        }
      };
      let land = new Land(data);
      //mc.world.sendMessage("" + Land.coincide_allLand(land));
      if (Land.coincide_allLand(land)) {
        player.sendMessage("领地重叠，无法创建");
        ui.cancel = true;
        return;
      }
      this.setInformation(`范围：x: ${land.pos.max.x}, y: ${land.pos.max.y}, z: ${land.pos.max.z} 到 x: ${land.pos.min.x}, y: ${land.pos.min.y}, z: ${land.pos.min.z}\n${(mc.world.getDynamicProperty("usf:land_scoreboard") === undefined ? "" : "当前花费："+ ((land.pos.max.x - land.pos.min.x) * (land.pos.max.y - land.pos.min.y) * (land.pos.max.z - land.pos.min.z) * mc.world.getDynamicProperty(" usf:.landOptions.cost")))}`);
    });
    this.setEvents((player, results) => {
      if(results.get("land_name").length === 0){
        player.sendMessage("领地名不能为空");
        return;
      }
      if (results.get("land_create")) {
        let data = {
          isCreate: true,
          owner: {
            id: USFPlayer.getId(player),
            name: player.name
          },
          dimension: player.dimension,
          pos: {
            from: player.land.pos[0],
            to: player.land.pos[1]
          },
          name: results.get("land_name")
        };
        let land = new Land(data);
        delete player.land;
        if(mc.world.getDynamicProperty("usf:land_scoreboard")){
          let sb = mc.world.scoreboard.getObjective(mc.world.getDynamicProperty("usf:land_scoreboard"));
          if(sb === null){
            Log.error("领地记分板不存在，id: " + mc.world.getDynamicProperty("usf:land_scoreboard"));
            return;
          };
          if((sb.getScore(player) - ((land.pos.max.x - land.pos.min.x) * (land.pos.max.y - land.pos.min.y) * (land.pos.max.z - land.pos.min.z) * mc.world.getDynamicProperty(" usf:.landOptions.cost"))) > 0){
            sb.addScore(player, -(land.pos.max.x - land.pos.min.x) * (land.pos.max.y - land.pos.min.y) * (land.pos.max.z - land.pos.min.z) * mc.world.getDynamicProperty(" usf:.landOptions.cost"));
          } else {
            player.sendMessage("余额不足");
            return;
          }
        };
        Land.manager.addLand(land);
      }
    })
  }
};


class LandEditGUI extends ScriptUI.ModalFormData {
  constructor(land){
    super();
    this.setTitle("领地编辑");
    this.setButtonsArray([
      {
        typeId: "textField",
        id: "land_name",
        label: "领地名称",
        setting: {
          defaultValue: land.name
        }
      },
      {
        typeId: "toggle",
        id: "land_delete",
        label: "删除领地",
        setting: {
          defaultValue: false
        }
      }
    ]);
    this.setBeforeSendEvents((player)=>{
      this.setInformation(`领地主：${land.owner.name}\n领地id：${land.id}\n范围：${land.pos.max.x} ${land.pos.max.y} ${land.pos.max.z} - ${land.pos.min.x} ${land.pos.min.y} ${land.pos.min.z}`);
    });
    this.setEvents((player, res)=>{
      if(res.get("land_name").length === 0){
        player.sendMessage("领地名不能为空");
        return;
      }
      land.name = res.get("land_name");
      land.owner.name = USFPlayer.getId(player) === land.owner.id ? player.name : land.owner.name;
      if(res.get("land_delete")){
        Land.manager.removeLand(land);
      } else {
        Land.manager.saveLand(land);
      }
    });
  }
}



//管理界面

class LandManagerGUI extends ScriptUI.ActionFormData {
  constructor(){
    super();
    this.setTitle("领地管理界面");
    this.setButtonsArray([
      {
        buttonDef: {
          text: "设置领地花费"
        },
        event: (player)=>{
          new LandSetCostGUI().sendToPlayer(player);
        }
      },
      {
        buttonDef: {
          text: "管理所有领地"
        },
        event: (player)=>{
          new LandListGUI().sendToPlayer(player);
        }
      }
    ])
  }
}


//领地花费界面
class LandSetCostGUI extends ScriptUI.ModalFormData {
  constructor(){
    super();
    this.setTitle("设置领地花费");
    this.setButtonsArray([{
      typeId: "textField",
      id: "land_sb_id",
      label: "领地记分板id（没有留空）",
      setting: {
        defaultValue: "" + (mc.world.getDynamicProperty("usf:land_scoreboard") ? mc.world.getDynamicProperty("usf:land_scoreboard") : "")
      }
    },
    {
      typeId: "textField",
      id: "land_cost",
      label: "每方块花费",
      setting: {
        defaultValue: "" + mc.world.getDynamicProperty(" usf:.landOptions.cost")
      }
      
    }]);
    this.setEvents((player, res)=>{
      if(res.get("land_sb_id").length === 0){
        mc.world.setDynamicProperty("usf:land_scoreboard", undefined);
      } else {
        mc.world.setDynamicProperty("usf:land_scoreboard", res.get("land_sb_id"));
      };
      if(typeof(Number(res.get("land_cost"))) !== typeof(1)){
        return;
      } else {
        mc.world.setDynamicProperty(" usf:.landOptions.cost", Number(res.get("land_cost")));
      }
    })
  }
};


class LandListGUI extends ScriptUI.ActionFormData {
  constructor(){
    super();
    this.setTitle("领地列表");
    this.setFather(new LandManagerGUI());
    this.setBeforeSendEvents((player) => {
      let player_land = Land.manager.getLandList();
      for(let land of player_land){
        this.addButton({
          buttonDef: {
            text: `领地名：${land.name}\n主人：${land.owner.name}`
          },
          event: (player)=>{
            new LandEditGUI(land).sendToPlayer(player);
          }
        });
      }
    });
  }
}