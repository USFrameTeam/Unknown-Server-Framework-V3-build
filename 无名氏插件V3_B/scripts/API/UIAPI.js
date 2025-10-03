import {
  ActionFormData,
  ActionFormResponse,
  MessageFormData,
  MessageFormResponse,
  ModalFormData,
  ModalFormResponse
}
from "@minecraft/server-ui";
import * as mc from "@minecraft/server"

//表格菜单返回值处理
class ScriptModalFormDataRet {
  constructor(results) {
    this.data = Array.from(results);
    /*for(let key in results){
      this.data[key] = results[key];
    }*/
  }
  //获取id对应值
  get(id) {
    //mc.world.sendMessage(JSON.stringify(this.results));
    for (let index = 0; index < this.data.length; index++) {
      if (this.data[index].id === id) {
        return this.data[index].result;
      }
    }
  }
}

//菜单
class ScriptActionFormData {
  constructor() {
    this.buttonContainer = [];
    this.Divider = false;
    this.cancel = false;
    return this;
  };
  //返回界面
  setFather(UI) {
    this.father = UI;
    return this;
  };
  //标题
  setTitle(title) {
    this.title = title;
    return this;
  };
  //文字
  setInformation(info) {
    this.info = info;
    return this;
  };
  //分界线
  setDivider(bool) {
    this.Divider = bool;
    return this;
  }
  /**
    button: {
      buttonDef: {
        text: string,
        iconPath: string
      },
      condition: function(player),
      event: (player, index)=>{
        …
      }
    }
  */
  //添加按钮
  addButton(button) {
    this.buttonContainer.push(button);
    return this;
  };
  //移除按钮
  removeButton(index) {
    return {
      UI: this,
      button: this.buttonContainer.splice(index, 1)
    };
  };
  //获取按钮
  getButton(index) {
    return this.buttonContainer[index];
  };

  getButtonsArray() {
    return this.buttonContainer;
  };
  setBeforeSendEvents(events) {
    this.beforeEvents = events;
    return this;
  };
  setCloseEvents(events){
  	this.closeEvents = events;
  };
  setButtonsArray(buttonArray) {
    this.buttonContainer = buttonArray;
    return this;
  };

  sendToPlayer(player) {
    if (this.beforeEvents !== undefined) {
      this.beforeEvents(player, this);
      if(this.cancel === true)return;
    };
    if (player.typeId === "minecraft:player") {
      let ui = new ActionFormData();
      let buttonEvents = [];
      ui.title(this.title);
      if (this.info !== undefined) ui.body(this.info);
      if (this.Divider) {
        ui = ui.divider();
      };
      for (let index = 0; index < this.buttonContainer.length; index++) {
        if (this.buttonContainer[index].condition === undefined || this.buttonContainer[index].condition(player) === true) {
          ui.button(this.buttonContainer[index].buttonDef.text, this.buttonContainer[index].buttonDef.iconPath);
          buttonEvents.push(this.buttonContainer[index].event);
        }
      };
      mc.system.run(() => {
        ui.show(player).then((result) => {
          if (result.canceled) {
            if (result.cancelationReason === "UserBusy") {
              mc.system.runTimeout(() => {
                this.sendToPlayer(player);
              }, 10);
              return;
            };
            if (result.cancelationReason === "UserClosed") {
            	if(this.closeEvents !== undefined){
            		this.closeEvents(player);
            	};
              if (this.father !== undefined) {
                this.father.sendToPlayer(player);
              }
            }
          } else {
            buttonEvents[result.selection](player, result.selection);
          }
        })
      });
    }
  }
};
//消息
class ScriptMessageFormData {
  constructor() {
    this.events = [(player) => {}, (player) => {}];
    this.cancel = false;
    return this;
  };
  //1 : 左下按钮文字 0: 右下按钮文字
  setButton(id, text, events = undefined) {
    if (id === 0) {
      this.button1 = text;
      if (events !== undefined) {
        this.events[0] = events;
      }
    };
    if (id === 1) {
      this.button2 = text;
      if (events !== undefined) {
        this.events[1] = events;
      }
    }
    return this;
  };
  //设置父ui
  setFather(UI) {
    this.father = UI;
    return this;
  };
  //标题
  setTitle(title) {
    this.title = title;
    return this;
  };
  //消息
  setInformation(info) {
    this.info = info;
    return this;
  };
  //发送前处理
  setBeforeSendEvents(events) {
    this.beforeEvents = events;
    return this;
  };
  setCloseEvents(events){
  	this.closeEvents = events;
  };
  //发送给玩家
  sendToPlayer(player) {
    if (this.beforeEvents !== undefined) {
      this.beforeEvents(player, this);
      if(this.cancel === true)return;
    };
    if (player.typeId === "minecraft:player") {
      let ui = new MessageFormData();
      ui.title(this.title);
      if(this.info !== undefined)ui.body(this.info);
      if (this.button1 !== undefined) ui.button1(this.button1);
      if (this.button2 !== undefined) ui.button2(this.button2);
      mc.system.run(() => {
        ui.show(player).then((result) => {
          if (result.canceled) {
            if (result.cancelationReason === "UserBusy") {
              mc.system.runTimeout(() => {
                this.sendToPlayer(player);
              }, 10);
              return;
            };
            if (result.cancelationReason === "UserClosed") {
            	if(this.closeEvents !== undefined){
            		this.closeEvents(player);
            	};
              if (this.father !== undefined) {
                this.father.sendToPlayer(player);
              }
            }
          } else {
            this.events[result.selection](player);
          }
        })
      });
    }
  }
}
//表格
class ScriptModalFormData {
  constructor() {
    this.buttonContainer = [];
    this.cancel = false;
    return this;
  };
  // UI: 父ui，即退出后进入的ui
  setFather(UI) {
    this.father = UI;
  };
  setTitle(title) {
    this.title = title;
  };
  setInformation(info) {
    this.info = info;
  };
  setHeader(header) {
    this.header = header;
  };
  setEvents(events) {
    //events: (player, new ScriptModalFormDataRet())=>{}
    this.events = events;
  };
  setBeforeSendEvents(events) {
    this.beforeEvents = events;
  };
  setCloseEvents(events){
  	this.closeEvents = events;
  };
  /*
    widget: {
      typeId: "dropdown" / "toggle" / "slider" / "textField",
      setting: setting,
      id: any,
      label: String,
      condition: function(player)
    }
    
    setting: "dropdown": {
              items: string[],
              defaultValue: number
            }
            "toggle": {
              defalutValue: bool
            }
            "slider": {
              minValue: <number>,
              maxValue: <number>,
              defaultValue: <number>,
              step: <number>
            }
            "textField": {
              placeHolderText: <string>,
              defaultValue: <string>
            }
  */
  addButton(button) {
    this.buttonContainer.push(button);
  };

