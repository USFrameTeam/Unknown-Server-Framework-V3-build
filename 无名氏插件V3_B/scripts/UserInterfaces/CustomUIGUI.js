import {
	ScriptUI
} from "../API/UIAPI.js";
import {
	UIManager
} from "./init.js";
import {
	USFPlayer,
	UUID
} from "../API/API.js";
import * as mc from "@minecraft/server";

//自定义UI存储
function CustomUIIO(mode = 0, UIList = [], uuid) {
	let data = JSON.parse(mc.world.getDynamicProperty("usf:customUI"));
	switch (mode) {
		case 0:
		case "get":
			let uiDataArray = [];
			//mc.world.sendMessage(JSON.stringify(data));
			for (let uiDataStr of data) {
				uiDataArray.push(CustomUI.toData(uiDataStr));
			};
			return uiDataArray;
			break;
		case 1:
		case "set":
			let uiStringDataArray = [];
			for (let index = 0; index < UIList.length; index++) {
				uiStringDataArray.push(CustomUI.getStringData(UIList[index]));
			};
			mc.world.setDynamicProperty("usf:customUI", JSON.stringify(uiStringDataArray));
			break;
		case 2:
			for (let uiDataStr of data) {
				let uiData = CustomUI.toData(uiDataStr);
				if (uiData.uuid === uuid) {
					return uiData;
				}
			}
			break;
	}
};

//自定义UI类
export class CustomUI {
	constructor(uiData) {
		this.data = uiData;
		this.ui = (uiData.type === 1 ? new ScriptUI.ActionFormData() : new ScriptUI.ModalFormData());
		this.ui.setTitle(uiData.title);
		if(uiData.label)this.ui.setInformation(uiData.label);
		this.ui.setCloseEvents((player) => {
			for (let command of this.data.closeCommands) {
				player.runCommand(command);
			}
		});
		if (uiData.type === 1) {
			for (let button of uiData.buttonArray) {
				button.event = (player) => {
					for (let command of button.commandList) {
						player.runCommand(command);
					}
				};
				this.ui.addButton(button);
			}
		}
	};

	sendToPlayer(player) {
		this.ui.sendToPlayer(player);
	};
	save() {
		let UIList = CustomUIIO();
		for (let index = 0; index < UIList.length; index++) {
			if (UIList[index].uuid === this.data.uuid) {
				UIList[index] = this.data;
				CustomUIIO(1, UIList);
				return;
			}
		};
		//mc.world.sendMessage(JSON.stringify(this.data));
		UIList.push(this.data);
		//mc.world.sendMessage("save--" + JSON.stringify(UIList));
		CustomUIIO(1, UIList);
	};
	remove() {
		let UIList = CustomUIIO();
		for (let index = 0; index < UIList.length; index++) {
			if (UIList[index].uuid === this.data.uuid) {
				UIList.splice(index, 1);
			}
		};
		CustomUIIO(1, UIList);
	};
	static getStringData(uiData) {
		//mc.world.sendMessage("getStringData--" + JSON.stringify(uiData));
		switch (uiData.type) {
			case (1):
				let strData = `${uiData.type}|${uiData.title}|${uiData.label}|${uiData.uuid}|${JSON.stringify(uiData.closeCommands)}|${JSON.stringify(uiData.buttonArray)}`;
				//mc.world.sendMessage(strData);
				return strData;
				break;
			case 2:
				return ``;
		}
	};

	static toData(str) {
		let dataArray = str.split("|");
		switch (Number(dataArray[0])) {
			case 1:
				return {
					type: Number(dataArray[0]),
						title: dataArray[1],
						label: dataArray[2],
						uuid: dataArray[3],
						closeCommands: JSON.parse(dataArray[4]),
						buttonArray: JSON.parse(dataArray[5])
				}
				break;
			case 2:
				return {
					type: Number(dataArray[0]),
						title: dataArray[1],
						label: dataArray[2],
						uuid: dataArray[3],
						closeCommands: JSON.parse(dataArray[4]),
						buttonArray: JSON.parse(dataArray[5]),
						event: JSON.parse(dataArray[6])
				}
				break;
		}
	}
	static getUIFromUUID(uuid) {
		return CustomUIIO(2, [], uuid);
	}
}


