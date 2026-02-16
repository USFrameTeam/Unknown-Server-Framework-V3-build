import {
  ScriptUI
} from "../utils/UIAPI.js";
import {
  UIManager
} from "./init.js";
import {
  USFPlayer
} from "../utils/PlayerAPI.js";
import {
	TexturePath
} from "./TexturePath.js";
import * as mc from "@minecraft/server";
import "./manager/ScoreBoard.js";
import "./manager/ItemEdit.js";
import "./manager/CustomUIGUI.js";
import "./manager/ChatFormatEdit.js";
import "./manager/SubordinateManagerGUI.js";

/*
  等级：
  普通玩家：0
  管理员：1
  服主：2
*/

class ManagerInterface extends ScriptUI.ActionFormData {
  static typeId = "ManagerGUI";
  constructor(player) {
    super();
    let level = USFPlayer.managerAPI.getLevelFromPlayer(player);
    let permissions = USFPlayer.managerAPI.getPermissionFromPlayer(player);
    this.setTitle("管理界面");
    this.setFather(new (UIManager.getUI("mainGUI"))());
    this.setButtonsArray([{
        buttonDef: {
          text: "设置计分板",
          iconPath: TexturePath.managerGUI.scoreboard
        },
        condition: (player) => {
          return (permissions?.scoreboard === true || level === 2);
        },
        event: (player) => {
          new (UIManager.getUI("Manager_ScoreBoardGUI"))().sendToPlayer(player);
        }
      },
      {
        buttonDef: {
          text: "领地管理",
          iconPath: TexturePath.mainGUI.icon_new
        },
        condition: (player) => {
          return (permissions?.land === true || level === 2);
        },
        event: (player) => {
          new (UIManager.getUI("LandGUI").managerGUI())().sendToPlayer(player);
        }
      },
      {
      	buttonDef: {
      		text: "自定义UI（半完成）",
      		iconPath: TexturePath.managerGUI.customUI
      	},
      	condition: (player) => {
          return (permissions?.customUI === true || level === 2);
        },
      	event: (player)=>{
      		new (UIManager.getUI("CustomManagerGUI"))().sendToPlayer(player);
      	}
      },
      {
      	buttonDef: {
      		text: "自定义物品属性",
      		iconPath: TexturePath.managerAPI.itemData
      	},
      	condition: (player) => {
          return (permissions?.itemEdit === true || level === 2);
        },
      	event: (player)=>{
      		new (UIManager.getUI("Manager_ItemEditGUI"))(player).sendToPlayer(player);
      	}
      },
      {
      	buttonDef: {
      		text: "聊天格式设置",
      		iconPath: TexturePath.mainGUI.message
      	},
      	condition: (player) => {
          return (permissions?.chatFormat === true || level === 2);
        },
      	event: (player)=>{
      		new (UIManager.getUI("Manager_ChatFormatEditGUI"))().sendToPlayer(player);
      	}
      },
      {
      	buttonDef: {
      		text: "传送系统设置",
      		iconPath: TexturePath.mainGUI.pointer
      	},
      	condition: (player)=>{
      		return (permissions?.teleportSetting === true || level === 2);
      	},
      	event: (player)=>{
      		UIManager.getUI("teleportGUI").newTeleportManagerGUI().sendToPlayer(player);
      	}
      },
      {
      	buttonDef: {
      		text: "管理员设置",
      		iconPath: TexturePath.mainGUI.permissions_op_crown
      	},
      	condition: (player) => {
          return level === 2;
        },
      	event: (player)=>{
      		new (UIManager.getUI("Manager_SubordinateManagerGUI"))(player).sendToPlayer(player);
      	}
      },
      {
        buttonDef: {
          text: "插件重要设置（未完成）"
        },
        condition: (player) => {
          return false;
        },
        event: (player)=>{
        	
        }
      }
    ]);
    this.setBeforeSendEvents((player) => {
      this.setInformation(`等级：${level === 2 ? "服主" : "管理员"}`);
      if (level === 0) {
        this.cancel = true;
      }
    });
  }
};
mc.system.run(() => {
  UIManager.addUI(ManagerInterface);
});



