import {
  ScriptUI
} from "../../API/UIAPI.js";
import {
  UIManager
} from "../init.js";
import * as mc from "@minecraft/server";

//计分板管理


function scoreBoardDefaultValueIO(id, mode = 0, value = 0) {
  let scoreBoardDL = JSON.parse(mc.world.getDynamicProperty("usf:.scoreboardDefaultValue"));
  if (mode === 0) {
    for (let sb of scoreBoardDL) {
      if (sb.id === id) {
        return sb.value;
      }
    }
    return 0;
  };
  if (mode === 1) {
    for (let index = 0; index < scoreBoardDL.length; index++) {
      if (scoreBoardDL[index].id === id) {
        scoreBoardDL[index].value = value;
        mc.world.setDynamicProperty("usf:.scoreboardDefaultValue", JSON.stringify(scoreBoardDL));
        return;
      }
    };
    scoreBoardDL.push({id, value: value});
    mc.world.setDynamicProperty("usf:.scoreboardDefaultValue", JSON.stringify(scoreBoardDL));
  };
  if(mode === 2){
    for (let index = 0; index < scoreBoardDL.length; index++) {
      if (scoreBoardDL[index].id === id) {
        scoreBoardDL.splice(index, 1);
        mc.world.setDynamicProperty("usf:.scoreboardDefaultValue", JSON.stringify(scoreBoardDL));
        return;
      }
    };
  }
}

//总界面

class ScoreBoardGUI extends ScriptUI.ActionFormData {
  static typeId = "ScoreBoardGUI";
  constructor() {
    super();
    let scoreBoardList = mc.world.scoreboard.getObjectives();
    this.setTitle("计分板管理");
    this.setInformation(`计分板个数：${scoreBoardList.length}`);
    this.setButtonsArray([{
      buttonDef: {
        text: "添加计分板"
      },
      event: (player) => {
        new AddScoreBoard().sendToPlayer(player);
      }
    }]);
    this.setBeforeSendEvents((player) => {
      this.setFather(new(UIManager.getUI("ManagerGUI"))(player));
    })
    for (let sb of scoreBoardList) {
      this.addButton({
        buttonDef: {
          text: `id: ${sb.id}\n名称: ${sb.displayName}`
        },
        event: (player) => {
          new SetScoreBoard(sb).sendToPlayer(player);
        }
      })
    }
  }
};
mc.system.run(() => {
  UIManager.addUI(ScoreBoardGUI);
});


//添加计分板
class AddScoreBoard extends ScriptUI.ModalFormData {
  constructor() {
    super();
    this.setTitle(`添加计分板`);
    this.setFather(new ScoreBoardGUI());
    this.setButtonsArray([{
        typeId: "textField",
        id: "sb_id",
        label: "计分板id（必填，仅支持英语字母）",
        setting: {
          placeHolderText: "计分板id"
        }
      },
      {
        typeId: "textField",
        id: "sb_name",
        label: "计分板名称（选填）（支持各种字符）",
        setting: {
          placeHolderText: "计分板名称"
        }
      },
      {
        typeId: "toggle",
        id: "sb_display_sidebar",
        label: "显示在侧边栏",
        setting: {
          defaultValue: false
        }
      },
      {
        typeId: "toggle",
        id: "sb_display_list",
        label: "显示在玩家列表（暂停界面）",
        setting: {
          defaultValue: false
        }
      },
      {
        typeId: "toggle",
        id: "sb_display_sortOrder",
        label: "升序/降序排列",
        setting: {
          defaultValue: false
        }
      }
    ]);
    this.setEvents((player, results) => {
      let sb = mc.world.scoreboard.addObjective(results.get("sb_id"), (results.get("sb_name").length === 0 ? undefined : results.get("sb_name")));
      if (results.get("sb_display_sidebar")) mc.world.scoreboard.setObjectiveAtDisplaySlot("Sidebar", {
        objective: sb,
        sortOrder: (results.get("sb_display_sortOrder") === true ? 1 : 0)
      });
      if (results.get("sb_display_list")) mc.world.scoreboard.setObjectiveAtDisplaySlot("List", {
        objective: sb,
        sortOrder: (results.get("sb_display_sortOrder") === true ? 1 : 0)
      });
    });
  }
};