//一级界面
class CustomManagerGUI extends ScriptUI.ActionFormData {
	constructor() {
		super();
		this.setTitle("自定义界面");
		this.setButtonsArray([{
			buttonDef: {
				text: "添加自定义界面"
			},
			event: (player) => {
				new AddCustomUIType().sendToPlayer(player);
			}
		}]);
		let UIList = CustomUIIO(0);
		for (let buttonData of UIList) {
			this.addButton({
				buttonDef: {
					text: buttonData.title
				},
				event: (player) => {
					if (buttonData.type === 1) {
						new CustomListUIEdit(buttonData).sendToPlayer(player);
					}
				}
			});
		}
	};
	static typeId = "CustomManagerGUI";
};
mc.system.run(() => {
	UIManager.addUI(CustomManagerGUI);
});



class AddCustomUIType extends ScriptUI.ModalFormData {
	constructor(title = "", warn = null) {
		super();
		this.setTitle(`添加自定义界面`);
		this.setButtonsArray([{
				typeId: "dropdown",
				id: "ui_type",
				label: "界面类型",
				setting: {
					items: ["列表", "表单（无效，不知道怎么写信息处理方式）"]
				}
			},
			{
				typeId: "textField",
				id: "ui_title",
				label: "名称" + (warn === null ? "" : "\n" + warn),
				setting: {
					defaultValue: title
				}
			}
		]);
		this.setEvents((player, res) => {
			if (res.get("ui_type") === 0) {
				if (res.get("ui_title").includes(";")) {
					new AddCustomUIType(res.get("ui_title"), "名称不能含“ ; ”").sendToPlayer(player);
					return;
				}
				new CustomListUIOptions({
					type: 1,
					title: res.get("ui_title"),
					label: "",
					buttonArray: [],
					closeCommands: [],
					uuid: UUID()
				}).sendToPlayer(player);
			}
		});
	}
};

class CommandAfterCloseUI extends ScriptUI.ModalFormData {
	constructor(uiData) {
		super();
		let commandIndex = 1;
		this.setTitle("关闭UI后运行指令");
		for (let command of uiData.closeCommands) {
			this.addButton({
				typeId: "textField",
				label: "指令-" + commandIndex,
				id: "command-" + commandIndex,
				setting: {
					defaultValue: command
				}
			});
			commandIndex++;
		};
		this.addButton({
			typeId: "toggle",
			label: "添加指令",
			id: "addCommand",
			setting: {}
		});
		this.addButton({
			typeId: "toggle",
			label: "清除空指令行",
			id: "clear",
			setting: {}
		});
		this.addButton({
			typeId: "toggle",
			label: "保存",
			id: "save",
			setting: {}
		});
		this.setEvents((player, result) => {
			let commands = [];
			for (let commandResIndex = 1; commandResIndex < commandIndex; commandResIndex++) {
				let command = result.get("command-" + commandResIndex);
				if (result.get("clear") && command.length === 0) continue;
				commands.push(command);
			};
			if (result.get("addCommand")) {
				commands.push("");
			};
			uiData.closeCommands = commands;
			if (result.get("save")) {
				switch (uiData.type) {
					case 1:
						new CustomListUIOptions(uiData).sendToPlayer(player);
						break;
				}
			} else {
				new CommandAfterCloseUI(uiData).sendToPlayer(player);
			}
		});
	}
}

//-----------------------------------
//列表UI
/*
	listUI:
	{
		type: 1,
		title: String,
		label: String,
		uuid: String,
		buttons: Array< button extends ScriptUI.ActionFormData.button {
			commandList: []<command>
		}>
		closeCommands: commandList[]
	}
*/

class CustomListUIOptions extends ScriptUI.ActionFormData {
	constructor(uiData = {
		type: 1,
		title: "",
		label: "",
		buttonArray: [],
		closeCommands: [],
		uuid: undefined
	}) {
		super();
		this.setTitle("自定义列表UI");
		this.setFather(new CustomListUIEdit(uiData));
		for (let uiIndex = 0; uiIndex < uiData.buttonArray.length; uiIndex++) {
			let buttonCopy = {
				...(uiData.buttonArray[uiIndex])
			};
			buttonCopy.event = (player) => {
				new CustomListUIButtonEdit(uiData, uiIndex).sendToPlayer(player);
			}
			this.addButton(buttonCopy);
		};
		this.addButton({
			buttonDef: {
				text: "添加按钮"
			},
			event: (player) => {
				uiData.buttonArray.push({
					buttonDef: {
						text: "按钮"
					},
					event: (player) => {
						for (let command of this.commandList) {
							player.runCommand(command);
						}
					},
					commandList: []
				});
				new CustomListUIOptions(uiData).sendToPlayer(player);
			}
		});
		this.addButton({
			buttonDef: {
				text: "关闭后运行指令"
			},
			event: (player) => {
				new CommandAfterCloseUI(uiData).sendToPlayer(player);
			}
		});
		this.addButton({
			buttonDef: {
				text: "保存"
			},
			event: (player) => {
				new CustomListUIEdit(uiData).sendToPlayer(player);
			}
		});
	};
};

