import {
  ScriptUI
} from "../API/UIAPI.js";
import {
  UIManager
} from "./init.js";
import {
  USFPlayer
} from "../API/API.js";
import * as mc from "@minecraft/server";
import "./manager/scoreBoard.js";
import "./manager/itemEdit.js";

/*
  等级：
  普通玩家：0
  低级管理：1
  中级管理：2
  高级管理：3
  服主：4
*/

const ManagerDefaultConfig = [{
    level: 0,
    power: []
  },
  {
    level: 1,
    power: [
      "scoreBoardManager",
      ""
    ]
  },
  {
    level: 2,
    power: []
  },
  {
    level: 3,
    power: []
  },
  {
    level: 4,
    power: [
      "Custom"
    ]
  },
  {
    level: 5,
    power: ["All"]
  }
]


class ManagerInterface extends ScriptUI.ActionFormData {
  static typeId = "ManagerGUI";
  constructor(player) {
    super();
    let level = USFPlayer.opLevel.getLevel(player);
    this.setTitle("管理界面");
    this.setFather(new (UIManager.getUI("mainGUI"))());
    this.setButtonsArray([{
        buttonDef: {
          text: "设置计分板"
        },
        condition: (player) => {
          return ManagerDefaultConfig[level].power.includes("scoreBoardManager") || level === 5;
        },
        event: (player) => {
          new (UIManager.getUI("ScoreBoardGUI"))().sendToPlayer(player);
        }
      },
      {
        buttonDef: {
          text: "设置领地"
        },
        condition: (player) => {
          return true;
        },
        event: (player) => {
          new (UIManager.getUI("LandGUI").managerGUI())().sendToPlayer(player);
        }
      },
      {
      	buttonDef: {
      		text: "自定义UI（半完成）"
      	},
      	event: (player)=>{
      		new (UIManager.getUI("CustomManagerGUI"))().sendToPlayer(player);
      	}
      },
      {
      	buttonDef: {
      		text: "自定义物品属性"
      	},
      	event: (player)=>{
      		new (UIManager.getUI("ItemEditGUI"))(player).sendToPlayer(player);
      	}
      },
      {
        buttonDef: {
          text: "插件重要设置（未完成）"
        },
        event: (player)=>{
        }
      }
    ]);
    this.setBeforeSendEvents((player) => {
      this.setInformation(`管理等级：${level}`);
      if (level === 0) {
        this.cancel = true;
      }
    });
  }
};
mc.system.run(() => {
  UIManager.addUI(ManagerInterface);
});