class SetScoreBoard extends ScriptUI.ActionFormData {
  constructor(scoreBoard) {
    super();
    this.setTitle("设置计分板：" + scoreBoard.displayName);
    this.setFather(new ScoreBoardGUI());
    this.setButtonsArray([{
        buttonDef: {
          text: "获取计分板下实体"
        },
        event: (player) => {
          //本来想写匿名类，但是不会
          let sEntityList = scoreBoard.getParticipants();
          let entityList = new ScriptUI.ActionFormData().setTitle("拥有此计分板的实体列表").setInformation(`实体个数：${sEntityList.length}`).setFather(new SetScoreBoard(scoreBoard));
          for (let sentity of sEntityList) {
            let entity = sentity.getEntity();
            entityList.addButton({
              buttonDef: {
                text: `实体类型：${entity.typeId}, 实体名称：${entity.nameTag}\n分数：${scoreBoard.getScore(entity)}`
              },
              event: (player) => {
                new entityScoreEdit(scoreBoard, entity).sendToPlayer(player);
              }
            });
          };
          entityList.sendToPlayer(player);
        }
      },
      {
        buttonDef: {
          text: "添加玩家"
        },
        event: (player) => {
          let playerList = mc.world.getAllPlayers();
          let sb_list = scoreBoard.getParticipants();
          let playerListGUI = new ScriptUI.ActionFormData().setTitle("玩家列表").setFather(new SetScoreBoard(scoreBoard));
          for (let splayer of playerList) {
            if (sb_list.includes(splayer.scoreboardIdentity)) continue;
            playerListGUI.addButton({
              buttonDef: {
                text: `${splayer.nameTag}`
              },
              event: (player) => {
                scoreBoard.setScore(player, 0);
              }
            });
          };
          playerListGUI.sendToPlayer(player);
        }
      },
      {
        buttonDef: {
          text: "计分板默认值"
        },
        event: (player) => {
          let scoreDefaultValueGUI = new ScriptUI.ModalFormData();
          scoreDefaultValueGUI.setTitle("计分板默认值");
          scoreDefaultValueGUI.setInformation(`计分板名称：${scoreBoard.displayName}`);
          scoreDefaultValueGUI.setButtonsArray([{
              typeId: "textField",
              id: "sb_default_score",
              label: "计分板默认分数",
              setting: {
                defaultValue: "" + scoreBoardDefaultValueIO(scoreBoard.id)
              }
            },
            {
              typeId: "toggle",
              id: "sb_default_delete",
              label: "删除默认值",
              setting: {
                defaultValue: false
              }
            }
          ]);
          scoreDefaultValueGUI.setEvents((player, res)=>{
            if(res.get("sb_default_delete")){
              scoreBoardDefaultValueIO(scoreBoard.id, 2);
            };
            //player.sendMessage(typeof(Number(res.get("sb_default_score"))));
            if(typeof(Number(res.get("sb_default_score"))) !== typeof(1)){
              player.sendMessage("设置计分板失败，值不是有效数字");
              return;
            }
            scoreBoardDefaultValueIO(scoreBoard.id, 1, Number(res.get("sb_default_score")));
          });
          scoreDefaultValueGUI.sendToPlayer(player);
        }
      },
      {
        buttonDef: {
          text: "删除"
        },
        event: (player) => {
          mc.world.scoreboard.removeObjective(scoreBoard.id);
        }
      }
    ]);
  }
};

class entityScoreEdit extends ScriptUI.ModalFormData {
  constructor(scoreBoard, entity) {
    super();
    this.setTitle("设置实体分数");
    this.setInformation(`实体id：${entity.id}\n实体类型：${entity.typeId}\n实体名称：${entity.nameTag}\n计分板名称：${scoreBoard.displayName}\n分数：${scoreBoard.getScore(entity)}`);
    this.setFather(new SetScoreBoard(scoreBoard));
    this.setButtonsArray([{
        typeId: "textField",
        id: "entity_score",
        label: "实体分数",
        setting: {
          defaultValue: "" + scoreBoard.getScore(entity)
        }
      },
      {
        typeId: "toggle",
        id: "entity_score_delete",
        label: "删除",
        setting: {
          defaultValue: false
        }
      }
    ]);
    this.setEvents((player, results) => {
      if (results.get("entity_score").length === 0) {
        scoreBoard.setScore(entity, 0);
      } else {
        scoreBoard.setScore(entity, Number(results.get("entity_score")));
      };
      if (results.get("entity_score_delete")) {
        scoreBoard.removeParticipant(entity);
      }
    })
  }
}