class CustomListUIButtonEdit extends ScriptUI.ModalFormData {
	constructor(uiData, buttonIndex) {
		super();
		this.setTitle("编辑UI");
		this.setFather(new CustomListUIOptions(uiData));
		let commandIndex = 1;
		this.addButton({
			typeId: "textField",
			label: "按钮名称",
			id: "button_name",
			setting: {
				defaultValue: uiData.buttonArray[buttonIndex].buttonDef.text
			}
		});
		for (let command of uiData.buttonArray[buttonIndex].commandList) {
			this.addButton({
				typeId: "textField",
				label: "指令-" + commandIndex,
				id: "command-" + commandIndex,
				setting: {
					defaultValue: command
				}
			});
			commandIndex++;
		};
		this.addButton({
			typeId: "toggle",
			label: "添加指令",
			id: "addCommand",
			setting: {}
		});
		this.addButton({
			typeId: "toggle",
			label: "清除空指令行",
			id: "clear",
			setting: {}
		});
		this.addButton({
			typeId: "toggle",
			label: "保存",
			id: "save",
			setting: {}
		});
		this.addButton({
			typeId: "toggle",
			label: "删除按钮",
			id: "delete",
			setting: {}
		});
		this.setEvents((player, result) => {
			uiData.buttonArray[buttonIndex].buttonDef.text = result.get("button_name");
			delete uiData.buttonArray[buttonIndex].commandList;
			let commands = [];
			for (let commandResIndex = 1; commandResIndex < commandIndex; commandResIndex++) {
				let command = result.get("command-" + commandResIndex);
				if (result.get("clear") && command.length === 0) continue;
				commands.push(command);
			};
			uiData.buttonArray[buttonIndex].commandList = commands;
			if (result.get("addCommand")) {
				uiData.buttonArray[buttonIndex].commandList.push("");
			};
			if (result.get("delete")) {
				uiData.buttonArray.splice(buttonIndex, 1);
				new CustomListUIOptions(uiData).sendToPlayer(player);
				return;
			};
			if (result.get("save")) {
				new CustomListUIOptions(uiData).sendToPlayer(player);
			} else {
				new CustomListUIButtonEdit(uiData, buttonIndex).sendToPlayer(player);
			}
		})
	}
};

class CustomListUIEdit extends ScriptUI.ModalFormData {
	constructor(uiData) {
		super();
		this.setTitle("编辑自定义列表");
		//this.setInformation(`uuid: ${uiData.uuid}`);
		this.setButtonsArray([{
				typeId: "textField",
				label: "列表名称",
				id: "ui_name",
				setting: {
					defaultValue: uiData.title
				}
			},
			{
				typeId: "textField",
				label: "uuid（复制）",
				id: "ui_uuid_copy",
				setting: {
					defaultValue: uiData.uuid
				}
			},
			/*{
				type: "dropdown"
			},*/
			{
				typeId: "toggle",
				label: "编辑内容及关闭事件",
				id: "button_edit",
				setting: {
					defaultValue: false
				}
			},
			{
				typeId: "toggle",
				label: "保存",
				id: "save",
				setting: {
					defaultValue: false
				}
			},
			{
				typeId: "toggle",
				label: "删除",
				id: "delete",
				setting: {
					defaultValue: false
				}
			}
		]);
		this.setEvents((player, res) => {
			uiData.title = res.get("ui_name");
			if (res.get("delete")) {
				new CustomUI(uiData).remove();
				return;
			};
			if (res.get("save")) {
				//mc.world.sendMessage(JSON.stringify(uiData));
				new CustomUI(uiData).save();
				return;
			};
			if (res.get("button_edit")) {
				new CustomListUIOptions(uiData).sendToPlayer(player);
			};
		});
	}
}

//--------------------------------------

//表格UI