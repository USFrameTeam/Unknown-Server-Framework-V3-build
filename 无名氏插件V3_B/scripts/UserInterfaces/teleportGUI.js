import {
  ScriptUI
} from "../API/UIAPI.js";
import {
  UIManager
} from "./init.js";
import * as mc from "@minecraft/server"
//type: 1: 玩家，2: 世界


//传送点数据读/写


function playerPointListIO(player, mode = 0, pl = []) {
  switch (mode) {
    case 1:
    case "Input":
      pl = pl.filter((pos) => {
        if (pos.location.dimensionId === undefined || pos.location.x === undefined || pos.location.y === undefined || pos.location.z === undefined) {
          return false;
        };
        return true;
      });
      player.setDynamicProperty("personalPoints", JSON.stringify(pl));
      break;

    case 0:
    case "Output":
    default:
      let pointList = player.getDynamicProperty("personalPoints");
      if (pointList === undefined) {
        player.setDynamicProperty("personalPoints", JSON.stringify([]));
        pointList = [];
        return pointList;
      };
      pointList = JSON.parse(pointList);
      return pointList;
      break;
  }
};

//世界传送点读/写
function worldPointListIO(mode, list = []) {
  switch (mode) {
    case 1:
    case "Input":
      list = list.filter((pos) => {
        if (pos.location.dimensionId === undefined || pos.location.x === undefined || pos.location.y === undefined || pos.location.z === undefined) {
          return false;
        };
        return true;
      });
      mc.world.setDynamicProperty("worldPointList", JSON.stringify(list));
      break;
    case 0:
    case "Output":
      let pointList = mc.world.getDynamicProperty("worldPointList");
      if (pointList === undefined) {
        mc.world.setDynamicProperty("worldPointList", JSON.stringify([]));
        pointList = [];
        return pointList;
      };
      pointList = JSON.parse(pointList);
      return pointList;
      break;
  }
}




//列表模板
class PointList extends ScriptUI.ActionFormData {
  //@Override
  //覆写setBeforeSendEvents方法
  setBeforeSendEvents(events, type) {
    this.beforeEvents = (player) => {
      let points = (type === 1 ? playerPointListIO(player, 0) : worldPointListIO(0));//类型判断，0为世界传送点，1为玩家传送点
      events(player, points);//调用event函数（玩家，传送点列表）
      for (let index = 0; index < points.length; index++) {
        this.addButton({
          buttonDef: {
            text: points[index].name
          },
          event: (player) => {
            new PointInfo({
              ...points[index]
            }, index, type).sendToPlayer(player);
          }
        });
      }
    };
  }
};
//添加传送点
class AddPoint extends ScriptUI.ModalFormData {
  constructor(teleportId) {
    super();
    this.setTitle(`添加传送点 [${ teleportId === 1 ? "个人传送点" : teleportId === 2 ? "世界公共点" : ""}]`);
    this.setFather(new (teleportId === 1 ? PersonalPoint : PublicWorldPoint)());
    //this.setInformation();
    this.setButtonsArray([{
      typeId: "textField",
      id: "point_name",
      label: "传送点名称",
      setting: {
        placeHolderText: "传送点名称"
      }
    }]);
    this.setEvents((player, results) => {
      let points = (teleportId === 1 ? playerPointListIO(player, 0) : worldPointListIO(0));
      let loc = player.dimension.getBlock({
        x: player.location.x,
        y: player.location.y - 1,
        z: player.location.z
      });

      points.push({
        name: results.get("point_name"),
        //将玩家x、y、z位置设置为方块中点（0.5, 0, 0.5）
        sender: (teleportId === 1 ? undefined : player.name),
        location: {
          x: loc.x + 0.5,
          y: loc.y + 1,
          z: loc.z + 0.5,
          dimensionId: player.dimension.id
        }
      });
      if (teleportId === 1) playerPointListIO(player, 1, points);//判断传送点类型发出对应界面
      if (teleportId === 2) worldPointListIO(1, points);
    });
  }
}

//传送点信息界面
class PointInfo extends ScriptUI.ActionFormData {
  constructor(point, pointIndex, type) {
    super();
    this.setTitle("传送点设置");
    this.setInformation(`传送点名称：${point.name}\n维度：${point.location.dimensionId}\n坐标：${point.location.x}, ${point.location.y}, ${point.location.z}` + (type === 2 ? `\n创建者：${point.sender}` : ""));
    this.setButtonsArray([{
      buttonDef: {
        text: "传送"
      },
      event: (player) => {
        player.teleport(point.location, {
          dimension: mc.world.getDimension(point.location.dimensionId)
        });
      }
    }, {
      buttonDef: {
        text: "编辑"
      },
      event: (player) => {
        new PointEditGUI(point, pointIndex, type).sendToPlayer(player);
      }
    }, {
      buttonDef: {
        text: "删除"
      },
      event: (player)=>{
      	new CheckPointDelete(point, pointIndex, type).sendToPlayer(player);
      }
    }]);
  }
}