  removeButton(index) {
    this.buttonContainer.splice(index, 1);
  };

  getButton(index) {
    return this.buttonContainer[index];
  };

  getButtonsArray() {
    return this.buttonContainer;
  };

  setButtonsArray(buttonArray) {
    if (Array.isArray(buttonArray)) {
      this.buttonContainer = buttonArray;
      return this;
    };
    return 1;
  };

  sendToPlayer(player) {
    if (this.beforeEvents !== undefined) {
      this.beforeEvents(player, this);
      if(this.cancel === true)return;
    };
    if (player.typeId === "minecraft:player") {
      let ui = new ModalFormData();
      let buttonResults = [];
      ui.title(this.title);
      if (this.info !== undefined) ui.label(this.info);
      if (this.header !== undefined) ui.header(this.header);
      if (this.Divider) {
        ui = ui.divider();
      };
      for (let index = 0; index < this.buttonContainer.length; index++) {
        if (this.buttonContainer[index].condition === undefined || this.buttonContainer[index].condition(player) === true) {
          switch (this.buttonContainer[index].typeId) {
            case "dropdown":
              ui.dropdown(
                this.buttonContainer[index].label,
                this.buttonContainer[index].setting.items, {
                  defaultValueIndex: (this.buttonContainer[index].setting.defaultValue === undefined ? 0 : this.buttonContainer[index].setting.defaultValue)
                }
              );

              break;
            case "toggle":
              ui.toggle(this.buttonContainer[index].label, {
                defaultValue: (this.buttonContainer[index].setting.defaultValue === undefined ? false : this.buttonContainer[index].setting.defaultValue)
              });
              break;
            case "slider":
              ui.slider(this.buttonContainer[index].label, this.buttonContainer[index].setting.minValue, this.buttonContainer[index].setting.maxValue, {
                defaultValue: (this.buttonContainer[index].setting.defaultValue === undefined ? 0 : this.buttonContainer[index].setting.defaultValue),
                valueStep: (this.buttonContainer[index].setting.step === undefined ? 1 : this.buttonContainer[index].setting.step)
              });

              break;
            case "textField":
              ui.textField(this.buttonContainer[index].label, (this.buttonContainer[index].setting.placeHolderText === undefined ? "" : this.buttonContainer[index].setting.placeHolderText), {
                defaultValue: (this.buttonContainer[index].setting.defaultValue === undefined ? "" : this.buttonContainer[index].setting.defaultValue)
              });
              break;
            default:

              break;
          };
          buttonResults.push({
            id: this.buttonContainer[index].id,
            result: undefined
          });
        }
      };
      mc.system.run(() => {
        ui.show(player).then((result) => {
          if (result.canceled) {
            if (result.cancelationReason === "UserBusy") {
              mc.system.runTimeout(() => {
                this.sendToPlayer(player);
              }, 10);
              return;
            };
            if (result.cancelationReason === "UserClosed") {
            	if(this.closeEvents !== undefined){
            		this.closeEvents(player);
            	};
              if (this.father !== undefined) {
                this.father.sendToPlayer(player);
              }
            }
          } else {
            let resultList = result.formValues.filter((value)=>{
              if(value === null || value === undefined){
                return false;
              };
              return true;
            })
            for(let index = 0; index < buttonResults.length; index++) {
              buttonResults[index].result = resultList[index];
            };
            this.events(player, new ScriptModalFormDataRet(buttonResults));
          }
        })
      });
    }
  }
}


export class ScriptUI {
  static ActionFormData = ScriptActionFormData;
  static ModalFormData = ScriptModalFormData;
  static MessageFormData = ScriptMessageFormData;
}