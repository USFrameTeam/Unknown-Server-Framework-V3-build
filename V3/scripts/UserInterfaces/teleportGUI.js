import {
  ScriptUI
} from "../API/UIAPI.js";
import {
  UIManager
} from "./init.js";
import {
  Options
} from "../mainActivity.js"
import * as mc from "@minecraft/server"

//传送点数据读/写

function pointListIO(player, mode = 0, pl = []) {
  switch (mode) {
    case 1:
    case "Input":
      pl = pl.filter((pos)=>{
        if(pos.location.dimensionId === undefined || pos.location.x === undefined || pos.location.y === undefined || pos.location.z === undefined){
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




//列表模板
class PointList extends ScriptUI.ActionFormData {
  //重写
  setBeforeSendEvents(events){
    this.beforeEvents = (player)=>{
      let points = pointListIO(player, 0);
      events(player, points);
      for (let index = 0; index < points.length; index++) {
        this.addButton({
          buttonDef: {
            text: points[index].name
          },
          event: (player) => {
            new PointInfo({...points[index]}, index).sendToPlayer(player);
          }
        });
      }
    };
  }
};

//传送点信息界面
class PointInfo extends ScriptUI.ActionFormData {
  constructor(point, pointIndex) {
    super();
    this.setTitle("传送点设置");
    this.setInformation(`传送点名称：${point.name}\n维度：${point.location.dimensionId}\n坐标：${point.location.x}, ${point.location.y}, ${point.location.z}`);
    this.setButtonsArray([{
      buttonDef: {
        text: "传送"
      },
      event: (player) => {
        player.teleport(point.location, {
          dimension: mc.world.getDimension(point.location.dimensionId)
        });
      }
    }]);
  }
}

/*传送点格式：
  point: {
    name: String,
    location: {x: number, y: number, z: number, dimensionId: String}
  }
*/


//传送GUI
class TeleportGUI extends ScriptUI.ActionFormData {
  constructor() {
    super();
    this.setTitle("传送界面");
    this.setButtonsArray([{
      buttonDef: {
        text: "个人传送点"
      },
      event: (player) => {
        new PersonalPoint().sendToPlayer(player);
      }
    }]);
  };
  static typeId = "teleportGUI"
};

mc.system.run(() => {
  UIManager.addUI(TeleportGUI);
});


class addPoint extends ScriptUI.ModalFormData {
  constructor(teleportId){
    super();
    this.setTitle(`添加传送点 [${ teleportId === 1 ? "个人传送点" : teleportId === 2 ? "世界公共点" : ""}]`);
    this.setInformation("");
    this.setFather(new PersonalPoint());
    this.setButtonsArray([
      {
        typeId: "textField",
        id: "point_name",
        label: "传送点名称",
        setting: {
          placeHolderText: "传送点名称"
        }
      }
    ]);
    this.setEvents((player, results)=>{
      let points = pointListIO(player, 0);
      let loc = player.dimension.getBlock({x: player.location.x, y: player.location.y - 1, z: player.location.z});
      points.push({
        name: results.get("传送点名称"),
        location: {
          x: loc.x + 0.5,
          y: loc.y + 1,
          z: loc.z + 0.5,
          dimensionId: player.dimension.id
        }
      });
      pointListIO(player, 1, points);
    });
  }
}

//私人传送点界面
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
          new addPoint(1).sendToPlayer(player);
        }
      }]);
    });
  }
}