//传送点编辑界面
class PointEditGUI extends ScriptUI.ModalFormData {
  constructor(point, pointIndex, type) {
    super();
    this.setTitle(`编辑[${ type === 1 ? "个人传送点" : type === 2 ? "世界公共点" : "" }]`);
    this.setInformation(`传送点名称：${point.name}\n维度：${point.location.dimensionId}\n坐标：${point.location.x}, ${point.location.y}, ${point.location.z}` + (type === 2 ? `\n创建者：${point.sender}` : ""));
    this.setFather(new (type === 1 ? PersonalPoint : PublicWorldPoint)());
    this.setButtonsArray([{
        typeId: "textField",
        id: "point_name",
        label: "传送点名称",
        setting: {
          defaultValue: point.name
        }
      },
      {
        typeId: "toggle",
        id: "point_pos",
        label: "设置传送坐标为当前位置",
        setting: {
          defaultValue: false
        }
      }
    ]);
    this.setEvents((player, results) => {
      let points = (type === 1 ? playerPointListIO(player, 0) : worldPointListIO(0));
      points[pointIndex].name = (results.get("point_name") !== undefined ? results.get("point_name") : undefined);
      if (results.get("point_pos")) {
        let loc = player.dimension.getBlock({
          x: player.location.x,
          y: player.location.y - 1,
          z: player.location.z
        });
        points[pointIndex].location = {
          x: loc.x + 0.5,
          y: loc.y + 1,
          z: loc.z + 0.5,
          dimensionId: player.dimension.id
        }
      };
      (type === 1 ? playerPointListIO(player, 1, points) : worldPointListIO(1, points));
    });
  }
}


/*传送点格式：
  point: {
    name: String,
    location: {x: number, y: number, z: number, dimensionId: String}
  }
*/


//传送GUI
//public class (bushi)
class TeleportGUI extends ScriptUI.ActionFormData {
  constructor() {
    super();
    this.setFather(new (UIManager.getUI("mainGUI"))());
    this.setTitle("传送界面");
    this.setButtonsArray([{
        buttonDef: {
          text: "个人传送点"
        },
        event: (player) => {
          new PersonalPoint().sendToPlayer(player);
        }
      },
      {
        buttonDef: {
          text: "世界传送点"
        },
        event: (player) => {
          new PublicWorldPoint().sendToPlayer(player);
        }
      },
      {
      	buttonDef: {
      		text: "玩家互传"
      	}
      }
    ]);
  };
  static typeId = "teleportGUI"
};

mc.system.run(() => {
  UIManager.addUI(TeleportGUI);
});



//个人传送点界面
class PersonalPoint extends PointList {
  constructor() {
    super();
    this.setTitle("个人传送点");
    this.setFather(new TeleportGUI());
    this.setBeforeSendEvents((player, pointList) => {
      this.setInformation(`个人传送点数：${pointList.length}`);
      this.setButtonsArray([{
        buttonDef: {
          text: "添加传送点"
        },
        event: (player) => {
          new AddPoint(1).sendToPlayer(player);
        }
      }]);
    }, 1);
  }
};

//世界公共点


class PublicWorldPoint extends PointList {
  constructor() {
    super();
    this.setTitle("世界公共点");
    this.setFather(new TeleportGUI());
    this.setBeforeSendEvents((player, pointList) => {
      this.setInformation(`世界传送点数：${pointList.length}`);
      this.setButtonsArray([{
        buttonDef: {
          text: "添加传送点"
        },
        event: (player) => {
          new AddPoint(2).sendToPlayer(player);
        }
      }]);
    }, 2);
  }
};

class CheckPointDelete extends ScriptUI.MessageFormData {
  constructor(point, pointIndex, type){
    super();
    this.setTitle("删除传送点");
    this.setInformation(`传送点名称：${point.name}`);
    this.setFather(new PointInfo(point, pointIndex, type));
    this.setButton(0, "取消", (player)=>{
      new PointInfo(point, pointIndex, type).sendToPlayer(player);
    });
    this.setButton(1, "删除", (player)=>{
      let points = (type === 1 ? playerPointListIO(player, 0) : worldPointListIO(0));
      points.splice(pointIndex, 1);
      (type === 1 ? playerPointListIO(player, 1, points) : worldPointListIO(1, points));
      new (type === 1 ? PersonalPoint : PublicWorldPoint)().sendToPlayer(player);
    });
  }
}